-- Добавление специфичных технических тегов на основе анализа названия

-- Для работ по механике и машиностроению
UPDATE t_p63326274_course_download_plat.works
SET keywords = (
  SELECT json_agg(DISTINCT keyword)::text
  FROM (
    SELECT unnest(string_to_array(keywords, '","')) AS keyword
    FROM (SELECT TRIM(BOTH '[]"' FROM keywords) AS keywords) k
    UNION
    SELECT unnest(ARRAY[
      CASE WHEN title ILIKE '%комбайн%' THEN 'сельхозтехника' END,
      CASE WHEN title ILIKE '%экскаватор%' THEN 'строительная техника' END,
      CASE WHEN title ILIKE '%износостойкост%' THEN 'материаловедение' END,
      CASE WHEN title ILIKE '%технологическ%' THEN 'технология машиностроения' END,
      CASE WHEN title ILIKE '%конструкторск%' THEN 'конструирование' END
    ])
  ) all_keywords
  WHERE keyword IS NOT NULL AND keyword != ''
)
WHERE (title ILIKE '%комбайн%' OR title ILIKE '%экскаватор%' OR title ILIKE '%машин%')
  AND id < 10000;

-- Убираем subject из тегов, заменяем на более понятные термины
UPDATE t_p63326274_course_download_plat.works
SET keywords = REPLACE(keywords, '"coursework"', '')
WHERE keywords LIKE '%coursework%';

UPDATE t_p63326274_course_download_plat.works
SET keywords = REPLACE(keywords, '""', '')
WHERE keywords LIKE '%""%';

UPDATE t_p63326274_course_download_plat.works
SET keywords = REPLACE(keywords, '[,', '[')
WHERE keywords LIKE '%[,%';

UPDATE t_p63326274_course_download_plat.works
SET keywords = REPLACE(keywords, ',]', ']')
WHERE keywords LIKE '%,]%';