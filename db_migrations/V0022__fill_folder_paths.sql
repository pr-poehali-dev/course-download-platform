-- Заполняем folder_path для всех работ на основе title и work_type
-- Формат: "Название (тип работы)"

UPDATE t_p63326274_course_download_plat.works
SET folder_path = title || ' (' || work_type || ' работа)'
WHERE folder_path IS NULL;