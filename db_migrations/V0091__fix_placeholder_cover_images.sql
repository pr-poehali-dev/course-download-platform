-- Fix placeholder cover images URLs for test work
UPDATE t_p63326274_course_download_plat.works 
SET cover_images = NULL 
WHERE id = 4861 AND cover_images::text LIKE '%storage.example.com%';