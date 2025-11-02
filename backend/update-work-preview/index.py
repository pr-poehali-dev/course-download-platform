'''
Business: Обновление превью работы: через загрузку фото или извлечение из архива
Args: event с POST body (work_id, image_base64 ИЛИ extract_from_archive: true)
Returns: {success, image_url} или {success: false, error}
'''

import json
import base64
import os
import uuid
import tempfile
import zipfile
import rarfile
import urllib.request
from typing import Dict, Any, List
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


def extract_images_from_archive(archive_url: str, work_id: int, work_title: str) -> List[str]:
    """Извлечь PNG изображения из архива и загрузить в S3"""
    print(f"[DEBUG] Downloading archive from: {archive_url}")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.archive') as tmp_archive:
        req = urllib.request.Request(archive_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as response:
            tmp_archive.write(response.read())
        tmp_archive_path = tmp_archive.name
    
    png_files = []
    
    try:
        with zipfile.ZipFile(tmp_archive_path, 'r') as archive:
            for file_info in archive.namelist():
                if file_info.lower().endswith('.png'):
                    png_data = archive.read(file_info)
                    png_files.append({
                        'name': os.path.basename(file_info),
                        'data': png_data
                    })
                    print(f"[DEBUG] Found PNG in ZIP: {file_info}")
    except zipfile.BadZipFile:
        try:
            with rarfile.RarFile(tmp_archive_path, 'r') as archive:
                for file_info in archive.namelist():
                    if file_info.lower().endswith('.png'):
                        png_data = archive.read(file_info)
                        png_files.append({
                            'name': os.path.basename(file_info),
                            'data': png_data
                        })
                        print(f"[DEBUG] Found PNG in RAR: {file_info}")
        except Exception as e:
            print(f"[ERROR] Failed to open as RAR: {e}")
    
    os.unlink(tmp_archive_path)
    
    if not png_files:
        return []
    
    s3_client = boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=os.environ.get('YANDEX_S3_KEY_ID', ''),
        aws_secret_access_key=os.environ.get('YANDEX_S3_SECRET_KEY', ''),
        region_name='ru-central1',
        config=Config(signature_version='s3v4')
    )
    
    uploaded_urls = []
    
    for idx, png_file in enumerate(png_files[:10]):
        safe_title = ''.join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in work_title[:30])
        s3_key = f'previews/{work_id}_{idx+1}_{safe_title}.png'
        
        try:
            s3_client.put_object(
                Bucket='kyra',
                Key=s3_key,
                Body=png_file['data'],
                ContentType='image/png',
                ACL='public-read'
            )
            
            image_url = f'https://storage.yandexcloud.net/kyra/{s3_key}'
            uploaded_urls.append(image_url)
            print(f"[DEBUG] Uploaded: {image_url}")
            
        except Exception as e:
            print(f"[ERROR] S3 upload failed: {e}")
    
    return uploaded_urls


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
    extract_from_archive = body_data.get('extract_from_archive', False)
    image_base64 = body_data.get('image_base64', '')
    image_filename = body_data.get('image_filename', 'image.jpg')
    
    if not work_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'work_id обязателен'})
        }
    
    database_url = os.environ.get('DATABASE_URL', '')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    if extract_from_archive:
        cursor.execute(
            "SELECT download_url, file_url, title FROM t_p63326274_course_download_plat.works WHERE id = %s",
            (work_id,)
        )
        work_result = cursor.fetchone()
        
        if not work_result:
            cursor.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Work not found'})
            }
        
        archive_url = work_result[0] or work_result[1]
        work_title = work_result[2]
        
        if not archive_url:
            cursor.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Archive URL not found'})
            }
        
        try:
            uploaded_urls = extract_images_from_archive(archive_url, work_id, work_title)
            
            if not uploaded_urls:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': False,
                        'message': 'No PNG files found in archive'
                    })
                }
            
            cursor.execute(
                "UPDATE t_p63326274_course_download_plat.works SET preview_image_url = %s, updated_at = NOW() WHERE id = %s",
                (uploaded_urls[0], work_id)
            )
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'image_url': uploaded_urls[0],
                    'all_images': uploaded_urls,
                    'count': len(uploaded_urls)
                })
            }
            
        except Exception as e:
            cursor.close()
            conn.close()
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': f'Extraction failed: {str(e)}'})
            }
    
    if not image_base64:
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'image_base64 обязателен'})
        }
    
    file_url = upload_file_to_storage(image_base64, image_filename)
    
    update_query = """
        UPDATE t_p63326274_course_download_plat.works 
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