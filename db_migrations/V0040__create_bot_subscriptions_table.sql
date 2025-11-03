CREATE TABLE IF NOT EXISTS t_p63326274_course_download_plat.bot_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    telegram_user_id VARCHAR(255),
    telegram_username VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'inactive',
    started_at TIMESTAMP,
    expires_at TIMESTAMP,
    payment_id VARCHAR(255),
    amount DECIMAL(10, 2) DEFAULT 3000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_bot_subscriptions_user_id ON t_p63326274_course_download_plat.bot_subscriptions(user_id);
CREATE INDEX idx_bot_subscriptions_telegram_user_id ON t_p63326274_course_download_plat.bot_subscriptions(telegram_user_id);
CREATE INDEX idx_bot_subscriptions_status ON t_p63326274_course_download_plat.bot_subscriptions(status);

COMMENT ON TABLE t_p63326274_course_download_plat.bot_subscriptions IS 'Подписки пользователей на Telegram-бота';
COMMENT ON COLUMN t_p63326274_course_download_plat.bot_subscriptions.status IS 'Статус подписки: active, inactive, expired';
COMMENT ON COLUMN t_p63326274_course_download_plat.bot_subscriptions.amount IS 'Стоимость подписки в рублях (по умолчанию 3000₽)';