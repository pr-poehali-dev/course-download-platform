-- Create promo codes table
CREATE TABLE t_p63326274_course_download_plat.promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    bonus_points INTEGER NOT NULL,
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user promo activations table
CREATE TABLE t_p63326274_course_download_plat.user_promo_activations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p63326274_course_download_plat.users(id),
    promo_code_id INTEGER NOT NULL REFERENCES t_p63326274_course_download_plat.promo_codes(id),
    bonus_received INTEGER NOT NULL,
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, promo_code_id)
);

-- Insert sample promo codes
INSERT INTO t_p63326274_course_download_plat.promo_codes (code, bonus_points, max_uses, expires_at)
VALUES 
    ('WELCOME2024', 50, NULL, '2024-12-31 23:59:59'),
    ('STUDENT100', 100, 1000, '2024-12-31 23:59:59'),
    ('VIPUSER', 200, 100, NULL);
