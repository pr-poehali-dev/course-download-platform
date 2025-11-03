'''
Business: Извлекает ВСЕ PNG/JPG изображения из архивов работ и сохраняет как галерею превью
Args: event с queryStringParameters.batch_size и offset
Returns: JSON с результатами обработки
'''

import json
import os
from typing import Dict, Any, List, Tuple, Optional
import psycopg2
import boto3
from botocore.config import Config
import io
import zipfile
from PIL import Image

DATABASE_URL = os.environ.get('DATABASE_URL')
YANDEX_S3_KEY_ID = os.environ.get('YANDEX_S3_KEY_ID')
YANDEX_S3_SECRET_KEY = os.environ.get('YANDEX_S3_SECRET_KEY')

def optimize_image(img: Image.Image, max_width: int = 800) -> bytes:
    """Оптимизирует изображение для превью"""
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
    
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=85, optimize=True)
    return output.getvalue()

def extract_all_images_from_zip(zip_data: bytes) -> List[Tuple[str, bytes]]:
    """Извлекает ВСЕ изображения из ZIP"""
    images = []
    
    try:
        with zipfile.ZipFile(io.BytesIO(zip_data)) as zf:
            image_files = [f for f in zf.namelist() 
                          if f.lower().endswith(('.png', '.jpg', '.jpeg')) 
                          and not f.startswith('__MACOSX')]
            
            for filename in sorted(image_files):
                try:
                    img_data = zf.read(filename)
                    img = Image.open(io.BytesIO(img_data))
                    optimized = optimize_image(img)
                    images.append((filename, optimized))
                    print(f"  ✓ Extracted: {filename}")
                except Exception as e:
                    print(f"  ✗ Failed to process {filename}: {e}")
                    continue
    except Exception as e:
        print(f"Error reading ZIP: {e}")
    
    return images

def upload_to_s3(s3_client, image_data: bytes, work_id: int, index: int) -> str:
    """Загружает превью в S3"""
    key = f"previews/{work_id}_{index}.jpg"
    
    s3_client.put_object(
        Bucket='kyra',
        Key=key,
        Body=image_data,
        ContentType='image/jpeg'
    )
    
    return f"https://storage.yandexcloud.net/kyra/{key}"

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
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters') or {}
    batch_size = int(params.get('batch_size', 10))
    offset = int(params.get('offset', 0))
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT id, title, download_url 
        FROM works 
        WHERE download_url IS NOT NULL 
        AND download_url != ''
        ORDER BY id
        LIMIT %s OFFSET %s
    """, (batch_size, offset))
    
    works = cur.fetchall()
    
    if not works:
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
                'processed': 0,
                'has_more': False,
                'message': 'All works processed'
            })
        }
    
    s3_client = boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=YANDEX_S3_KEY_ID,
        aws_secret_access_key=YANDEX_S3_SECRET_KEY,
        config=Config(signature_version='s3v4'),
        region_name='ru-central1'
    )
    
    processed = 0
    errors = []
    
    for work_id, title, download_url in works:
        try:
            print(f"Processing work #{work_id}: {title}")
            
            from urllib.parse import urlparse
            parsed = urlparse(download_url)
            path_parts = parsed.path.lstrip('/').split('/', 1)
            
            if len(path_parts) != 2:
                errors.append(f"Work {work_id}: Invalid URL format")
                continue
            
            bucket_name = path_parts[0]
            object_key = path_parts[1]
            
            response = s3_client.get_object(Bucket=bucket_name, Key=object_key)
            zip_data = response['Body'].read()
            
            images = extract_all_images_from_zip(zip_data)
            
            if not images:
                print(f"  No images found")
                continue
            
            preview_urls = []
            for idx, (filename, img_data) in enumerate(images):
                url = upload_to_s3(s3_client, img_data, work_id, idx)
                preview_urls.append(url)
            
            preview_urls_json = json.dumps(preview_urls)
            
            cur.execute("""
                UPDATE works 
                SET preview_url = %s, 
                    preview_urls = %s
                WHERE id = %s
            """, (preview_urls[0], preview_urls_json, work_id))
            
            conn.commit()
            processed += 1
            print(f"  ✓ Saved {len(preview_urls)} previews")
            
        except Exception as e:
            errors.append(f"Work {work_id}: {str(e)}")
            print(f"  ✗ Error: {e}")
    
    cur.execute("SELECT COUNT(*) FROM works WHERE download_url IS NOT NULL AND download_url != ''")
    total_count = cur.fetchone()[0]
    
    cur.close()
    conn.close()
    
    has_more = (offset + batch_size) < total_count
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'processed': processed,
            'batch_size': batch_size,
            'offset': offset,
            'total_remaining': total_count - offset - batch_size if has_more else 0,
            'has_more': has_more,
            'errors': errors
        })
    }
