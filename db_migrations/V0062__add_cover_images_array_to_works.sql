-- Add cover_images array column to works table
ALTER TABLE works ADD COLUMN IF NOT EXISTS cover_images TEXT[];

-- Add comment
COMMENT ON COLUMN works.cover_images IS 'Array of cover image URLs for work cards (2-3 images)';