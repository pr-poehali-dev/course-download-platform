-- Добавление поля is_temporary_password в таблицу users
ALTER TABLE t_p63326274_course_download_plat.users 
ADD COLUMN IF NOT EXISTS is_temporary_password BOOLEAN DEFAULT FALSE;

-- Комментарий для поля
COMMENT ON COLUMN t_p63326274_course_download_plat.users.is_temporary_password IS 'Флаг временного пароля (true если пароль сгенерирован системой и требует замены)';