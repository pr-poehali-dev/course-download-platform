-- Улучшенная генерация ключевых слов на основе названия работы

-- Извлечение основных тем из названия для тегов
UPDATE t_p63326274_course_download_plat.works
SET keywords = (
  SELECT json_agg(DISTINCT keyword)::text
  FROM (
    SELECT unnest(ARRAY[
      CASE 
        WHEN title ILIKE '%электр%' THEN 'электроэнергетика'
        WHEN title ILIKE '%энергет%' THEN 'энергетика'
        WHEN title ILIKE '%эу%' THEN 'электроустановки'
        WHEN title ILIKE '%ру%' THEN 'распределительные устройства'
      END,
      CASE 
        WHEN title ILIKE '%автомат%' THEN 'автоматизация'
        WHEN title ILIKE '%управлен%' THEN 'системы управления'
        WHEN title ILIKE '%контрол%' THEN 'контроль'
      END,
      CASE
        WHEN title ILIKE '%газопровод%' THEN 'газопровод'
        WHEN title ILIKE '%нефтепровод%' THEN 'нефтепровод'
        WHEN title ILIKE '%трубопровод%' THEN 'трубопровод'
      END,
      CASE
        WHEN title ILIKE '%привод%' THEN 'привод'
        WHEN title ILIKE '%двигател%' THEN 'двигатель'
        WHEN title ILIKE '%насос%' THEN 'насос'
        WHEN title ILIKE '%компрессор%' THEN 'компрессор'
      END,
      CASE
        WHEN title ILIKE '%проектирован%' THEN 'проектирование'
        WHEN title ILIKE '%расчет%' THEN 'расчет'
        WHEN title ILIKE '%модернизац%' THEN 'модернизация'
        WHEN title ILIKE '%разработк%' THEN 'разработка'
      END,
      CASE 
        WHEN work_type ILIKE '%курсов%' THEN 'курсовая работа'
        WHEN work_type ILIKE '%диплом%' THEN 'дипломная работа'
        WHEN work_type ILIKE '%практик%' THEN 'практика'
        WHEN work_type ILIKE '%отчет%' THEN 'отчет'
      END,
      'готовая работа',
      subject
    ]) AS keyword
  ) keywords
  WHERE keyword IS NOT NULL
)
WHERE id < 10000;