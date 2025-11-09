-- Таблица для логирования подозрительной активности
CREATE TABLE IF NOT EXISTS t_p63326274_course_download_plat.security_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    event_type VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по пользователю и типу события
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON t_p63326274_course_download_plat.security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON t_p63326274_course_download_plat.security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON t_p63326274_course_download_plat.security_logs(created_at);