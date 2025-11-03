# 📚 S3 File Access Debug - Complete Index

## 🎯 Purpose
Debug S3 file access issue for work ID 4851 ("русловые исследования") by testing multiple path formats and analyzing bucket structure.

---

## 📁 Documentation Files (Read These)

### 🚀 Start Here
1. **`S3_DEBUG_QUICKSTART.md`** - Quick start guide (30 seconds)
   - One command to run everything
   - What to expect
   - What to report back

### 📖 Reference Guides
2. **`S3_DEBUG_SUMMARY.md`** - Quick reference (5 minutes)
   - What the script does
   - How to interpret results
   - Common issues and solutions
   - All key information in one place

3. **`S3_DEBUG_README.md`** - Complete documentation (15 minutes)
   - Full toolkit overview
   - Detailed scenario analysis
   - Integration with application
   - Troubleshooting guide

4. **`S3_DEBUG_INSTRUCTIONS.md`** - Step-by-step instructions (10 minutes)
   - What each step does
   - Expected output format
   - Configuration details
   - Database schema info

---

## 🔧 Executable Files (Run These)

### Main Scripts
1. **`debug_s3.py`** - Main debugging script
   - Tests 6 different S3 access methods
   - Lists bucket contents
   - Queries database
   - Comprehensive output

2. **`run_debug_s3.sh`** - Convenience wrapper
   - Checks environment variables
   - Installs dependencies
   - Runs debug_s3.py
   - Saves output to file

3. **`analyze_results.py`** - Output analyzer
   - Parses debug output
   - Extracts key findings
   - Provides summary
   - Offers recommendations

### Configuration
4. **`requirements.txt`** - Python dependencies
   - boto3 (S3 client)
   - psycopg2-binary (PostgreSQL)

---

## 📊 Output Files (Generated)

These files are created when you run the scripts:

1. **`debug_output.txt`** - Full debug output
   - All console output
   - Saved automatically by run_debug_s3.sh
   - Used by analyze_results.py
   - ⚠️ In .gitignore (may contain sensitive data)

2. **`full_debug.txt`** - Manual output save
   - Optional: save with `> full_debug.txt`
   - ⚠️ In .gitignore (may contain sensitive data)

---

## 🗺️ Navigation Map

```
┌─────────────────────────────────────────────────────────┐
│                   WANT TO DEBUG S3?                     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  S3_DEBUG_QUICKSTART  │ ← START HERE (30 sec)
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   run_debug_s3.sh     │ ← RUN THIS
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   debug_output.txt    │ ← OUTPUT
                └───────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐
    │ Read manually   │   OR    │ analyze_results │
    └─────────────────┘         └─────────────────┘
              │                           │
              └─────────────┬─────────────┘
                            ▼
                ┌───────────────────────┐
                │  S3_DEBUG_SUMMARY     │ ← INTERPRET RESULTS
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  S3_DEBUG_README      │ ← DEEP DIVE (optional)
                └───────────────────────┘
```

---

## 📋 File Summary Table

| File | Type | Size | Purpose | When to Use |
|------|------|------|---------|-------------|
| `S3_DEBUG_QUICKSTART.md` | Docs | Small | Quick start | First time |
| `S3_DEBUG_SUMMARY.md` | Docs | Medium | Quick reference | Interpreting results |
| `S3_DEBUG_README.md` | Docs | Large | Complete guide | Troubleshooting |
| `S3_DEBUG_INSTRUCTIONS.md` | Docs | Medium | Detailed steps | Understanding process |
| `S3_DEBUG_INDEX.md` | Docs | Small | This file | Finding what you need |
| `debug_s3.py` | Script | Medium | Main debugger | Run to debug |
| `run_debug_s3.sh` | Script | Small | Wrapper | Easiest way to run |
| `analyze_results.py` | Script | Small | Analyzer | After running debug |
| `requirements.txt` | Config | Tiny | Dependencies | Auto-installed |
| `debug_output.txt` | Output | Varies | Results | Generated by script |

---

## 🎓 Reading Order by Scenario

### Scenario 1: Quick Debug (First Time)
1. Read: `S3_DEBUG_QUICKSTART.md`
2. Run: `./run_debug_s3.sh`
3. Read: `S3_DEBUG_SUMMARY.md`
4. Share results

### Scenario 2: Deep Troubleshooting
1. Read: `S3_DEBUG_SUMMARY.md`
2. Read: `S3_DEBUG_README.md`
3. Run: `./run_debug_s3.sh > full_debug.txt 2>&1`
4. Run: `python3 analyze_results.py full_debug.txt`
5. Read: `S3_DEBUG_INSTRUCTIONS.md`
6. Review backend code

### Scenario 3: Understanding the System
1. Read: `S3_DEBUG_INSTRUCTIONS.md`
2. Read: `S3_DEBUG_README.md`
3. Review: `debug_s3.py` source code
4. Run: `./run_debug_s3.sh`
5. Experiment with modifications

---

## 🔍 Quick Search

### "How do I run this?"
→ `S3_DEBUG_QUICKSTART.md`

### "What does each approach test?"
→ `S3_DEBUG_SUMMARY.md` (Section: What It Does)

### "Why did it fail?"
→ `S3_DEBUG_README.md` (Section: Common Scenarios)

### "How do I fix my application?"
→ `S3_DEBUG_README.md` (Section: Integration with Application)

### "What's the S3 configuration?"
→ `S3_DEBUG_INSTRUCTIONS.md` (Section: Configuration Details)

### "What information should I collect?"
→ `S3_DEBUG_SUMMARY.md` (Section: Information to Report)

---

## 🎯 Key Concepts

### The Problem
- Work ID 4851 has a download_url in the database
- Need to verify the file is accessible in S3
- Need to determine correct path format

### The Solution
- Test 6 different path formats
- List actual bucket structure
- Compare database path vs S3 reality
- Find the working approach

### The Goal
- Identify correct S3 key format
- Update application code if needed
- Fix database paths if needed
- Enable successful file downloads

---

## 🛠️ Technical Details

### Stack
- **Language**: Python 3
- **AWS SDK**: boto3
- **Database**: PostgreSQL (psycopg2)
- **Cloud**: Yandex Cloud Storage (S3-compatible)

### Environment Variables Required
```bash
DATABASE_URL          # PostgreSQL connection string
YANDEX_S3_KEY_ID      # S3 access key
YANDEX_S3_SECRET_KEY  # S3 secret key
```

### Target Work
```
ID: 4851
Title: "русловые исследования"
Table: t_p63326274_course_download_plat.works
Bucket: kyra
```

---

## 📞 Support

### First Steps
1. Check `S3_DEBUG_QUICKSTART.md`
2. Review `debug_output.txt`
3. Check `S3_DEBUG_SUMMARY.md` troubleshooting

### Still Stuck?
1. Save full output: `./run_debug_s3.sh > full_debug.txt 2>&1`
2. Run analyzer: `python3 analyze_results.py full_debug.txt`
3. Review `S3_DEBUG_README.md` scenarios

### Need More Help?
Share these files:
- `debug_output.txt` or `full_debug.txt`
- Relevant sections from documentation
- Specific error messages
- What you've tried so far

---

## ⚠️ Important Notes

### Security
- Debug output may contain sensitive URLs
- Output files are in .gitignore
- Don't commit or share credentials
- Environment variables are partially masked in output

### Data Safety
- Script only reads from S3 (no writes)
- Database queries are read-only
- Original files are never modified
- Safe to run multiple times

### Performance
- Script runs in ~30-60 seconds
- Lists up to 1000 objects from bucket
- Tests 6 approaches per file
- Minimal network usage

---

## 📅 Version Info

**Created**: 2024-11-03  
**Purpose**: Debug S3 file access for work ID 4851  
**Status**: Ready to use  
**Last Updated**: 2024-11-03

---

## ✅ Checklist

Before running:
- [ ] Read `S3_DEBUG_QUICKSTART.md`
- [ ] Set `DATABASE_URL` environment variable
- [ ] Set `YANDEX_S3_KEY_ID` environment variable
- [ ] Set `YANDEX_S3_SECRET_KEY` environment variable
- [ ] Make `run_debug_s3.sh` executable

After running:
- [ ] Review `debug_output.txt`
- [ ] Note which approach worked (if any)
- [ ] Check error messages for failed approaches
- [ ] Review bucket structure listing
- [ ] Collect information for reporting

---

## 🚀 Let's Go!

Ready to start? Go to **`S3_DEBUG_QUICKSTART.md`** →

Need more context first? Go to **`S3_DEBUG_SUMMARY.md`** →

Want full details? Go to **`S3_DEBUG_README.md`** →
