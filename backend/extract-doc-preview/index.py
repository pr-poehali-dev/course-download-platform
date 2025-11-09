'''
Business: Извлекает превью первых 2 страниц из пояснительной записки работы
Args: event с work_id в queryStringParameters
Returns: JSON с URL превью-изображений (содержание и введение)
'''

import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
import boto3
from botocore.config import Config
import io
import zipfile
import tempfile
import requests
from pdf2image import convert_from_bytes
from PIL import Image

DATABASE_URL = os.environ.get('DATABASE_URL')
YANDEX_S3_KEY_ID = os.environ.get('YANDEX_S3_KEY_ID')
YANDEX_S3_SECRET_KEY = os.environ.get('YANDEX_S3_SECRET_KEY')

def find_explanatory_note(zf: zipfile.ZipFile) -> Optional[str]:
    """
    Находит пояснительную записку в архиве
    Приоритет: PDF > DOCX > DOC
    Ищет файлы с ключевыми словами: пояснительная, записка, пз, работа
    """
    all_files = zf.namelist()
    
    # Фильтруем системные файлы
    files = [f for f in all_files if not f.startswith('__MACOSX') and not f.startswith('.')]
    
    # Ищем PDF файлы
    pdf_files = [f for f in files if f.lower().endswith('.pdf')]
    
    # Приоритет 1: файлы с "пояснительная" или "пз" в названии
    keywords = ['пояснительн', 'записк', ' пз ', '_пз_', 'работа', 'диплом', 'курсов']
    for keyword in keywords:
        for pdf in pdf_files:
            if keyword in pdf.lower():
                return pdf
    
    # Приоритет 2: самый большой PDF файл (обычно это основной документ)
    if pdf_files:
        largest_pdf = max(pdf_files, key=lambda f: zf.getinfo(f).file_size)
        return largest_pdf
    
    # Если PDF нет, ищем DOCX/DOC
    doc_files = [f for f in files if f.lower().endswith(('.docx', '.doc'))]
    for keyword in keywords:
        for doc in doc_files:
            if keyword in doc.lower():
                return doc
    
    if doc_files:
        largest_doc = max(doc_files, key=lambda f: zf.getinfo(f).file_size)
        return largest_doc
    
    return None

def extract_preview_pages(file_data: bytes, filename: str, max_pages: int = 2) -> List[bytes]:
    """
    Извлекает первые max_pages страниц из документа
    Возвращает список изображений в формате JPEG
    """
    images = []
    
    try:
        if filename.lower().endswith('.pdf'):
            # Конвертируем PDF в изображения (первые 2 страницы)
            pil_images = convert_from_bytes(
                file_data,
                first_page=1,
                last_page=max_pages,
                dpi=150,  # Хорошее качество для превью
                fmt='jpeg'
            )
            
            for img in pil_images:
                # Оптимизируем размер
                if img.width > 1200:
                    ratio = 1200 / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((1200, new_height), Image.Resampling.LANCZOS)
                
                # Конвертируем в JPEG
                output = io.BytesIO()
                img.convert('RGB').save(output, format='JPEG', quality=90, optimize=True)
                images.append(output.getvalue())
        
        # Для DOCX/DOC потребуется LibreOffice или другой конвертер
        # Пока оставим только PDF
        
    except Exception as e:
        print(f"Error extracting pages: {e}")
    
    return images

def upload_to_s3(s3_client, image_data: bytes, work_id: int, page_num: int) -> str:
    """Загружает превью страницы в S3"""
    key = f"doc-previews/{work_id}_page_{page_num}.jpg"
    
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
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        params = event.get('queryStringParameters', {}) or {}
        work_id = params.get('work_id')
        
        if not work_id:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'work_id required'})
            }
        
        # Подключаемся к БД
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Получаем информацию о работе
        cur.execute(
            'SELECT file_url, title FROM t_p63326274_course_download_plat.works WHERE id = %s',
            (work_id,)
        )
        result = cur.fetchone()
        
        if not result or not result[0]:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Work not found or no file_url'})
            }
        
        file_url, title = result
        print(f"Processing work {work_id}: {title}")
        print(f"Downloading from: {file_url}")
        
        # Скачиваем архив
        response = requests.get(file_url, timeout=60)
        if response.status_code != 200:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': f'Failed to download archive: {response.status_code}'})
            }
        
        zip_data = response.content
        print(f"Downloaded {len(zip_data)} bytes")
        
        # Открываем архив и ищем пояснительную записку
        with zipfile.ZipFile(io.BytesIO(zip_data)) as zf:
            explanatory_file = find_explanatory_note(zf)
            
            if not explanatory_file:
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Explanatory note not found in archive'})
                }
            
            print(f"Found explanatory note: {explanatory_file}")
            
            # Извлекаем файл
            file_data = zf.read(explanatory_file)
            print(f"Extracted {len(file_data)} bytes")
        
        # Извлекаем первые 2 страницы
        preview_images = extract_preview_pages(file_data, explanatory_file, max_pages=2)
        
        if not preview_images:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Failed to extract preview pages'})
            }
        
        print(f"Extracted {len(preview_images)} preview pages")
        
        # Загружаем в S3
        s3_client = boto3.client(
            's3',
            endpoint_url='https://storage.yandexcloud.net',
            aws_access_key_id=YANDEX_S3_KEY_ID,
            aws_secret_access_key=YANDEX_S3_SECRET_KEY,
            config=Config(signature_version='s3v4'),
            region_name='ru-central1'
        )
        
        preview_urls = []
        for i, img_data in enumerate(preview_images, 1):
            url = upload_to_s3(s3_client, img_data, int(work_id), i)
            preview_urls.append(url)
            print(f"Uploaded page {i}: {url}")
        
        # Сохраняем URL в базу
        preview_urls_json = json.dumps(preview_urls)
        cur.execute(
            'UPDATE t_p63326274_course_download_plat.works SET preview_urls = %s WHERE id = %s',
            (preview_urls_json, work_id)
        )
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'work_id': int(work_id),
                'preview_urls': preview_urls,
                'pages_extracted': len(preview_urls)
            })
        }
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
