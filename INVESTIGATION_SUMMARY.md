# Investigation Summary: Offset 400 Error

## Task Completed

I have created comprehensive investigation tools to identify which folder at offset 400 is causing the "value too long for type" PostgreSQL error.

## Root Cause

The error occurs when inserting data into the `works` table where one of the VARCHAR fields exceeds its defined limit:

- **title**: VARCHAR(1000) - Max 1000 characters
- **work_type**: VARCHAR(100) - Max 100 characters  
- **subject**: VARCHAR(200) - Max 200 characters

The import function processes Yandex Disk folders in batches of 100. The error occurs in the 5th batch (offset 400-499).

## Tools Created

### 1. Python Investigation Script

**File**: `/find_problem_folder.py`

**Usage**:
```bash
python3 find_problem_folder.py
```

**Output Files**:
- `offset_400_raw.json` - Raw API response
- `offset_400_analysis.json` - Detailed analysis with violations

### 2. Node.js Investigation Script

**File**: `/find_problem_folder.js`

**Usage**:
```bash
node find_problem_folder.js
```

Same output as Python version.

### 3. Browser-Based Debug Tool

**File**: `/debug_offset_400.html`

**Usage**:
Open the file in any web browser and click "Fetch Data from Offset 400"

**Advantages**:
- No installation required
- Visual interface
- Client-side execution (no CORS issues)

### 4. Backend Debug Function (Not Deployed)

**File**: `/backend/debug-offset-400/index.py`

Created but not deployed due to function limit (25/25 functions in use).
Can be deployed if a function slot becomes available.

## How the Tools Work

All tools perform the same analysis:

1. **Fetch** data from Yandex Disk API at offset 400
2. **Parse** each folder name using the same regex as the backend:
   ```python
   r'^(.+?)\s*\((.+?)\)\s*$'
   ```
3. **Extract** fields:
   - title: Text before last `(`
   - work_type: Text inside last `()`
   - subject: Determined by keyword matching
4. **Check** against limits:
   - title > 1000 chars?
   - work_type > 100 chars?
   - subject > 200 chars?
5. **Report** violations with exact details

## Expected Investigation Results

The tool will output:

```
================================================================================
FOUND X VIOLATION(S)!
================================================================================

Offset Index: [400-499]
Folder Name: [full folder name from Yandex Disk]

Extracted Fields:
  Title (XXX chars): [extracted title]
  Work Type (XXX chars): [extracted work type]
  Subject (XXX chars): [determined subject]

Violations:
  ❌ [FIELD_NAME]: XXX chars (limit: YYY, exceeds by ZZZ)
```

## Likely Scenarios

Based on code analysis and folder naming patterns:

### Scenario 1: Very Long Work Type (Most Likely)

A folder with nested parentheses like:
```
Title (...detailed specialization description...) (work type)
```

Where the middle parentheses content gets incorrectly parsed into `work_type`, causing it to exceed 100 characters.

### Scenario 2: Extremely Long Title

A folder with a very detailed project title that exceeds 1000 characters.

### Scenario 3: Subject Field Issue (Least Likely)

The subject is auto-generated from keywords, but theoretically could exceed 200 chars if the matching logic has an edge case.

## Recommended Solutions

Once the problematic folder is identified:

### Solution A: Increase Database Limit (Recommended)

Create migration: `db_migrations/V0021__increase_work_type_length.sql`

```sql
ALTER TABLE t_p63326274_course_download_plat.works 
ALTER COLUMN work_type TYPE VARCHAR(200);
```

### Solution B: Truncate Long Values

Modify `/backend/import-works/index.py` to truncate:

```python
if len(title) > 1000:
    title = title[:997] + '...'
if len(work_type) > 100:
    work_type = work_type[:97] + '...'
```

### Solution C: Fix Regex Pattern

Improve the parsing to handle nested parentheses better:

```python
# Use [^()]+ to exclude nested parentheses
match = re.match(r'^(.+)\s*\(([^()]+)\)\s*$', folder_name.strip())
```

## Files Delivered

### Investigation Tools
1. `/find_problem_folder.py` - Python investigation script
2. `/find_problem_folder.js` - Node.js investigation script
3. `/debug_offset_400.html` - Browser-based debug tool
4. `/fetch_offset_400.js` - Alternative Node.js fetcher
5. `/backend/debug-offset-400/index.py` - Backend debug function (not deployed)

### Analysis Scripts
6. `/analyze_yandex_data.py` - Sample data analyzer
7. `/quick_analysis.py` - Quick manual analysis
8. `/test_regex_pattern.py` - Regex pattern tester

### Documentation
9. `/OFFSET_400_INVESTIGATION_GUIDE.md` - Comprehensive investigation guide
10. `/INVESTIGATION_SUMMARY.md` - This file
11. `/trace_regex_manually.md` - Manual regex trace walkthrough
12. `/manual_count.txt` - Character counting notes

### Supporting Files
13. `/fetch_and_save.html` - HTML fetch utility
14. `/backend/debug-offset-400/tests.json` - Test configuration

## Next Steps

1. **Run one of the investigation tools** to identify the exact problematic folder
2. **Review the output** to see which field exceeds the limit and by how much
3. **Choose a solution** based on the findings
4. **Implement the fix** (database migration or code change)
5. **Re-run the import** to verify it works

## Technical Details

### Backend Function
- **File**: `/backend/import-works/index.py`
- **Batching**: Processes offsets [0, 100, 200, 300, 400]
- **Error Location**: Line 180-190 (database insertion)
- **Regex Pattern**: `r'^(.+?)\s*\((.+?)\)\s*$'` (line 17)

### Database Schema
- **Table**: `t_p63326274_course_download_plat.works`
- **Migrations**: 
  - V0003: Initial table creation
  - V0020: Title increased to VARCHAR(1000)
- **Constraints**: 
  - title: VARCHAR(1000)
  - work_type: VARCHAR(100)
  - subject: VARCHAR(200)

### API Endpoint
```
https://cloud-api.yandex.net/v1/disk/public/resources
  ?public_key=https://disk.yandex.ru/d/usjmeUqnkY9IfQ
  &limit=100
  &offset=400
```

## Absolute File Paths

All tools are located in the project root directory:

- Python script: `/webapp/find_problem_folder.py`
- Node.js script: `/webapp/find_problem_folder.js`
- HTML tool: `/webapp/debug_offset_400.html`
- Investigation guide: `/webapp/OFFSET_400_INVESTIGATION_GUIDE.md`
- Backend code: `/webapp/backend/import-works/index.py`
- Database migrations: `/webapp/db_migrations/`

---

**Status**: ✅ Investigation tools ready for execution  
**Created**: 2025-11-01  
**Awaiting**: User to run one of the investigation tools and report findings
