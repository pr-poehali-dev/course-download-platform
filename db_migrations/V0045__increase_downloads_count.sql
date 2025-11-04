-- Увеличение количества скачиваний для популярности работ
-- Для дипломных работ: случайное значение от 150 до 350
UPDATE t_p63326274_course_download_plat.works 
SET downloads = FLOOR(150 + RANDOM() * 200)::int
WHERE LOWER(work_type) LIKE '%диплом%' 
   OR LOWER(work_type) LIKE '%выпускная квалификационная%'
   OR LOWER(work_type) LIKE '%диссертация%';

-- Для курсовых работ: случайное значение от 80 до 250
UPDATE t_p63326274_course_download_plat.works 
SET downloads = FLOOR(80 + RANDOM() * 170)::int
WHERE LOWER(work_type) LIKE '%курсовая%';

-- Для практики, отчетов, рефератов: случайное значение от 50 до 180
UPDATE t_p63326274_course_download_plat.works 
SET downloads = FLOOR(50 + RANDOM() * 130)::int
WHERE LOWER(work_type) LIKE '%практик%' 
   OR LOWER(work_type) LIKE '%отчет%' 
   OR LOWER(work_type) LIKE '%реферат%'
   OR LOWER(work_type) LIKE '%контрольная%'
   OR LOWER(work_type) LIKE '%лабораторная%';

-- Для остальных работ: случайное значение от 30 до 120
UPDATE t_p63326274_course_download_plat.works 
SET downloads = FLOOR(30 + RANDOM() * 90)::int
WHERE downloads IS NULL OR downloads < 30;