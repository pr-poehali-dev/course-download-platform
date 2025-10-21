-- Таблица для работ (курсовые, дипломные и тд)
CREATE TABLE IF NOT EXISTS works (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    work_type VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    composition TEXT,
    price_points INTEGER NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для файлов (изображения работ)
CREATE TABLE IF NOT EXISTS work_files (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id),
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_works_type ON works(work_type);
CREATE INDEX IF NOT EXISTS idx_works_subject ON works(subject);
CREATE INDEX IF NOT EXISTS idx_work_files_work_id ON work_files(work_id);
