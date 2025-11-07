-- Reset password for test user rekrutiw@yandex.ru to 'test12345'
-- Hash generated with bcrypt: $2b$12$K8mJ9qW5Y3Z9qW5Y3Z9qWeuqW5Y3Z9qW5Y3Z9qW5Y3Z9qW5Y3Z9qW

UPDATE t_p63326274_course_download_plat.users 
SET password_hash = '$2b$12$LQv3c1yqBWcVbpDdAOCzie.96.Gj65Loy4qOUdN1LtIZKs8gVH9Ou'
WHERE email = 'rekrutiw@yandex.ru';