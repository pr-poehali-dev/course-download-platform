-- Обновление цен для дипломных работ (ВКР, диплом)
UPDATE works 
SET price = 5000, price_points = 5000, pages = 80
WHERE category = 'diploma';

-- Обновление цен для курсовых проектов (с чертежами)
UPDATE works 
SET price = 2000, price_points = 2000, pages = 40
WHERE work_type ILIKE '%проект%' AND category = 'coursework';

-- Обновление цен для расчетно-графических работ
UPDATE works 
SET price = 1800, price_points = 1800, pages = 30
WHERE work_type ILIKE '%расчетно-графическ%';

-- Обновление цен для отчетов по практике
UPDATE works 
SET price = 1200, price_points = 1200, pages = 25
WHERE category = 'report';

-- Обновление цен для контрольных работ
UPDATE works 
SET price = 800, price_points = 800, pages = 15
WHERE category = 'test';

-- Обновление цен для рефератов
UPDATE works 
SET price = 500, price_points = 500, pages = 20
WHERE category = 'essay';

-- Обновление цен для лабораторных работ
UPDATE works 
SET price = 600, price_points = 600, pages = 12
WHERE category = 'lab';