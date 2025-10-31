-- Update promo code expiry dates to 2025
UPDATE t_p63326274_course_download_plat.promo_codes 
SET expires_at = '2025-12-31 23:59:59' 
WHERE code IN ('WELCOME2024', 'STUDENT100');
