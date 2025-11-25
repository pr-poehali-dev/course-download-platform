"""
Business: Управление работами (добавление, получение, обновление, импорт с Яндекс.Диска)
Args: event с httpMethod, body, queryStringParameters
Returns: HTTP response с данными работ
"""

import json
import os
import psycopg2
import requests
import re
from typing import Dict, Any, List, Optional
from docx import Document
from openai import OpenAI
from io import BytesIO
from PIL import Image

DATABASE_URL = os.environ.get('DATABASE_URL', '')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def get_yandex_disk_folders(public_key: str) -> List[Dict[str, Any]]:
    """Получить список папок с прямыми ссылками для скачивания"""
    url = 'https://cloud-api.yandex.net/v1/disk/public/resources'
    params = {'public_key': public_key, 'limit': 1000}
    
    print(f"🔍 Получаю список папок из Яндекс.Диска: {public_key}")
    response = requests.get(url, params=params)
    data = response.json()
    
    folders = []
    if '_embedded' in data and 'items' in data['_embedded']:
        print(f"✅ Найдено элементов в корне: {len(data['_embedded']['items'])}")
        for item in data['_embedded']['items']:
            if item['type'] == 'dir':
                folder_name = item['name']
                folder_public_url = item.get('public_url', '')
                print(f"📁 Добавляю папку: {folder_name}")
                
                folders.append({
                    'name': folder_name,
                    'public_url': folder_public_url
                })
    
    print(f"📊 Итого папок для импорта: {len(folders)}")
    return folders

def get_files_in_folder(public_key: str, folder_path: str) -> List[Dict[str, Any]]:
    """Получить все файлы из конкретной папки по пути"""
    url = 'https://cloud-api.yandex.net/v1/disk/public/resources'
    params = {'public_key': public_key, 'path': folder_path, 'limit': 1000}
    
    response = requests.get(url, params=params)
    data = response.json()
    
    files = []
    if '_embedded' in data and 'items' in data['_embedded']:
        for item in data['_embedded']['items']:
            if item['type'] == 'file':
                file_path = item['path']
                download_url_endpoint = f"https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key={public_key}&path={file_path}"
                
                try:
                    dl_response = requests.get(download_url_endpoint)
                    dl_data = dl_response.json()
                    file_url = dl_data.get('href', '')
                    
                    if file_url:
                        files.append({
                            'name': item['name'],
                            'download_url': file_url,
                            'mime_type': item.get('mime_type', ''),
                            'size': item.get('size', 0)
                        })
                except Exception as e:
                    pass
    
    return files

def parse_work_title_and_type(folder_name: str) -> Dict[str, str]:
    """Извлечь название и тип работы из названия папки"""
    work_type_map = {
        'курсовая': 'курсовая',
        'диплом': 'диплом',
        'реферат': 'реферат',
        'чертеж': 'чертеж',
        'лабораторная': 'лабораторная',
        'контрольная': 'контрольная'
    }
    
    match = re.search(r'\(([^)]+)\)', folder_name)
    work_type = 'другое'
    
    if match:
        type_text = match.group(1).lower()
        for key, value in work_type_map.items():
            if key in type_text:
                work_type = value
                break
        title = folder_name.replace(match.group(0), '').strip()
    else:
        title = folder_name
    
    return {'title': title, 'work_type': work_type}

def download_file(url: str) -> bytes:
    """Скачать файл по URL"""
    response = requests.get(url)
    return response.content

def extract_text_from_docx(content: bytes) -> str:
    """Извлечь текст из DOCX файла"""
    doc = Document(BytesIO(content))
    text = '\n'.join([para.text for para in doc.paragraphs if para.text.strip()])
    return text

def generate_description_from_text(text: str, title: str, work_type: str) -> Dict[str, Any]:
    """Сгенерировать описание работы через OpenAI"""
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    prompt = f"""Проанализируй студенческую работу и верни JSON:
{{
  "subject": "предмет работы (физика, математика, программирование и т.д.)",
  "description": "описание работы 2-3 предложения о чем работа",
  "composition": "состав работы (введение, главы, заключение, список литературы и т.д.)",
  "price_points": число от 50 до 800 (баллы за работу в зависимости от объема и сложности)
}}

Название: {title}
Тип работы: {work_type}
Текст работы (начало): {text[:3000]}
"""
    
    response = client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.7,
        response_format={"type": "json_object"}
    )
    
    result = json.loads(response.choices[0].message.content)
    return result

def save_file_to_storage(content: bytes, filename: str) -> str:
    """Сохранить файл (заглушка - в реальности загрузка в S3)"""
    return f'https://storage.example.com/works/{filename}'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Email',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'GET':
        query_params = event.get('queryStringParameters') or {}
        work_id = query_params.get('id')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            if work_id:
                cur.execute("""
                    SELECT id, title, work_type, subject, description, composition, 
                           price_points, rating, downloads, created_at, yandex_disk_link, 
                           preview_image_url, file_url, author_id, preview_urls,
                           author_name, language, software, views_count, reviews_count, keywords, downloads_count, cover_images, discount
                    FROM t_p63326274_course_download_plat.works WHERE id = %s
                """, (work_id,))
                row = cur.fetchone()
                
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Work not found'})
                    }
                
                preview_urls_str = row[14]
                if isinstance(preview_urls_str, str):
                    preview_urls = json.loads(preview_urls_str) if preview_urls_str else []
                elif isinstance(preview_urls_str, list):
                    preview_urls = preview_urls_str
                else:
                    preview_urls = []
                
                software_str = row[17]
                if isinstance(software_str, str):
                    software = json.loads(software_str) if software_str and software_str != '[]' else []
                elif isinstance(software_str, list):
                    software = software_str
                else:
                    software = []
                
                keywords_str = row[20]
                if isinstance(keywords_str, str):
                    keywords = json.loads(keywords_str) if keywords_str and keywords_str != '[]' else []
                elif isinstance(keywords_str, list):
                    keywords = keywords_str
                else:
                    keywords = []
                
                cover_images = row[22] if row[22] else []
                if not isinstance(cover_images, list):
                    cover_images = []
                
                work = {
                    'id': row[0],
                    'title': row[1],
                    'work_type': row[2],
                    'subject': row[3],
                    'description': row[4],
                    'composition': row[5],
                    'price_points': row[6],
                    'rating': float(row[7]) if row[7] else 0,
                    'downloads': row[8],
                    'created_at': row[9].isoformat() if row[9] else None,
                    'yandex_disk_link': row[10],
                    'preview_image_url': row[11],
                    'file_url': row[12],
                    'author_id': row[13],
                    'preview_urls': preview_urls,
                    'author_name': row[15],
                    'language': row[16] or 'Русский',
                    'software': software,
                    'views_count': row[18] or 0,
                    'reviews_count': row[19] or 0,
                    'keywords': keywords,
                    'downloads_count': row[21] or 0,
                    'cover_images': cover_images,
                    'discount': row[23] or 0
                }
                
                cur.execute("""
                    SELECT file_url, file_type, display_order
                    FROM t_p63326274_course_download_plat.work_files WHERE work_id = %s ORDER BY display_order
                """, (work_id,))
                
                work['files'] = [
                    {'url': f[0], 'type': f[1], 'order': f[2]}
                    for f in cur.fetchall()
                ]
                
                # Инкрементируем счётчик просмотров
                cur.execute("""
                    UPDATE t_p63326274_course_download_plat.works 
                    SET views_count = COALESCE(views_count, 0) + 1 
                    WHERE id = %s
                """, (work_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(work)
                }
            else:
                # Пагинация и фильтрация
                # Увеличен лимит до 1000 для отображения всех работ в каталоге
                limit = int(query_params.get('limit', 1000))
                offset = int(query_params.get('offset', 0))
                category = query_params.get('category')
                search = query_params.get('search')
                author_id = query_params.get('author_id')
                
                # Базовый запрос
                where_clauses = []
                params = []
                
                # Исключаем удалённые записи
                where_clauses.append("title NOT LIKE %s")
                params.append('[УДАЛЕНО]%')
                
                # Фильтрация по статусу
                status_filter = query_params.get('status')
                if status_filter:
                    where_clauses.append("status = %s")
                    params.append(status_filter)
                elif not author_id:
                    # Для каталога показываем только одобренные работы
                    where_clauses.append("status = %s")
                    params.append('approved')
                
                # Фильтрация по автору (для профиля пользователя)
                if author_id:
                    where_clauses.append("author_id = %s")
                    params.append(int(author_id))
                
                if category and category != 'all':
                    where_clauses.append("category = %s")
                    params.append(category)
                
                if search:
                    where_clauses.append("(title ILIKE %s OR description ILIKE %s)")
                    search_pattern = f'%{search}%'
                    params.extend([search_pattern, search_pattern])
                
                where_sql = " AND ".join(where_clauses)
                
                # Получить общее количество
                count_query = f"""
                    SELECT COUNT(*) FROM t_p63326274_course_download_plat.works 
                    WHERE {where_sql}
                """
                cur.execute(count_query, params)
                total = cur.fetchone()[0]
                
                # Получить работы с пагинацией
                query = f"""
                    SELECT id, title, work_type, subject, description, 
                           price_points, rating, downloads, category, preview_image_url, author_id, preview_urls,
                           author_name, language, software, views_count, reviews_count, keywords, file_url, downloads_count, discount
                    FROM t_p63326274_course_download_plat.works 
                    WHERE {where_sql}
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                    """
                params.extend([limit, offset])
                cur.execute(query, params)
                
                works = []
                for row in cur.fetchall():
                    preview_urls_str = row[11]
                    if isinstance(preview_urls_str, str):
                        preview_urls = json.loads(preview_urls_str) if preview_urls_str else []
                    elif isinstance(preview_urls_str, list):
                        preview_urls = preview_urls_str
                    else:
                        preview_urls = []
                    
                    software_str = row[14]
                    if isinstance(software_str, str):
                        software = json.loads(software_str) if software_str and software_str != '[]' else []
                    elif isinstance(software_str, list):
                        software = software_str
                    else:
                        software = []
                    
                    keywords_str = row[17]
                    if isinstance(keywords_str, str):
                        keywords = json.loads(keywords_str) if keywords_str and keywords_str != '[]' else []
                    elif isinstance(keywords_str, list):
                        keywords = keywords_str
                    else:
                        keywords = []
                    
                    work = {
                        'id': row[0],
                        'title': row[1],
                        'work_type': row[2],
                        'subject': row[3],
                        'preview': row[4][:150] + '...' if row[4] and len(row[4]) > 150 else (row[4] or ''),
                        'price_points': row[5],
                        'rating': float(row[6]) if row[6] else 0,
                        'downloads': row[7] or 0,
                        'category': row[8],
                        'preview_image_url': row[9],
                        'author_id': row[10],
                        'preview_urls': preview_urls,
                        'author_name': row[12],
                        'language': row[13] or 'Русский',
                        'software': software,
                        'views_count': row[15] or 0,
                        'reviews_count': row[16] or 0,
                        'keywords': keywords,
                        'file_url': row[18],
                        'downloads_count': row[19] or 0,
                        'discount': row[20] or 0
                    }
                    works.append(work)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'works': works,
                        'total': total,
                        'limit': limit,
                        'offset': offset
                    })
                }
        finally:
            cur.close()
            conn.close()
    
    if method == 'POST':
        admin_email = event.get('headers', {}).get('x-admin-email') or event.get('headers', {}).get('X-Admin-Email')
        
        if admin_email != 'rekrutiw@yandex.ru':
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'clear_all':
            conn = get_db_connection()
            cur = conn.cursor()
            
            try:
                # Удалить связанные данные сначала
                cur.execute("DELETE FROM t_p63326274_course_download_plat.work_files")
                cur.execute("DELETE FROM t_p63326274_course_download_plat.favorites")
                cur.execute("DELETE FROM t_p63326274_course_download_plat.reviews")
                cur.execute("DELETE FROM t_p63326274_course_download_plat.purchases")
                
                # Теперь удаляем работы
                cur.execute("DELETE FROM t_p63326274_course_download_plat.works")
                deleted_count = cur.rowcount
                conn.commit()
                
                print(f"🗑️ Удалено всех работ: {deleted_count}")
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'deleted': deleted_count,
                        'message': f'База очищена. Удалено работ: {deleted_count}'
                    })
                }
            finally:
                cur.close()
                conn.close()
        
        if action == 'remove_duplicates':
            conn = get_db_connection()
            cur = conn.cursor()
            
            try:
                # Найти и удалить дубликаты, оставив только самые ранние записи
                cur.execute("""
                    DELETE FROM t_p63326274_course_download_plat.works
                    WHERE id NOT IN (
                        SELECT MIN(id)
                        FROM t_p63326274_course_download_plat.works
                        GROUP BY title
                    )
                """)
                deleted_count = cur.rowcount
                conn.commit()
                
                print(f"🗑️ Удалено дубликатов: {deleted_count}")
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'deleted': deleted_count,
                        'message': f'Удалено дубликатов: {deleted_count}'
                    })
                }
            finally:
                cur.close()
                conn.close()
        
        if action == 'import':
            public_key = body_data.get('public_key')
            offset = body_data.get('offset', 0)
            limit = body_data.get('limit', 50)
            
            if not public_key:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'public_key required'})
                }
            
            folders = get_yandex_disk_folders(public_key)
            total_folders = len(folders)
            
            # Применяем offset и limit
            folders_batch = folders[offset:offset+limit]
            
            imported = []
            errors = []
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            print(f"🚀 Начинаю импорт батча {offset}-{offset+len(folders_batch)} из {total_folders} работ...")
            
            try:
                for folder in folders_batch:
                    folder_name = folder['name']
                    yandex_disk_link = folder.get('public_url', '')
                    
                    parsed = parse_work_title_and_type(folder_name)
                    title = parsed['title']
                    work_type = parsed['work_type']
                    
                    subject = 'общий'
                    description = f'Работа по теме: {title}. Тип работы: {work_type}.'
                    composition = 'Документация и файлы'
                    price_points = 150
                    
                    try:
                        # Escape single quotes for SQL
                        safe_title = title.replace("'", "''")
                        safe_work_type = work_type.replace("'", "''")
                        safe_subject = subject.replace("'", "''")
                        safe_desc = description.replace("'", "''")
                        safe_comp = composition.replace("'", "''")
                        safe_link = yandex_disk_link.replace("'", "''")
                        
                        cur.execute(f"""
                            INSERT INTO t_p63326274_course_download_plat.works (title, work_type, subject, description, composition, price_points, yandex_disk_link)
                            VALUES ('{safe_title}', '{safe_work_type}', '{safe_subject}', '{safe_desc}', '{safe_comp}', {price_points}, '{safe_link}')
                            RETURNING id
                        """)
                        
                        work_id = cur.fetchone()[0]
                        conn.commit()
                        
                        print(f"✅ Создана работа ID={work_id}: {title}")
                        
                        imported.append({
                            'filename': folder_name,
                            'work_id': work_id,
                            'title': title
                        })
                        
                    except Exception as e:
                        errors.append({
                            'filename': folder_name,
                            'error': str(e)
                        })
                        conn.rollback()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'imported': len(imported),
                        'errors': len(errors),
                        'total': total_folders,
                        'offset': offset,
                        'limit': limit,
                        'has_more': offset + limit < total_folders,
                        'next_offset': offset + limit if offset + limit < total_folders else None,
                        'details': {
                            'imported': imported,
                            'errors': errors
                        }
                    })
                }
            finally:
                cur.close()
                conn.close()
        
        title = body_data.get('title')
        work_type = body_data.get('work_type')
        subject = body_data.get('subject')
        description = body_data.get('description')
        composition = body_data.get('composition')
        price_points = body_data.get('price_points', 100)
        
        if not all([title, work_type, subject]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute("""
                INSERT INTO works (title, work_type, subject, description, composition, price_points)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (title, work_type, subject, description, composition, price_points))
            
            work_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': work_id, 'message': 'Work created'})
            }
        finally:
            cur.close()
            conn.close()
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        work_id = body_data.get('workId')
        activity_type = body_data.get('activityType')
        
        if not work_id or not activity_type:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'workId and activityType required'})
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            if activity_type == 'view':
                cur.execute(
                    "UPDATE t_p63326274_course_download_plat.works SET views = COALESCE(views, 0) + 1, downloads = COALESCE(downloads, 0) + 1 WHERE id = %s",
                    (work_id,)
                )
            elif activity_type == 'download':
                cur.execute(
                    "UPDATE t_p63326274_course_download_plat.works SET downloads = COALESCE(downloads, 0) + 1, views = COALESCE(views, 0) + 1 WHERE id = %s",
                    (work_id,)
                )
            elif activity_type == 'review':
                cur.execute(
                    "UPDATE t_p63326274_course_download_plat.works SET reviews_count = COALESCE(reviews_count, 0) + 1 WHERE id = %s",
                    (work_id,)
                )
            
            cur.execute(
                "SELECT views, downloads, reviews_count FROM t_p63326274_course_download_plat.works WHERE id = %s",
                (work_id,)
            )
            stats = cur.fetchone()
            
            conn.commit()
            
            if not stats:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Work not found'})
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'workId': work_id,
                    'views': stats[0] if stats[0] else 0,
                    'downloads': stats[1] if stats[1] else 0,
                    'reviewsCount': stats[2] if stats[2] else 0
                })
            }
        finally:
            cur.close()
            conn.close()
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        work_id = body_data.get('work_id')
        new_status = body_data.get('status')
        rejection_reason = body_data.get('rejection_reason')
        
        admin_email = event.get('headers', {}).get('X-Admin-Email') or event.get('headers', {}).get('x-admin-email')
        if admin_email != 'rekrutiw@yandex.ru':
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Admin access required'})
            }
        
        if not work_id or not new_status:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'work_id and status required'})
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            if rejection_reason:
                cur.execute("""
                    UPDATE t_p63326274_course_download_plat.works 
                    SET status = %s, moderation_comment = %s
                    WHERE id = %s
                """, (new_status, rejection_reason, work_id))
            else:
                cur.execute("""
                    UPDATE t_p63326274_course_download_plat.works 
                    SET status = %s
                    WHERE id = %s
                """, (new_status, work_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'work_id': work_id,
                    'status': new_status
                })
            }
        finally:
            cur.close()
            conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }