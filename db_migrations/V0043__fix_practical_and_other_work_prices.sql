-- Исправление цен для практических работ на 200 баллов
UPDATE t_p63326274_course_download_plat.works 
SET price_points = 200 
WHERE work_type IN ('практическая', 'практическая работа', 'практические', 'практические работы');

-- Исправление для части курсовой работы
UPDATE t_p63326274_course_download_plat.works 
SET price_points = 600 
WHERE work_type = 'часть курсовой работы';

-- Исправление других работ которые не должны быть 1500
UPDATE t_p63326274_course_download_plat.works 
SET price_points = 200 
WHERE work_type IN ('аттестационная работа', 'студентческая работа', 'вариант Котельная', '~2', 'черт. 723.03.02.04.004 в CAD-CAM-CAPP системах', 'чертежи');