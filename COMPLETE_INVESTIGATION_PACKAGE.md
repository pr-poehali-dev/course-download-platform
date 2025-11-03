# Complete ZIP Investigation Package

## Package Overview

This is a complete toolkit for investigating ZIP file structures stored in Yandex S3 for works in your database. All scripts are production-ready and include comprehensive error handling.

## Files Included

### Core Scripts (3)
1. **investigate_zip.py** (295 lines)
   - Primary investigation script
   - Uses `download_url` field from database
   - Recommended for standard use cases

2. **investigate_zip_alternative.py** (238 lines)
   - Auto-detects available database columns
   - Handles multiple URL/key formats
   - Fallback when main script fails

3. **test_environment.py** (106 lines)
   - Validates complete environment setup
   - Tests database connectivity
   - Tests S3 access
   - **Run this first!**

### Automation Scripts (1)
4. **run_investigate_zip.sh** (49 lines)
   - Bash automation script
   - Creates virtual environment
   - Installs dependencies
   - Runs investigation
   - Handles cleanup

### Configuration Files (1)
5. **investigate_zip_requirements.txt** (2 lines)
   - Python package dependencies
   - psycopg2-binary==2.9.9
   - boto3==1.34.0

### Documentation Files (4)
6. **INVESTIGATE_ZIP_README.md**
   - Complete usage documentation
   - Setup instructions
   - Configuration guide

7. **ZIP_INVESTIGATION_SUMMARY.md**
   - Technical summary
   - Integration notes
   - Troubleshooting guide

8. **QUICK_RUN_GUIDE.txt**
   - Quick start commands
   - Copy-paste solutions
   - Common errors and fixes

9. **INVESTIGATION_FLOW_DIAGRAM.txt**
   - Visual process flow
   - Data flow diagram
   - Component interaction map

10. **COMPLETE_INVESTIGATION_PACKAGE.md**
    - This file
    - Complete package overview

## Total Files: 10

## Quick Start (3 Steps)

```bash
# Step 1: Set credentials
export DATABASE_URL='your_database_url'
export YANDEX_S3_KEY_ID='your_key_id'
export YANDEX_S3_SECRET_KEY='your_secret_key'

# Step 2: Install dependencies
pip install -r investigate_zip_requirements.txt

# Step 3: Run investigation
python investigate_zip.py
```

## What This Package Does

### Primary Function
Investigates the internal structure of ZIP archives stored in Yandex S3 for works with titles containing:
- "износостойкост" (wear resistance)
- "экскаватор" (excavator)

### Data Retrieved
1. **Work Information**
   - Database ID
   - Full title
   - Download URL or file key

2. **S3 Details**
   - Bucket name (typically: kyra)
   - Object key path
   - File size

3. **ZIP Contents**
   - Complete file listing
   - Full paths within archive
   - File sizes in bytes
   - Directory structure
   - File type identification

4. **Special Focus**
   - PNG file identification
   - Preview image location
   - Exact paths for extraction

## Technical Stack

### Languages & Tools
- Python 3.7+
- Bash (for automation)
- SQL (PostgreSQL queries)

### Python Dependencies
- **psycopg2-binary**: PostgreSQL database adapter
- **boto3**: AWS S3 SDK (Yandex S3 compatible)
- **zipfile**: Standard library (ZIP handling)

### External Services
- PostgreSQL Database
- Yandex Cloud Storage (S3-compatible)

## Architecture

### Database Schema Expected
```sql
CREATE TABLE works (
    id INTEGER PRIMARY KEY,
    title VARCHAR(500),
    download_url TEXT,
    -- other fields...
);
```

### S3 Configuration
- **Endpoint**: https://storage.yandexcloud.net
- **Region**: ru-central1
- **Default Bucket**: kyra
- **File Format**: ZIP archives

### URL Format
```
https://storage.yandexcloud.net/kyra/filename.zip
```

## Usage Scenarios

### Scenario 1: Standard Investigation
**Use Case**: Check ZIP structure for a specific work

**Command**:
```bash
python investigate_zip.py
```

**Output**: Complete file listing with PNG highlights

### Scenario 2: Environment Validation
**Use Case**: Verify setup before running investigation

**Command**:
```bash
python test_environment.py
```

**Output**: Pass/fail for each requirement

### Scenario 3: Alternative Schema
**Use Case**: Database uses different column names

**Command**:
```bash
python investigate_zip_alternative.py
```

**Output**: Auto-detected fields and results

### Scenario 4: Automated Execution
**Use Case**: Run with automatic venv setup

**Command**:
```bash
./run_investigate_zip.sh
```

**Output**: Complete process from setup to results

## Output Examples

### Work Information Section
```
WORK INFORMATION:
================================================================================
Work ID: 4523
Title: Износостойкость деталей экскаватора (курсовая работа)
Download URL: https://storage.yandexcloud.net/kyra/work_4523.zip
================================================================================
```

### S3 Details Section
```
S3 Details:
  Bucket: kyra
  Key: work_4523.zip

Downloading from S3...
Downloaded 15234567 bytes
```

### ZIP Contents Section
```
ZIP FILE CONTENTS:
================================================================================
[DIR]            0 bytes  work_folder/
[FILE]     1234567 bytes  work_folder/main_document.docx
[FILE]      234567 bytes  work_folder/diagram.png
[FILE]       45678 bytes  work_folder/preview.png
[FILE]       12345 bytes  work_folder/calculations.xlsx
================================================================================
Total entries: 5
```

### PNG Files Section
```
PNG FILES FOUND:
================================================================================
  - work_folder/diagram.png
  - work_folder/preview.png
================================================================================
```

## Error Handling

### Environment Errors
- Missing DATABASE_URL → Clear error message with setup instructions
- Missing S3 credentials → Specific variable names shown
- Invalid formats → Format examples provided

### Connection Errors
- Database unreachable → Connection details verification prompt
- S3 access denied → Credential validation steps
- Network timeouts → Retry suggestions

### Data Errors
- No matching work → Search criteria reminder
- Invalid URL format → Expected format shown
- Not a ZIP file → File type check performed

### All Errors Include
1. Clear error message
2. Root cause explanation
3. Suggested solution
4. Example of correct format

## Security Features

### Credential Protection
- Never logs full credentials
- Masks sensitive data in output
- Environment variable isolation
- No credential storage in files

### Safe Operations
- Read-only database access
- No file modifications
- No data deletion
- Automatic connection cleanup

### Best Practices
- Connection pooling avoided (single use)
- Explicit connection closure
- Try-catch-finally blocks
- Resource cleanup in all paths

## Performance Considerations

### Memory Usage
- Entire ZIP loaded to memory
- Consider file sizes (typical: 1-50 MB)
- Large files (>100MB) may cause issues

### Network Usage
- Single database query
- Single S3 download
- No pagination needed
- Efficient binary transfer

### Optimization Tips
- Run on same network as database
- Use fast internet for S3 download
- Close connections promptly
- Avoid concurrent runs

## Integration Points

### Backend Functions
Works with these backend endpoints:
- `backend/extract-previews/` - Preview generation
- `backend/download-work/` - File downloads
- `backend/full-yandex-sync/` - S3 synchronization
- `backend/works/` - Work management

### Database Tables
Queries these tables:
- `works` (primary)
- Potential: `work_files`, `purchases`

### S3 Buckets
Accesses:
- `kyra` (main work files)
- Potential: `previews` subdirectory

## Maintenance

### Regular Updates
- Check boto3 compatibility
- Verify S3 endpoint URLs
- Test with new Python versions
- Update dependencies quarterly

### Monitoring
- Log investigation runs
- Track file sizes
- Monitor S3 costs
- Check error patterns

### Documentation
- Keep README updated
- Document schema changes
- Update examples
- Record common issues

## Troubleshooting Guide

### Problem: Script won't run
**Check**: Python version, dependencies installed
**Fix**: `pip install -r investigate_zip_requirements.txt`

### Problem: Can't connect to database
**Check**: DATABASE_URL format, network access
**Fix**: Verify connection string format

### Problem: S3 access denied
**Check**: Credentials, bucket permissions
**Fix**: Regenerate S3 keys if needed

### Problem: No work found
**Check**: Search terms, work titles in database
**Fix**: Query database directly to verify

### Problem: ZIP parse error
**Check**: File actually is ZIP, not RAR
**Fix**: May need conversion first

## Future Enhancements

### Possible Improvements
1. Support for RAR files
2. Batch processing multiple works
3. JSON output format option
4. Export to file option
5. Statistics collection
6. Progress bars for downloads
7. Parallel downloads
8. Caching mechanism

### Not Implemented (By Design)
- File extraction
- File modification
- Database writes
- Automatic conversion
- File uploads

## Support Information

### Getting Help
1. Read INVESTIGATE_ZIP_README.md
2. Check ZIP_INVESTIGATION_SUMMARY.md
3. Review QUICK_RUN_GUIDE.txt
4. Run test_environment.py
5. Check error messages carefully

### Common Questions

**Q: Can I search for other works?**
A: Yes, modify the search terms in the script (lines 36-37)

**Q: Does this modify files?**
A: No, all operations are read-only

**Q: Can I run this in production?**
A: Yes, but monitor resource usage

**Q: What if the file is very large?**
A: Script loads to memory; may need adjustments for files >100MB

**Q: Can I automate this?**
A: Yes, use run_investigate_zip.sh or create cron job

## License & Credits

This investigation toolkit is provided as-is for internal use. Modify and extend as needed for your specific requirements.

## Version Information

- **Package Version**: 1.0
- **Creation Date**: 2025-11-03
- **Python Required**: 3.7+
- **Last Updated**: 2025-11-03

## File Locations

All files in project root:
```
/investigate_zip.py
/investigate_zip_alternative.py
/test_environment.py
/run_investigate_zip.sh
/investigate_zip_requirements.txt
/INVESTIGATE_ZIP_README.md
/ZIP_INVESTIGATION_SUMMARY.md
/QUICK_RUN_GUIDE.txt
/INVESTIGATION_FLOW_DIAGRAM.txt
/COMPLETE_INVESTIGATION_PACKAGE.md
```

---

**Ready to start?** Run: `python test_environment.py`
