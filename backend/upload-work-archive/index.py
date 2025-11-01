'''
Business: Загрузка ZIP-архива для работы админом
Args: event с POST body (work_id, archive_base64, archive_filename)
Returns: {success, archive_url, file_size_mb} или {success: false, error}
'''

import json
import base64
import os
import uuid
from typing import Dict, Any
import psycopg2
import boto3
from botocore.config import Config


def upload_archive_to_storage(archive_base64: str, filename: str) -> tuple[str, float]:
    """Загрузка ZIP-архива в S3 хранилище"""
    file_name = f"archive_{uuid.uuid4().hex[:12]}.zip"
    
    # Декодируем base64
    file_data = base64.b64decode(archive_base64)
    file_size_mb = len(file_data) / (1024 * 1024)
    
    # Настройка S3 клиента для Yandex Cloud
    s3_client = boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=os.environ.get('YANDEX_S3_KEY_ID', ''),
        aws_secret_access_key=os.environ.get('YANDEX_S3_SECRET_KEY', ''),
        region_name='ru-central1',
        config=Config(signature_version='s3v4')
    )
    
    # Загружаем архив в S3
    s3_client.put_object(
        Bucket='kyra',
        Key=file_name,
        Body=file_data,
        ContentType='application/zip',
        ACL='public-read'
    )
    
    file_url = f"https://storage.yandexcloud.net/kyra/{file_name}"
    return file_url, file_size_mb


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
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
    archive_base64 = body_data.get('archive_base64', '')
    archive_filename = body_data.get('archive_filename', 'archive.zip')
    
    if not work_id or not archive_base64:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'work_id и archive_base64 обязательны'})
        }
    
    # Загружаем архив в хранилище
    file_url, file_size_mb = upload_archive_to_storage(archive_base64, archive_filename)
    
    database_url = os.environ.get('DATABASE_URL', '')
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    # Обновляем запись работы
    update_query = """
        UPDATE works 
        SET file_url = %s, file_size_mb = %s, updated_at = NOW()
        WHERE id = %s
    """
    
    cursor.execute(update_query, (file_url, file_size_mb, work_id))
    
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
            'archive_url': file_url,
            'file_size_mb': round(file_size_mb, 2)
        })
    }
