-- Create admin user with ID 999999
INSERT INTO t_p63326274_course_download_plat.users 
(id, username, email, password_hash, balance, referral_code, role, created_at, updated_at)
VALUES 
(999999, 'admin', 'admin@system.local', 'ADMIN_NO_PASSWORD', 999999999, 'ADMIN', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET role = 'admin', balance = 999999999;

-- Update sequence to avoid conflicts
SELECT setval('t_p63326274_course_download_plat.users_id_seq', GREATEST(999999, (SELECT MAX(id) FROM t_p63326274_course_download_plat.users)));