-- Добавляем тип 'sale' в разрешенные типы транзакций
ALTER TABLE t_p63326274_course_download_plat.transactions 
DROP CONSTRAINT type_check;

ALTER TABLE t_p63326274_course_download_plat.transactions 
ADD CONSTRAINT type_check CHECK (type IN ('purchase', 'refill', 'commission', 'referral', 'sale'));