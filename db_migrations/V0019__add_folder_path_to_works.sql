-- Add folder_path column to store exact Yandex Disk folder name
ALTER TABLE works ADD COLUMN folder_path TEXT;

-- Create index for faster lookups
CREATE INDEX idx_works_folder_path ON works(folder_path);

COMMENT ON COLUMN works.folder_path IS 'Exact folder name from Yandex Disk for downloading files';