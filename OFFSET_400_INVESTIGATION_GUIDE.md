# Investigation Guide: "value too long for type" Error at Offset 400

## Problem Statement

The `backend/import-works/index.py` function is failing at offset 400 (5th batch) with a PostgreSQL error:
```
value too long for type character varying(N)
```

This indicates one of the folder names at offset 400-499 has a field that exceeds the database VARCHAR limits.

## Database Schema Limits

Based on the migrations (`db_migrations/V0003__create_works_table.sql` and `db_migrations/V0020__increase_title_length.sql`):

| Field | Type | Max Length | Source |
|-------|------|------------|--------|
| `title` | VARCHAR(1000) | 1000 chars | Extracted before last `(` |
| `work_type` | VARCHAR(100) | 100 chars | Text inside last `()` |
| `subject` | VARCHAR(200) | 200 chars | Determined by keyword matching |
| `description` | TEXT | Unlimited | Generated text |
| `composition` | TEXT | Unlimited | Generated text |
| `folder_path` | TEXT | Unlimited | Full folder name |
| `universities` | TEXT | Unlimited | Extracted organization |

## Field Extraction Logic

From `backend/import-works/index.py`, line 15-26:

```python
def extract_work_info(folder_name: str) -> Dict[str, str]:
    """Extract title and work type from folder name"""
    match = re.match(r'^(.+?)\s*\((.+?)\)\s*$', folder_name.strip())
    if match:
        return {
            'title': match.group(1).strip(),
            'work_type': match.group(2).strip()
        }
    return {
        'title': folder_name,
        'work_type': 'неизвестный тип'
    }
```

### How the Regex Works with Nested Parentheses

Pattern: `r'^(.+?)\s*\((.+?)\)\s*$'`

For a folder name like:
```
"Управление...тоннелей (для специалистов с высшим образованием) (курсовая работа)"
```

The regex will match:
- **Group 1 (title)**: "Управление...тоннелей (для специалистов с высшим образованием)"
- **Group 2 (work_type)**: "курсовая работа"

Because the `$` anchor forces the pattern to match to the end, the regex engine backtracks to find the LAST `(...)` pair as the work_type.

## Batch Processing

From `backend/import-works/index.py`, line 152:

```python
for offset in [0, 100, 200, 300, 400]:
```

- **Batch 1**: Offset 0-99
- **Batch 2**: Offset 100-199  
- **Batch 3**: Offset 200-299
- **Batch 4**: Offset 300-399
- **Batch 5**: Offset 400-499 ← ERROR OCCURS HERE

## Investigation Tools Created

### 1. Python Script: `find_problem_folder.py`

**To run:**
```bash
python3 find_problem_folder.py
```

**What it does:**
1. Fetches data from Yandex Disk API at offset 400
2. Analyzes all 100 folders in that batch
3. Identifies which field(s) exceed the database limits
4. Saves results to:
   - `offset_400_raw.json` - Raw API response
   - `offset_400_analysis.json` - Detailed analysis

**Output includes:**
- Exact folder name causing the violation
- Which field is too long (title, work_type, or subject)
- Actual length vs. limit
- How many characters it exceeds by

### 2. Node.js Script: `find_problem_folder.js`

**To run:**
```bash
node find_problem_folder.js
```

Same functionality as the Python script, but uses Node.js.

### 3. HTML Debug Page: `debug_offset_400.html`

**To run:**
1. Open `debug_offset_400.html` in a web browser
2. Click "Fetch Data from Offset 400"
3. View the analysis directly in the browser

**Advantages:**
- No server/backend needed
- Runs entirely in the browser
- Visual presentation of violations
- No CORS issues (client-side API call)

## Most Likely Culprits

Based on the folder naming patterns observed in the dataset:

### 1. Very Long Titles (>1000 chars)

Possible scenarios:
- Extremely detailed project titles
- Nested parentheses causing the regex to include more text than expected
- Multiple organization names or specifications

### 2. Very Long Work Types (>100 chars)

Example problematic patterns:
```
(...для специалистов с высшим образованием по направлению...)
```

If the parenthetical content describes specializations or qualifications, it could exceed 100 chars.

### 3. Subject Field Issues

Less likely since subjects are generated from keywords, but possible if:
- A very long word is used in the title
- The subject matching logic generates an unusual result

## Recommended Investigation Steps

### Step 1: Run the Analysis Tool

Choose one method:

**Option A - Python** (recommended):
```bash
python3 find_problem_folder.py
```

**Option B - Node.js**:
```bash
node find_problem_folder.js
```

**Option C - Browser**:
```bash
# Open debug_offset_400.html in Chrome/Firefox
open debug_offset_400.html
```

### Step 2: Review the Output

Look for:
```
FOUND X VIOLATION(S)!
================================================================================
Offset Index: 4XX
Folder Name: [problematic folder name]

Violations:
  ❌ TITLE: XXXX chars (limit: 1000, exceeds by XX)
  OR
  ❌ WORK_TYPE: XXX chars (limit: 100, exceeds by XX)
```

### Step 3: Determine the Fix

Once you identify the problematic folder(s), you have several options:

#### Option A: Increase Database Limit

Create a new migration file:

**File**: `db_migrations/V0021__increase_work_type_length.sql`
```sql
-- Increase work_type field length to accommodate longer descriptions
ALTER TABLE t_p63326274_course_download_plat.works 
ALTER COLUMN work_type TYPE VARCHAR(200);

COMMENT ON COLUMN t_p63326274_course_download_plat.works.work_type 
IS 'Work type, increased to 200 chars for detailed descriptions';
```

OR if title is the issue:

**File**: `db_migrations/V0021__increase_title_length_further.sql`
```sql
-- Increase title field length further
ALTER TABLE t_p63326274_course_download_plat.works 
ALTER COLUMN title TYPE VARCHAR(1500);

COMMENT ON COLUMN t_p63326274_course_download_plat.works.title 
IS 'Work title, increased to 1500 chars for very long names';
```

#### Option B: Truncate the Long Field

Modify `backend/import-works/index.py` to truncate long values:

```python
def extract_work_info(folder_name: str) -> Dict[str, str]:
    """Extract title and work type from folder name"""
    match = re.match(r'^(.+?)\s*\((.+?)\)\s*$', folder_name.strip())
    if match:
        title = match.group(1).strip()
        work_type = match.group(2).strip()
        
        # Truncate if too long
        if len(title) > 1000:
            title = title[:997] + '...'
        if len(work_type) > 100:
            work_type = work_type[:97] + '...'
        
        return {
            'title': title,
            'work_type': work_type
        }
    return {
        'title': folder_name[:1000] if len(folder_name) > 1000 else folder_name,
        'work_type': 'неизвестный тип'
    }
```

#### Option C: Improve Regex Pattern

If the issue is with nested parentheses being incorrectly parsed, update the regex to be more precise:

```python
def extract_work_info(folder_name: str) -> Dict[str, str]:
    """Extract title and work type from folder name - improved version"""
    # Try to match the LAST parentheses as work_type
    match = re.match(r'^(.+)\s*\(([^()]+)\)\s*$', folder_name.strip())
    if match:
        return {
            'title': match.group(1).strip(),
            'work_type': match.group(2).strip()
        }
    return {
        'title': folder_name,
        'work_type': 'неизвестный тип'
    }
```

The change: `(.+?)` → `(.+)` and `(.+?)` → `([^()]+)`
- First group is now greedy, matching as much as possible
- Second group explicitly excludes nested parentheses

## Expected Output Format

When you run any of the investigation tools, you should see output like:

```
Fetching data from Yandex Disk API at offset 400...
================================================================================
✓ Raw data saved to offset_400_raw.json
✓ Analysis saved to offset_400_analysis.json

Found 100 items

================================================================================
FOUND 1 VIOLATION(S)!
================================================================================

================================================================================
Offset Index: 401
================================================================================
Folder Name: Управление техническим состоянием железнодорожного пути по направлению Строительство железных дорог, мостов и транспортных тоннелей (для специалистов с высшим образованием) (курсовая работа)

Extracted Fields:
  Title (170 chars): Управление техническим состоянием железнодорожного пути...
  Work Type (64 chars): для специалистов с высшим образованием) (курсовая работа
  Subject (20 chars): строительство

Violations:
  ❌ WORK_TYPE: 104 chars (limit: 100, exceeds by 4)

================================================================================
Analysis complete!
================================================================================
```

## Next Steps After Investigation

1. **Run the investigation tool** to identify the exact problematic folder
2. **Document the findings**: Which folder, which field, how much it exceeds
3. **Choose a fix strategy**:
   - Increase database limit (cleanest)
   - Truncate the field (quick fix)
   - Improve regex parsing (most robust)
4. **Implement the fix**
5. **Re-run the import** to verify it works
6. **Report back** with the specific folder and solution chosen

## Files Reference

- **Backend import function**: `backend/import-works/index.py`
- **Database schema**: `db_migrations/V0003__create_works_table.sql`
- **Title limit increase**: `db_migrations/V0020__increase_title_length.sql`
- **Investigation tools**: 
  - `find_problem_folder.py`
  - `find_problem_folder.js`
  - `debug_offset_400.html`

## API Endpoint

Direct API call (can test in browser or Postman):
```
https://cloud-api.yandex.net/v1/disk/public/resources?public_key=https%3A%2F%2Fdisk.yandex.ru%2Fd%2FusjmeUqnkY9IfQ&limit=100&offset=400
```

---

**Created**: 2025-11-01  
**Purpose**: Investigate PostgreSQL VARCHAR limit violation at offset 400  
**Status**: Investigation tools ready, awaiting execution
