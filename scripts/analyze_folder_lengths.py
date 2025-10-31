#!/usr/bin/env python3
"""
Analyze Yandex Disk folder names to find which fields exceed VARCHAR limits
Database limits:
- title: VARCHAR(500)
- work_type: VARCHAR(100)
- subject: VARCHAR(200)
- file_url: VARCHAR(500)
- folder_path: TEXT (unlimited)
"""

import json
import urllib.request
import urllib.parse
import re
from typing import Dict, Any, Optional

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

def fetch_yandex_disk_batch(offset: int) -> Dict[str, Any]:
    """Fetch batch of folders from Yandex Disk API"""
    public_key = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ'
    api_url = f'https://cloud-api.yandex.net/v1/disk/public/resources?public_key={urllib.parse.quote(public_key)}&limit=100&offset={offset}'
    
    req = urllib.request.Request(api_url)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def main():
    """Analyze all folder names for length violations"""
    print("Analyzing Yandex Disk folder names for VARCHAR length violations...\n")
    
    # Track violations
    violations = {
        'title': [],
        'work_type': [],
        'subject': [],
        'description': []
    }
    
    max_lengths = {
        'folder_name': 0,
        'title': 0,
        'work_type': 0,
        'subject': 0,
        'description': 0
    }
    
    total_folders = 0
    
    for offset in [0, 100, 200, 300, 400]:
        print(f"Fetching batch at offset {offset}...")
        
        try:
            data = fetch_yandex_disk_batch(offset)
            
            if '_embedded' in data and 'items' in data['_embedded']:
                for item in data['_embedded']['items']:
                    if item.get('type') == 'dir':
                        folder_name = item.get('name', '')
                        work_info = extract_work_info(folder_name)
                        
                        title = work_info['title']
                        work_type = work_info['work_type']
                        subject = determine_subject(title)
                        description = f'Работа по теме: {title}'
                        
                        total_folders += 1
                        
                        # Track max lengths
                        max_lengths['folder_name'] = max(max_lengths['folder_name'], len(folder_name))
                        max_lengths['title'] = max(max_lengths['title'], len(title))
                        max_lengths['work_type'] = max(max_lengths['work_type'], len(work_type))
                        max_lengths['subject'] = max(max_lengths['subject'], len(subject))
                        max_lengths['description'] = max(max_lengths['description'], len(description))
                        
                        # Check for violations
                        if len(title) > 500:
                            violations['title'].append({
                                'folder_name': folder_name,
                                'title': title,
                                'length': len(title),
                                'excess': len(title) - 500
                            })
                        
                        if len(work_type) > 100:
                            violations['work_type'].append({
                                'folder_name': folder_name,
                                'work_type': work_type,
                                'length': len(work_type),
                                'excess': len(work_type) - 100
                            })
                        
                        if len(subject) > 200:
                            violations['subject'].append({
                                'folder_name': folder_name,
                                'subject': subject,
                                'length': len(subject),
                                'excess': len(subject) - 200
                            })
                        
                        if len(description) > 500:
                            violations['description'].append({
                                'folder_name': folder_name,
                                'description': description,
                                'length': len(description),
                                'excess': len(description) - 500
                            })
                        
        except Exception as e:
            print(f"Error at offset {offset}: {e}")
    
    # Print summary
    print(f"\n{'='*80}")
    print(f"ANALYSIS COMPLETE - Total folders analyzed: {total_folders}")
    print(f"{'='*80}\n")
    
    print("MAX LENGTHS OBSERVED:")
    print(f"  folder_name: {max_lengths['folder_name']} chars (TEXT type, no limit)")
    print(f"  title:       {max_lengths['title']} chars (limit: 500)")
    print(f"  work_type:   {max_lengths['work_type']} chars (limit: 100)")
    print(f"  subject:     {max_lengths['subject']} chars (limit: 200)")
    print(f"  description: {max_lengths['description']} chars (TEXT type, no limit)")
    print()
    
    # Report violations
    has_violations = False
    
    for field, items in violations.items():
        if items:
            has_violations = True
            print(f"\n{'='*80}")
            print(f"⚠️  {field.upper()} VIOLATIONS: {len(items)} records exceed limit")
            print(f"{'='*80}")
            
            for i, violation in enumerate(items, 1):
                print(f"\n{i}. Length: {violation['length']} chars (exceeds by {violation['excess']})")
                print(f"   Folder: {violation['folder_name'][:100]}...")
                if field == 'title':
                    print(f"   Title: {violation['title'][:100]}...")
                elif field == 'work_type':
                    print(f"   Work Type: {violation['work_type']}")
                elif field == 'subject':
                    print(f"   Subject: {violation['subject']}")
                elif field == 'description':
                    print(f"   Description: {violation['description'][:100]}...")
    
    if not has_violations:
        print("\n✅ NO VIOLATIONS FOUND - All fields are within their VARCHAR limits!")
    else:
        print(f"\n{'='*80}")
        print("RECOMMENDATIONS:")
        print(f"{'='*80}")
        
        if violations['title']:
            new_limit = max_lengths['title'] + 50  # Add buffer
            print(f"\n1. Increase title VARCHAR limit:")
            print(f"   ALTER TABLE works ALTER COLUMN title TYPE VARCHAR({new_limit});")
        
        if violations['work_type']:
            new_limit = max_lengths['work_type'] + 50
            print(f"\n2. Increase work_type VARCHAR limit:")
            print(f"   ALTER TABLE works ALTER COLUMN work_type TYPE VARCHAR({new_limit});")
        
        if violations['subject']:
            new_limit = max_lengths['subject'] + 50
            print(f"\n3. Increase subject VARCHAR limit:")
            print(f"   ALTER TABLE works ALTER COLUMN subject TYPE VARCHAR({new_limit});")
        
        if violations['description']:
            print(f"\n4. Change description to TEXT type (unlimited):")
            print(f"   ALTER TABLE works ALTER COLUMN description TYPE TEXT;")

if __name__ == '__main__':
    main()
