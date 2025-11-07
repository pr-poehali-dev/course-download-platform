-- Создание таблицы для хранения созданных пакетов защиты
CREATE TABLE IF NOT EXISTS t_p63326274_course_download_plat.defense_kits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    work_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Индекс для быстрого поиска по пользователю
CREATE INDEX IF NOT EXISTS idx_defense_kits_user_id 
    ON t_p63326274_course_download_plat.defense_kits(user_id);

-- Индекс для быстрого поиска по работе
CREATE INDEX IF NOT EXISTS idx_defense_kits_work_id 
    ON t_p63326274_course_download_plat.defense_kits(work_id);
