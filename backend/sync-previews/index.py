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
        limit = body_data.get('limit', 100)
        
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(database_url)
        conn.autocommit = False
        cursor = conn.cursor()
        
        cursor.execute(f'''
            SELECT id, title, yandex_disk_link 
            FROM t_p63326274_course_download_plat.works 
            WHERE preview_image_url IS NULL AND yandex_disk_link IS NOT NULL
            LIMIT {limit}
        ''')
        
        works = cursor.fetchall()
        
        results = {
            'total_processed': 0,
            'success': 0,
            'failed': 0,
            'errors': []
        }
        
        for work in works:
            work_id, title, yandex_link = work
            results['total_processed'] += 1
            
            try:
                preview_url = find_preview_in_folder(yandex_link, title)
                
                if preview_url:
                    escaped_url = preview_url.replace("'", "''")
                    cursor.execute(
                        f"UPDATE t_p63326274_course_download_plat.works SET preview_image_url = '{escaped_url}' WHERE id = {work_id}"
                    )
                    conn.commit()
                    results['success'] += 1
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
        url = f'{API_BASE}?public_key={urllib.parse.quote(public_link)}&limit=100'
        
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
        
        if data.get('_embedded') and data['_embedded'].get('items'):
            for item in data['_embedded']['items']:
                if item.get('type') == 'file':
                    name = item.get('name', '').lower()
                    if name.startswith('preview') and (name.endswith('.png') or name.endswith('.jpg') or name.endswith('.jpeg')):
                        file_url = item.get('file')
                        if file_url:
                            return file_url
        
        return None
        
    except Exception as e:
        raise Exception(f'Failed to load folder: {str(e)}')