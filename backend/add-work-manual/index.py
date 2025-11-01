'''
Business: Добавление работы в каталог через ручную загрузку фото
Args: event с POST body (title, description, work_type, subject, price_points, image_base64, image_filename)
Returns: {success, work_id, image_url} или {success: false, error}
'''

import json
import base64
import os
import uuid
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor


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
    
    title = body_data.get('title', '').strip()
    description = body_data.get('description', '').strip()
    work_type = body_data.get('work_type', '').strip()
    subject = body_data.get('subject', '').strip()
    price_points = body_data.get('price_points', 0)
    image_base64 = body_data.get('image_base64', '')
    image_filename = body_data.get('image_filename', 'image.jpg')
    
    if not title or not image_base64:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Название и фото обязательны'})
        }
    
    image_url = upload_image_to_storage(image_base64, image_filename)
    
    database_url = os.environ.get('DATABASE_URL', '')
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    insert_query = """
        INSERT INTO works (
            title, description, work_type, subject, price_points, 
            preview_image_url, status, author_id, category_id,
            created_at, updated_at, rating, downloads, views_count
        ) VALUES (
            %s, %s, %s, %s, %s,
            %s, 'active', 1, 1,
            NOW(), NOW(), 0, 0, 0
        ) RETURNING id
    """
    
    cursor.execute(insert_query, (
        title, description, work_type, subject, price_points, image_url
    ))
    
    work_id = cursor.fetchone()['id']
    
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
            'work_id': work_id,
            'image_url': image_url
        })
    }
