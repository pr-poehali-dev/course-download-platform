import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';
import multer from 'multer';
import fs from 'fs/promises';
import fsSync from 'fs';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const log = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });

// ---- Конфиг
const PORT = Number(process.env.PORT || 3000);
const ORIGIN_REGEX = new RegExp(process.env.ORIGIN_REGEX || '.*');
const MAX_CONCURRENCY = Number(process.env.MAX_CONCURRENCY || 16);
const QUEUE_MAX = Number(process.env.QUEUE_MAX || 500);
const REQ_TIMEOUT_MS = Number(process.env.REQ_TIMEOUT_MS || 25000);
const RATE_WINDOW_MS = Number(process.env.RATE_WINDOW_MS || 60000);
const RATE_MAX = Number(process.env.RATE_MAX || 120);
const HEALTHCHECK_INTERVAL_MS = Number(process.env.HEALTHCHECK_INTERVAL_MS || 60000);
const HEALTHCHECK_FAIL_THRESHOLD = Number(process.env.HEALTHCHECK_FAIL_THRESHOLD || 3);

// ---- Redis (опционально)
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;
if (redis) {
  redis.on('connect', () => log.info('Redis connected'));
  redis.on('error', (e) => log.error({ e }, 'Redis error'));
}

// ---- Хранилище сессий (Redis -> fallback Map)
const memSessions = new Map();
async function getSession(sessionId) {
  if (redis) {
    const raw = await redis.get(`tm:session:${sessionId}`);
    return raw ? JSON.parse(raw) : [];
  }
  return memSessions.get(sessionId) || [];
}
async function setSession(sessionId, history) {
  const clipped = history.slice(-16);
  if (redis) {
    await redis.set(`tm:session:${sessionId}`, JSON.stringify(clipped), 'EX', 60 * 60 * 24);
  } else {
    memSessions.set(sessionId, clipped);
  }
}

// ---- Ограничение параллелизма + очередь
let active = 0;
const waiters = [];
function acquire() {
  return new Promise((resolve, reject) => {
    if (active < MAX_CONCURRENCY) {
      active++; resolve();
      return;
    }
    if (waiters.length >= QUEUE_MAX) {
      reject(Object.assign(new Error('Server busy'), { code: 'BUSY' }));
      return;
    }
    waiters.push(resolve);
  });
}
function release() {
  active = Math.max(0, active - 1);
  const next = waiters.shift();
  if (next) {
    active++;
    next();
  }
}
function queueDepth() { return waiters.length; }

// ---- Инициализация OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---- Health
let health = { ok: true, fails: 0, lastError: null, lastOk: 0 };
async function checkHealth() {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 6000);
    await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      signal: controller.signal
    });
    clearTimeout(t);
    health.ok = true; health.fails = 0; health.lastOk = Date.now(); health.lastError = null;
    log.debug('Health OK');
  } catch (e) {
    health.fails += 1; health.ok = false; health.lastError = e?.message || String(e);
    log.warn({ e }, 'Health FAIL');
    if (health.fails >= HEALTHCHECK_FAIL_THRESHOLD) {
      log.error('Health threshold exceeded. Exiting for supervisor restart.');
      process.exit(1);
    }
  }
}
setInterval(checkHealth, HEALTHCHECK_INTERVAL_MS).unref();
checkHealth();

// ---- Express
const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: (origin, cb) => cb(null, !origin || ORIGIN_REGEX.test(origin) ? origin : false) }));
app.use(express.json({ limit: '1mb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Rate-limit на IP
app.use(rateLimit({
  windowMs: RATE_WINDOW_MS,
  max: RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Слишком много запросов, попробуйте позже.'
}));

// Роуты статические
app.get('/mentor', (_, res) => res.sendFile(path.join(__dirname, 'public', 'mentor.html')));

// ---- Политики/промпты
const MODES = { TUTOR:'tutor', REWRITE:'rewrite', OUTLINE:'outline' };
const BASE_POLICY = `Ты — TechMentor платформы TechForma. Помогаешь студенту РАЗОБРАТЬСЯ и сделать работу САМОСТОЯТЕЛЬНО. Правила:
• Не пишешь работы целиком и не выдаёшь большие фрагменты; вместо этого — план, структура, методика, чек-листы, мини-примеры (до 6–8 предложений), вопросы для самопроверки.
• Если просят «сделай/напиши полностью» — мягко отказывайся и переводишь в учебный формат.
• Не выдумывай источники/ГОСТы; проси методичку/исходники, давай общий алгоритм поиска.
• Пиши по-русски, по шагам, коротко и конкретно.`;

function systemByMode(mode){
  if (mode === MODES.REWRITE) return BASE_POLICY + `\nРежим: Переформулирование. Переписывай яснее и компактнее, без новых фактов; добавь 2–3 стилистические правки и чек-лист.`;
  if (mode === MODES.OUTLINE) return BASE_POLICY + `\nРежим: План. Дай структуру, что раскрывать в каждом разделе, какие данные собрать, формат таблиц/рисунков и чек-лист.`;
  return BASE_POLICY + `\nРежим: Репетитор. Объясняй по шагам, задавай наводящие вопросы, мини-примеры, типовые ошибки, критерии оценивания.`;
}

function guardText(msg){
  return /(сделай|напиши|выполни|оформи).*(за меня|полностью|всю|всё)/i.test(msg)
    ? 'Пользователь просит сделать за него: мягко откажись и предложи план, чек-лист и мини-пример.'
    : 'Обычный запрос.';
}

function clip(arr, n=16){ return arr.slice(-n); }

function buildMessages({mode, pageContext, history, userText}){
  const msgs = [
    { role: 'system', content: systemByMode(mode) },
    { role: 'system', content: guardText(userText) },
    { role: 'system', content: pageContext ? `Контекст страницы: ${JSON.stringify(pageContext)}` : 'Контекст страницы отсутствует.' }
  ];
  return [...msgs, ...clip(history || []), { role: 'user', content: userText }];
}

// ---- Вспомогалка: вызов OpenAI с таймаутом
async function createChatCompletionJSON(body, { stream = false } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQ_TIMEOUT_MS);
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ---- ЧАТ: обычный
app.post('/api/mentor', async (req, res) => {
  const rid = uuidv4();
  const t0 = Date.now();
  try {
    const { sessionId, userText, mode = MODES.TUTOR, pageContext } = req.body || {};
    if (!sessionId || !userText) return res.status(400).json({ error: 'sessionId и userText обязательны' });
    
    await acquire();
    const hist = await getSession(sessionId);
    const messages = buildMessages({ mode, pageContext, history: hist, userText });
    
    const apiRes = await createChatCompletionJSON({
      model: 'gpt-4o',
      temperature: 0.5,
      messages
    });
    
    if (!apiRes.ok) {
      if (apiRes.status === 429) return res.status(429).json({ error: 'Лимит модели. Повторите позже.' });
      throw new Error(`OpenAI HTTP ${apiRes.status}`);
    }
    const data = await apiRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Не удалось сформировать ответ.';
    
    const next = [...clip(hist), { role: 'user', content: userText }, { role: 'assistant', content: reply }];
    await setSession(sessionId, next);
    res.json({ reply });
  } catch (e) {
    log.error({ e, rid }, 'chat error');
    if (e.code === 'BUSY') return res.status(503).json({ error: 'Сервер перегружен. Попробуйте позже.' });
    if (e.name === 'AbortError') return res.status(504).json({ error: 'Таймаут запроса к модели.' });
    res.status(500).json({ error: 'Внутренняя ошибка' });
  } finally {
    release();
    log.debug({ rid, ms: Date.now() - t0, active, q: queueDepth() }, 'chat done');
  }
});

// ---- ЧАТ: стрим
app.post('/api/mentor/stream', async (req, res) => {
  const rid = uuidv4();
  const t0 = Date.now();
  try {
    const { sessionId, userText, mode = MODES.TUTOR, pageContext } = req.body || {};
    if (!sessionId || !userText) { res.status(400).end('Bad request'); return; }
    
    if (active >= MAX_CONCURRENCY && waiters.length >= QUEUE_MAX) {
      res.status(503).end('busy'); return;
    }
    await acquire();
    
    const hist = await getSession(sessionId);
    const messages = buildMessages({ mode, pageContext, history: hist, userText });
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform, must-revalidate');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    const apiRes = await createChatCompletionJSON({
      model: 'gpt-4o',
      temperature: 0.5,
      stream: true,
      messages
    }, { stream: true });
    
    if (!apiRes.ok || !apiRes.body) {
      res.status(apiRes.status || 500).end('error'); return;
    }
    
    const reader = apiRes.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      
      const lines = chunk.split('\n');
      for (const l of lines) {
        const m = l.match(/^data:\s*(.*)$/);
        if (!m) continue;
        const payload = m[1];
        if (payload === '[DONE]') continue;
        try {
          const obj = JSON.parse(payload);
          const delta = obj.choices?.[0]?.delta?.content || '';
          if (delta) {
            full += delta;
            res.write(delta);
          }
        } catch {}
      }
    }
    res.end();
    const next = [...clip(hist), { role: 'user', content: userText }, { role: 'assistant', content: full.trim() }];
    await setSession(sessionId, next);
  } catch (e) {
    log.error({ e, rid }, 'stream error');
    try { res.end(); } catch {}
  } finally {
    release();
    log.debug({ rid, ms: Date.now() - t0, active, q: queueDepth() }, 'stream done');
  }
});

// ---- Upload + Проверка
try { fsSync.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true }); } catch {}
const upload = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (_, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g,'_'))
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = ['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype);
    cb(ok ? null : new Error('Допустимы только PDF или DOCX'), ok);
  }
});

function roughStats(txt){
  const words = (txt.match(/\S+/g)||[]).length;
  const chars = txt.length;
  const pagesEst = Math.max(1, Math.round(chars / 2000));
  const refs = (txt.match(/^\s*(\[\d+\]|^\d+\.)/gmi)||[]).length + (txt.match(/\b(ГОСТ|СП|СНиП|СанПиН|ISO|EN)\b/g)||[]).length;
  return { words, chars, pagesEst, refs };
}

function sliceSmart(txt, target = 14000){
  if (txt.length <= target) return [txt];
  const chunks = [];
  let i=0;
  while (i < txt.length && chunks.length < 5){ chunks.push(txt.slice(i, i+target)); i += target; }
  return chunks;
}

function reviewPrompt(requirements){
  return `${BASE_POLICY}
Режим: Проверка работы. Ты — строгий, но доброжелательный научный руководитель. Дай:
1) резюме,
2) чек-лист Да/Нет/Частично с комментариями,
3) структура/логика (что править),
4) методология/данные (чего не хватает),
5) оформление (типовые нарушения без выдуманных ГОСТов),
6) три мини-примера улучшений (введение/раздел/выводы),
7) топ-5 приоритетных правок.
Требования вуза: ${requirements || 'не заданы; попроси методичку или кратко описать требования.'}`;
}

async function extractText(filePath, mimetype){
  if (mimetype === 'application/pdf') {
    const buf = await fs.readFile(filePath);
    const data = await pdfParse(buf);
    return data.text || '';
  }
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const res = await mammoth.extractRawText({ path: filePath });
    return res.value || '';
  }
  return '';
}

app.post('/api/mentor/upload', upload.single('file'), async (req, res) => {
  const rid = uuidv4();
  try {
    const { file } = req;
    const { sessionId, uniReq } = req.body || {};
    if (!file) return res.status(400).json({ error: 'Файл не получен' });
    if (!sessionId) return res.status(400).json({ error: 'sessionId обязателен' });
    
    await acquire();
    
    const text = (await extractText(file.path, file.mimetype)).trim();
    await fs.unlink(file.path).catch(()=>{});
    if (!text) return res.status(400).json({ error: 'Не удалось извлечь текст из файла' });
    
    const stats = roughStats(text);
    const chunks = sliceSmart(text, 14000);
    
    const localFindings = [];
    for (let i=0;i<chunks.length;i++){
      const part = chunks[i];
      const apiRes = await createChatCompletionJSON({
        model: 'gpt-4o',
        temperature: 0.2,
        messages: [
          { role: 'system', content: reviewPrompt(uniReq) },
          { role: 'user', content: `Часть ${i+1} из ${chunks.length}. Дай сжатые ключевые замечания списком (≤10 пунктов), без повторов.`},
          { role: 'user', content: part }
        ]
      });
      if (!apiRes.ok) throw new Error(`OpenAI HTTP ${apiRes.status}`);
      const data = await apiRes.json();
      localFindings.push(data.choices?.[0]?.message?.content?.trim() || '');
    }
    
    const apiRes = await createChatCompletionJSON({
      model: 'gpt-4o',
      temperature: 0.3,
      messages: [
        { role: 'system', content: reviewPrompt(uniReq) },
        { role: 'user', content: `Сведи итоговый отчёт, не дублируя, на основе:\n\n${localFindings.join('\n\n---\n\n')}` }
      ]
    });
    if (!apiRes.ok) throw new Error(`OpenAI HTTP ${apiRes.status}`);
    const final = await apiRes.json();
    const reply = `Метрики файла: ~${stats.pagesEst} стр., ${stats.words} слов, упоминаний источников/норм: ${stats.refs}.\n\n`
                + (final.choices?.[0]?.message?.content?.trim() || 'Не удалось сформировать отчёт.');
    
    const hist = await getSession(sessionId);
    await setSession(sessionId, [...clip(hist), { role: 'assistant', content: reply }]);
    res.json({ reply, stats });
  } catch (e) {
    log.error({ e, rid }, 'upload error');
    if (e.code === 'BUSY') return res.status(503).json({ error: 'Сервер перегружен. Попробуйте позже.' });
    if (e.name === 'AbortError') return res.status(504).json({ error: 'Таймаут запроса к модели.' });
    res.status(500).json({ error: 'Ошибка анализа файла' });
  } finally {
    release();
  }
});

// ---- Health endpoints
app.get('/healthz', (req, res) => {
  res.json({ ok: health.ok, fails: health.fails, active, queue: queueDepth(), lastOk: health.lastOk, lastError: health.lastError });
});
app.get('/readyz', (req, res) => {
  if (health.ok && queueDepth() < QUEUE_MAX) res.json({ ready: true, active, queue: queueDepth() });
  else res.status(503).json({ ready: false, active, queue: queueDepth() });
});

// ---- Запуск
app.listen(PORT, () => log.info(`TechMentor API listening on http://localhost:${PORT}`));
