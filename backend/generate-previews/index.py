'''
Business: Generate preview images from PNG or PDF files on Yandex Disk
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
    
    # Сначала получаем корневую папку
    root_params = {
        'public_key': public_key,
        'limit': 200
    }
    
    print(f"🔍 Запрос корневой папки Яндекс.Диска")
    
    root_response = requests.get(api_url, params=root_params, timeout=15)
    root_data = root_response.json()
    
    print(f"📦 Корневая папка: status={root_response.status_code}")
    
    if 'error' in root_data:
        print(f"❌ Ошибка API корня: {root_data.get('error')} - {root_data.get('message', '')}")
        return []
    
    # Ищем нужную папку по названию
    target_folder_path = None
    if '_embedded' in root_data and 'items' in root_data['_embedded']:
        items = root_data['_embedded']['items']
        print(f"📁 Папок в корне: {len(items)}")
        
        # Выводим первые 5 папок для отладки
        print(f"🔎 Первые папки:")
        for i, item in enumerate(items[:5]):
            if item['type'] == 'dir':
                print(f"  {i+1}. '{item['name']}'")
        
        print(f"🔎 Ищем папку: '{folder_name}'")
        
        # Ищем по началу названия (папки на диске имеют суффиксы типа " (курсовая работа)")
        for item in items:
            if item['type'] == 'dir':
                folder_name_normalized = folder_name.strip()
                item_name_normalized = item['name'].strip()
                
                # Проверяем точное совпадение или совпадение с началом + пробел + скобка
                if (item_name_normalized == folder_name_normalized or 
                    item_name_normalized.startswith(folder_name_normalized + ' (') or
                    item_name_normalized.startswith(folder_name_normalized + '(')):
                    target_folder_path = item['path']
                    print(f"✅ Найдена папка: '{item['name']}' → {target_folder_path}")
                    break
    
    if not target_folder_path:
        print(f"❌ Папка '{folder_name}' не найдена в корне")
        return []
    
    # Получаем файлы из найденной папки
    folder_params = {
        'public_key': public_key,
        'path': target_folder_path,
        'limit': 100
    }
    
    response = requests.get(api_url, params=folder_params, timeout=15)
    data = response.json()
    
    print(f"📦 Ответ от Яндекс.Диска для папки: status={response.status_code}")
    
    if 'error' in data:
        print(f"❌ Ошибка API папки: {data.get('error')} - {data.get('message', '')}")
        return []
    
    files = []
    if '_embedded' in data and 'items' in data['_embedded']:
        print(f"📁 Найдено файлов в папке: {len(data['_embedded']['items'])}")
        
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
                        print(f"  ✅ Файл: {file_item['name']}")
                except Exception as e:
                    print(f"  ⚠️ Ошибка получения ссылки для {file_item['name']}: {e}")
    else:
        print(f"⚠️ Нет _embedded или items в ответе папки")
    
    return files

def find_preview_or_pdf(files: list) -> tuple[Optional[str], str]:
    """Найти готовое превью (PNG) или PDF для генерации. Возвращает (url, type)"""
    # Сначала ищем готовые PNG превью
    png_files = [f for f in files if f['name'].lower().endswith('.png')]
    
    # Приоритет файлов с "preview" или "превью" в названии
    for png in png_files:
        name_lower = png['name'].lower()
        if 'preview' in name_lower or 'превью' in name_lower:
            print(f"  ✅ Найдено готовое PNG превью: {png['name']}")
            return (png['download_url'], 'png')
    
    # Если есть любой PNG, берём первый
    if png_files:
        print(f"  ✅ Используем PNG: {png_files[0]['name']}")
        return (png_files[0]['download_url'], 'png')
    
    # Если PNG нет, ищем PDF для генерации превью
    pdf_files = [f for f in files if f['name'].lower().endswith('.pdf')]
    
    # Приоритет PDF: ПЗ, записка, диплом, курсовая
    priority_keywords = ['пз', 'записка', 'диплом', 'курсовая', 'реферат']
    
    for keyword in priority_keywords:
        for pdf in pdf_files:
            if keyword in pdf['name'].lower():
                print(f"  📄 Найден приоритетный PDF: {pdf['name']}")
                return (pdf['download_url'], 'pdf')
    
    # Берём первый доступный PDF
    if pdf_files:
        print(f"  📄 Используем первый PDF: {pdf_files[0]['name']}")
        return (pdf_files[0]['download_url'], 'pdf')
    
    return (None, '')

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
    limit = body_data.get('limit', 3)  # Уменьшено до 3 работ за раз для избежания таймаута
    public_key = body_data.get('public_key', 'https://disk.yandex.ru/d/8J9vk2t_fe3cpA')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Получаем работы без превью (исключая помеченные как NO_FILES)
        cur.execute(f"""
            SELECT id, title, yandex_disk_link
            FROM t_p63326274_course_download_plat.works
            WHERE (preview_image_url IS NULL OR preview_image_url = '')
            AND COALESCE(preview_image_url, '') != 'NO_FILES'
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
                
                # Используем ссылку из БД или дефолтную
                disk_key = yandex_link if yandex_link else public_key
                print(f"  🔗 Используем ссылку: {disk_key}")
                
                # Получаем файлы из папки
                files = get_files_from_yandex_folder(disk_key, title)
                
                if not files:
                    raise Exception('Файлы не найдены в папке')
                
                # Находим готовое превью или PDF для генерации
                file_url, file_type = find_preview_or_pdf(files)
                
                if not file_url:
                    raise Exception('Не найден PNG или PDF файл')
                
                # Если нашли готовое PNG превью, используем его напрямую
                if file_type == 'png':
                    print(f"  ✅ Используем готовое PNG превью")
                    response = requests.get(file_url, timeout=30)
                    preview_bytes = response.content
                    preview_url = upload_to_cloudflare(preview_bytes, f'preview_{work_id}.png')
                # Если нашли PDF, генерируем превью из него
                elif file_type == 'pdf':
                    print(f"  🔄 Генерируем превью из PDF")
                    preview_bytes = generate_preview_from_pdf(file_url)
                    if not preview_bytes:
                        raise Exception('Не удалось сгенерировать превью из PDF')
                    preview_url = upload_to_cloudflare(preview_bytes, f'preview_{work_id}.png')
                else:
                    raise Exception('Неизвестный тип файла')
                
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
                error_msg = str(e)
                results['failed'] += 1
                results['errors'].append({
                    'work_id': work_id,
                    'title': title,
                    'error': error_msg
                })
                print(f"❌ Ошибка для работы ID={work_id}: {error_msg}")
                
                # Если нет PNG/PDF файлов, помечаем работу чтобы больше не пытаться
                if 'Не найден PNG или PDF файл' in error_msg or 'Файлы не найдены' in error_msg:
                    cur.execute(f"""
                        UPDATE t_p63326274_course_download_plat.works
                        SET preview_image_url = 'NO_FILES'
                        WHERE id = {work_id}
                    """)
                    conn.commit()
                    print(f"  ⚠️ Пометили работу как 'нет файлов'")
                else:
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