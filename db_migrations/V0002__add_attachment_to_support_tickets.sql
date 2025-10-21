-- Добавление колонки для хранения URL изображений в тикетах поддержки
ALTER TABLE support_tickets ADD COLUMN attachment_url TEXT;