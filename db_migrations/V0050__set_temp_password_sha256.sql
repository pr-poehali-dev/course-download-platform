-- Устанавливаем временный пароль "12345678" для пользователя ID=2 (Максим)
-- SHA256 хеш для "12345678": ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f
UPDATE t_p63326274_course_download_plat.users 
SET password_hash = 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f'
WHERE id = 2;