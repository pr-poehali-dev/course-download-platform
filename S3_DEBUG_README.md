# S3 File Access Debugging Toolkit

## Quick Start

```bash
# 1. Make sure environment variables are set
export DATABASE_URL="your_database_url"
export YANDEX_S3_KEY_ID="your_key_id"
export YANDEX_S3_SECRET_KEY="your_secret_key"

# 2. Run the debug script
chmod +x run_debug_s3.sh
./run_debug_s3.sh

# 3. Review the output in console or analyze it
python3 analyze_results.py
```

## Files in This Toolkit

| File | Purpose |
|------|---------|
| `debug_s3.py` | Main debugging script - tests 6 different S3 access methods |
| `run_debug_s3.sh` | Convenience script - sets up and runs debug_s3.py |
| `analyze_results.py` | Analyzes debug output and provides summary |
| `requirements.txt` | Python dependencies (boto3, psycopg2-binary) |
| `S3_DEBUG_INSTRUCTIONS.md` | Detailed documentation |

## What This Debugs

**Target**: Work ID 4851 ("русловые исследования")

**Problem**: Need to verify S3 file access and determine correct path format

**S3 Configuration**:
- Bucket: `kyra`
- Endpoint: `https://storage.yandexcloud.net`
- Region: `ru-central1`

## The 6 Test Approaches

The script tests these path formats to find which one works:

1. **Direct path** - Path exactly as stored in database
2. **URL decoded** - Decodes percent-encoded characters (important for Cyrillic)
3. **With 'works/' prefix** - Adds 'works/' directory prefix
4. **URL decoded + 'works/'** - Combines decoding with prefix
5. **Just filename** - Filename only, no directory path
6. **Filename + 'works/'** - Filename only with 'works/' prefix

## Expected Output Structure

```
================================================================================
S3 FILE ACCESS DEBUGGING
================================================================================

1. CHECKING ENVIRONMENT VARIABLES...
✓ DATABASE_URL: postgres://...
✓ YANDEX_S3_KEY_ID: YCAJEm...
✓ YANDEX_S3_SECRET_KEY: ********************

2. CONNECTING TO DATABASE...
✓ Found work:
  ID: 4851
  Title: русловые исследования
  Download URL: https://storage.yandexcloud.net/kyra/...

3. INITIALIZING S3 CLIENT...
✓ S3 client initialized

4. LISTING BUCKET 'kyra' CONTENTS...
✓ Found 150 objects in bucket
First 50 objects:
  - file1.rar
  - file2.zip
  ...
✓ Found 100 objects with 'works/' prefix

5. PARSING DOWNLOAD URL...
  Original URL: https://...
  Parsed path: works/filename.rar

6. TRYING DIFFERENT DOWNLOAD APPROACHES...

Approach 1: Direct path from download_url
  Trying key: works/filename.rar
  ✓ SUCCESS! File found
    Content-Length: 12345678
    Content-Type: application/x-rar-compressed
    Last-Modified: 2024-11-01 10:30:00

[... additional approaches ...]

SUMMARY
Download URL from database: https://...
Paths tried:
  1. Direct path: works/filename.rar
  2. URL decoded: works/имя_файла.rar
  ...
```

## What to Report Back

After running the debug script, provide:

### 1. Download URL
What's stored in the database:
```
download_url = "..."
```

### 2. Bucket Structure
From the listing:
```
Total objects: XXX
Objects with 'works/' prefix: XXX
Sample files:
  - ...
  - ...
```

### 3. Which Approach Worked
```
✓ Approach X: [name]
  Key: [exact path that worked]
  File size: XXX bytes
```

### 4. Error Messages
For failed approaches:
```
❌ Approach Y: [name]
  Error: NoSuchKey / AccessDenied / etc.
  Message: [detailed error]
```

## Common Scenarios and Solutions

### Scenario 1: NoSuchKey for all attempts
**Diagnosis**: File doesn't exist in S3 or path is completely wrong

**Action**:
- Review bucket listing carefully
- Search for file with similar name
- Check if file was uploaded to different bucket
- Verify database entry is correct

### Scenario 2: One approach works (e.g., URL decoded with 'works/')
**Diagnosis**: Path format mismatch between database and S3

**Action**:
- Update application code to use working format
- Consider database migration to fix all paths
- Document the correct format for future uploads

### Scenario 3: AccessDenied errors
**Diagnosis**: Permission issue

**Action**:
- Verify S3 credentials are correct
- Check IAM policy for read permissions on bucket
- Ensure bucket policy allows access

### Scenario 4: Files exist but in different location
**Diagnosis**: Structural mismatch

**Action**:
- If files are in root but code expects 'works/', update code
- If files are in 'works/' but DB has root paths, update DB
- Consider S3 reorganization if needed

## Integration with Application

Based on successful approach, update your application:

### If URL decoding is needed:
```python
from urllib.parse import unquote

# When accessing S3
s3_key = unquote(download_url_path)
```

### If 'works/' prefix is needed:
```python
# When accessing S3
s3_key = f"works/{filename}"
```

### If database paths need updating:
```sql
-- Example migration
UPDATE t_p63326274_course_download_plat.works
SET download_url = REPLACE(download_url, 'old_format', 'new_format')
WHERE download_url LIKE 'old_format%';
```

## Troubleshooting

### Script fails at database connection
- Verify DATABASE_URL is correct
- Check network connectivity to database
- Ensure PostgreSQL is accessible

### Script fails at S3 client init
- Verify YANDEX_S3_KEY_ID and YANDEX_S3_SECRET_KEY
- Check credentials are active
- Verify endpoint URL is correct

### Script runs but finds no files
- Bucket might be empty
- Credentials might lack list permissions
- Wrong bucket name

## Next Steps After Debugging

1. **Document findings** - Note which approach worked
2. **Update code** - Modify application to use correct path format
3. **Test with other works** - Verify solution works for multiple files
4. **Fix database** - If needed, update all download_url entries
5. **Add monitoring** - Log S3 access errors in production

## Additional Resources

- [Boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
- [Yandex Cloud Storage API](https://cloud.yandex.com/en/docs/storage/s3/)
- [URL Encoding Reference](https://www.w3schools.com/tags/ref_urlencode.ASP)

## Support

If issues persist:
1. Save full debug output: `./run_debug_s3.sh > full_debug.txt`
2. Check S3 bucket permissions in Yandex Console
3. Verify credentials have correct IAM policies
4. Review application logs for related errors
