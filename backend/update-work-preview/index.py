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
import boto3
from botocore.config import Config


def upload_file_to_storage(file_base64: str, filename: str) -> str:
    """Загрузка любого файла (изображения, PDF, документы и т.д.)"""
    ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'bin'
    file_name = f"work_{uuid.uuid4().hex[:12]}.{ext}"
    
    # Декодируем base64
    file_data = base64.b64decode(file_base64)
    
    # Настройка S3 клиента для Yandex Cloud
    s3_client = boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=os.environ.get('YANDEX_S3_KEY_ID', ''),
        aws_secret_access_key=os.environ.get('YANDEX_S3_SECRET_KEY', ''),
        region_name='ru-central1',
        config=Config(signature_version='s3v4')
    )
    
    # Определяем Content-Type
    content_type = 'application/octet-stream'
    ext_lower = ext.lower()
    if ext_lower in ['jpg', 'jpeg']:
        content_type = 'image/jpeg'
    elif ext_lower == 'png':
        content_type = 'image/png'
    elif ext_lower == 'gif':
        content_type = 'image/gif'
    elif ext_lower == 'webp':
        content_type = 'image/webp'
    elif ext_lower == 'pdf':
        content_type = 'application/pdf'
    
    # Загружаем файл в S3
    s3_client.put_object(
        Bucket='kyra',
        Key=file_name,
        Body=file_data,
        ContentType=content_type,
        ACL='public-read'
    )
    
    file_url = f"https://storage.yandexcloud.net/kyra/{file_name}"
    return file_url


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
    
    file_url = upload_file_to_storage(image_base64, image_filename)
    
    database_url = os.environ.get('DATABASE_URL', '')
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    update_query = """
        UPDATE works 
        SET preview_image_url = %s, updated_at = NOW()
        WHERE id = %s
    """
    
    cursor.execute(update_query, (file_url, work_id))
    
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
            'image_url': file_url
        })
    }