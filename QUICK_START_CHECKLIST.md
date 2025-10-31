# Quick Start Checklist: Find the Problem Folder

## Choose ONE method to run:

### ✅ Method 1: Python (Recommended)

```bash
cd /path/to/webapp
python3 find_problem_folder.py
```

**What you'll get**:
- Console output showing violations
- `offset_400_raw.json` - API data
- `offset_400_analysis.json` - Analysis results

---

### ✅ Method 2: Node.js

```bash
cd /path/to/webapp
node find_problem_folder.js
```

**What you'll get**:
- Same as Python method

---

### ✅ Method 3: Browser (Easiest)

1. Open `/webapp/debug_offset_400.html` in Chrome or Firefox
2. Click the "Fetch Data from Offset 400" button
3. View results on the page

**Advantages**:
- No terminal needed
- Visual interface
- Instant results

---

## What to Look For

The output will show something like:

```
FOUND 1 VIOLATION(S)!

Offset Index: 4XX
Folder Name: [long folder name]

Violations:
  ❌ WORK_TYPE: 104 chars (limit: 100, exceeds by 4)
```

## Report Back

Once you run it, tell me:

1. **Which offset** (400-499)?
2. **Which field** (title, work_type, or subject)?
3. **How many chars** and how much it exceeds?
4. **The full folder name**

## Example Response Format

```
Found the issue!

Offset: 401
Field: work_type
Length: 104 characters (exceeds limit of 100 by 4 chars)
Folder: "Управление техническим состоянием железнодорожного пути по направлению Строительство железных дорог, мостов и транспортных тоннелей (для специалистов с высшим образованием) (курсовая работа)"
```

---

## That's it!

Just run ONE of the three methods above and you'll get the answer.
