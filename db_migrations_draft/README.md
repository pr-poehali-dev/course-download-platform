# Database Migration - Insert All 486 Works

## Overview
This directory contains SQL INSERT statements for all 486 academic works from Yandex Disk.

## Source Data
- **API Endpoint**: https://cloud-api.yandex.net/v1/disk/public/resources
- **Public URL**: https://disk.yandex.ru/d/usjmeUqnkY9IfQ
- **Total Works**: 486 folders

## Files

### 1. `insert_all_486_works.sql`
Complete SQL INSERT script for all works. Each INSERT includes:
- `title` - Work title (extracted from folder name)
- `work_type` - Type of work (курсовая работа, дипломная работа, etc.)
- `subject` - Subject area (электроэнергетика, автоматизация, etc.)
- `description` - Brief description
- `composition` - File composition (пояснительная записка, графика, чертежи)
- `universities` - Organization name if mentioned (e.g., "ООО Карачинский источник")
- `price_points` - Price in points based on work type and complexity
- `yandex_disk_link` - Public link to Yandex Disk folder

### 2. Generator Scripts

#### `generate_all_sql.js` (Node.js)
```bash
node generate_all_sql.js
```
Fetches all 486 works from Yandex Disk API and generates complete SQL file.

#### `generate_complete_sql.html` (Browser-based)
Open in browser, click "Fetch All 486 Works & Generate SQL" to generate and download SQL file.

#### `fetch_all_works.py` (Python)
```bash
python3 fetch_all_works.py
```
Python script to fetch and generate SQL.

## Pricing Strategy

### Work Type Price Ranges:
- **Практическая работа**: 800-1,200 points
- **Контрольная работа**: 1,200-1,500 points
- **Реферат**: 1,000-1,500 points
- **Отчет по практике**: 1,200-1,800 points
- **Курсовая работа**: 1,500-2,500 points
  - Simple: 1,800 points
  - Complex (with проектирование, расчет, модернизация): 2,200 points
- **Дипломная работа**: 4,000-7,000 points
  - Standard: 5,000 points
  - Complex (with модернизация, автоматизация, проектирование системы): 6,000 points

### Complexity Indicators:
Works with these keywords in title get higher prices:
- проектирование (design/engineering)
- расчет (calculation)
- модернизация (modernization)
- разработка (development)
- автоматизация (automation)
- проектирование системы (system design)

## Subject Area Classification

Keywords used for automatic classification:

| Subject | Keywords |
|---------|----------|
| электроэнергетика | электро, электри, энергет, эу, ру |
| автоматизация | автоматиз, управлен, асу, контрол, регулир |
| строительство | строител, бетон, конструк, здание, сооружен |
| механика | механ, привод, станок, оборудован |
| газоснабжение | газ, газопровод, нефт |
| программирование | програм, по, software, алгоритм, дискрет |
| безопасность | безопасн, охран, труд, защит |
| теплоснабжение | тепло, водоснабжен, вентиляц, отоплен, канализац |
| транспорт | транспорт, дорог, судов, автомобил, локомотив |
| гидравлика | гидравлик, гидро |
| общая инженерия | (default if no matches) |

## Composition Rules

Based on work type:

### Дипломная работа (Diploma Work):
- Complex technical works: "Пояснительная записка, графика, чертежи"
- Standard works: "Пояснительная записка, графика"

### Курсовая работа (Course Work):
- With проектирование, расчет, схема: "Пояснительная записка, чертежи"
- Simple: "Пояснительная записка"

### Отчет по практике (Internship Report):
- "Отчёт, дневник практики"

### Other types:
- "Пояснительная записка"

## University/Organization Extraction

Regex pattern: `/(ООО|ПАО|ОАО|АО|ЗАО)\s+[«"]?([^»"()]+)[»"]?/`

Examples found:
- ООО Карачинский источник
- ПАО Сургутнефтегаз

## Usage

### Direct SQL Execution:
```sql
source db_migrations_draft/insert_all_486_works.sql;
```

### Check Results:
```sql
SELECT COUNT(*) FROM t_p63326274_course_download_plat.works;
-- Should return 486

SELECT work_type, COUNT(*) as count, AVG(price_points) as avg_price
FROM t_p63326274_course_download_plat.works
GROUP BY work_type
ORDER BY count DESC;
```

## Data Quality

All 486 works include:
- ✓ Extracted title from folder name
- ✓ Identified work type from parentheses
- ✓ Auto-classified subject area
- ✓ Realistic pricing based on type and complexity
- ✓ Composition determined by work type
- ✓ Organization names extracted where present
- ✓ Same Yandex Disk public link for all (folder-level links)

## Generation Process

1. Fetch all folders via Yandex Disk API (5 batches: offsets 0, 100, 200, 300, 400)
2. Parse folder name to extract title and work type
3. Analyze title keywords to determine subject area
4. Calculate price based on work type and complexity indicators
5. Extract organization names using regex
6. Determine composition based on work type rules
7. Generate SQL INSERT statement
8. Compile all 486 statements into single SQL file

## Notes

- All works link to the same public folder: https://yadi.sk/d/usjmeUqnkY9IfQ
- Individual folder links would require separate API calls per folder
- Prices reflect realistic market values for Russian academic works
- Subject classification is automatic based on title keywords
- SQL strings are properly escaped (single quotes doubled)
