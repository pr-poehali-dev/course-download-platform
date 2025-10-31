-- Increase title field length to accommodate long work names
ALTER TABLE t_p63326274_course_download_plat.works 
ALTER COLUMN title TYPE VARCHAR(1000);

COMMENT ON COLUMN t_p63326274_course_download_plat.works.title IS 'Work title, increased to 1000 chars for long names';