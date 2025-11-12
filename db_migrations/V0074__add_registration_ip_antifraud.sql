-- Добавляем колонку для хранения IP адреса регистрации (анти-фрод)
ALTER TABLE t_p63326274_course_download_plat.users 
ADD COLUMN IF NOT EXISTS registration_ip VARCHAR(50);

-- Индекс для быстрой проверки количества регистраций с одного IP
CREATE INDEX IF NOT EXISTS idx_users_registration_ip_created 
ON t_p63326274_course_download_plat.users(registration_ip, created_at);