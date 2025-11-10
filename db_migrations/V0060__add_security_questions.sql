-- Add security question fields to users table
ALTER TABLE users 
ADD COLUMN security_question TEXT,
ADD COLUMN security_answer_hash TEXT;