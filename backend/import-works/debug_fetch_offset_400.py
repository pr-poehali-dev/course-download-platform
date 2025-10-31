import json
import urllib.request
import urllib.parse
import re

def fetch_yandex_disk_batch(offset: int):
    """Fetch batch of folders from Yandex Disk API"""
    public_key = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ'
    api_url = f'https://cloud-api.yandex.net/v1/disk/public/resources?public_key={urllib.parse.quote(public_key)}&limit=100&offset={offset}'
    
    req = urllib.request.Request(api_url)
    with urllib.request.urlopen(req) as response:
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

# Fetch offset 400
print("Fetching data from offset 400...")
data = fetch_yandex_disk_batch(400)

if '_embedded' in data and 'items' in data['_embedded']:
    items = data['_embedded']['items']
    print(f"\nFound {len(items)} items at offset 400\n")
    
    # Field limits
    TITLE_LIMIT = 1000
    WORK_TYPE_LIMIT = 100
    SUBJECT_LIMIT = 200
    
    violations = []
    
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
            folder_len = len(folder_name)
            
            print(f"Item {i} (offset {400 + i}):")
            print(f"  Folder name: {folder_name[:100]}{'...' if len(folder_name) > 100 else ''}")
            print(f"  Title length: {title_len} / {TITLE_LIMIT}")
            print(f"  Work type length: {work_type_len} / {WORK_TYPE_LIMIT}")
            print(f"  Subject length: {subject_len} / {SUBJECT_LIMIT}")
            
            # Check for violations
            if title_len > TITLE_LIMIT:
                violations.append({
                    'offset': 400 + i,
                    'folder_name': folder_name,
                    'field': 'title',
                    'length': title_len,
                    'limit': TITLE_LIMIT,
                    'value': title
                })
                print(f"  *** VIOLATION: Title exceeds limit! ***")
            
            if work_type_len > WORK_TYPE_LIMIT:
                violations.append({
                    'offset': 400 + i,
                    'folder_name': folder_name,
                    'field': 'work_type',
                    'length': work_type_len,
                    'limit': WORK_TYPE_LIMIT,
                    'value': work_type
                })
                print(f"  *** VIOLATION: Work type exceeds limit! ***")
            
            if subject_len > SUBJECT_LIMIT:
                violations.append({
                    'offset': 400 + i,
                    'folder_name': folder_name,
                    'field': 'subject',
                    'length': subject_len,
                    'limit': SUBJECT_LIMIT,
                    'value': subject
                })
                print(f"  *** VIOLATION: Subject exceeds limit! ***")
            
            print()
    
    if violations:
        print("\n" + "="*80)
        print("VIOLATIONS FOUND:")
        print("="*80)
        for v in violations:
            print(f"\nOffset: {v['offset']}")
            print(f"Folder: {v['folder_name']}")
            print(f"Field: {v['field']}")
            print(f"Length: {v['length']} / {v['limit']} (exceeds by {v['length'] - v['limit']} characters)")
            print(f"Value: {v['value']}")
    else:
        print("\nNo field length violations found in this batch.")
else:
    print("No items found in response")
