'''
Business: Массовая загрузка работ в Cloud Storage с автоматическим созданием превью
Args: event с POST body (files: [{name, base64, workId}])
Returns: {success, uploaded: [{workId, zipUrl, previewUrl}], errors}
'''

import json
import base64
import os
import uuid
import zipfile
import io
from typing import Dict, Any, List
import psycopg2
import boto3
from botocore.config import Config
from PIL import Image
import fitz  # PyMuPDF для PDF


def upload_to_s3(file_data: bytes, filename: str, content_type: str) -> str:
    """Загрузка файла в S3"""
    s3_client = boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=os.environ.get('YANDEX_S3_KEY_ID', ''),
        aws_secret_access_key=os.environ.get('YANDEX_S3_SECRET_KEY', ''),
        region_name='ru-central1',
        config=Config(signature_version='s3v4')
    )
    
    file_name = f"{uuid.uuid4().hex[:12]}_{filename}"
    
    s3_client.put_object(
        Bucket='kyra',
        Key=file_name,
        Body=file_data,
        ContentType=content_type,
        ACL='public-read'
    )
    
    return f"https://storage.yandexcloud.net/kyra/{file_name}"


def extract_preview_from_zip(zip_data: bytes) -> bytes:
    """Извлекает первую страницу PDF из ZIP и конвертирует в PNG"""
    zip_file = zipfile.ZipFile(io.BytesIO(zip_data))
    
    # Ищем первый PDF файл в архиве
    pdf_files = [f for f in zip_file.namelist() if f.lower().endswith('.pdf')]
    
    if not pdf_files:
        # Если PDF нет, ищем изображения
        image_files = [f for f in zip_file.namelist() 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif'))]
        if image_files:
            img_data = zip_file.read(image_files[0])
            return img_data
        return None
    
    # Читаем первый PDF
    pdf_data = zip_file.read(pdf_files[0])
    pdf_document = fitz.open(stream=pdf_data, filetype="pdf")
    
    # Конвертируем первую страницу в изображение
    first_page = pdf_document[0]
    pix = first_page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x качество
    
    # Конвертируем в PNG
    img_bytes = pix.tobytes("png")
    
    pdf_document.close()
    return img_bytes


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
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
            'body': json.dumps({'success': False, 'error': 'Method not allowed'})
        }
    
    body = event.get('body', '{}')
    if not body or body == '':
        body = '{}'
    
    body_data = json.loads(body)
    files = body_data.get('files', [])
    
    if not files:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'files обязателен'})
        }
    
    database_url = os.environ.get('DATABASE_URL', '')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    uploaded = []
    errors = []
    
    for file_info in files:
        work_id = file_info.get('workId')
        file_base64 = file_info.get('base64', '')
        file_name = file_info.get('name', 'archive.zip')
        
        if not work_id or not file_base64:
            errors.append({'workId': work_id, 'error': 'Отсутствует workId или base64'})
            continue
        
        file_data = base64.b64decode(file_base64)
        
        # Загружаем ZIP в S3
        zip_url = upload_to_s3(file_data, file_name, 'application/zip')
        
        # Создаём превью
        preview_url = None
        try:
            preview_data = extract_preview_from_zip(file_data)
            if preview_data:
                preview_url = upload_to_s3(preview_data, f'preview_{work_id}.png', 'image/png')
        except Exception as e:
            errors.append({'workId': work_id, 'error': f'Ошибка создания превью: {str(e)}'})
        
        # Обновляем БД
        update_query = """
            UPDATE works 
            SET yandex_disk_link = %s,
                preview_image_url = COALESCE(%s, preview_image_url),
                updated_at = NOW()
            WHERE id = %s
        """
        
        cursor.execute(update_query, (zip_url, preview_url, work_id))
        
        uploaded.append({
            'workId': work_id,
            'zipUrl': zip_url,
            'previewUrl': preview_url
        })
    
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
            'uploaded': uploaded,
            'errors': errors,
            'total': len(files),
            'successful': len(uploaded)
        })
    }