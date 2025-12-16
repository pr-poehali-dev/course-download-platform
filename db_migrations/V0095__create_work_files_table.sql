-- Создаём таблицу для хранения множественных файлов работ
CREATE TABLE IF NOT EXISTS t_p63326274_course_download_plat.work_files (
  id SERIAL PRIMARY KEY,
  work_id INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для быстрого поиска файлов по work_id
CREATE INDEX IF NOT EXISTS idx_work_files_work_id ON t_p63326274_course_download_plat.work_files(work_id);