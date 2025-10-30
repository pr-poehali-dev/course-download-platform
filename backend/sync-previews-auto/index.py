'''
Business: Automatically fetch and sync preview images from Yandex Disk for all works
Args: event - HTTP event, context - function context  
Returns: JSON response with sync status
'''

import json
import urllib.request
import urllib.parse
import re
import os
import psycopg2
from typing import Dict, Any, List, Optional

def fetch_yandex_disk_batch(offset: int) -> Dict[str, Any]:
    """Fetch batch of folders from Yandex Disk API"""
    public_key = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ'
    api_url = f'https://cloud-api.yandex.net/v1/disk/public/resources?public_key={urllib.parse.quote(public_key)}&limit=100&offset={offset}'
    
    req = urllib.request.Request(api_url)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def fetch_folder_contents(folder_path: str) -> Dict[str, Any]:
    """Fetch contents of a specific folder from Yandex Disk"""
    public_key = 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ'
    api_url = f'https://cloud-api.yandex.net/v1/disk/public/resources?public_key={urllib.parse.quote(public_key)}&path={urllib.parse.quote(folder_path)}'
    
    req = urllib.request.Request(api_url)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def find_preview_image(items: List[Dict[str, Any]]) -> Optional[str]:
    """Find first image file in folder items"""
    image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    
    for item in items:
        if item.get('type') == 'file':
            name = item.get('name', '').lower()
            if any(name.endswith(ext) for ext in image_extensions):
                return item.get('file')
    
    return None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
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
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    updated_count = 0
    skipped_count = 0
    errors = []
    
    # Fetch all works from database
    cur.execute('SELECT id, title FROM t_p63326274_course_download_plat.works WHERE preview_image_url IS NULL OR preview_image_url = \'\'')
    works_without_preview = cur.fetchall()
    
    total_works = len(works_without_preview)
    
    # Fetch all folders from Yandex Disk
    all_folders = []
    for offset in [0, 100, 200, 300, 400]:
        try:
            data = fetch_yandex_disk_batch(offset)
            if '_embedded' in data and 'items' in data['_embedded']:
                for item in data['_embedded']['items']:
                    if item.get('type') == 'dir':
                        all_folders.append({
                            'name': item.get('name', ''),
                            'path': item.get('path', '')
                        })
        except Exception as e:
            errors.append(f'Error fetching batch at offset {offset}: {str(e)}')
    
    # Match works with folders and find preview images
    for work_id, work_title in works_without_preview:
        matched = False
        
        for folder in all_folders:
            folder_name = folder['name']
            
            # Check if folder name contains work title
            if work_title.lower() in folder_name.lower() or folder_name.lower() in work_title.lower():
                try:
                    # Fetch folder contents
                    folder_data = fetch_folder_contents(folder['path'])
                    
                    if '_embedded' in folder_data and 'items' in folder_data['_embedded']:
                        items = folder_data['_embedded']['items']
                        
                        # Find preview image
                        preview_url = find_preview_image(items)
                        
                        if preview_url:
                            # Update database
                            cur.execute('''
                                UPDATE t_p63326274_course_download_plat.works
                                SET preview_image_url = %s
                                WHERE id = %s
                            ''', (preview_url, work_id))
                            
                            updated_count += 1
                            matched = True
                            break
                
                except Exception as e:
                    errors.append(f'Error processing work {work_id}: {str(e)}')
        
        if not matched:
            skipped_count += 1
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'total_works': total_works,
            'updated_count': updated_count,
            'skipped_count': skipped_count,
            'errors': errors
        })
    }
