-- Исправление категорий для дипломных работ
UPDATE works SET category = 'diploma' 
WHERE work_type ILIKE '%диплом%' 
   OR work_type ILIKE '%вкр%' 
   OR work_type ILIKE '%выпускн%'
   OR work_type ILIKE '%диссерт%';

-- Исправление категорий для отчетов и практик
UPDATE works SET category = 'report' 
WHERE work_type ILIKE '%отчет%' 
   OR work_type ILIKE '%практик%';

-- Исправление категорий для рефератов
UPDATE works SET category = 'essay' 
WHERE work_type ILIKE '%реферат%' 
   OR work_type ILIKE '%литератур%обзор%';

-- Исправление категорий для контрольных работ
UPDATE works SET category = 'test' 
WHERE work_type ILIKE '%контрольн%' 
   OR work_type ILIKE '%домашн%';

-- Исправление категорий для лабораторных работ
UPDATE works SET category = 'lab' 
WHERE work_type ILIKE '%лаборатор%';

-- Обновляем subject чтобы соответствовал category
UPDATE works SET subject = category;