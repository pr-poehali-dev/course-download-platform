# 🚀 S3 Debug - Quick Start Guide

## One-Command Setup & Run

```bash
# 1. Set your environment variables
export DATABASE_URL="postgres://..."
export YANDEX_S3_KEY_ID="YCAJEm..."
export YANDEX_S3_SECRET_KEY="YCO..."

# 2. Run the debug
chmod +x run_debug_s3.sh && ./run_debug_s3.sh
```

That's it! The script will:
- ✅ Install dependencies (boto3, psycopg2-binary)
- ✅ Connect to your database
- ✅ Get work ID 4851 details
- ✅ List S3 bucket contents
- ✅ Try 6 different ways to access the file
- ✅ Save output to `debug_output.txt`

## What You'll See

```
================================================================================
S3 FILE ACCESS DEBUGGING
================================================================================

1. CHECKING ENVIRONMENT VARIABLES...
✓ All variables found

2. CONNECTING TO DATABASE...
✓ Found work: ID 4851, Title: русловые исследования

3. INITIALIZING S3 CLIENT...
✓ S3 client initialized

4. LISTING BUCKET 'kyra' CONTENTS...
✓ Found 150 objects

5. PARSING DOWNLOAD URL...
Download URL: https://storage.yandexcloud.net/kyra/works/file.rar

6. TRYING DIFFERENT APPROACHES...
Approach 1: ❌ or ✓
Approach 2: ❌ or ✓
...

SUMMARY
✓ Approach X worked!
Key: works/русловые исследования.rar
```

## What to Report Back

Copy and share:

1. **Download URL**: `https://storage.yandexcloud.net/kyra/...`
2. **Which approach worked**: `Approach X: [description]`
3. **Exact S3 key**: `works/filename.rar`
4. **Errors encountered**: `NoSuchKey / AccessDenied / etc.`

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "DATABASE_URL not found" | Set environment variable |
| "YANDEX_S3_KEY_ID not found" | Set environment variable |
| All approaches fail | File may not exist in S3 |
| "AccessDenied" | Check S3 credentials |

## Files Reference

- **Read First**: `S3_DEBUG_SUMMARY.md` - Quick reference
- **Full Docs**: `S3_DEBUG_README.md` - Complete guide
- **Details**: `S3_DEBUG_INSTRUCTIONS.md` - Step-by-step

## Need Help?

1. Check `S3_DEBUG_SUMMARY.md` for common issues
2. Review full output in `debug_output.txt`
3. Run analyzer: `python3 analyze_results.py`

---

**Target**: Work ID 4851 ("русловые исследования")  
**Bucket**: kyra  
**Endpoint**: https://storage.yandexcloud.net
