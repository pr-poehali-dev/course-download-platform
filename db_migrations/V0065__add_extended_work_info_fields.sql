-- Добавление новых полей для расширенной информации о работах

-- Имя автора (если работа от автора, а не платформы)
ALTER TABLE t_p63326274_course_download_plat.works 
ADD COLUMN IF NOT EXISTS author_name VARCHAR(255);

-- Язык работы (по умолчанию русский)
ALTER TABLE t_p63326274_course_download_plat.works 
ADD COLUMN IF NOT EXISTS language VARCHAR(100) DEFAULT 'Русский';

-- Использованное ПО (JSON массив)
ALTER TABLE t_p63326274_course_download_plat.works 
ADD COLUMN IF NOT EXISTS software TEXT DEFAULT '[]';

-- Количество отзывов
ALTER TABLE t_p63326274_course_download_plat.works 
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- Ключевые слова (теги для поиска)
ALTER TABLE t_p63326274_course_download_plat.works 
ADD COLUMN IF NOT EXISTS keywords TEXT DEFAULT '[]';

-- Индексы для ускорения поиска
CREATE INDEX IF NOT EXISTS idx_works_language ON t_p63326274_course_download_plat.works (language);
CREATE INDEX IF NOT EXISTS idx_works_author_name ON t_p63326274_course_download_plat.works (author_name);