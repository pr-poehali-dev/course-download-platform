-- Add case-insensitive unique indexes for email and username
-- This prevents creating users with same email/username in different cases

CREATE UNIQUE INDEX IF NOT EXISTS users_email_ci 
  ON t_p63326274_course_download_plat.users (lower(email));

CREATE UNIQUE INDEX IF NOT EXISTS users_username_ci 
  ON t_p63326274_course_download_plat.users (lower(username));