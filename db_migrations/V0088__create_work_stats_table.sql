CREATE TABLE work_stats (
    work_id INTEGER PRIMARY KEY,
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_stats_work_id ON work_stats(work_id);

COMMENT ON TABLE work_stats IS 'Статистика просмотров, скачиваний и отзывов для работ';
COMMENT ON COLUMN work_stats.work_id IS 'ID работы из каталога';
COMMENT ON COLUMN work_stats.views_count IS 'Количество просмотров';
COMMENT ON COLUMN work_stats.downloads_count IS 'Количество скачиваний';
COMMENT ON COLUMN work_stats.reviews_count IS 'Количество отзывов';