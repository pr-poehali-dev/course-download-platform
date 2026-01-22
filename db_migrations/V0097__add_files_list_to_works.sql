-- Добавляем поле files_list для хранения списка файлов из архива
ALTER TABLE t_p63326274_course_download_plat.works 
ADD COLUMN IF NOT EXISTS files_list JSONB DEFAULT '[]'::jsonb;

-- Добавляем комментарий к полю
COMMENT ON COLUMN t_p63326274_course_download_plat.works.files_list IS 'Список файлов в архиве работы: [{"name": "ПЗ.docx", "type": "word", "size": 1024000}]';