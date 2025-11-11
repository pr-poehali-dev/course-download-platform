-- Исправление экранирования в JSON полях keywords

-- Очистка и перестройка keywords для корректного JSON формата
UPDATE t_p63326274_course_download_plat.works
SET keywords = 
  CASE 
    WHEN keywords LIKE '%\\"%' THEN 
      -- Убираем двойное экранирование
      REPLACE(REPLACE(REPLACE(keywords, '\\"', '"'), '""', '"'), '[",', '["')
    ELSE keywords
  END
WHERE keywords LIKE '%\\"%';