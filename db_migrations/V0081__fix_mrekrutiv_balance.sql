-- Fix incorrect balance for mrekrutiv@mail.ru user
-- The balance was inflated due to bug in activate-promo function
-- Bug: column name was 'transaction_type' instead of 'type', causing multiple bonus accruals
-- Correct balance should be: 100 (registration) + 50 + 100 + 200 (promos) = 450

UPDATE t_p63326274_course_download_plat.users 
SET balance = 450 
WHERE email = 'mrekrutiv@mail.ru' AND balance > 450;
