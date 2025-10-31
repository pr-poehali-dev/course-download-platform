#!/usr/bin/env python3
import json
import urllib.request
import urllib.parse
import re
import sys

def fetch_yandex_disk_batch(offset: int):
    """Fetch batch of folders from Yandex Disk API"""
    public_key = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ'
    api_url = f'https://cloud-api.yandex.net/v1/disk/public/resources?public_key={urllib.parse.quote(public_key)}&limit=100&offset={offset}'
    
    req = urllib.request.Request(api_url)
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode('utf-8'))

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

try:
    print("Fetching data from Yandex Disk API at offset 400...")
    data = fetch_yandex_disk_batch(400)
    
    # Save raw response
    with open('offset_400_raw.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Raw data saved to offset_400_raw.json")
    
    if '_embedded' in data and 'items' in data['_embedded']:
        items = data['_embedded']['items']
        print(f"\nFound {len(items)} items at offset 400\n")
        
        # Field limits from database schema
        TITLE_LIMIT = 1000
        WORK_TYPE_LIMIT = 100
        SUBJECT_LIMIT = 200
        
        violations = []
        all_items_analysis = []
        
        for i, item in enumerate(items):
            if item.get('type') == 'dir':
                folder_name = item.get('name', '')
                work_info = extract_work_info(folder_name)
                
                title = work_info['title']
                work_type = work_info['work_type']
                subject = determine_subject(title)
                
                # Check field lengths
                title_len = len(title)
                work_type_len = len(work_type)
                subject_len = len(subject)
                
                item_analysis = {
                    'offset_index': 400 + i,
                    'folder_name': folder_name,
                    'title': title,
                    'title_length': title_len,
                    'work_type': work_type,
                    'work_type_length': work_type_len,
                    'subject': subject,
                    'subject_length': subject_len,
                    'violations': []
                }
                
                # Check for violations
                if title_len > TITLE_LIMIT:
                    item_analysis['violations'].append({
                        'field': 'title',
                        'length': title_len,
                        'limit': TITLE_LIMIT,
                        'exceeds_by': title_len - TITLE_LIMIT
                    })
                    violations.append(item_analysis)
                
                if work_type_len > WORK_TYPE_LIMIT:
                    item_analysis['violations'].append({
                        'field': 'work_type',
                        'length': work_type_len,
                        'limit': WORK_TYPE_LIMIT,
                        'exceeds_by': work_type_len - WORK_TYPE_LIMIT
                    })
                    if item_analysis not in violations:
                        violations.append(item_analysis)
                
                if subject_len > SUBJECT_LIMIT:
                    item_analysis['violations'].append({
                        'field': 'subject',
                        'length': subject_len,
                        'limit': SUBJECT_LIMIT,
                        'exceeds_by': subject_len - SUBJECT_LIMIT
                    })
                    if item_analysis not in violations:
                        violations.append(item_analysis)
                
                all_items_analysis.append(item_analysis)
        
        # Save analysis
        with open('offset_400_analysis.json', 'w', encoding='utf-8') as f:
            json.dump({
                'total_items': len(all_items_analysis),
                'violations_count': len(violations),
                'all_items': all_items_analysis,
                'violations': violations
            }, f, ensure_ascii=False, indent=2)
        print("Analysis saved to offset_400_analysis.json")
        
        # Print summary
        if violations:
            print("\n" + "="*80)
            print(f"FOUND {len(violations)} ITEM(S) WITH VIOLATIONS:")
            print("="*80)
            for item in violations:
                print(f"\nOffset Index: {item['offset_index']}")
                print(f"Folder Name: {item['folder_name'][:80]}{'...' if len(item['folder_name']) > 80 else ''}")
                print(f"\nExtracted Fields:")
                print(f"  - Title: {item['title'][:80]}{'...' if len(item['title']) > 80 else ''}")
                print(f"    Length: {item['title_length']}")
                print(f"  - Work Type: {item['work_type'][:80]}{'...' if len(item['work_type']) > 80 else ''}")
                print(f"    Length: {item['work_type_length']}")
                print(f"  - Subject: {item['subject']}")
                print(f"    Length: {item['subject_length']}")
                print(f"\nViolations:")
                for v in item['violations']:
                    print(f"  - Field '{v['field']}' is {v['length']} characters (limit: {v['limit']}, exceeds by: {v['exceeds_by']})")
                print("-" * 80)
        else:
            print("\nNo violations found in offset 400 batch.")
            print("Checking the 10 longest fields in this batch:")
            
            # Sort by title length
            sorted_by_title = sorted(all_items_analysis, key=lambda x: x['title_length'], reverse=True)
            print("\nTop 10 longest titles:")
            for i, item in enumerate(sorted_by_title[:10]):
                print(f"{i+1}. Offset {item['offset_index']}: {item['title_length']} chars - {item['title'][:100]}...")
            
            # Sort by work_type length
            sorted_by_work_type = sorted(all_items_analysis, key=lambda x: x['work_type_length'], reverse=True)
            print("\nTop 10 longest work types:")
            for i, item in enumerate(sorted_by_work_type[:10]):
                print(f"{i+1}. Offset {item['offset_index']}: {item['work_type_length']} chars - {item['work_type'][:100]}...")
    else:
        print("No items found in response")
        
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
