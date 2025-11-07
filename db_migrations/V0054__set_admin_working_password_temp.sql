-- Устанавливаем рабочий хеш для админа (временно пароль "testpassword")
UPDATE t_p63326274_course_download_plat.users 
SET password_hash = '$2b$12$5kcrXihpKvP12NvtcROhEO9rcrWMvWpJ3y0XAdUYak6j06/2NnmSC'
WHERE id = 2;
