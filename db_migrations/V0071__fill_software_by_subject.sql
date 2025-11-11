-- Заполнение софта для всех работ по предметным областям

-- Для работ по машиностроению и механике
UPDATE t_p63326274_course_download_plat.works
SET software = '["КОМПАС-3D", "AutoCAD", "SolidWorks", "Microsoft Word"]'
WHERE (title ILIKE '%машин%' OR title ILIKE '%механ%' OR title ILIKE '%деталь%' OR title ILIKE '%узел%')
  AND (software = '[]' OR software IS NULL);

-- Для работ по сельхозтехнике
UPDATE t_p63326274_course_download_plat.works
SET software = '["КОМПАС-3D", "AutoCAD", "Microsoft Word", "Excel"]'
WHERE (title ILIKE '%комбайн%' OR title ILIKE '%трактор%' OR title ILIKE '%сельхоз%')
  AND (software = '[]' OR software IS NULL);

-- Для строительной техники
UPDATE t_p63326274_course_download_plat.works
SET software = '["AutoCAD", "КОМПАС-3D", "Microsoft Word", "Excel"]'
WHERE (title ILIKE '%экскаватор%' OR title ILIKE '%бульдозер%' OR title ILIKE '%кран%')
  AND (software = '[]' OR software IS NULL);

-- Для электроэнергетики
UPDATE t_p63326274_course_download_plat.works
SET software = '["AutoCAD Electrical", "КОМПАС-Электрик", "Microsoft Word", "Excel"]'
WHERE (title ILIKE '%электр%' OR title ILIKE '%энергет%')
  AND (software = '[]' OR software IS NULL);

-- Для всех остальных работ - базовый набор
UPDATE t_p63326274_course_download_plat.works
SET software = '["Microsoft Word", "Excel"]'
WHERE (software = '[]' OR software IS NULL);