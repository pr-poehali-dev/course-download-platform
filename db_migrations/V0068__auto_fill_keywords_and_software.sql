-- Автоматическое заполнение ключевых слов на основе названия и типа работы

-- Для электроэнергетики
UPDATE t_p63326274_course_download_plat.works
SET 
  keywords = '["электроэнергетика", "энергетика", "электротехника", "курсовая работа", "готовая работа"]',
  software = '["AutoCAD Electrical", "КОМПАС-Электрик", "Microsoft Word", "Excel"]',
  language = 'Русский'
WHERE (title ILIKE '%электр%' OR title ILIKE '%энергет%' OR title ILIKE '%эу%' OR title ILIKE '%ру%')
  AND keywords = '[]';

-- Для автоматизации
UPDATE t_p63326274_course_download_plat.works
SET 
  keywords = '["автоматизация", "управление", "АСУ", "курсовая работа", "готовая работа"]',
  software = '["SCADA", "TIA Portal", "STEP 7", "Microsoft Word", "Excel"]',
  language = 'Русский'
WHERE (title ILIKE '%автоматиз%' OR title ILIKE '%управлен%' OR title ILIKE '%асу%')
  AND keywords = '[]';

-- Для строительства
UPDATE t_p63326274_course_download_plat.works
SET 
  keywords = '["строительство", "проектирование", "конструкции", "курсовая работа", "готовая работа"]',
  software = '["AutoCAD", "ArchiCAD", "ЛИРА-САПР", "Microsoft Word", "Excel"]',
  language = 'Русский'
WHERE (title ILIKE '%строител%' OR title ILIKE '%здание%' OR title ILIKE '%конструк%')
  AND keywords = '[]';

-- Для механики и машиностроения  
UPDATE t_p63326274_course_download_plat.works
SET 
  keywords = '["механика", "машиностроение", "технология", "расчет", "курсовая работа"]',
  software = '["КОМПАС-3D", "SolidWorks", "AutoCAD", "Microsoft Word", "Excel"]',
  language = 'Русский'
WHERE (title ILIKE '%механ%' OR title ILIKE '%машин%' OR title ILIKE '%привод%' OR title ILIKE '%станок%')
  AND keywords = '[]';

-- Для транспорта
UPDATE t_p63326274_course_download_plat.works
SET 
  keywords = '["транспорт", "автомобиль", "дорожное строительство", "курсовая работа", "готовая работа"]',
  software = '["AutoCAD", "КОМПАС-3D", "Microsoft Word", "Excel"]',
  language = 'Русский'
WHERE (title ILIKE '%транспорт%' OR title ILIKE '%автомобил%' OR title ILIKE '%дорог%')
  AND keywords = '[]';

-- Для всех остальных работ
UPDATE t_p63326274_course_download_plat.works
SET 
  keywords = '["курсовая работа", "готовая работа", "инженерия", "технические науки"]',
  software = '["Microsoft Word", "Excel", "PowerPoint"]',
  language = 'Русский'
WHERE keywords = '[]' OR keywords IS NULL;