-- Обновление цен для курсовых работ на 600 баллов
UPDATE t_p63326274_course_download_plat.works 
SET price_points = 600 
WHERE LOWER(work_type) LIKE '%курсовая%';

-- Обновление цен для дипломных работ на 1500 баллов
UPDATE t_p63326274_course_download_plat.works 
SET price_points = 1500 
WHERE LOWER(work_type) LIKE '%диплом%' 
   OR LOWER(work_type) LIKE '%выпускная квалификационная%'
   OR LOWER(work_type) LIKE '%диссертация%';

-- Обновление цен для отчетов, практики и рефератов на 200 баллов
UPDATE t_p63326274_course_download_plat.works 
SET price_points = 200 
WHERE LOWER(work_type) LIKE '%отчет%' 
   OR LOWER(work_type) LIKE '%практик%' 
   OR LOWER(work_type) LIKE '%реферат%'
   OR LOWER(work_type) LIKE '%контрольная%'
   OR LOWER(work_type) LIKE '%лабораторная%'
   OR LOWER(work_type) LIKE '%домашняя%';