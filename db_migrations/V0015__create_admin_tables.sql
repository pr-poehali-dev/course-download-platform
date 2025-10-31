-- Создание таблицы для администраторов
CREATE TABLE IF NOT EXISTS t_p63326274_course_download_plat.admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Создание таблицы для истории действий администраторов
CREATE TABLE IF NOT EXISTS t_p63326274_course_download_plat.admin_actions_log (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES t_p63326274_course_download_plat.admins(id),
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON t_p63326274_course_download_plat.admin_actions_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON t_p63326274_course_download_plat.admin_actions_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_entity ON t_p63326274_course_download_plat.admin_actions_log(entity_type, entity_id);