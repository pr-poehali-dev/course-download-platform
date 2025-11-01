'''
Business: Generate preview images from PDF/DOCX files on Yandex Disk
Args: event with httpMethod POST, body with offset/limit for batch processing
Returns: HTTP response with generation statistics
'''

import json
import os
import psycopg2
import requests
import base64
from typing import Dict, Any, Optional
from io import BytesIO
from PIL import Image
import fitz  # PyMuPDF

DATABASE_URL = os.environ.get('DATABASE_URL', '')
CLOUDFLARE_ACCOUNT_ID = os.environ.get('CLOUDFLARE_ACCOUNT_ID', '')
CLOUDFLARE_API_TOKEN = os.environ.get('CLOUDFLARE_API_TOKEN', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def get_files_from_yandex_folder(public_key: str, folder_name: str) -> list:
    """Получить список файлов из папки на Яндекс.Диске"""
    api_url = 'https://cloud-api.yandex.net/v1/disk/public/resources'
    
    # Получаем список файлов в конкретной папке через path
    folder_path = f'/{folder_name}'
    params = {
        'public_key': public_key,
        'path': folder_path,
        'limit': 100
    }
    
    response = requests.get(api_url, params=params, timeout=15)
    data = response.json()
    
    files = []
    if '_embedded' in data and 'items' in data['_embedded']:
        for file_item in data['_embedded']['items']:
            if file_item['type'] == 'file':
                # Получаем прямую ссылку на скачивание
                file_path = file_item['path']
                download_params = {
                    'public_key': public_key,
                    'path': file_path
                }
                
                try:
                    dl_url = f'{api_url}/download'
                    dl_response = requests.get(dl_url, params=download_params, timeout=10)
                    dl_data = dl_response.json()
                    download_url = dl_data.get('href', '')
                    
                    if download_url:
                        files.append({
                            'name': file_item['name'],
                            'path': file_item['path'],
                            'download_url': download_url
                        })
                except:
                    pass
    
    return files

def find_main_document(files: list) -> Optional[str]:
    """Найти основной документ (PDF или DOCX) в списке файлов"""
    # Приоритет: ПЗ, записка, диплом, курсовая
    priority_keywords = ['пз', 'записка', 'диплом', 'курсовая', 'реферат']
    
    pdf_files = [f for f in files if f['name'].lower().endswith('.pdf')]
    docx_files = [f for f in files if f['name'].lower().endswith(('.docx', '.doc'))]
    
    # Ищем по приоритетным ключевым словам
    for keyword in priority_keywords:
        for pdf in pdf_files:
            if keyword in pdf['name'].lower():
                return pdf['download_url']
    
    # Если не нашли, берем первый PDF
    if pdf_files:
        return pdf_files[0]['download_url']
    
    # Или первый DOCX
    if docx_files:
        return docx_files[0]['download_url']
    
    return None

def generate_preview_from_pdf(download_url: str) -> Optional[bytes]:
    """Сгенерировать PNG превью из первой страницы PDF"""
    response = requests.get(download_url, timeout=30)
    pdf_bytes = response.content
    
    # Открываем PDF с помощью PyMuPDF
    doc = fitz.open(stream=pdf_bytes, filetype='pdf')
    
    if len(doc) == 0:
        return None
    
    # Рендерим первую страницу в изображение
    page = doc[0]
    
    # Увеличиваем разрешение для лучшего качества (2x zoom)
    mat = fitz.Matrix(2, 2)
    pix = page.get_pixmap(matrix=mat)
    
    # Конвертируем в PIL Image
    img_data = pix.tobytes('png')
    img = Image.open(BytesIO(img_data))
    
    # Сжимаем до разумного размера (макс 800px по ширине)
    max_width = 800
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
    
    # Конвертируем в PNG bytes
    output = BytesIO()
    img.save(output, format='PNG', optimize=True)
    output.seek(0)
    
    doc.close()
    
    return output.read()

def upload_to_cloudflare(image_bytes: bytes, filename: str) -> str:
    """Загрузить изображение в Cloudflare R2 и вернуть публичный URL"""
    # Заглушка - в реальности нужно загрузить в S3/R2
    # Пока возвращаем data URL
    base64_data = base64.b64encode(image_bytes).decode('utf-8')
    return f'data:image/png;base64,{base64_data}'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Email',
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
    
    admin_email = event.get('headers', {}).get('x-admin-email') or event.get('headers', {}).get('X-Admin-Email')
    
    if admin_email != 'rekrutiw@yandex.ru':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    offset = body_data.get('offset', 0)
    limit = body_data.get('limit', 10)
    public_key = body_data.get('public_key', 'https://disk.yandex.ru/d/dQBBqvLRShUD6A')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Получаем работы без превью
        cur.execute(f"""
            SELECT id, title, yandex_disk_link
            FROM t_p63326274_course_download_plat.works
            WHERE preview_image_url IS NULL
            ORDER BY id
            LIMIT {limit} OFFSET {offset}
        """)
        
        works = cur.fetchall()
        total_works = len(works)
        
        results = {
            'processed': 0,
            'success': 0,
            'failed': 0,
            'errors': []
        }
        
        for work_id, title, yandex_link in works:
            results['processed'] += 1
            
            try:
                print(f"📄 Обрабатываю работу ID={work_id}: {title}")
                
                # Получаем файлы из папки
                files = get_files_from_yandex_folder(public_key, title)
                
                if not files:
                    raise Exception('Файлы не найдены в папке')
                
                # Находим основной документ
                doc_url = find_main_document(files)
                
                if not doc_url:
                    raise Exception('Не найден PDF/DOCX файл')
                
                # Генерируем превью
                preview_bytes = generate_preview_from_pdf(doc_url)
                
                if not preview_bytes:
                    raise Exception('Не удалось сгенерировать превью')
                
                # Загружаем в хранилище
                preview_url = upload_to_cloudflare(preview_bytes, f'preview_{work_id}.png')
                
                # Сохраняем URL в базу
                safe_url = preview_url.replace("'", "''")
                cur.execute(f"""
                    UPDATE t_p63326274_course_download_plat.works
                    SET preview_image_url = '{safe_url}'
                    WHERE id = {work_id}
                """)
                conn.commit()
                
                results['success'] += 1
                print(f"✅ Превью создано для работы ID={work_id}")
                
            except Exception as e:
                results['failed'] += 1
                results['errors'].append({
                    'work_id': work_id,
                    'title': title,
                    'error': str(e)
                })
                print(f"❌ Ошибка для работы ID={work_id}: {str(e)}")
                conn.rollback()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'total_works': total_works,
                'offset': offset,
                'limit': limit,
                **results
            })
        }
        
    finally:
        cur.close()
        conn.close()