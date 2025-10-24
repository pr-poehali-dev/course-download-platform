-- Таблица для хранения результатов проверок на плагиат
CREATE TABLE plagiarism_checks (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    file_hash VARCHAR(64) NOT NULL,
    text_content TEXT,
    uniqueness_percent DECIMAL(5,2) NOT NULL,
    similar_works JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT status_check CHECK (status IN ('processing', 'completed', 'failed'))
);

-- Индексы для быстрого поиска
CREATE INDEX idx_plagiarism_work ON plagiarism_checks(work_id);
CREATE INDEX idx_plagiarism_user ON plagiarism_checks(user_id);
CREATE INDEX idx_plagiarism_hash ON plagiarism_checks(file_hash);

-- Добавляем поле для хранения хеша файла в таблицу works
ALTER TABLE works ADD COLUMN file_hash VARCHAR(64);
CREATE INDEX idx_works_hash ON works(file_hash);