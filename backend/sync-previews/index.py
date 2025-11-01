import json
import os
import psycopg2
import urllib.parse
import urllib.request
from typing import Dict, Any, Optional

YANDEX_DISK_URL = 'https://disk.yandex.ru/d/9sBuGSvwb5KwNw'
API_BASE = 'https://cloud-api.yandex.net/v1/disk/public/resources'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Sync preview images from Yandex Disk folders to database
    Args: event with httpMethod, optional limit parameter
          context with request_id
    Returns: HTTP response with sync statistics
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        limit = body_data.get('limit', 5)
        
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(database_url)
        conn.autocommit = False
        cursor = conn.cursor()
        
        cursor.execute(f'''
            SELECT id, title, yandex_disk_link 
            FROM t_p63326274_course_download_plat.works 
            WHERE yandex_disk_link IS NOT NULL 
            AND (preview_image_url IS NULL OR preview_image_url LIKE 'data:image%%')
            ORDER BY id
            LIMIT {limit}
        ''')
        
        works = cursor.fetchall()
        
        results = {
            'total_processed': 0,
            'success': 0,
            'failed': 0,
            'errors': [],
            'success_items': []
        }
        
        for work in works:
            work_id, title, yandex_link = work
            results['total_processed'] += 1
            
            try:
                print(f"[DEBUG] Processing work_id={work_id}, title='{title}', link={yandex_link}")
                preview_url = find_preview_in_folder(yandex_link, title)
                
                if preview_url:
                    print(f"[SUCCESS] Found preview for work_id={work_id}: {preview_url}")
                    escaped_url = preview_url.replace("'", "''")
                    cursor.execute(
                        f"UPDATE t_p63326274_course_download_plat.works SET preview_image_url = '{escaped_url}' WHERE id = {work_id}"
                    )
                    conn.commit()
                    results['success'] += 1
                    results['success_items'].append({
                        'work_id': work_id,
                        'title': title
                    })
                else:
                    results['failed'] += 1
                    results['errors'].append({
                        'work_id': work_id,
                        'title': title,
                        'error': 'Preview file not found in folder'
                    })
                
            except Exception as e:
                results['failed'] += 1
                results['errors'].append({
                    'work_id': work_id,
                    'title': title,
                    'error': str(e)
                })
                conn.rollback()
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps(results)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }


def find_preview_in_folder(public_link: str, work_title: str) -> Optional[str]:
    try:
        root_url = f'{API_BASE}?public_key={urllib.parse.quote(public_link)}&limit=500'
        req = urllib.request.Request(root_url)
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
        
        if not data.get('_embedded') or not data['_embedded'].get('items'):
            return None
        
        folder_name = None
        clean_title = work_title.strip().replace('«', '').replace('»', '').replace('"', '').replace('"', '')
        
        print(f"[DEBUG] Searching for folder matching '{clean_title}' in {len(data['_embedded']['items'])} items")
        
        for item in data['_embedded']['items']:
            if item.get('type') == 'dir':
                dir_name = item.get('name', '')
                clean_dir = dir_name.strip().replace('«', '').replace('»', '').replace('"', '').replace('"', '')
                
                if clean_title.lower() in clean_dir.lower() or clean_dir.lower() in clean_title.lower():
                    folder_name = dir_name
                    print(f"[DEBUG] Found matching folder: '{folder_name}'")
                    break
        
        if not folder_name:
            print(f"[ERROR] No folder found for title: '{clean_title}'")
            return None
        
        folder_path = f'/{folder_name}'
        folder_url = f'{API_BASE}?public_key={urllib.parse.quote(public_link)}&path={urllib.parse.quote(folder_path)}&limit=50'
        
        req = urllib.request.Request(folder_url)
        with urllib.request.urlopen(req, timeout=5) as response:
            folder_data = json.loads(response.read().decode())
        
        if not folder_data.get('_embedded') or not folder_data['_embedded'].get('items'):
            print(f"[ERROR] No items in folder '{folder_name}'")
            return None
        
        items = folder_data['_embedded']['items']
        print(f"[DEBUG] Found {len(items)} items in folder '{folder_name}'")
        
        # Берём первый файл с превью
        for item in items:
            if item.get('type') == 'file' and item.get('preview'):
                preview_url = item['preview']
                print(f"[SUCCESS] Using preview from file: {item.get('name')}")
                return preview_url
        
        # Если превью нет, ищем изображения
        for item in items:
            if item.get('type') == 'file':
                name = item.get('name', '').lower()
                if name.endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                    # Запрашиваем полную информацию о файле
                    file_path = f'/{folder_name}/{item["name"]}'
                    file_url = f'{API_BASE}?public_key={urllib.parse.quote(public_link)}&path={urllib.parse.quote(file_path)}'
                    
                    try:
                        req = urllib.request.Request(file_url)
                        with urllib.request.urlopen(req, timeout=3) as response:
                            file_data = json.loads(response.read().decode())
                        
                        if file_data.get('preview'):
                            print(f"[SUCCESS] Using image file: {item['name']}")
                            return file_data['preview']
                    except Exception as e:
                        print(f"[WARN] Failed to get file info for {item['name']}: {e}")
                        continue
        
        print(f"[ERROR] No preview or image files found in folder '{folder_name}'")
        return None
        
    except Exception as e:
        raise Exception(f'Failed to load preview: {str(e)}')