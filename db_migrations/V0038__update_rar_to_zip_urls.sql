-- Обновляем все ссылки с .rar на .zip
UPDATE works 
SET download_url = REPLACE(download_url, '.rar', '.zip'),
    file_url = REPLACE(file_url, '.rar', '.zip')
WHERE download_url LIKE '%.rar';
