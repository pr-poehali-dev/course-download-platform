-- Создание тестового пользователя для проверки системы покупок
INSERT INTO t_p63326274_course_download_plat.users 
(username, email, password_hash, referral_code, balance, role) 
VALUES 
('test_buyer', 'test@techforma.pro', '$2b$10$abcdefghijklmnopqrstuv', 'TEST001', 5000, 'user');

-- Обновляем баланс maximus для тестов
UPDATE t_p63326274_course_download_plat.users 
SET balance = 5000 
WHERE username = 'maximus';