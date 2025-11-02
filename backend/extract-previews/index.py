'''
Business: Извлечение PNG превью из RAR архивов работ и загрузка в S3
Args: event с POST body (пустой, обрабатываются все работы без превью)
Returns: {success, processed, errors}
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
import boto3
from botocore.config import Config
import io
import rarfile
from PIL import Image


def get_s3_client():
    """Создает S3 клиента для работы с Yandex Object Storage"""
    return boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=os.environ.get('YANDEX_S3_KEY_ID', ''),
        aws_secret_access_key=os.environ.get('YANDEX_S3_SECRET_KEY', ''),
        region_name='ru-central1',
        config=Config(signature_version='s3v4')
    )


def extract_first_png_from_rar(rar_data: bytes) -> bytes:
    """Извлекает первый PNG файл из RAR архива"""
    try:
        rar_file = rarfile.RarFile(io.BytesIO(rar_data))
        
        png_files = [f for f in rar_file.namelist() if f.lower().endswith('.png')]
        
        if not png_files:
            return None
        
        first_png = png_files[0]
        png_data = rar_file.read(first_png)
        
        img = Image.open(io.BytesIO(png_data))
        
        max_width = 800
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        output = io.BytesIO()
        img.save(output, format='PNG', optimize=True)
        output.seek(0)
        
        return output.getvalue()
        
    except Exception as e:
        print(f"Error extracting PNG: {e}")
        return None


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
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
    
    conn = None
    processed = 0
    errors = []
    
    try:
        s3_client = get_s3_client()
        bucket_name = 'kyra'
        
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, title, download_url 
            FROM works 
            WHERE download_url IS NOT NULL 
            AND preview_image_url IS NULL
            ORDER BY id
        """)
        
        works = cursor.fetchall()
        
        for work_id, title, download_url in works:
            try:
                file_key = download_url.replace('https://storage.yandexcloud.net/kyra/', '')
                
                print(f"Processing work {work_id}: {title}")
                
                response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
                rar_data = response['Body'].read()
                
                png_data = extract_first_png_from_rar(rar_data)
                
                if png_data:
                    preview_key = f'previews/preview_{work_id}.png'
                    
                    s3_client.put_object(
                        Bucket=bucket_name,
                        Key=preview_key,
                        Body=png_data,
                        ContentType='image/png',
                        ACL='public-read'
                    )
                    
                    preview_url = f'https://storage.yandexcloud.net/{bucket_name}/{preview_key}'
                    
                    cursor.execute(
                        "UPDATE works SET preview_image_url = %s WHERE id = %s",
                        (preview_url, work_id)
                    )
                    conn.commit()
                    
                    processed += 1
                    print(f"✓ Work {work_id} preview created")
                else:
                    errors.append(f"Work {work_id}: No PNG found in RAR")
                    
            except Exception as e:
                error_msg = f"Work {work_id}: {str(e)}"
                errors.append(error_msg)
                print(f"✗ {error_msg}")
                continue
        
        cursor.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'total_works': len(works),
                'processed': processed,
                'errors': errors[:10]
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if conn:
            conn.close()
