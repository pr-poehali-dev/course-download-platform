-- Устанавливаем временный пароль "admin123456" для пользователя ID=2
-- Хеш bcrypt для пароля "admin123456"
UPDATE t_p63326274_course_download_plat.users 
SET password_hash = '$2b$12$LQv3c1yduXC1v6u.qX1Umu2eZ3qB5UXjKzH5Xz5K7WqGqT3qJ2qVG'
WHERE id = 2;