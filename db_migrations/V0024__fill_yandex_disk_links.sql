-- Заполняем yandex_disk_link для всех работ дефолтной публичной ссылкой
UPDATE t_p63326274_course_download_plat.works
SET yandex_disk_link = 'https://disk.yandex.ru/d/8J9vk2t_fe3cpA'
WHERE yandex_disk_link IS NULL OR yandex_disk_link = '';