# Work Archive Image Checker

This script analyzes work archives stored in Yandex S3 to find image files that could be used as previews.

## Requirements

Python 3.6+ with the following packages:
- psycopg2-binary
- boto3

## Installation

```bash
pip install psycopg2-binary boto3
```

## Environment Variables

Before running the script, set the following environment variables:

```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
export YANDEX_S3_KEY_ID="your_yandex_s3_key_id"
export YANDEX_S3_SECRET_KEY="your_yandex_s3_secret_key"
```

## Usage

```bash
python3 check_work_images.py
```

## What the Script Does

1. Connects to PostgreSQL using DATABASE_URL
2. Queries for 10 works that don't have preview_url but have a file_url or archive_url
3. For each work:
   - Downloads the ZIP archive from Yandex S3
   - Lists all image files (PNG, JPG, JPEG, GIF, BMP, WEBP)
   - Notes exact paths and filenames
4. Outputs a summary table with:
   - Work ID
   - Title
   - Image files found (with paths)
   - Image count
   - JPEG indicator (important!)

## Output

The script provides three sections:

1. **Summary Table**: Quick overview of all works with image counts
2. **Detailed Image Listings**: Full paths of all images found in each archive
3. **Statistics**: Overall summary of findings

JPEG/JPG files are specially highlighted as they are critical for preview generation.

## Database Query

The script uses this query to find works:

```sql
SELECT id, title, file_url, archive_url
FROM works
WHERE preview_url IS NULL
  AND (file_url IS NOT NULL OR archive_url IS NOT NULL)
ORDER BY id
LIMIT 10;
```

## S3 Configuration

- Endpoint: https://storage.yandexcloud.net
- Signature version: s3v4
- Supports both URL formats:
  - https://storage.yandexcloud.net/bucket/key
  - https://bucket.storage.yandexcloud.net/key

## Notes

- The script checks both root directory and all subdirectories in the ZIP
- All image extensions are case-insensitive
- The script will skip any files that are not valid ZIP archives
- Errors are reported but don't stop the entire process
