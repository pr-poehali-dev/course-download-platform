-- Таблица подписок на AI помощника
CREATE TABLE IF NOT EXISTS ai_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    subscription_type VARCHAR(20) NOT NULL CHECK (subscription_type IN ('single', 'monthly', 'yearly')),
    requests_total INTEGER NOT NULL DEFAULT 0,
    requests_used INTEGER NOT NULL DEFAULT 0,
    price_points INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Таблица истории чатов с AI
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    subscription_id INTEGER REFERENCES ai_subscriptions(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    file_name VARCHAR(255),
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_ai_subscriptions_user_active ON ai_subscriptions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user ON ai_chat_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_subscription ON ai_chat_history(subscription_id);

-- Комментарии
COMMENT ON TABLE ai_subscriptions IS 'Подписки пользователей на AI помощника';
COMMENT ON TABLE ai_chat_history IS 'История диалогов с AI помощником';
COMMENT ON COLUMN ai_subscriptions.subscription_type IS 'Тип подписки: single (разовая), monthly (месячная), yearly (годовая)';
COMMENT ON COLUMN ai_subscriptions.requests_total IS 'Общее количество запросов по подписке (0 = безлимит)';
COMMENT ON COLUMN ai_subscriptions.requests_used IS 'Использовано запросов';