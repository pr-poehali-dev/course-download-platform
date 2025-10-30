CREATE TABLE IF NOT EXISTS t_p63326274_course_download_plat.payments (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    points INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user_email ON t_p63326274_course_download_plat.payments(user_email);
CREATE INDEX idx_payments_payment_id ON t_p63326274_course_download_plat.payments(payment_id);
