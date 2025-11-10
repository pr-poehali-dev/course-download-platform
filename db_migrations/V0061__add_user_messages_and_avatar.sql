-- Добавляем поле avatar_url к пользователям
ALTER TABLE t_p63326274_course_download_plat.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

-- Создаем таблицу внутренних сообщений
CREATE TABLE IF NOT EXISTS t_p63326274_course_download_plat.user_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_messages_user_id ON t_p63326274_course_download_plat.user_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_is_read ON t_p63326274_course_download_plat.user_messages(is_read);

COMMENT ON TABLE t_p63326274_course_download_plat.user_messages IS 'Internal messaging system for support and notifications';
