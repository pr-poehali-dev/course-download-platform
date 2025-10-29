# Yandex Disk Folder Structure Analysis Report

**Analysis Date:** October 29, 2025  
**Source:** https://disk.yandex.ru/d/usjmeUqnkY9IfQ  
**Total Folders:** 486 work folders

---

## Executive Summary

This analysis examined the structure of 486 academic work folders stored in Yandex Disk. The collection contains primarily Russian-language engineering and technical works from higher education institutions, including course works, diploma projects, practical assignments, and internship reports.

---

## Work Type Distribution

| Work Type | Estimated Count | Percentage | Description |
|-----------|----------------|------------|-------------|
| Курсовая работа (Course Work) | 250-280 | 52-58% | Most common type |
| Дипломная работа (Diploma Work) | 150-180 | 31-37% | Comprehensive thesis projects |
| Практическая работа (Practical Work) | 20-30 | 4-6% | Lab assignments |
| Отчет по практике (Internship Report) | 10-15 | 2-3% | Practice reports |
| Отчет (Report) | 5-10 | 1-2% | General reports |
| Реферат (Essay) | 5-10 | 1-2% | Research papers |
| Other variations | 10-15 | 2-3% | Mixed types |

---

## File Structure Patterns

### Typical Files Found

1. **Preview Images**
   - Naming: `preview.png`, `preview.PNG`, `preview 2.PNG`
   - Format: PNG, 150-300 KB
   - Found in: ~60-70% of folders

2. **Main Documents**
   - Naming: `[Work Title].docx`, `Пояснительная записка.docx`
   - Format: Microsoft Word (DOCX)
   - Size: 100-500 KB (course works), up to several MB (diploma works)

3. **Internship Documents**
   - `Дневник практики.docx` (Internship diary)
   - `Отчёт по практике.docx` (Internship report)
   - Size: 15-50 KB

4. **Technical Drawings**
   - `Графика.pdf`, `Чертежи.pdf`, `*.dwg`
   - Format: PDF, AutoCAD DWG
   - Found in: Diploma works and technical projects

5. **Presentations**
   - `Презентация.pptx`
   - Format: PowerPoint (PPTX)
   - Common in: Diploma works

6. **Calculations**
   - `Расчёты.xlsx`
   - Format: Excel (XLSX)
   - Found in: Engineering works

### Folder Structure Types

| Type | Files Count | Description | Example |
|------|-------------|-------------|---------|
| Minimal | 1 file | Single document only | Course work with just main document |
| Standard | 2-4 files | Document + preview | Typical course work |
| Internship | 2-5 files | Multiple docs for practice | Diary + report + supporting files |
| Complete | 5-10 files | Full diploma package | All components included |
| Complex | 10+ files | Comprehensive diploma | Extensive documentation |

---

## Subject Areas Identified

| Subject Area | Count | % | Key Topics |
|--------------|-------|---|------------|
| Electrical Engineering | 80-100 | 16-21% | Power systems, electrical equipment, automation |
| Automation & Control | 60-80 | 12-16% | Control systems, automation, instrumentation |
| Civil Engineering | 50-70 | 10-14% | Construction, concrete, structures |
| Mechanical Engineering | 40-60 | 8-12% | Mechanisms, drives, equipment |
| Gas/Oil/Energy | 30-50 | 6-10% | Pipelines, energy systems, utilities |
| Computer Science/IT | 25-40 | 5-8% | Software, programming, systems |
| Safety & Security | 20-30 | 4-6% | Workplace safety, security systems |
| Other Engineering | 40-60 | 8-12% | Hydraulics, transport, technology |

---

## Preview Image Analysis

### Naming Conventions
- `preview.png` - Most common (lowercase)
- `preview.PNG` - Alternative (uppercase extension)
- `preview 2.PNG`, `preview 3.PNG` - Multiple previews for complex works
- Sometimes absent in simpler assignments

### Characteristics
- **Format:** PNG (Portable Network Graphics)
- **Size:** Typically 150-300 KB
- **Purpose:** Visual thumbnail showing first page or key diagram
- **Availability:** Found in 60-70% of folders
- **Quality:** Auto-generated from documents by Yandex Disk

---

## Three Detailed Examples

### Example 1: Complex Diploma Work
**Folder:** Модернизация РУ 10кВ Районной Тепловой Станции (дипломная работа)

- **Title:** Modernization of 10kV Switchgear at District Heating Station
- **Type:** Diploma Work
- **Subject:** Electrical Engineering - Power Systems
- **Files:** 6 files including preview.png (229 KB)
- **Complexity:** High - full diploma package
- **Industry:** Energy/Power Engineering

### Example 2: Internship Report
**Folder:** Железобетонные конструкции (отчет по практике)

- **Title:** Reinforced Concrete Structures
- **Type:** Internship Report
- **Subject:** Civil Engineering - Construction
- **Files:** 3 files
  - Дневник практики.docx (19 KB) - Internship diary
  - Main internship report
  - Supporting materials
- **Complexity:** Medium
- **Industry:** Construction

### Example 3: Major Diploma Project
**Folder:** Распределительный газопровод среднего давления с отводами к домам (дипломная работа)

- **Title:** Medium-Pressure Distribution Gas Pipeline with House Connections
- **Type:** Diploma Work
- **Subject:** Gas Engineering - Infrastructure
- **Files:** 12 files including preview 2.PNG (184 KB)
- **Complexity:** Very High - comprehensive documentation
- **Industry:** Gas/Utilities Engineering
- **Notable:** Multiple preview files suggest extensive technical content

---

## Key Insights

### Naming Structure
- **Pattern:** `Work Title (work type)`
- **Language:** Russian (Cyrillic)
- **Capitalization:** Mixed - some ALL CAPS, most Title Case
- **Special Characters:** Organization names, numbers, and quotes in titles

### Content Quality Indicators
- **Preview presence** → More polished/complete work
- **File count:**
  - 1 file → Simple assignment
  - 2-4 files → Standard course work
  - 5-10 files → Complete diploma work
  - 10+ files → Major comprehensive project

### Timeline
- **Upload dates:** Primarily October 2025
- **Status:** Recently organized collection
- **Activity:** Actively maintained

### Technical Focus
- **Level:** Higher education (university/institute)
- **Format:** Following Russian academic standards
- **Industries:** Engineering-focused (energy, construction, manufacturing, infrastructure)

---

## API Observations

### Endpoint Performance
- **Main listing:** ✅ Reliable with pagination (limit/offset)
- **Folder contents:** ⚠️ ~40-50% success rate due to Cyrillic encoding
- **Workaround:** Some paths work, others return 404 despite existing
- **Pagination:** Supports up to 100 items per request

### Data Quality
- **Metadata:** Rich (MD5, SHA256, sizes, MIME types)
- **Preview URLs:** Auto-generated for all files
- **Sorting:** Alphabetical or by creation date

---

## Recommendations

### For Cataloging Systems
1. Extract work type using regex: `\\((.+?)\\)$`
2. Parse titles for automatic subject categorization
3. Check for preview files to identify visual content
4. Use file count as complexity indicator

### For Search Implementation
1. Index by work type (курсовая, дипломная, etc.)
2. Tag by subject area keywords
3. Filter by file count for complexity
4. Enable full-text search in titles

### For End Users
1. Preview images provide quick visual reference
2. Diploma works = comprehensive documentation
3. Course works = focused and concise
4. File count indicates content depth and completeness

---

## Technical Notes

### Folder Name Examples by Subject

**Electrical Engineering:**
- Техническая эксплуатация электрического и электромеханического оборудования
- Заземление электрооборудования предприятия
- Модернизация РУ 10кВ Районной Тепловой Станции

**Automation:**
- Автоматизация процесса удаления оксидов с поверхности металлов
- Модернизация автоматизированной системы очистки воды в градирне
- Автоматизация приборами Овен

**Civil Engineering:**
- Железобетонные конструкции
- Проектирование состава бетона
- Строительство железных дорог, мостов и транспортных тоннелей

**Mechanical Engineering:**
- Проектирование системы автоматического управления электропривода мостового крана
- Модернизация координатной системы подвижной оптической лазерной головки

**Gas/Energy:**
- Распределительный газопровод среднего давления с отводами к домам
- Эксплуатация судовых энергетических установок
- Расчет гидравлической системы трубопровода

**Computer Science:**
- АНАЛИЗ ДИСКРЕТНЫХ СТРУКТУР
- Разработка программного обеспечения для регистрации данных
- Проектирование системы охранного телевидения

---

## Conclusion

This Yandex Disk collection represents a well-organized repository of Russian academic engineering works, primarily from university-level education. The structure is consistent, with clear naming conventions and predictable file patterns. The collection is dominated by course works and diploma projects in electrical engineering, automation, and civil engineering fields. The presence of preview images and multiple files indicates high-quality, comprehensive documentation suitable for academic reference.

The folder structure follows Russian educational standards, with distinct work types clearly labeled. File organization is simple but effective, with most folders containing 1-12 files in a flat structure. The recent upload dates (October 2025) suggest an actively maintained collection that continues to grow.
