-- Добавляем недостающие колонки в таблицу works
ALTER TABLE works ADD COLUMN author_id INTEGER;
ALTER TABLE works ADD COLUMN category_id INTEGER;
ALTER TABLE works ADD COLUMN file_url VARCHAR(500);
ALTER TABLE works ADD COLUMN file_size_mb DECIMAL(10,2);
ALTER TABLE works ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE works ADD COLUMN views_count INTEGER DEFAULT 0;

-- Добавляем внешние ключи
ALTER TABLE works ADD CONSTRAINT fk_works_author FOREIGN KEY (author_id) REFERENCES users(id);
ALTER TABLE works ADD CONSTRAINT fk_works_category FOREIGN KEY (category_id) REFERENCES categories(id);
ALTER TABLE works ADD CONSTRAINT works_status_check CHECK (status IN ('pending', 'approved', 'rejected'));

-- Транзакции (покупки баллов и комиссии)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT type_check CHECK (type IN ('purchase', 'refill', 'commission', 'referral'))
);

-- Покупки работ
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    work_id INTEGER NOT NULL REFERENCES works(id),
    price_paid INTEGER NOT NULL,
    commission INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(buyer_id, work_id)
);

-- Избранное
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    work_id INTEGER NOT NULL REFERENCES works(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, work_id)
);

-- Отзывы
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(work_id, user_id)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_works_author ON works(author_id);
CREATE INDEX idx_works_category ON works(category_id);
CREATE INDEX idx_works_status ON works(status);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX idx_purchases_work ON purchases(work_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_reviews_work ON reviews(work_id);

-- Вставка базовых категорий
INSERT INTO categories (name, slug) VALUES
    ('Курсовые работы', 'coursework'),
    ('Рефераты', 'essays'),
    ('Лабораторные', 'labs'),
    ('Дипломные работы', 'thesis'),
    ('Контрольные работы', 'tests'),
    ('Презентации', 'presentations'),
    ('Шпаргалки', 'cheatsheets'),
    ('Конспекты', 'notes');