-- Add activity tracking columns to works table
ALTER TABLE works 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downloads INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_works_views ON works(views);
CREATE INDEX IF NOT EXISTS idx_works_downloads ON works(downloads);
CREATE INDEX IF NOT EXISTS idx_works_reviews_count ON works(reviews_count);
