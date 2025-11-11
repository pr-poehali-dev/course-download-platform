-- Добавление тестовых данных для демонстрации новых полей

-- Обновляем работу от платформы (без автора)
UPDATE t_p63326274_course_download_plat.works 
SET 
  author_name = NULL,
  language = 'Русский',
  software = '["AutoCAD", "КОМПАС-3D", "Microsoft Word", "Excel"]',
  keywords = '["льноуборочный комбайн", "сельхозтехника", "курсовая работа", "технологический расчет", "конструкторский расчет"]',
  reviews_count = 5
WHERE id = 4856;

-- Обновляем работы с авторами
UPDATE t_p63326274_course_download_plat.works 
SET 
  author_name = 'Иванов Петр Сергеевич',
  language = 'Русский',
  software = '["AutoCAD", "SolidWorks", "Microsoft Word"]',
  keywords = '["электроэнергетика", "автоматизация", "курсовой проект"]',
  reviews_count = 3
WHERE author_id IS NOT NULL AND author_id IN (1, 2, 3);

-- Для работ от платформы добавляем базовые данные
UPDATE t_p63326274_course_download_plat.works 
SET 
  language = 'Русский',
  software = '["Microsoft Word", "Excel", "PowerPoint"]',
  keywords = '["курсовая", "диплом", "инженерия"]',
  reviews_count = 0
WHERE author_name IS NULL AND keywords = '[]' AND id < 5000;