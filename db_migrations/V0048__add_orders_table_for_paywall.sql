-- Добавляем таблицу заказов (orders) для поддержки pending статуса перед оплатой
CREATE TABLE IF NOT EXISTS t_p63326274_course_download_plat.orders (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p63326274_course_download_plat.users(id),
  work_id INTEGER NOT NULL REFERENCES t_p63326274_course_download_plat.works(id),
  status TEXT NOT NULL CHECK (status IN ('pending','paid','canceled')) DEFAULT 'pending',
  amount_cents INTEGER NOT NULL,
  payment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Индекс для быстрой проверки оплаченных заказов
CREATE INDEX IF NOT EXISTS idx_orders_user_work_paid 
  ON t_p63326274_course_download_plat.orders (user_id, work_id) 
  WHERE status = 'paid';

-- Индекс для поиска pending заказов
CREATE INDEX IF NOT EXISTS idx_orders_status 
  ON t_p63326274_course_download_plat.orders (status, created_at DESC);