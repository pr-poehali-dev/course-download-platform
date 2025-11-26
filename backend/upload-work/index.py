"""
Business: Загрузка работы автором с сохранением в БД
Args: event с файлом, названием, описанием, категорией, ценой
Returns: HTTP response с результатом загрузки
"""

import json
import os
import psycopg2
import base64
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
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
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        title = body_data.get('title')
        description = body_data.get('description')
        work_type = body_data.get('category')
        price_points = body_data.get('price')
        file_data = body_data.get('file')
        file_name = body_data.get('fileName')
        author_id = body_data.get('authorId')
        
        if not all([title, description, work_type, price_points, author_id]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Экранируем строки для Simple Query Protocol
        safe_title = title.replace("'", "''")
        safe_work_type = work_type.replace("'", "''")
        safe_description = description.replace("'", "''")
        safe_file_name = file_name.replace("'", "''") if file_name else 'work.rar'
        
        # Вставляем работу в БД используя Simple Query Protocol
        cur.execute(f"""
            INSERT INTO t_p63326274_course_download_plat.works 
            (title, work_type, subject, description, price_points, 
             created_at, updated_at, author_id, status, category, price, downloads, views_count, file_url)
            VALUES ('{safe_title}', '{safe_work_type}', 'Общая', '{safe_description}', {int(price_points)}, 
                    NOW(), NOW(), {int(author_id)}, 'pending', '{safe_work_type}', {int(price_points)}, 0, 0, '{safe_file_name}')
            RETURNING id
        """)
        
        work_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'workId': work_id,
                'message': 'Work uploaded successfully'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }