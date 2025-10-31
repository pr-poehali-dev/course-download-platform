#!/usr/bin/env python3
"""
Fetch and analyze Yandex Disk folders at offset 400 to find VARCHAR violations.
Run this script locally: python3 find_problem_folder.py
"""

import json
import urllib.request
import urllib.parse
import re

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

def main():
    print("Fetching data from Yandex Disk API at offset 400...")
    print("="*80)
    
    # Fetch data
    public_key = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ'
    api_url = f'https://cloud-api.yandex.net/v1/disk/public/resources?public_key={urllib.parse.quote(public_key)}&limit=100&offset=400'
    
    try:
        req = urllib.request.Request(api_url)
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
        
        # Save raw response
        with open('offset_400_raw.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("✓ Raw data saved to offset_400_raw.json\n")
        
        if '_embedded' not in data or 'items' not in data['_embedded']:
            print("ERROR: No items found in API response")
            return
        
        items = data['_embedded']['items']
        print(f"Found {len(items)} items\n")
        
        # Field limits
        TITLE_LIMIT = 1000
        WORK_TYPE_LIMIT = 100
        SUBJECT_LIMIT = 200
        
        violations = []
        all_items = []
        
        # Analyze each folder
        for i, item in enumerate(items):
            if item.get('type') == 'dir':
                folder_name = item.get('name', '')
                work_info = extract_work_info(folder_name)
                
                title = work_info['title']
                work_type = work_info['work_type']
                subject = determine_subject(title)
                
                item_data = {
                    'offset_index': 400 + i,
                    'folder_name': folder_name,
                    'title': title,
                    'title_length': len(title),
                    'work_type': work_type,
                    'work_type_length': len(work_type),
                    'subject': subject,
                    'subject_length': len(subject),
                    'violations': []
                }
                
                # Check for violations
                if len(title) > TITLE_LIMIT:
                    item_data['violations'].append({
                        'field': 'title',
                        'length': len(title),
                        'limit': TITLE_LIMIT,
                        'exceeds_by': len(title) - TITLE_LIMIT
                    })
                    violations.append(item_data)
                
                if len(work_type) > WORK_TYPE_LIMIT:
                    item_data['violations'].append({
                        'field': 'work_type',
                        'length': len(work_type),
                        'limit': WORK_TYPE_LIMIT,
                        'exceeds_by': len(work_type) - WORK_TYPE_LIMIT
                    })
                    if item_data not in violations:
                        violations.append(item_data)
                
                if len(subject) > SUBJECT_LIMIT:
                    item_data['violations'].append({
                        'field': 'subject',
                        'length': len(subject),
                        'limit': SUBJECT_LIMIT,
                        'exceeds_by': len(subject) - SUBJECT_LIMIT
                    })
                    if item_data not in violations:
                        violations.append(item_data)
                
                all_items.append(item_data)
        
        # Save analysis
        analysis = {
            'total_items': len(all_items),
            'violations_count': len(violations),
            'violations': violations,
            'all_items': all_items
        }
        
        with open('offset_400_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(analysis, f, ensure_ascii=False, indent=2)
        print("✓ Analysis saved to offset_400_analysis.json\n")
        
        # Print summary
        if violations:
            print("="*80)
            print(f"FOUND {len(violations)} VIOLATION(S)!")
            print("="*80)
            
            for item in violations:
                print(f"\n{'='*80}")
                print(f"Offset Index: {item['offset_index']}")
                print(f"{'='*80}")
                print(f"Folder Name: {item['folder_name']}")
                print(f"\nExtracted Fields:")
                print(f"  Title ({item['title_length']} chars): {item['title'][:100]}...")
                print(f"  Work Type ({item['work_type_length']} chars): {item['work_type'][:100]}...")
                print(f"  Subject ({item['subject_length']} chars): {item['subject']}")
                print(f"\nViolations:")
                for v in item['violations']:
                    print(f"  ❌ {v['field'].upper()}: {v['length']} chars (limit: {v['limit']}, exceeds by {v['exceeds_by']})")
                print()
        else:
            print("="*80)
            print("No violations found!")
            print("="*80)
            print("\nShowing top 10 longest titles:")
            sorted_by_title = sorted(all_items, key=lambda x: x['title_length'], reverse=True)
            for i, item in enumerate(sorted_by_title[:10]):
                print(f"  {i+1}. Offset {item['offset_index']}: {item['title_length']} chars")
                print(f"     {item['title'][:80]}...")
            
            print("\nShowing top 10 longest work types:")
            sorted_by_work_type = sorted(all_items, key=lambda x: x['work_type_length'], reverse=True)
            for i, item in enumerate(sorted_by_work_type[:10]):
                print(f"  {i+1}. Offset {item['offset_index']}: {item['work_type_length']} chars")
                print(f"     {item['work_type'][:80]}...")
        
        print("\n" + "="*80)
        print("Analysis complete!")
        print("="*80)
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
