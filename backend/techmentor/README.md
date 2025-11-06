# TechMentor Chat API

Полноценный чат-репетитор для TechForma с поддержкой тысяч пользователей.

## Возможности

- **Чат с ИИ-репетитором**: 3 режима (Репетитор, План, Переформулирование)
- **Стриминг ответов**: Real-time потоковый вывод
- **Проверка работ**: Загрузка PDF/DOCX, анализ и обратная связь
- **Масштабируемость**: Очередь, rate-limiting, кластеризация PM2
- **Health-checks**: Автоконтроль и перезапуск при сбоях
- **Redis поддержка**: Опциональное хранение сессий

## Установка

```bash
cd backend/techmentor
npm install
cp .env.example .env
# Отредактируйте .env и добавьте OPENAI_API_KEY
```

## Запуск

### Разработка
```bash
npm run dev
```

### Production (PM2)
```bash
npm start
```

## Endpoints

- `GET /mentor` - Интерфейс чата
- `POST /api/mentor` - Обычный чат (JSON)
- `POST /api/mentor/stream` - Стриминг чата
- `POST /api/mentor/upload` - Проверка работы (PDF/DOCX)
- `GET /healthz` - Health check
- `GET /readyz` - Readiness check

## Конфигурация

Основные переменные в `.env`:

- `OPENAI_API_KEY` - ключ OpenAI
- `MAX_CONCURRENCY` - макс. параллельных запросов к OpenAI (16)
- `QUEUE_MAX` - макс. очередь ожидающих (500)
- `RATE_MAX` - лимит запросов/мин на IP (120)
- `REDIS_URL` - опционально для кластера

## Масштабирование

PM2 автоматически создаёт кластер по числу ядер. Для балансировки нагрузки между серверами используйте Nginx.

## Интеграция с фронтендом

Добавьте виджет на страницы:

```html
<script src="/public/widget-snippet.html"></script>
```

Кнопка "Спросить TechMentor" откроет чат в новой вкладке с контекстом страницы.
