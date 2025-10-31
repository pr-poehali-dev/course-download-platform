#!/usr/bin/env python3
import re

folder_name = "Управление техническим состоянием железнодорожного пути по направлению Строительство железных дорог, мостов и транспортных тоннелей (для специалистов с высшим образованием) (курсовая работа)"

# Extract title and work_type using the pattern from the backend
match = re.match(r'^(.+?)\s*\((.+?)\)\s*$', folder_name.strip())

if match:
    # This regex is GREEDY from the start and matches the FIRST opening ( and LAST closing )
    # So it would capture everything before the LAST (
    title = match.group(1).strip()
    work_type = match.group(2).strip()
else:
    title = folder_name
    work_type = 'неизвестный тип'

print(f"Folder name: {folder_name}")
print(f"Folder name length: {len(folder_name)}\n")

print(f"Title: {title}")
print(f"Title length: {len(title)}\n")

print(f"Work type: {work_type}")
print(f"Work type length: {len(work_type)}\n")

print("="*80)
print("ANALYSIS:")
print("="*80)
print(f"Title limit: 1000 characters")
print(f"Work type limit: 100 characters")
print(f"Subject limit: 200 characters")
print()

if len(title) > 1000:
    print(f"❌ TITLE VIOLATION: {len(title)} chars exceeds 1000 by {len(title) - 1000}")
else:
    print(f"✓ Title OK: {len(title)} chars (within 1000 limit)")

if len(work_type) > 100:
    print(f"❌ WORK TYPE VIOLATION: {len(work_type)} chars exceeds 100 by {len(work_type) - 100}")
else:
    print(f"✓ Work type OK: {len(work_type)} chars (within 100 limit)")
