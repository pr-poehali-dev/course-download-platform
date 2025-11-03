# ZIP File Investigation - Complete Summary

## Overview
This investigation toolkit allows you to examine the internal structure of ZIP files stored in Yandex S3 for works in the database. It specifically searches for works containing "износостойкост" or "экскаватор" in the title.

## Files Created

### Main Scripts
1. **investigate_zip.py** - Primary investigation script
   - Uses `download_url` field from database
   - Full S3 URL parsing
   - Recommended for normal use

2. **investigate_zip_alternative.py** - Fallback script
   - Auto-detects available database columns
   - Handles multiple field formats
   - Use if main script fails

3. **test_environment.py** - Environment verification
   - Tests all prerequisites
   - Validates database connection
   - Validates S3 access
   - Run this first!

### Support Files
4. **run_investigate_zip.sh** - Automated runner
   - Creates virtual environment
   - Installs dependencies
   - Runs investigation
   - Handles cleanup

5. **investigate_zip_requirements.txt** - Python dependencies
   - psycopg2-binary==2.9.9
   - boto3==1.34.0

6. **INVESTIGATE_ZIP_README.md** - Complete documentation
7. **ZIP_INVESTIGATION_SUMMARY.md** - This file

## Quick Start

### Step 1: Test Environment
```bash
python test_environment.py
```
This will verify:
- Environment variables are set
- Python dependencies are installed
- Database is accessible
- S3 bucket is accessible

### Step 2: Run Investigation
```bash
# Option A: Direct execution
python investigate_zip.py

# Option B: Alternative version (if main fails)
python investigate_zip_alternative.py

# Option C: Automated (handles everything)
chmod +x run_investigate_zip.sh
./run_investigate_zip.sh
```

## Required Environment Variables

```bash
# PostgreSQL connection string
export DATABASE_URL='postgresql://user:password@host:port/database'

# Yandex S3 credentials
export YANDEX_S3_KEY_ID='your_access_key_id'
export YANDEX_S3_SECRET_KEY='your_secret_access_key'
```

## Expected Output

The script will provide:

### 1. Work Information
```
Work ID: 1234
Title: Износостойкость деталей экскаватора
Download URL: https://storage.yandexcloud.net/kyra/filename.zip
```

### 2. S3 Details
```
Bucket: kyra
Key: filename.zip
Downloaded: 15234567 bytes
```

### 3. ZIP Contents
```
ZIP FILE CONTENTS:
================================================================================
[DIR]            0 bytes  folder_name/
[FILE]     1234567 bytes  folder_name/document.docx
[FILE]      234567 bytes  folder_name/image.png
[FILE]       12345 bytes  folder_name/preview.png
================================================================================
Total entries: 4
```

### 4. PNG File Highlights
```
PNG FILES FOUND:
================================================================================
  - folder_name/image.png
  - folder_name/preview.png
================================================================================
```

## Technical Details

### Database Query
```sql
SELECT id, title, download_url 
FROM works 
WHERE title ILIKE '%износостойкост%' OR title ILIKE '%экскаватор%'
LIMIT 1
```

### S3 Configuration
- Endpoint: https://storage.yandexcloud.net
- Region: ru-central1
- Bucket: kyra
- Signature Version: s3v4

### File Processing
- Downloads entire ZIP to memory
- Uses Python's zipfile module
- Lists all entries (files and directories)
- Identifies file types by extension
- Reports sizes in bytes

## Troubleshooting

### Issue: Environment variables not set
**Solution:** Export all three required variables before running

### Issue: Database connection failed
**Solution:** 
- Verify DATABASE_URL format
- Check network connectivity
- Verify database credentials

### Issue: S3 connection failed
**Solution:**
- Verify S3 credentials
- Check endpoint URL
- Ensure bucket 'kyra' exists and is accessible

### Issue: No work found
**Solution:**
- Verify works exist in database with matching titles
- Try alternative search terms
- Check table name and column names

### Issue: Download failed
**Solution:**
- Verify file exists in S3
- Check download_url format
- Ensure sufficient permissions

### Issue: Not a ZIP file
**Solution:**
- File may still be in RAR format
- Check file extension in download_url
- May need RAR to ZIP conversion first

## Search Criteria

The script searches for works with titles containing:
- **износостойкост** (wear resistance)
- **экскаватор** (excavator)

These are case-insensitive partial matches (ILIKE with % wildcards).

## Output Details

### File Type Indicators
- `[FILE]` - Regular file
- `[DIR]` - Directory entry

### File Information
- Full path within ZIP archive
- File size in bytes
- Compression details (available via zipfile.ZipInfo)

### Special Focus: PNG Files
The script specifically identifies and highlights PNG files because:
- They're commonly used for previews
- They indicate visual content
- They're important for the application's preview system

## Integration Notes

### Backend Integration
The investigation results can help:
- Understand ZIP structure for preview extraction
- Identify which files to extract
- Plan preview generation logic
- Debug download issues

### Related Backend Functions
- `backend/extract-previews/` - Preview extraction logic
- `backend/download-work/` - Download handling
- `backend/full-yandex-sync/` - S3 synchronization

## Safety Notes

1. **Read-Only Operations**: Scripts only read, never modify data
2. **Memory Usage**: Entire ZIP loaded to memory (consider file sizes)
3. **Credentials**: Never log or print full credentials
4. **Error Handling**: Comprehensive try-catch blocks
5. **Connection Cleanup**: Always closes database connections

## Next Steps After Investigation

Based on the ZIP structure found:
1. Update preview extraction logic if needed
2. Adjust file parsing in backend functions
3. Document standard ZIP structure
4. Plan for variations in structure
5. Implement robust error handling

## Additional Resources

- Yandex S3 Documentation: https://cloud.yandex.com/docs/storage/
- psycopg2 Documentation: https://www.psycopg.org/docs/
- boto3 Documentation: https://boto3.amazonaws.com/v1/documentation/api/latest/index.html

## Support

For issues or questions:
1. Check this documentation
2. Review INVESTIGATE_ZIP_README.md
3. Run test_environment.py for diagnostics
4. Check backend logs for related operations
