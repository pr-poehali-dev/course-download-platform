-- Увеличиваем все VARCHAR поля до безопасных значений
ALTER TABLE t_p63326274_course_download_plat.works 
ALTER COLUMN work_type TYPE VARCHAR(500);

ALTER TABLE t_p63326274_course_download_plat.works 
ALTER COLUMN subject TYPE VARCHAR(500);

COMMENT ON COLUMN t_p63326274_course_download_plat.works.work_type IS 'Work type, increased to 500 chars for complex types';
COMMENT ON COLUMN t_p63326274_course_download_plat.works.subject IS 'Subject area, increased to 500 chars for long subjects';