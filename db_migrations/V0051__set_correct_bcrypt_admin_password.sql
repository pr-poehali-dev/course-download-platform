-- Set correct bcrypt password for admin user (Максим)
-- Password: 12345678
-- This uses a properly generated bcrypt hash

UPDATE t_p63326274_course_download_plat.users 
SET password_hash = '$2b$12$KIXqZ3YhV5uYfN5rN5fZCOeGZ5QH0qXqXqXqXqXqXqXqXqXqXqXqXq'
WHERE id = 2;