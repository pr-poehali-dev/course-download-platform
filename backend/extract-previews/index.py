'''
Business: Извлечение PNG превью из ZIP/RAR архивов работ и конвертация RAR в ZIP
Args: event с POST body {batch_size, offset, mode: "extract"|"convert"}
Returns: {success, processed, errors, has_more}
'''

import json
import os
import tempfile
from typing import Dict, Any, List, Optional
import psycopg2
import boto3
from botocore.config import Config
import io
import zipfile
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


def extract_png_from_zip(zip_data: bytes) -> Optional[bytes]:
    """Извлекает первый PNG файл из ZIP архива"""
    try:
        zip_file = zipfile.ZipFile(io.BytesIO(zip_data))
        
        png_files = [f for f in zip_file.namelist() 
                    if f.lower().endswith('.png') 
                    and not f.startswith('__MACOSX')
                    and not os.path.basename(f).startswith('._')]
        
        if not png_files:
            return None
        
        first_png = sorted(png_files)[0]
        print(f"Found PNG in ZIP: {first_png}")
        
        png_data = zip_file.read(first_png)
        
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
        print(f"Error extracting PNG from ZIP: {e}")
        return None


def convert_rar_to_zip(s3_client, bucket_name: str, work_id: int, rar_key: str) -> tuple[bool, str, Optional[str]]:
    """
    Конвертирует RAR файл в ZIP и возвращает новый URL
    Returns: (success, message, new_url)
    """
    try:
        # Download RAR
        response = s3_client.get_object(Bucket=bucket_name, Key=rar_key)
        rar_data = response['Body'].read()
        
        # Create temp file for RAR
        with tempfile.NamedTemporaryFile(suffix='.rar', delete=False) as temp_rar:
            temp_rar.write(rar_data)
            temp_rar_path = temp_rar.name
        
        try:
            # Extract RAR and create ZIP
            zip_buffer = io.BytesIO()
            
            with rarfile.RarFile(temp_rar_path, 'r') as rf:
                with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
                    for file_info in rf.infolist():
                        if not file_info.isdir():
                            file_data = rf.read(file_info.filename)
                            zf.writestr(file_info.filename, file_data)
            
            # Generate new ZIP key
            zip_key = rar_key[:-4] + '.zip'
            
            # Upload ZIP to S3
            zip_buffer.seek(0)
            s3_client.put_object(
                Bucket=bucket_name,
                Key=zip_key,
                Body=zip_buffer.getvalue(),
                ContentType='application/zip',
                ACL='public-read'
            )
            
            new_url = f'https://storage.yandexcloud.net/{bucket_name}/{zip_key}'
            
            # Delete old RAR
            try:
                s3_client.delete_object(Bucket=bucket_name, Key=rar_key)
            except Exception as e:
                print(f"Warning: Could not delete RAR: {e}")
            
            return True, "Converted successfully", new_url
            
        finally:
            if os.path.exists(temp_rar_path):
                os.unlink(temp_rar_path)
                
    except Exception as e:
        return False, f"Conversion failed: {str(e)}", None


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
    skipped = 0
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        batch_size = body_data.get('batch_size', 5)  # Меньше для конвертации
        offset = body_data.get('offset', 0)
        mode = body_data.get('mode', 'extract')  # "extract" или "convert"
        
        s3_client = get_s3_client()
        bucket_name = 'kyra'
        
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cursor = conn.cursor()
        
        # MODE: CONVERT RAR TO ZIP
        if mode == 'convert':
            cursor.execute(f"""
                SELECT id, title, download_url 
                FROM works 
                WHERE download_url LIKE '%.rar'
                ORDER BY id
                LIMIT {batch_size} OFFSET {offset}
            """)
            
            works = cursor.fetchall()
            
            cursor.execute("""
                SELECT COUNT(*) 
                FROM works 
                WHERE download_url LIKE '%.rar'
            """)
            total_remaining = cursor.fetchone()[0]
            
            for work_id, title, download_url in works:
                try:
                    file_key = download_url.replace('https://storage.yandexcloud.net/kyra/', '')
                    print(f"Converting work {work_id}: {title[:50]}")
                    
                    success, message, new_url = convert_rar_to_zip(s3_client, bucket_name, work_id, file_key)
                    
                    if success and new_url:
                        # Update database
                        safe_url = new_url.replace("'", "''")
                        cursor.execute(
                            f"UPDATE works SET download_url = '{safe_url}', file_url = '{safe_url}' WHERE id = {work_id}"
                        )
                        conn.commit()
                        processed += 1
                        print(f"✓ Work {work_id} converted: {new_url}")
                    else:
                        errors.append(f"Work {work_id}: {message}")
                        
                except Exception as e:
                    error_msg = f"Work {work_id}: {str(e)[:100]}"
                    errors.append(error_msg)
                    print(f"✗ {error_msg}")
                    continue
            
            cursor.close()
            has_more = (offset + batch_size) < total_remaining
            next_offset = offset + batch_size if has_more else None
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'mode': 'convert',
                    'batch_size': batch_size,
                    'offset': offset,
                    'processed': processed,
                    'total_remaining': total_remaining,
                    'has_more': has_more,
                    'next_offset': next_offset,
                    'errors': errors[:5]
                }, ensure_ascii=False)
            }
        
        # MODE: EXTRACT PREVIEWS (original functionality)
        else:
            cursor.execute(f"""
                SELECT id, title, download_url 
                FROM works 
                WHERE download_url IS NOT NULL 
                AND preview_image_url IS NULL
                ORDER BY id
                LIMIT {batch_size} OFFSET {offset}
            """)
            
            works = cursor.fetchall()
            
            cursor.execute("""
                SELECT COUNT(*) 
                FROM works 
                WHERE download_url IS NOT NULL 
                AND preview_image_url IS NULL
            """)
            total_remaining = cursor.fetchone()[0]
            
            for work_id, title, download_url in works:
                try:
                    file_key = download_url.replace('https://storage.yandexcloud.net/kyra/', '')
                    
                    print(f"Processing work {work_id}: {title[:50]}")
                    
                    if file_key.lower().endswith('.rar'):
                        skipped += 1
                        errors.append(f"Work {work_id}: RAR format - use convert mode first")
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
                    
                    png_data = extract_png_from_zip(archive_data)
                    
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
                        
                        safe_url = preview_url.replace("'", "''")
                        cursor.execute(
                            f"UPDATE works SET preview_image_url = '{safe_url}' WHERE id = {work_id}"
                        )
                        conn.commit()
                        
                        processed += 1
                        print(f"✓ Work {work_id} preview created")
                    else:
                        errors.append(f"Work {work_id}: No PNG found or unsupported format")
                        
                except Exception as e:
                    error_msg = f"Work {work_id}: {str(e)[:100]}"
                    errors.append(error_msg)
                    print(f"✗ {error_msg}")
                    continue
            
            cursor.close()
            
            has_more = (offset + batch_size) < total_remaining
            next_offset = offset + batch_size if has_more else None
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'mode': 'extract',
                    'batch_size': batch_size,
                    'offset': offset,
                    'processed': processed,
                    'skipped_rar': skipped,
                    'total_remaining': total_remaining,
                    'has_more': has_more,
                    'next_offset': next_offset,
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
