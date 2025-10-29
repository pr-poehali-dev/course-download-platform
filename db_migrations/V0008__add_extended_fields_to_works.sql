-- Добавляем новые поля к существующей таблице
ALTER TABLE t_p63326274_course_download_plat.works 
ADD COLUMN IF NOT EXISTS universities TEXT,
ADD COLUMN IF NOT EXISTS preview_image_url TEXT,
ADD COLUMN IF NOT EXISTS file_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_graphics BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_presentation BOOLEAN DEFAULT FALSE;

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_works_type ON t_p63326274_course_download_plat.works(work_type);
CREATE INDEX IF NOT EXISTS idx_works_subject ON t_p63326274_course_download_plat.works(subject);
CREATE INDEX IF NOT EXISTS idx_works_price ON t_p63326274_course_download_plat.works(price_points);