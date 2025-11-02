'''
Business: Извлечение превью из ZIP архивов (PNG/PDF/DOCX) и загрузка в S3
Args: event с POST body {batch_size: 15, offset: 0} для пакетной обработки
Returns: {success, processed, errors, has_more}
'''

import json
import os
from typing import Dict, Any, Optional, Tuple
import psycopg2
import boto3
from botocore.config import Config
import io
import zipfile
from PIL import Image
from pdf2image import convert_from_bytes


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


def optimize_image(img: Image.Image, max_width: int = 800) -> bytes:
    """Оптимизирует изображение и возвращает PNG байты"""
    if img.mode == 'RGBA':
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
    
    output = io.BytesIO()
    img.save(output, format='PNG', optimize=True)
    output.seek(0)
    return output.getvalue()


def pdf_to_preview(pdf_data: bytes) -> Optional[bytes]:
    """Конвертирует первую страницу PDF в PNG"""
    try:
        images = convert_from_bytes(pdf_data, first_page=1, last_page=1, dpi=150)
        if images:
            print(f"✓ Converted PDF first page to image")
            return optimize_image(images[0])
    except Exception as e:
        print(f"Error converting PDF: {e}")
    return None


def extract_preview_from_zip(zip_data: bytes) -> Tuple[Optional[bytes], str]:
    """Извлекает превью из ZIP: PNG, PDF или DOCX"""
    try:
        zip_file = zipfile.ZipFile(io.BytesIO(zip_data))
        files = [f for f in zip_file.namelist() 
                if not f.startswith('__MACOSX')
                and not os.path.basename(f).startswith('._')]
        
        png_files = [f for f in files if f.lower().endswith('.png')]
        if png_files:
            first_png = sorted(png_files)[0]
            print(f"Found PNG in ZIP: {first_png}")
            png_data = zip_file.read(first_png)
            img = Image.open(io.BytesIO(png_data))
            return optimize_image(img), 'png'
        
        pdf_files = [f for f in files if f.lower().endswith('.pdf')]
        if pdf_files:
            first_pdf = sorted(pdf_files)[0]
            print(f"Found PDF in ZIP: {first_pdf}")
            pdf_data = zip_file.read(first_pdf)
            preview = pdf_to_preview(pdf_data)
            if preview:
                return preview, 'pdf'
        
        return None, 'none'
        
    except Exception as e:
        print(f"Error extracting from ZIP: {e}")
        return None, 'error'


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
    skipped_rar = 0
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        batch_size = body_data.get('batch_size', 15)
        offset = body_data.get('offset', 0)
        
        s3_client = get_s3_client()
        bucket_name = 'kyra'
        
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cursor = conn.cursor()
        
        cursor.execute(f"""
            SELECT id, title, file_url 
            FROM works 
            WHERE file_url IS NOT NULL 
            AND file_url != ''
            AND preview_image_url IS NULL
            ORDER BY id
            LIMIT {batch_size} OFFSET {offset}
        """)
        
        works = cursor.fetchall()
        
        for work_id, title, download_url in works:
            try:
                file_key = download_url.replace('https://storage.yandexcloud.net/kyra/', '')
                
                print(f"Processing work {work_id}: {title[:50]}")
                
                if file_key.lower().endswith('.rar'):
                    skipped_rar += 1
                    errors.append(f"Work {work_id}: RAR format not supported (convert to ZIP first)")
                    continue
                
                if file_key.lower().endswith('.png'):
                    print(f"Work {work_id}: Already a PNG file, using as preview")
                    preview_key = f'previews/preview_{work_id}.png'
                    
                    response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
                    png_data = response['Body'].read()
                    
                    img = Image.open(io.BytesIO(png_data))
                    
                    max_width = 800
                    if img.width > max_width:
                        ratio = max_width / img.width
                        new_height = int(img.height * ratio)
                        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                        
                        output = io.BytesIO()
                        img.save(output, format='PNG', optimize=True)
                        output.seek(0)
                        png_data = output.getvalue()
                    
                    s3_client.put_object(
                        Bucket=bucket_name,
                        Key=preview_key,
                        Body=png_data,
                        ContentType='image/png',
                        ACL='public-read'
                    )
                    
                    preview_url = f'https://storage.yandexcloud.net/{bucket_name}/{preview_key}'
                    safe_url = preview_url.replace("'", "''")
                    cursor.execute(
                        f"UPDATE works SET preview_image_url = '{safe_url}' WHERE id = {work_id}"
                    )
                    conn.commit()
                    processed += 1
                    continue
                
                response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
                archive_data = response['Body'].read()
                
                preview_data, source_type = extract_preview_from_zip(archive_data)
                
                if preview_data:
                    preview_key = f'previews/preview_{work_id}.png'
                    
                    s3_client.put_object(
                        Bucket=bucket_name,
                        Key=preview_key,
                        Body=preview_data,
                        ContentType='image/png',
                        ACL='public-read'
                    )
                    
                    preview_url = f'https://storage.yandexcloud.net/{bucket_name}/{preview_key}'
                    
                    safe_url = preview_url.replace("'", "''")
                    cursor.execute(
                        f"UPDATE works SET preview_image_url = '{safe_url}' WHERE id = {work_id}"
                    )
                    conn.commit()
                    
                    processed += 1
                    print(f"✓ Work {work_id} preview created from {source_type}")
                else:
                    errors.append(f"Work {work_id}: No preview source found (PNG/PDF/DOCX)")
                    
            except Exception as e:
                error_msg = f"Work {work_id}: {str(e)[:100]}"
                errors.append(error_msg)
                print(f"✗ {error_msg}")
                continue
        
        cursor.execute("""
            SELECT COUNT(*) 
            FROM works 
            WHERE file_url IS NOT NULL 
            AND file_url != ''
            AND preview_image_url IS NULL
        """)
        total_remaining = cursor.fetchone()[0]
        
        cursor.close()
        
        has_more = total_remaining > 0
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'batch_size': batch_size,
                'offset': offset,
                'processed': processed,
                'skipped_rar': skipped_rar,
                'total_remaining': total_remaining,
                'has_more': has_more,
                'errors': errors[:5]
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)}, ensure_ascii=False)
        }
    finally:
        if conn:
            conn.close()