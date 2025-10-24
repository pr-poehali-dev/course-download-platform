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
    """Рекурсивно получить все папки и файлы из публичной папки Яндекс.Диска"""
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
                folder_path = item['path']
                
                print(f"📁 Обрабатываю папку: {folder_name} (путь: {folder_path})")
                folder_files = get_files_in_folder(public_key, folder_path)
                print(f"   └─ Найдено файлов: {len(folder_files)}")
                
                folders.append({
                    'name': folder_name,
                    'path': folder_path,
                    'files': folder_files
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
                           price_points, rating, downloads, created_at
                    FROM works WHERE id = %s
                """, (work_id,))
                row = cur.fetchone()
                
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Work not found'})
                    }
                
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
                    'created_at': row[9].isoformat() if row[9] else None
                }
                
                cur.execute("""
                    SELECT file_url, file_type, display_order
                    FROM work_files WHERE work_id = %s ORDER BY display_order
                """, (work_id,))
                
                work['files'] = [
                    {'url': f[0], 'type': f[1], 'order': f[2]}
                    for f in cur.fetchall()
                ]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(work)
                }
            else:
                cur.execute("""
                    SELECT id, title, work_type, subject, description, 
                           price_points, rating, downloads
                    FROM works ORDER BY created_at DESC
                """)
                
                works = []
                for row in cur.fetchall():
                    work = {
                        'id': row[0],
                        'title': row[1],
                        'work_type': row[2],
                        'subject': row[3],
                        'preview': row[4][:150] + '...' if len(row[4]) > 150 else row[4],
                        'price': row[5],
                        'rating': float(row[6]) if row[6] else 0,
                        'downloads': row[7]
                    }
                    works.append(work)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'works': works})
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
        
        if action == 'import':
            public_key = body_data.get('public_key')
            
            if not public_key:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'public_key required'})
                }
            
            folders = get_yandex_disk_folders(public_key)
            
            imported = []
            errors = []
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            try:
                for folder in folders:
                    folder_name = folder['name']
                    folder_files = folder['files']
                    
                    parsed = parse_work_title_and_type(folder_name)
                    title = parsed['title']
                    work_type = parsed['work_type']
                    
                    docx_files = [f for f in folder_files if f['name'].lower().endswith(('.docx', '.doc'))]
                    image_files = [f for f in folder_files if f['name'].lower().endswith(('.jpg', '.jpeg', '.png'))]
                    pdf_files = [f for f in folder_files if f['name'].lower().endswith('.pdf')]
                    dwg_files = [f for f in folder_files if f['name'].lower().endswith('.dwg')]
                    ppt_files = [f for f in folder_files if f['name'].lower().endswith(('.ppt', '.pptx'))]
                    
                    subject = 'общий'
                    description = f'Работа по теме: {title}. Тип работы: {work_type}.'
                    composition = 'Документация и файлы'
                    price_points = 150
                    
                    try:
                        cur.execute("""
                            INSERT INTO works (title, work_type, subject, description, composition, price_points)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            RETURNING id
                        """, (title, work_type, subject, description, composition, price_points))
                        
                        work_id = cur.fetchone()[0]
                        
                        print(f"✅ Создана работа ID={work_id}: {title}")
                        

                        
                        conn.commit()
                        
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
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }