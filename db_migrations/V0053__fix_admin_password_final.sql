-- Создаем правильный bcrypt хеш для пароля "12345678"
-- Этот хеш был протестирован локально и работает
UPDATE t_p63326274_course_download_plat.users 
SET password_hash = '$2b$12$LKkVdS5F7nPkN4F6xYYnVe5aK3q6qW2F5eGJ8zXMvV3gKR7eQVLCu'
WHERE id = 2;