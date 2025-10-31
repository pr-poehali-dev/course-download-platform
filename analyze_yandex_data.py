#!/usr/bin/env python3
"""
Analyze Yandex Disk API data at offset 400 to find VARCHAR limit violations.
This script analyzes the folder names from the Yandex Disk public folder.
"""

import re

# Sample data from the API response (first two items as examples)
sample_folders = [
    "Улучшение условий труда работников Долганского месторождения ПАО Сургутнефтегаз (дипломная работа)",
    "Управление техническим состоянием железнодорожного пути по направлению Строительство железных дорог, мостов и транспортных тоннелей (для специалистов с высшим образованием) (курсовая работа)",
]

def extract_work_info(folder_name: str):
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

def determine_subject(title: str) -> str:
    """Determine subject area from title keywords"""
    t = title.lower()
    
    if re.search(r'электро|электри|энергет|эу|ру', t):
        return 'электроэнергетика'
    if re.search(r'автоматиз|управлен|асу|контрол|регулир', t):
        return 'автоматизация'
    if re.search(r'строител|бетон|конструк|здание|сооружен', t):
        return 'строительство'
    if re.search(r'механ|привод|станок|оборудован', t):
        return 'механика'
    if re.search(r'газ|газопровод|нефт', t):
        return 'газоснабжение'
    if re.search(r'програм|по|software|алгоритм|дискрет', t):
        return 'программирование'
    if re.search(r'безопасн|охран|труд|защит', t):
        return 'безопасность'
    if re.search(r'тепло|водоснабжен|вентиляц|отоплен', t):
        return 'теплоснабжение'
    if re.search(r'транспорт|дорог|судов|автомобил|локомотив', t):
        return 'транспорт'
    if re.search(r'гидравлик|гидро', t):
        return 'гидравлика'
    
    return 'общая инженерия'

# Database field limits
TITLE_LIMIT = 1000
WORK_TYPE_LIMIT = 100
SUBJECT_LIMIT = 200

print("="*80)
print("ANALYZING SAMPLE FOLDER NAMES FROM OFFSET 400")
print("="*80)

for i, folder_name in enumerate(sample_folders):
    offset = 400 + i
    print(f"\n{'='*80}")
    print(f"ITEM {i} (Offset {offset})")
    print(f"{'='*80}")
    print(f"\nFolder Name ({len(folder_name)} chars):")
    print(folder_name)
    print(f"\n{'-'*80}")
    
    work_info = extract_work_info(folder_name)
    title = work_info['title']
    work_type = work_info['work_type']
    subject = determine_subject(title)
    
    print(f"\nExtracted Fields:")
    print(f"  Title: {title}")
    print(f"  Title Length: {len(title)} / {TITLE_LIMIT}")
    print(f"\n  Work Type: {work_type}")
    print(f"  Work Type Length: {len(work_type)} / {WORK_TYPE_LIMIT}")
    print(f"\n  Subject: {subject}")
    print(f"  Subject Length: {len(subject)} / {SUBJECT_LIMIT}")
    
    violations = []
    
    if len(title) > TITLE_LIMIT:
        violations.append(('title', len(title), TITLE_LIMIT, len(title) - TITLE_LIMIT))
    
    if len(work_type) > WORK_TYPE_LIMIT:
        violations.append(('work_type', len(work_type), WORK_TYPE_LIMIT, len(work_type) - WORK_TYPE_LIMIT))
    
    if len(subject) > SUBJECT_LIMIT:
        violations.append(('subject', len(subject), SUBJECT_LIMIT, len(subject) - SUBJECT_LIMIT))
    
    if violations:
        print(f"\n{'!'*80}")
        print("VIOLATIONS DETECTED:")
        print(f"{'!'*80}")
        for field, length, limit, exceeds in violations:
            print(f"  {field.upper()}: {length} chars (limit: {limit}) - EXCEEDS BY {exceeds} CHARS")
    else:
        print(f"\n✓ No violations found for this item")

print(f"\n\n{'='*80}")
print("DETAILED ANALYSIS OF ITEM 1 (Most likely culprit)")
print(f"{'='*80}")

# Focus on item 1 which has a very long folder name
problem_folder = sample_folders[1]
work_info = extract_work_info(problem_folder)
title = work_info['title']
work_type = work_info['work_type']

print(f"\nFull folder name:")
print(f"Length: {len(problem_folder)} characters")
print(problem_folder)

print(f"\n\nTitle (before last parentheses):")
print(f"Length: {len(title)} characters")
print(title)

print(f"\n\nWork type (inside last parentheses):")
print(f"Length: {len(work_type)} characters")
print(work_type)

# Check each word/part
print(f"\n\nBreaking down the title:")
parts = title.split()
cumulative = 0
for i, part in enumerate(parts):
    cumulative += len(part) + (1 if i > 0 else 0)  # +1 for space
    print(f"  Word {i+1}: '{part}' (cumulative: {cumulative} chars)")

if len(title) > TITLE_LIMIT:
    print(f"\n{'='*80}")
    print(f"FOUND THE ISSUE!")
    print(f"{'='*80}")
    print(f"The title field is {len(title)} characters long")
    print(f"Database limit is {TITLE_LIMIT} characters")
    print(f"Exceeds by {len(title) - TITLE_LIMIT} characters")
    print(f"\nThis is causing the 'value too long for type character varying(1000)' error")
