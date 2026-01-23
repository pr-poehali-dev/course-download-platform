-- Reset files_list to trigger re-population with correct encoding
UPDATE t_p63326274_course_download_plat.works 
SET files_list = '[]'::jsonb 
WHERE files_list IS NOT NULL AND files_list != '[]'::jsonb;