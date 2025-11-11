import json
import os
import base64
from typing import Dict, Any
import boto3
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Загрузка превью изображений для работ (из админки)
    Args: event - dict с httpMethod, body (images array, work_id)
          context - объект с request_id
    Returns: HTTP response с URLs загруженных изображений
    '''
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        images = body.get('images', [])
        work_id = body.get('work_id')
        
        if not images or not work_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing images or work_id'}),
                'isBase64Encoded': False
            }
        
        # Инициализация S3 клиента
        s3_client = boto3.client(
            's3',
            endpoint_url='https://storage.yandexcloud.net',
            aws_access_key_id=os.environ.get('YANDEX_S3_KEY_ID'),
            aws_secret_access_key=os.environ.get('YANDEX_S3_SECRET_KEY'),
            region_name='ru-central1'
        )
        
        bucket_name = 'kyra'
        uploaded_urls = []
        
        # Загружаем каждое изображение
        for idx, img_data in enumerate(images):
            file_base64 = img_data.get('file')
            filename = img_data.get('filename', f'preview_{work_id}_{idx}.jpg')
            
            # Декодируем base64
            image_bytes = base64.b64decode(file_base64)
            
            # Определяем content type
            content_type = 'image/jpeg'
            if filename.endswith('.png'):
                content_type = 'image/png'
            
            # Загружаем в S3
            object_key = f'previews/{filename}'
            s3_client.put_object(
                Bucket=bucket_name,
                Key=object_key,
                Body=image_bytes,
                ContentType=content_type,
                ACL='public-read'
            )
            
            url = f'https://storage.yandexcloud.net/{bucket_name}/{object_key}'
            uploaded_urls.append(url)
        
        # Обновляем БД (первое изображение как основное превью)
        if uploaded_urls:
            database_url = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(database_url)
            cur = conn.cursor()
            
            escaped_url = uploaded_urls[0].replace("'", "''")
            update_query = f"UPDATE works SET preview_image_url = '{escaped_url}' WHERE id = {int(work_id)}"
            cur.execute(update_query)
            
            conn.commit()
            cur.close()
            conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'preview_url': uploaded_urls[0] if uploaded_urls else None,
                'all_urls': uploaded_urls,
                'work_id': work_id
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"Error uploading preview: {repr(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Failed to upload preview',
                'details': str(e)
            }),
            'isBase64Encoded': False
        }