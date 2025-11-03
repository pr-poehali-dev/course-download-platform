# S3 File Access Debug - Quick Reference

## 📋 Files Created

All files are in the project root:

- **`debug_s3.py`** - Main debugging script (Python)
- **`run_debug_s3.sh`** - Bash wrapper to run the script
- **`analyze_results.py`** - Output analyzer
- **`requirements.txt`** - Python dependencies
- **`S3_DEBUG_README.md`** - Complete documentation
- **`S3_DEBUG_INSTRUCTIONS.md`** - Detailed instructions
- **`S3_DEBUG_SUMMARY.md`** - This file (quick reference)

## 🚀 How to Run

```bash
# Set environment variables (required)
export DATABASE_URL="your_postgres_connection_string"
export YANDEX_S3_KEY_ID="your_yandex_s3_key_id"
export YANDEX_S3_SECRET_KEY="your_yandex_s3_secret"

# Make script executable
chmod +x run_debug_s3.sh

# Run the debug
./run_debug_s3.sh
```

## 🎯 What It Does

1. ✅ Gets environment variables (DATABASE_URL, S3 credentials)
2. 🔍 Connects to database and retrieves work ID 4851 ("русловые исследования")
3. 🌐 Initializes S3 client (Yandex Cloud Storage)
4. 📂 Lists bucket 'kyra' contents to see actual structure
5. 🔑 Parses the download_url from database
6. 🧪 Tries 6 different approaches to access the file:
   - Direct path from URL
   - URL decoded path (handles Cyrillic)
   - With 'works/' prefix
   - URL decoded + 'works/' prefix
   - Just the filename
   - Filename + 'works/' prefix

## 📊 What to Look For

### ✅ Success Indicators
- "✓ SUCCESS! File found" message
- File metadata displayed (size, type, modified date)
- At least one approach worked

### ❌ Failure Indicators
- "❌ FAILED" messages
- Error codes: NoSuchKey, AccessDenied, etc.
- All 6 approaches failed

## 📝 Information to Report

After running the script, collect:

### 1. Download URL from Database
```
Download URL: https://storage.yandexcloud.net/kyra/...
```

### 2. Paths Tried
```
1. Direct path: [path]
2. URL decoded: [path]
3. With works/ prefix: [path]
4. URL decoded with works/ prefix: [path]
5. Just filename: [path]
6. Filename with works/ prefix: [path]
```

### 3. Bucket Structure
```
Total objects in bucket: XXX
Objects with 'works/' prefix: XXX

Sample files from listing:
  - file1.rar
  - file2.zip
  - works/file3.rar
  ...
```

### 4. Which Approach Worked (if any)
```
✓ Approach [number]: [description]
  Key used: [exact S3 key that worked]
  File size: XXX bytes
  Content-Type: application/x-rar-compressed
```

### 5. Error Messages (for failed attempts)
```
❌ Approach [number]: [description]
  Error Code: NoSuchKey / AccessDenied / etc.
  Error Message: [detailed message]
```

## 🔧 Common Issues & Solutions

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| All approaches fail with NoSuchKey | File doesn't exist or wrong path | Review bucket listing, search for file manually |
| AccessDenied errors | Permission problem | Verify S3 credentials, check IAM policies |
| One specific approach works | Path format mismatch | Update application to use working format |
| Bucket listing shows different structure | Organizational mismatch | May need to reorganize S3 or update DB paths |

## 🔐 S3 Configuration Details

From `backend/full-yandex-sync/index.py`:

```python
s3_client = boto3.client(
    's3',
    endpoint_url='https://storage.yandexcloud.net',
    aws_access_key_id=os.environ.get('YANDEX_S3_KEY_ID'),
    aws_secret_access_key=os.environ.get('YANDEX_S3_SECRET_KEY'),
    region_name='ru-central1',
    config=Config(signature_version='s3v4')
)

bucket_name = 'kyra'
```

## 📦 Database Details

From `backend/download-work/index.py`:

```sql
SELECT title, download_url, file_url 
FROM t_p63326274_course_download_plat.works 
WHERE id = %s
```

**Target Work**:
- ID: 4851
- Title: "русловые исследования"
- Schema: t_p63326274_course_download_plat.works

## 🎓 Understanding URL Encoding

Cyrillic filenames need special handling:

| Original | URL Encoded | Decoded |
|----------|-------------|---------|
| русловые | %D1%80%D1%83%D1%81%D0%BB%D0%BE%D0%B2%D1%8B%D0%B5 | русловые |
| исследования | %D0%B8%D1%81%D1%81%D0%BB%D0%B5%D0%B4%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F | исследования |

The script tests both encoded and decoded versions.

## 🔄 Next Steps Based on Results

### If Successful ✅
1. Note which approach worked
2. Update application code to use that path format
3. Test with other works to confirm
4. Consider updating database if paths are inconsistent

### If Failed ❌
1. Review bucket listing carefully
2. Check if file exists with different name
3. Verify S3 credentials have read permissions
4. Check if file is in different bucket
5. Review database entry for correctness

## 📞 Getting Help

If you need assistance:

1. **Save complete output**:
   ```bash
   ./run_debug_s3.sh > full_debug.txt 2>&1
   ```

2. **Share the following**:
   - Full debug output
   - Download URL from database
   - List of files in bucket (if visible)
   - Any error codes/messages

3. **Check these resources**:
   - S3_DEBUG_README.md (full documentation)
   - S3_DEBUG_INSTRUCTIONS.md (detailed instructions)
   - Backend code: backend/download-work/index.py
   - Backend code: backend/full-yandex-sync/index.py

## ⚠️ Security Notes

- Debug output may contain sensitive information (URLs, file names)
- `debug_output.txt` is in `.gitignore` - don't commit it
- Don't share S3 credentials publicly
- Environment variables are displayed partially for security

## 📄 Output File Locations

After running the script:

```
.
├── debug_s3.py              (script)
├── run_debug_s3.sh          (script)
├── analyze_results.py       (script)
├── debug_output.txt         (generated - in .gitignore)
├── S3_DEBUG_README.md       (documentation)
├── S3_DEBUG_INSTRUCTIONS.md (documentation)
└── S3_DEBUG_SUMMARY.md      (this file)
```

## 🧪 Testing Other Works

To test a different work, edit `debug_s3.py`:

```python
# Change this line (around line 42):
WHERE id = 4851

# To test work ID 1234:
WHERE id = 1234
```

Then re-run the script.

## 📈 Interpreting Results

### Perfect Scenario
```
✓ All environment variables set
✓ Database connected
✓ Work found: ID 4851
✓ S3 client initialized
✓ Bucket listed: 150 files
✓ Approach 2 SUCCESS! (URL decoded path)
```

### Problem Scenario
```
✓ All environment variables set
✓ Database connected
✓ Work found: ID 4851
✓ S3 client initialized
✓ Bucket listed: 150 files
❌ All 6 approaches failed with NoSuchKey
→ File doesn't exist in bucket or path mismatch
```

## 🎯 End Goal

Determine the exact S3 key format needed to successfully download work files, so the application can construct correct download URLs.

---

**Created**: 2024-11-03  
**Purpose**: Debug S3 file access for work ID 4851  
**Bucket**: kyra  
**Endpoint**: https://storage.yandexcloud.net
