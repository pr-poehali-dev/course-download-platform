-- Синхронизировать количество просмотров со скачиваниями
UPDATE works SET views = downloads WHERE views != downloads;