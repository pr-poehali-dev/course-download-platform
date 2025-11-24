-- Добавить поле discount (процент скидки) в таблицу works
ALTER TABLE t_p63326274_course_download_plat.works 
ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT NULL;

-- Создаём индекс для быстрой фильтрации работ со скидкой
CREATE INDEX IF NOT EXISTS idx_works_discount 
ON t_p63326274_course_download_plat.works(discount) 
WHERE discount IS NOT NULL;