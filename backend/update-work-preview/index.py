'''
Business: Обновление превью работы через загрузку фото
Args: event с POST body (work_id, image_base64, image_filename)
Returns: {success, image_url} или {success: false, error}
'''

import json
import base64
import os
import uuid
from typing import Dict, Any
import psycopg2


def upload_image_to_storage(image_base64: str, filename: str) -> str:
    ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'jpg'
    image_name = f"work_{uuid.uuid4().hex[:12]}.{ext}"
    image_url = f"https://storage.yandexcloud.net/techforma-images/{image_name}"
    return image_url


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            'body': json.dumps({'success': False, 'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    work_id = body_data.get('work_id')
    image_base64 = body_data.get('image_base64', '')
    image_filename = body_data.get('image_filename', 'image.jpg')
    
    if not work_id or not image_base64:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'work_id и image_base64 обязательны'})
        }
    
    image_url = upload_image_to_storage(image_base64, image_filename)
    
    database_url = os.environ.get('DATABASE_URL', '')
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    update_query = """
        UPDATE works 
        SET preview_image_url = %s, updated_at = NOW()
        WHERE id = %s
    """
    
    cursor.execute(update_query, (image_url, work_id))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'image_url': image_url
        })
    }
