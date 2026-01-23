-- Установка пустого files_list для тестовых работ без архивов
UPDATE t_p63326274_course_download_plat.works 
SET files_list = '[]'::jsonb
WHERE id IN (4861, 4864, 4865) AND (files_list IS NULL OR files_list = '[]'::jsonb);

-- Установка пустого files_list для работ с отсутствующими файлами (404)
UPDATE t_p63326274_course_download_plat.works 
SET files_list = '[]'::jsonb
WHERE id IN (4410, 4503, 4594, 4866) AND (files_list IS NULL OR files_list = '[]'::jsonb);
