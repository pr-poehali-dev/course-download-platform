# ZIP File Investigation Tool

This tool investigates the structure of ZIP files stored in S3 for works in the database.

## Requirements

- Python 3.7+
- psycopg2-binary
- boto3

## Setup

1. Install dependencies:
```bash
pip install -r investigate_zip_requirements.txt
```

2. Set required environment variables:
```bash
export DATABASE_URL='your_postgres_connection_string'
export YANDEX_S3_KEY_ID='your_yandex_s3_key_id'
export YANDEX_S3_SECRET_KEY='your_yandex_s3_secret_key'
```

## Available Scripts

### 1. investigate_zip.py (Main Script)
Uses the `download_url` field from the database which contains the full S3 URL.

**Usage:**
```bash
python investigate_zip.py
```

### 2. investigate_zip_alternative.py (Fallback Script)
Automatically detects available columns (download_url, file_key, file_url) and uses the best available option.
Use this if the main script fails or if your database schema differs.

**Usage:**
```bash
python investigate_zip_alternative.py
```

### 3. run_investigate_zip.sh (Automated Script)
Sets up a virtual environment and runs the investigation automatically.

**Usage:**
```bash
chmod +x run_investigate_zip.sh
./run_investigate_zip.sh
```

## What it does

1. Connects to the PostgreSQL database using DATABASE_URL
2. Searches for a work with title containing "износостойкост" or "экскаватор"
3. Retrieves the work's download URL or file key from the works table
4. Downloads the ZIP file from Yandex S3 storage (bucket: kyra)
5. Extracts and lists ALL files in the ZIP archive with their full paths
6. Specifically identifies any PNG files and their exact paths

## Output

The script will display:
- Work ID and title
- Download URL and/or file key in S3
- S3 bucket and object key details
- Complete list of files in the ZIP with their paths and sizes
- File type indicators ([FILE] or [DIR])
- Specifically highlighted PNG files if present

## Database Schema

The script expects a `works` table with at least:
- `id` - Work identifier
- `title` - Work title
- `download_url` - Full S3 URL (format: https://storage.yandexcloud.net/bucket/path/to/file.zip)

Alternative fields that may be used:
- `file_key` - S3 key (format: bucket/path/to/file.zip or just filename)
- `file_url` - Alternative URL field

## S3 Configuration

- Endpoint: https://storage.yandexcloud.net
- Region: ru-central1
- Default Bucket: kyra
- File format: ZIP archives converted from RAR
