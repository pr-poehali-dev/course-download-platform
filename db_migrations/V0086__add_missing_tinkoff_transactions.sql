-- Добавление транзакций за успешные платежи через Tinkoff
-- которые не были записаны из-за ошибки constraint

-- Транзакция для user_id=1000021 (maximus) - 110 баллов
INSERT INTO t_p63326274_course_download_plat.transactions (user_id, type, amount, description, created_at)
VALUES (1000021, 'refill', 110, 'Пополнение через Тинькофф: 110 баллов (PaymentId: 7421796580)', '2025-11-22 03:33:06');

-- Транзакция для user_id=1000015 (ker) - 700 баллов  
INSERT INTO t_p63326274_course_download_plat.transactions (user_id, type, amount, description, created_at)
VALUES (1000015, 'refill', 700, 'Пополнение через Тинькофф: 700 баллов (PaymentId: 7418060961)', '2025-11-22 03:33:12');