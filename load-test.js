import http from 'k6/http';
import { check, sleep } from 'k6';

// Конфигурация нагрузочного тестирования
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Разгон: 0 → 10 пользователей за 30 сек
    { duration: '1m', target: 30 },    // Рост: 10 → 30 пользователей за 1 мин
    { duration: '2m', target: 50 },    // Удержание: 50 пользователей 2 минуты
    { duration: '1m', target: 100 },   // Пик: 100 пользователей 1 минута
    { duration: '30s', target: 0 },    // Спад: плавное снижение до 0
  ],
  
  // Пороговые значения для успешного прохождения теста
  thresholds: {
    'http_req_duration': ['p(95)<500'],      // 95% запросов быстрее 500ms
    'http_req_duration{name:HomePage}': ['p(95)<1000'], // Главная < 1s
    'http_req_duration{name:API}': ['p(95)<300'],       // API < 300ms
    'http_req_failed': ['rate<0.01'],        // Меньше 1% ошибок
    'checks': ['rate>0.95'],                 // 95%+ успешных проверок
  },
};

// URL вашего сайта (ЗАМЕНИ НА СВОЙ!)
const BASE_URL = 'https://preview--course-download-platform.poehali.dev';

// URL API функций из func2url.json
const API = {
  works: 'https://functions.poehali.dev/a16a43fc-fa7d-4c72-ad15-ba566d2c7413',
  auth: 'https://functions.poehali.dev/48e96862-17ab-4f46-a6b8-f123b2e32e46',
  healthcheck: 'https://functions.poehali.dev/fafd6cc9-8170-405d-b2b9-d282d190b762',
};

// Сценарий действий одного виртуального пользователя
export default function () {
  // Тест 1: Главная страница
  let res = http.get(`${BASE_URL}/`, {
    tags: { name: 'HomePage' },
  });
  
  check(res, {
    'главная загружена (200)': (r) => r.status === 200,
    'главная быстрая (<2s)': (r) => r.timings.duration < 2000,
    'главная содержит контент': (r) => r.body.length > 1000,
  });
  
  sleep(1); // Пользователь читает главную 1 секунду

  // Тест 2: Healthcheck (проверка системы)
  res = http.get(API.healthcheck, {
    tags: { name: 'Healthcheck' },
  });
  
  check(res, {
    'healthcheck работает': (r) => r.status === 200,
    'система healthy': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'healthy';
      } catch {
        return false;
      }
    },
  });

  sleep(0.5);

  // Тест 3: Каталог работ
  res = http.get(`${BASE_URL}/catalog`, {
    tags: { name: 'CatalogPage' },
  });
  
  check(res, {
    'каталог загружен': (r) => r.status === 200,
    'каталог быстрый (<1.5s)': (r) => r.timings.duration < 1500,
  });

  sleep(2); // Пользователь просматривает каталог 2 секунды

  // Тест 4: API - получение работ
  res = http.get(API.works, {
    tags: { name: 'API' },
  });
  
  check(res, {
    'API работ доступен': (r) => r.status === 200,
    'API работ быстрый (<300ms)': (r) => r.timings.duration < 300,
    'API возвращает JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });

  sleep(1);

  // Тест 5: CORS preflight (OPTIONS)
  res = http.options(`${API.auth}?action=login`, {
    tags: { name: 'CORS' },
  });
  
  check(res, {
    'CORS настроен': (r) => r.status === 200,
    'CORS headers есть': (r) => r.headers['Access-Control-Allow-Origin'] !== undefined,
  });

  sleep(1);

  // Тест 6: Страница входа
  res = http.get(`${BASE_URL}/login`, {
    tags: { name: 'LoginPage' },
  });
  
  check(res, {
    'страница входа доступна': (r) => r.status === 200,
  });

  sleep(2); // Среднее время между действиями пользователя
}

// Отчёт после завершения теста
export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n' + indent + '===== РЕЗУЛЬТАТЫ НАГРУЗОЧНОГО ТЕСТИРОВАНИЯ =====\n\n';
  
  // Общая статистика
  summary += indent + `Виртуальных пользователей (пик): ${data.metrics.vus_max.values.max}\n`;
  summary += indent + `Всего запросов: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `Продолжительность: ${(data.state.testRunDurationMs / 1000).toFixed(1)}s\n\n`;
  
  // Время ответа
  summary += indent + 'Время ответа (http_req_duration):\n';
  summary += indent + `  средн: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += indent + `  мин:   ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
  summary += indent + `  макс:  ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
  summary += indent + `  p(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n\n`;
  
  // Ошибки
  const failedRate = data.metrics.http_req_failed.values.rate || 0;
  const failedPct = (failedRate * 100).toFixed(2);
  summary += indent + `Ошибки: ${failedPct}%\n\n`;
  
  // Проверки
  const checksRate = data.metrics.checks.values.rate || 0;
  const checksPct = (checksRate * 100).toFixed(2);
  summary += indent + `Успешные проверки: ${checksPct}%\n\n`;
  
  // Вердикт
  const thresholdsPassed = Object.values(data.metrics).every(m => 
    !m.thresholds || Object.values(m.thresholds).every(t => t.ok)
  );
  
  if (thresholdsPassed) {
    summary += indent + '✅ ТЕСТ ПРОЙДЕН УСПЕШНО!\n';
    summary += indent + 'Сайт готов к запуску в production.\n';
  } else {
    summary += indent + '❌ ТЕСТ НЕ ПРОЙДЕН\n';
    summary += indent + 'Требуется оптимизация перед запуском.\n';
  }
  
  return summary;
}
