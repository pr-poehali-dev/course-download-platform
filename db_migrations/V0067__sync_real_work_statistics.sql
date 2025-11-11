-- Синхронизация данных работ с реальными статистиками из покупок и отзывов

-- Обновляем reviews_count на основе реальных отзывов
UPDATE t_p63326274_course_download_plat.works w
SET reviews_count = (
  SELECT COUNT(*) 
  FROM t_p63326274_course_download_plat.reviews r 
  WHERE r.work_id = w.id
);

-- Обновляем downloads на основе реальных покупок
UPDATE t_p63326274_course_download_plat.works w
SET downloads = GREATEST(
  downloads,
  (SELECT COUNT(*) FROM t_p63326274_course_download_plat.purchases p WHERE p.work_id = w.id)
);

-- Обновляем views_count - добавляем просмотры на основе покупок (минимум покупки * 10)
UPDATE t_p63326274_course_download_plat.works w
SET views_count = GREATEST(
  COALESCE(views_count, 0),
  (SELECT COUNT(*) * 10 FROM t_p63326274_course_download_plat.purchases p WHERE p.work_id = w.id)
);