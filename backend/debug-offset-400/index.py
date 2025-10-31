'''
Debug function to fetch and analyze offset 400 from Yandex Disk API
Args: event - HTTP event, context - function context
Returns: JSON response with analysis of folder names
'''

import json
import urllib.request
import urllib.parse
import re
from typing import Dict, Any

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

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    # Handle CORS
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    try:
        # Fetch data from Yandex Disk API
        public_key = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ'
        api_url = f'https://cloud-api.yandex.net/v1/disk/public/resources?public_key={urllib.parse.quote(public_key)}&limit=100&offset=400'
        
        req = urllib.request.Request(api_url)
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
        
        if '_embedded' not in data or 'items' not in data['_embedded']:
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'error': 'No items found in API response'})
            }
        
        items = data['_embedded']['items']
        
        # Analyze each folder
        TITLE_LIMIT = 1000
        WORK_TYPE_LIMIT = 100
        SUBJECT_LIMIT = 200
        
        violations = []
        all_items = []
        
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
                    'folder_name_length': len(folder_name),
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
        
        # Sort by title length to see the longest ones
        sorted_by_title = sorted(all_items, key=lambda x: x['title_length'], reverse=True)
        sorted_by_work_type = sorted(all_items, key=lambda x: x['work_type_length'], reverse=True)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'total_items': len(all_items),
                'violations_count': len(violations),
                'violations': violations,
                'top_10_longest_titles': sorted_by_title[:10],
                'top_10_longest_work_types': sorted_by_work_type[:10]
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': str(e),
                'type': type(e).__name__
            })
        }
