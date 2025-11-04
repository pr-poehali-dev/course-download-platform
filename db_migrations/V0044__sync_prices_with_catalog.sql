-- Синхронизация цен с каталогом работ
-- Диссертации: 3000 баллов
UPDATE t_p63326274_course_download_plat.works 
SET price_points = 3000 
WHERE LOWER(work_type) LIKE '%диссертация%';

-- Дипломные работы и ВКР: 1500 баллов (уже установлено, но на всякий случай)
UPDATE t_p63326274_course_download_plat.works 
SET price_points = 1500 
WHERE LOWER(work_type) LIKE '%диплом%' 
   OR LOWER(work_type) LIKE '%выпускная квалификационная%'
   OR LOWER(work_type) LIKE '%вкр%';

-- Курсовые работы: 600 баллов (уже установлено)
UPDATE t_p63326274_course_download_plat.works 
SET price_points = 600 
WHERE LOWER(work_type) LIKE '%курсовая%';

-- Практика, отчёты, рефераты, контрольные, лабораторные, расчетно-графические: 200 баллов
UPDATE t_p63326274_course_download_plat.works 
SET price_points = 200 
WHERE LOWER(work_type) LIKE '%практик%' 
   OR LOWER(work_type) LIKE '%отчет%' 
   OR LOWER(work_type) LIKE '%реферат%'
   OR LOWER(work_type) LIKE '%контрольная%'
   OR LOWER(work_type) LIKE '%лабораторная%'
   OR LOWER(work_type) LIKE '%домашняя%'
   OR LOWER(work_type) LIKE '%расчетно-графическая%';