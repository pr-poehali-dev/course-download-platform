-- Add Premium subscription fields to users table
ALTER TABLE t_p63326274_course_download_plat.users
ADD COLUMN is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN premium_expires_at TIMESTAMP DEFAULT NULL,
ADD COLUMN downloads_this_week INTEGER DEFAULT 0,
ADD COLUMN week_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create subscriptions table for payment history
CREATE TABLE t_p63326274_course_download_plat.subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p63326274_course_download_plat.users(id),
    subscription_type VARCHAR(50) NOT NULL, -- 'premium_monthly'
    amount INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'active', 'expired', 'cancelled'
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create download limits tracking table
CREATE TABLE t_p63326274_course_download_plat.user_downloads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p63326274_course_download_plat.users(id),
    work_id INTEGER NOT NULL REFERENCES t_p63326274_course_download_plat.works(id),
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_downloads_user_week ON t_p63326274_course_download_plat.user_downloads(user_id, downloaded_at);
