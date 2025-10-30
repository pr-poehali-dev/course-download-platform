CREATE TABLE IF NOT EXISTS t_p63326274_course_download_plat.password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON t_p63326274_course_download_plat.password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON t_p63326274_course_download_plat.password_resets(user_id);
