-- Таблица для запросов на возврат средств
CREATE TABLE IF NOT EXISTS t_p63326274_course_download_plat.refund_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p63326274_course_download_plat.users(id),
    transaction_id INTEGER NOT NULL REFERENCES t_p63326274_course_download_plat.transactions(id),
    amount INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    admin_comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON t_p63326274_course_download_plat.refund_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON t_p63326274_course_download_plat.refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_created_at ON t_p63326274_course_download_plat.refund_requests(created_at DESC);