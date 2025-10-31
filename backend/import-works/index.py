'''
Business: Import all 486 works from Yandex Disk to database
Args: event - HTTP event, context - function context
Returns: JSON response with import status
'''

import json
import urllib.request
import urllib.parse
import re
import os
import psycopg2
from typing import Dict, Any, Optional, List

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

def determine_price(work_type: str, title: str) -> int:
    """Determine realistic market price based on work type and complexity"""
    wt = work_type.lower()
    t = title.lower()
    
    if re.search(r'практическая|практика', wt) and not re.search(r'отчет', wt):
        return 1000
    if re.search(r'отчет.*практ', wt):
        return 1500
    if re.search(r'курсовая|курсовой', wt):
        if re.search(r'проектирование|расчет|модернизация|разработка', t):
            return 2200
        return 1800
    if re.search(r'дипломная|диплом', wt):
        if re.search(r'модернизация|проектирование системы|разработка|автоматизация', t):
            return 6000
        return 5000
    if re.search(r'реферат', wt):
        return 1200
    if re.search(r'контрольная', wt):
        return 1500
    
    return 1500

def extract_university(title: str) -> Optional[str]:
    """Extract organization name from title"""
    match = re.search(r'(ООО|ПАО|ОАО|АО|ЗАО)\s+[«"]?([^»"()]+)[»"]?', title)
    if match:
        return f"{match.group(1)} {match.group(2).strip()}"
    return None

def determine_composition(work_type: str, title: str) -> str:
    """Determine work composition based on type"""
    wt = work_type.lower()
    t = title.lower()
    
    if re.search(r'дипломная', wt):
        if re.search(r'газопровод|электро|система|модернизация', t):
            return 'Пояснительная записка, графика, чертежи'
        return 'Пояснительная записка, графика'
    if re.search(r'курсовая', wt):
        if re.search(r'проектирование|расчет|схема', t):
            return 'Пояснительная записка, чертежи'
        return 'Пояснительная записка'
    if re.search(r'отчет', wt):
        return 'Отчёт, дневник практики'
    
    return 'Пояснительная записка'

def fetch_yandex_disk_batch(offset: int) -> Dict[str, Any]:
    """Fetch batch of folders from Yandex Disk API"""
    public_key = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ'
    api_url = f'https://cloud-api.yandex.net/v1/disk/public/resources?public_key={urllib.parse.quote(public_key)}&limit=100&offset={offset}'
    
    req = urllib.request.Request(api_url)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Connect to database
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    total_imported = 0
    errors = []
    
    # Fetch all batches
    for offset in [0, 100, 200, 300, 400]:
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
                        price = determine_price(work_type, title)
                        university = extract_university(title)
                        composition = determine_composition(work_type, title)
                        description = f'Работа по теме: {title}'
                        yandex_link = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ'
                        
                        # Check if work exists by title
                        cur.execute('''
                            SELECT id FROM t_p63326274_course_download_plat.works 
                            WHERE title = %s LIMIT 1
                        ''', (title,))
                        
                        existing = cur.fetchone()
                        
                        if existing:
                            # Update existing work with folder_path
                            cur.execute('''
                                UPDATE t_p63326274_course_download_plat.works
                                SET folder_path = %s, yandex_disk_link = %s
                                WHERE id = %s
                            ''', (folder_name, yandex_link, existing[0]))
                        else:
                            # Insert new work
                            cur.execute('''
                                INSERT INTO t_p63326274_course_download_plat.works 
                                (title, work_type, subject, description, composition, universities, price_points, yandex_disk_link, folder_path)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ''', (title, work_type, subject, description, composition, university, price, yandex_link, folder_name))
                        
                        total_imported += 1
        except Exception as e:
            errors.append(f'Error at offset {offset}: {str(e)}')
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'total_imported': total_imported,
            'errors': errors
        })
    }