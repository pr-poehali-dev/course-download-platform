"""
Business: Загрузка работы автором с сохранением множественных файлов в БД
Args: event с массивом файлов, названием, описанием, категорией, ценой
Returns: HTTP response с результатом загрузки
"""

import json
import os
import psycopg2
import base64
import boto3
import uuid
from typing import Dict, Any, List

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
        # Remove data URL prefix if present
        if ',' in file_data:
            file_data = file_data.split(',', 1)[1]
        
        # Clean base64 string
        clean_base64 = file_data.strip().replace('\n', '').replace('\r', '').replace(' ', '')
        
        # Add padding if needed
        missing_padding = len(clean_base64) % 4
        if missing_padding:
            clean_base64 += '=' * (4 - missing_padding)
        
        # Decode base64
        file_bytes = base64.b64decode(clean_base64)
        
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
        headers = event.get('headers', {})
        
        title = body_data.get('title')
        description = body_data.get('description', '')
        work_type = body_data.get('workType')
        subject = body_data.get('subject', 'Общая')
        price_points = body_data.get('price')
        files = body_data.get('files', [])  # Массив файлов
        user_id = headers.get('X-User-Id') or headers.get('x-user-id')
        
        if not all([title, work_type, price_points, user_id]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields: title, workType, price, userId'})
            }
        
        if not files or len(files) == 0:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'At least one file is required'})
            }
        
        if len(files) > 10:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Maximum 10 files allowed'})
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Экранируем строки для Simple Query Protocol
        safe_title = title.replace("'", "''")
        safe_work_type = work_type.replace("'", "''")
        safe_subject = subject.replace("'", "''")
        safe_description = description.replace("'", "''")
        
        # Создаём запись работы
        cur.execute(f"""
            INSERT INTO t_p63326274_course_download_plat.works 
            (title, work_type, subject, description, price_points, 
             created_at, updated_at, author_id, status, category, price, downloads, views_count)
            VALUES ('{safe_title}', '{safe_work_type}', '{safe_subject}', '{safe_description}', {int(price_points)}, 
                    NOW(), NOW(), {int(user_id)}, 'pending', '{safe_work_type}', {int(price_points)}, 0, 0)
            RETURNING id
        """)
        
        work_id = cur.fetchone()[0]
        
        # Загружаем все файлы в S3 и сохраняем в work_files
        uploaded_files = []
        for file_data in files:
            file_name = file_data.get('name', 'file')
            file_size = file_data.get('size', 0)
            file_base64 = file_data.get('data', '')
            
            try:
                file_url = upload_to_s3(file_base64, file_name)
                
                safe_file_url = file_url.replace("'", "''")
                safe_file_name = file_name.replace("'", "''")
                
                cur.execute(f"""
                    INSERT INTO t_p63326274_course_download_plat.work_files 
                    (work_id, file_url, file_name, file_size, created_at)
                    VALUES ({work_id}, '{safe_file_url}', '{safe_file_name}', {file_size}, NOW())
                """)
                
                uploaded_files.append({
                    'name': file_name,
                    'url': file_url,
                    'size': file_size
                })
            except Exception as e:
                print(f"Error uploading file {file_name}: {str(e)}")
                # Продолжаем загрузку остальных файлов
        
        # Обновляем file_url в works (первый файл для обратной совместимости)
        if uploaded_files:
            first_file_url = uploaded_files[0]['url'].replace("'", "''")
            cur.execute(f"""
                UPDATE t_p63326274_course_download_plat.works 
                SET file_url = '{first_file_url}'
                WHERE id = {work_id}
            """)
        
        # Начисляем бонус за загрузку (50 баллов)
        cur.execute(f"""
            UPDATE t_p63326274_course_download_plat.users 
            SET balance = balance + 50
            WHERE id = {int(user_id)}
            RETURNING balance
        """)
        
        new_balance_row = cur.fetchone()
        new_balance = new_balance_row[0] if new_balance_row else 0
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'workId': work_id,
                'uploadedFiles': len(uploaded_files),
                'files': uploaded_files,
                'bonusEarned': 50,
                'newBalance': new_balance,
                'message': f'Работа отправлена на модерацию! Загружено файлов: {len(uploaded_files)}'
            })
        }
        
    except Exception as e:
        print(f"Error in handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
