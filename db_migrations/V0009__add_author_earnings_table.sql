CREATE TABLE IF NOT EXISTS t_p63326274_course_download_plat.author_earnings (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES t_p63326274_course_download_plat.users(id),
    work_id INTEGER NOT NULL REFERENCES t_p63326274_course_download_plat.works(id),
    purchase_id INTEGER NOT NULL REFERENCES t_p63326274_course_download_plat.purchases(id),
    sale_amount INTEGER NOT NULL,
    author_share INTEGER NOT NULL,
    platform_fee INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_author_earnings_author ON t_p63326274_course_download_plat.author_earnings(author_id);
CREATE INDEX idx_author_earnings_status ON t_p63326274_course_download_plat.author_earnings(status);

COMMENT ON TABLE t_p63326274_course_download_plat.author_earnings IS 'Author earnings from work sales with 90/10 split';
COMMENT ON COLUMN t_p63326274_course_download_plat.author_earnings.sale_amount IS 'Total sale price in points';
COMMENT ON COLUMN t_p63326274_course_download_plat.author_earnings.author_share IS 'Author receives 90% of sale';
COMMENT ON COLUMN t_p63326274_course_download_plat.author_earnings.platform_fee IS 'Platform takes 10% fee';
COMMENT ON COLUMN t_p63326274_course_download_plat.author_earnings.status IS 'pending, paid, or cancelled';
