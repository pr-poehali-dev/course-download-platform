CREATE TABLE IF NOT EXISTS uploaded_works (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    work_type VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price_points INTEGER NOT NULL,
    file_name VARCHAR(500),
    file_size BIGINT,
    file_url TEXT,
    moderation_status VARCHAR(50) DEFAULT 'pending',
    moderation_comment TEXT,
    moderator_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moderated_at TIMESTAMP,
    published_at TIMESTAMP,
    downloads_count INTEGER DEFAULT 0,
    earnings_total INTEGER DEFAULT 0
);

CREATE INDEX idx_uploaded_works_user_id ON uploaded_works(user_id);
CREATE INDEX idx_uploaded_works_status ON uploaded_works(moderation_status);
CREATE INDEX idx_uploaded_works_created ON uploaded_works(created_at DESC);