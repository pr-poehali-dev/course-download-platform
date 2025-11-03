# S3 File Access Debugging Instructions

## Overview
This debugging script helps diagnose S3 file access issues for work ID 4851 ("русловые исследования").

## Files Created
1. **debug_s3.py** - Main Python debugging script
2. **run_debug_s3.sh** - Bash script to run the debug with proper setup
3. **requirements.txt** - Python dependencies (boto3, psycopg2-binary)

## Prerequisites
You must have the following environment variables set:
- `DATABASE_URL` - PostgreSQL connection string
- `YANDEX_S3_KEY_ID` - Yandex S3 Access Key ID
- `YANDEX_S3_SECRET_KEY` - Yandex S3 Secret Access Key

## How to Run

### Option 1: Using the bash script
```bash
chmod +x run_debug_s3.sh
./run_debug_s3.sh
```

### Option 2: Manual run
```bash
# Install dependencies
pip3 install boto3 psycopg2-binary

# Run the script
python3 debug_s3.py
```

## What the Script Does

### Step 1: Environment Check
- Verifies all required environment variables are present
- Shows partial values (for security)

### Step 2: Database Query
- Connects to PostgreSQL database
- Queries work with ID 4851
- Retrieves: id, title, download_url

### Step 3: S3 Client Initialization
- Creates boto3 S3 client
- Uses endpoint: https://storage.yandexcloud.net
- Region: ru-central1
- Config: s3v4 signature

### Step 4: Bucket Listing
- Lists all objects in 'kyra' bucket
- Shows first 50 objects
- Identifies files with 'works/' prefix
- Helps understand actual bucket structure

### Step 5: URL Parsing
- Parses the download_url from database
- Extracts the path component
- Removes bucket name if present

### Step 6: Multiple Access Attempts
The script tries 6 different approaches to access the file:

1. **Direct path from download_url**
   - Uses path exactly as stored in database

2. **URL decoded path (unquote)**
   - Decodes percent-encoded characters (e.g., %D0%B0 → а)
   - Important for Cyrillic filenames

3. **With 'works/' prefix**
   - Adds 'works/' before the path
   - Tests if files are organized in a 'works/' directory

4. **URL decoded with 'works/' prefix**
   - Combines URL decoding with 'works/' prefix

5. **Just the filename**
   - Uses only the filename without any directory path
   - Tests if files are in bucket root

6. **URL decoded filename with 'works/' prefix**
   - Filename only, decoded, with 'works/' prefix

## What to Look For in Output

### Success Indicators
- ✓ symbols indicate successful steps
- "SUCCESS! File found" message
- File metadata (Content-Length, Content-Type, Last-Modified)

### Failure Indicators
- ❌ symbols indicate failures
- Error codes and messages
- Common errors:
  - `NoSuchKey` - File doesn't exist at that path
  - `AccessDenied` - Permission issue
  - `InvalidAccessKeyId` - Wrong credentials

### Important Information to Collect

1. **Download URL from database**
   - What's actually stored in the database?

2. **Bucket structure**
   - Are files in root or in 'works/' subdirectory?
   - What's the actual naming pattern?

3. **Which approach worked**
   - Did any of the 6 approaches succeed?
   - What was the correct path format?

4. **Exact error messages**
   - Error codes help diagnose the issue
   - Error messages provide context

## Common Issues and Solutions

### Issue: NoSuchKey error
**Problem**: File path doesn't match S3 key
**Solutions**:
- Check if files use 'works/' prefix
- Verify URL encoding (Cyrillic characters)
- Compare database path with actual bucket structure

### Issue: AccessDenied
**Problem**: Insufficient permissions
**Solutions**:
- Verify S3 credentials are correct
- Check IAM/bucket policies
- Ensure credentials have read access

### Issue: File exists but can't download
**Problem**: Path mismatch between database and S3
**Solutions**:
- Update download_url in database to match actual S3 path
- Modify application code to transform paths correctly
- Consider migration script to fix all paths

## Next Steps Based on Results

### If a path works:
1. Note which approach succeeded
2. Update application code to use that path format
3. Consider updating database if paths are wrong

### If no path works:
1. Check if file actually exists in S3
2. Verify credentials have proper permissions
3. Check if filename in database matches S3

### If bucket listing fails:
1. Verify S3 credentials
2. Check network connectivity
3. Verify bucket name is correct

## Configuration Details

Based on `backend/full-yandex-sync/index.py`:
- **Bucket**: kyra
- **Endpoint**: https://storage.yandexcloud.net
- **Region**: ru-central1
- **Signature**: s3v4
- **Expected structure**: Files may be in 'works/' subdirectory

## Database Schema
- **Table**: t_p63326274_course_download_plat.works
- **Columns used**: id, title, download_url
- **Target work**: id=4851, title="русловые исследования"
