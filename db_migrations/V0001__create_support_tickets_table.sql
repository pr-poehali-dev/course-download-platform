-- Создание таблицы для тикетов технической поддержки
CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'answered', 'closed')),
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по статусу
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- Индекс для поиска по email
CREATE INDEX idx_support_tickets_email ON support_tickets(user_email);

-- Индекс для сортировки по дате
CREATE INDEX idx_support_tickets_created ON support_tickets(created_at DESC);