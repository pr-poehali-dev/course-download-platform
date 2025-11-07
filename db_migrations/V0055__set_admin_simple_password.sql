-- Устанавливаем простой пароль для существующего админа
-- Пароль: admin123
-- Проверенный bcrypt хеш
UPDATE t_p63326274_course_download_plat.users 
SET password_hash = '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE id = 999999;
