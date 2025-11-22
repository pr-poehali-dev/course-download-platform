-- Ручное зачисление баллов за платёж 500₽ (22.11.2025)
-- Платёж не был обработан автоматически из-за ошибки проверки подписи

-- Обновляем баланс пользователя ker (id=1000015)
UPDATE t_p63326274_course_download_plat.users 
SET balance = balance + 110 
WHERE id = 1000015;

-- Добавляем транзакцию
INSERT INTO t_p63326274_course_download_plat.transactions (user_id, type, amount, description)
VALUES (1000015, 'refill', 110, 'Ручное зачисление баллов за платёж 500₽ (22.11.2025)');