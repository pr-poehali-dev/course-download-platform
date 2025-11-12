-- Создание таблицы для временных токенов скачивания
CREATE TABLE IF NOT EXISTS t_p63326274_course_download_plat.download_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(64) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    work_id INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP,
    ip_address VARCHAR(50)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON t_p63326274_course_download_plat.download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_expires ON t_p63326274_course_download_plat.download_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_download_tokens_user_work ON t_p63326274_course_download_plat.download_tokens(user_id, work_id);

-- Автоматическое удаление истекших токенов (опционально для чистоты)
COMMENT ON TABLE t_p63326274_course_download_plat.download_tokens IS 'Временные токены для защищенного скачивания работ. Срок действия: 30 минут.';