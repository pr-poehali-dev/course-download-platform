'''
Business: Полная синхронизация каталога с Яндекс.Диска — парсинг папок, создание превью, обновление БД
Args: event с POST body (yandex_disk_url)
Returns: {success, total_works, updated, created, errors}
'''

import json
import os
import urllib.request
import urllib.parse
from typing import Dict, Any, List
import psycopg2
import boto3
from botocore.config import Config
import uuid


def get_yandex_disk_folders(public_url: str) -> List[Dict[str, Any]]:
    """Получает список всех папок с Яндекс.Диска"""
    api_url = 'https://cloud-api.yandex.net/v1/disk/public/resources'
    params = urllib.parse.urlencode({
        'public_key': public_url,
        'limit': 1000
    })
    
    request_url = f"{api_url}?{params}"
    
    req = urllib.request.Request(request_url)
    response = urllib.request.urlopen(req)
    data = json.loads(response.read().decode('utf-8'))
    
    folders = []
    
    if '_embedded' in data and 'items' in data['_embedded']:
        for item in data['_embedded']['items']:
            if item['type'] == 'dir':
                folder_name = item['name']
                folder_path = item['path']
                
                # Парсим название папки: "Название (Тип работы)"
                match = folder_name.strip()
                parts = match.rsplit('(', 1)
                
                if len(parts) == 2:
                    title = parts[0].strip()
                    work_type = parts[1].replace(')', '').strip()
                else:
                    title = match
                    work_type = 'неизвестный тип'
                
                folders.append({
                    'name': folder_name,
                    'title': title,
                    'work_type': work_type,
                    'path': folder_path,
                    'download_url': item.get('file', '')
                })
    
    return folders


def get_folder_files(public_url: str, folder_path: str) -> List[Dict[str, Any]]:
    """Получает список файлов внутри папки"""
    api_url = 'https://cloud-api.yandex.net/v1/disk/public/resources'
    params = urllib.parse.urlencode({
        'public_key': public_url,
        'path': folder_path,
        'limit': 100
    })
    
    request_url = f"{api_url}?{params}"
    
    req = urllib.request.Request(request_url)
    response = urllib.request.urlopen(req)
    data = json.loads(response.read().decode('utf-8'))
    
    files = []
    
    if '_embedded' in data and 'items' in data['_embedded']:
        for item in data['_embedded']['items']:
            if item['type'] == 'file':
                files.append({
                    'name': item['name'],
                    'type': item['mime_type'],
                    'size': item['size'],
                    'download_url': item.get('file', '')
                })
    
    return files


def download_and_convert_pdf_preview(pdf_url: str) -> bytes:
    """Скачивает PDF и конвертирует первую страницу в PNG"""
    try:
        import fitz  # PyMuPDF
        from PIL import Image
        import io
        
        # Скачиваем PDF
        req = urllib.request.Request(pdf_url)
        response = urllib.request.urlopen(req, timeout=30)
        pdf_data = response.read()
        
        # Открываем PDF
        pdf_document = fitz.open(stream=pdf_data, filetype="pdf")
        
        # Конвертируем первую страницу
        first_page = pdf_document[0]
        pix = first_page.get_pixmap(matrix=fitz.Matrix(2, 2))
        
        # Конвертируем в PNG
        img_bytes = pix.tobytes("png")
        
        pdf_document.close()
        return img_bytes
    except Exception as e:
        print(f"Preview generation error: {e}")
        return None


def upload_to_s3(file_data: bytes, filename: str) -> str:
    """Загрузка превью в S3"""
    s3_client = boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=os.environ.get('YANDEX_S3_KEY_ID', ''),
        aws_secret_access_key=os.environ.get('YANDEX_S3_SECRET_KEY', ''),
        region_name='ru-central1',
        config=Config(signature_version='s3v4')
    )
    
    file_name = f"preview_{uuid.uuid4().hex[:12]}.png"
    
    s3_client.put_object(
        Bucket='kyra',
        Key=file_name,
        Body=file_data,
        ContentType='image/png',
        ACL='public-read'
    )
    
    return f"https://storage.yandexcloud.net/kyra/{file_name}"


def determine_subject(title: str) -> str:
    """Определяет предмет по названию работы"""
    t = title.lower()
    
    if 'электро' in t or 'энергет' in t or 'эу' in t or 'ру' in t:
        return 'электроэнергетика'
    elif 'автоматиз' in t or 'управлен' in t or 'асу' in t:
        return 'автоматизация'
    elif 'строител' in t or 'бетон' in t or 'конструк' in t:
        return 'строительство'
    elif 'механ' in t or 'привод' in t or 'станок' in t:
        return 'механика'
    elif 'газ' in t or 'нефт' in t:
        return 'газоснабжение'
    elif 'програм' in t or 'software' in t or 'алгоритм' in t:
        return 'программирование'
    elif 'безопасн' in t or 'охран' in t:
        return 'безопасность'
    elif 'тепло' in t or 'водоснабжен' in t or 'вентиляц' in t:
        return 'теплоснабжение'
    elif 'транспорт' in t or 'дорог' in t or 'автомобил' in t:
        return 'транспорт'
    else:
        return 'общая инженерия'


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
    
    body = event.get('body', '{}')
    if not body:
        body = '{}'
    
    body_data = json.loads(body)
    yandex_disk_url = body_data.get('yandex_disk_url', 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ')
    
    # Получаем список папок
    folders = get_yandex_disk_folders(yandex_disk_url)
    
    database_url = os.environ.get('DATABASE_URL', '')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    updated = 0
    created = 0
    errors = []
    
    for folder in folders:
        try:
            # Получаем файлы внутри папки
            files = get_folder_files(yandex_disk_url, folder['path'])
            
            # Ищем PDF файл для превью
            pdf_file = next((f for f in files if f['name'].lower().endswith('.pdf')), None)
            
            preview_url = None
            if pdf_file and pdf_file.get('download_url'):
                # Генерируем превью
                preview_data = download_and_convert_pdf_preview(pdf_file['download_url'])
                if preview_data:
                    preview_url = upload_to_s3(preview_data, f"{folder['title']}.png")
            
            # Определяем предмет
            subject = determine_subject(folder['title'])
            
            # Проверяем существование работы
            cursor.execute(
                "SELECT id FROM works WHERE title = %s",
                (folder['title'],)
            )
            existing = cursor.fetchone()
            
            if existing:
                # Обновляем существующую работу
                update_query = """
                    UPDATE works 
                    SET work_type = %s,
                        subject = %s,
                        preview_image_url = COALESCE(%s, preview_image_url),
                        updated_at = NOW()
                    WHERE title = %s
                """
                cursor.execute(update_query, (
                    folder['work_type'],
                    subject,
                    preview_url,
                    folder['title']
                ))
                updated += 1
            else:
                # Создаём новую работу
                insert_query = """
                    INSERT INTO works (
                        title, work_type, subject, description,
                        preview_image_url, yandex_disk_link,
                        price, rating, created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                """
                cursor.execute(insert_query, (
                    folder['title'],
                    folder['work_type'],
                    subject,
                    f"Работа по предмету {subject}",
                    preview_url,
                    yandex_disk_url,
                    100,  # Дефолтная цена
                    4.8   # Дефолтный рейтинг
                ))
                created += 1
            
            conn.commit()
            
        except Exception as e:
            errors.append({
                'folder': folder['name'],
                'error': str(e)
            })
    
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
            'total_works': len(folders),
            'updated': updated,
            'created': created,
            'errors': errors
        })
    }
