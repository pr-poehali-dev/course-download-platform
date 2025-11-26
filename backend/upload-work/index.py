"""
Business: Загрузка работы автором с сохранением в БД
Args: event с файлом, названием, описанием, категорией, ценой
Returns: HTTP response с результатом загрузки
"""

import json
import os
import psycopg2
import base64
import boto3
import uuid
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL', '')
YANDEX_S3_KEY_ID = os.environ.get('YANDEX_S3_KEY_ID', '')
YANDEX_S3_SECRET_KEY = os.environ.get('YANDEX_S3_SECRET_KEY', '')
S3_BUCKET = 'kyra'
S3_ENDPOINT = 'https://storage.yandexcloud.net'

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def upload_to_s3(file_data: str, file_name: str) -> str:
    """Upload file to Yandex S3 and return public URL"""
    try:
        # Decode base64
        file_bytes = base64.b64decode(file_data)
        
        # Create S3 client
        s3_client = boto3.client(
            's3',
            endpoint_url=S3_ENDPOINT,
            aws_access_key_id=YANDEX_S3_KEY_ID,
            aws_secret_access_key=YANDEX_S3_SECRET_KEY,
            region_name='ru-central1'
        )
        
        # Generate unique filename
        unique_name = f"works/{uuid.uuid4()}_{file_name}"
        
        # Upload to S3
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=unique_name,
            Body=file_bytes,
            ContentType='application/octet-stream'
        )
        
        # Return public URL
        return f"{S3_ENDPOINT}/{S3_BUCKET}/{unique_name}"
    except Exception as e:
        print(f"Error uploading to S3: {str(e)}")
        raise Exception(f"Failed to upload file: {str(e)}")

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
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
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        title = body_data.get('title')
        description = body_data.get('description')
        work_type = body_data.get('category')
        price_points = body_data.get('price')
        file_data = body_data.get('file')
        file_name = body_data.get('fileName')
        author_id = body_data.get('authorId')
        
        if not all([title, description, work_type, price_points, author_id]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        # Upload file to S3 if provided
        file_url = None
        if file_data and file_name:
            try:
                file_url = upload_to_s3(file_data, file_name)
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'File upload failed: {str(e)}'})
                }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Экранируем строки для Simple Query Protocol
        safe_title = title.replace("'", "''")
        safe_work_type = work_type.replace("'", "''")
        safe_description = description.replace("'", "''")
        safe_file_url = file_url.replace("'", "''") if file_url else ''
        
        # Вставляем работу в БД используя Simple Query Protocol
        if file_url:
            cur.execute(f"""
                INSERT INTO t_p63326274_course_download_plat.works 
                (title, work_type, subject, description, price_points, 
                 created_at, updated_at, author_id, status, category, price, downloads, views_count, file_url)
                VALUES ('{safe_title}', '{safe_work_type}', 'Общая', '{safe_description}', {int(price_points)}, 
                        NOW(), NOW(), {int(author_id)}, 'pending', '{safe_work_type}', {int(price_points)}, 0, 0, '{safe_file_url}')
                RETURNING id
            """)
        else:
            cur.execute(f"""
                INSERT INTO t_p63326274_course_download_plat.works 
                (title, work_type, subject, description, price_points, 
                 created_at, updated_at, author_id, status, category, price, downloads, views_count)
                VALUES ('{safe_title}', '{safe_work_type}', 'Общая', '{safe_description}', {int(price_points)}, 
                        NOW(), NOW(), {int(author_id)}, 'pending', '{safe_work_type}', {int(price_points)}, 0, 0)
                RETURNING id
            """)
        
        work_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'workId': work_id,
                'message': 'Work uploaded successfully'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }