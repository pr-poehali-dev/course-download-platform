-- Временно даём тестовому пользователю баллы для проверки покупки
UPDATE t_p63326274_course_download_plat.users
SET balance = 5000
WHERE email = 'rekrutiw@yandex.ru';