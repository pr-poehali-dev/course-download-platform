-- Add role column to users table for admin privileges
ALTER TABLE t_p63326274_course_download_plat.users 
ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Set admin role for user with id=1 (current admin)
UPDATE t_p63326274_course_download_plat.users 
SET role = 'admin' 
WHERE id = 1;