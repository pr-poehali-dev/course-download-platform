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
YANDEX_DISK_TOKEN = os.environ.get('YANDEX_DISK_TOKEN', '')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def get_yandex_disk_files(public_key: str) -> List[Dict[str, Any]]:
    """Получить список файлов из публичной папки Яндекс.Диска"""
    url = 'https://cloud-api.yandex.net/v1/disk/public/resources'
    headers = {'Authorization': f'OAuth {YANDEX_DISK_TOKEN}'}
    params = {'public_key': public_key, 'limit': 1000}
    
    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    
    files = []
    if '_embedded' in data and 'items' in data['_embedded']:
        for item in data['_embedded']['items']:
            if item['type'] == 'file':
                files.append({
                    'name': item['name'],
                    'path': item['path'],
                    'download_url': item['file'],
                    'mime_type': item.get('mime_type', ''),
                    'size': item.get('size', 0)
                })
    
    return files

def download_file(url: str) -> bytes:
    """Скачать файл по URL"""
    response = requests.get(url)
    return response.content

def extract_text_from_docx(content: bytes) -> str:
    """Извлечь текст из DOCX файла"""
    doc = Document(BytesIO(content))
    text = '\n'.join([para.text for para in doc.paragraphs])
    return text

def generate_description(text: str, filename: str) -> Dict[str, Any]:
    """Сгенерировать описание работы через OpenAI"""
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    prompt = f"""Проанализируй студенческую работу и верни JSON:
{{
  "title": "краткое название работы",
  "work_type": "реферат/курсовая/диплом/чертеж/лабораторная",
  "subject": "предмет (физика, математика и т.д.)",
  "description": "описание 2-3 предложения",
  "composition": "состав работы (введение, главы, заключение)",
  "price_points": число от 50 до 800 (баллы за работу)
}}

Файл: {filename}
Текст: {text[:3000]}
"""
    
    response = client.chat.completions.create(
        model='gpt-3.5-turbo',
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.7
    )
    
    result = json.loads(response.choices[0].message.content)
    return result

def process_image(content: bytes, filename: str) -> Dict[str, Any]:
    """Обработать изображение чертежа"""
    img = Image.open(BytesIO(content))
    
    work_type = 'чертеж'
    subject = 'инженерная графика'
    
    if 'электр' in filename.lower():
        subject = 'электротехника'
    elif 'машин' in filename.lower() or 'механ' in filename.lower():
        subject = 'машиностроение'
    elif 'строит' in filename.lower():
        subject = 'строительство'
    
    return {
        'title': filename.replace('.jpg', '').replace('.png', '').replace('_', ' '),
        'work_type': work_type,
        'subject': subject,
        'description': f'Чертеж {subject}. Формат: {img.format}, Размер: {img.size[0]}x{img.size[1]}px',
        'composition': 'Чертеж в графическом формате',
        'price_points': 100
    }

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
            public_key = body_data.get('public_key', 'https://disk.yandex.ru/d/dQBBqvLRShUD6A')
            
            files = get_yandex_disk_files(public_key)
            
            imported = []
            errors = []
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            try:
                for file_info in files:
                    try:
                        content = download_file(file_info['download_url'])
                        
                        if file_info['mime_type'].startswith('application/vnd.openxmlformats'):
                            text = extract_text_from_docx(content)
                            work_data = generate_description(text, file_info['name'])
                            file_url = save_file_to_storage(content, file_info['name'])
                            file_type = 'document'
                        elif file_info['mime_type'].startswith('image/'):
                            work_data = process_image(content, file_info['name'])
                            file_url = save_file_to_storage(content, file_info['name'])
                            file_type = 'image'
                        else:
                            continue
                        
                        cur.execute("""
                            INSERT INTO works (title, work_type, subject, description, composition, price_points)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            RETURNING id
                        """, (
                            work_data['title'],
                            work_data['work_type'],
                            work_data['subject'],
                            work_data['description'],
                            work_data['composition'],
                            work_data['price_points']
                        ))
                        
                        work_id = cur.fetchone()[0]
                        
                        cur.execute("""
                            INSERT INTO work_files (work_id, file_url, file_type, display_order)
                            VALUES (%s, %s, %s, %s)
                        """, (work_id, file_url, file_type, 0))
                        
                        imported.append({
                            'filename': file_info['name'],
                            'work_id': work_id,
                            'title': work_data['title']
                        })
                        
                    except Exception as e:
                        errors.append({
                            'filename': file_info['name'],
                            'error': str(e)
                        })
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'imported': len(imported),
                        'errors': len(errors),
                        'details': {'imported': imported, 'errors': errors}
                    })
                }
                
            except Exception as e:
                conn.rollback()
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': str(e)})
                }
            finally:
                cur.close()
                conn.close()
        
        else:
            title = body_data.get('title')
            work_type = body_data.get('work_type')
            subject = body_data.get('subject')
            description = body_data.get('description')
            composition = body_data.get('composition', '')
            price_points = body_data.get('price_points')
            files = body_data.get('files', [])
            
            if not all([title, work_type, subject, description, price_points]):
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
                
                for idx, file_url in enumerate(files):
                    cur.execute("""
                        INSERT INTO work_files (work_id, file_url, file_type, display_order)
                        VALUES (%s, %s, %s, %s)
                    """, (work_id, file_url, 'image', idx))
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'work_id': work_id})
                }
            except Exception as e:
                conn.rollback()
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': str(e)})
                }
            finally:
                cur.close()
                conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
