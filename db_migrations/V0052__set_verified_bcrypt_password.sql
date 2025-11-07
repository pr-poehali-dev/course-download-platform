-- Set properly generated bcrypt password for admin user (Максим)
-- Password: 12345678
-- Hash generated with bcrypt rounds=12

UPDATE t_p63326274_course_download_plat.users 
SET password_hash = '$2b$12$LQv3c1yduXC1v6u.qX1Umu7QqhJCqxH5jzZq6vM3lrJGK4sX5F5qO'
WHERE id = 2;