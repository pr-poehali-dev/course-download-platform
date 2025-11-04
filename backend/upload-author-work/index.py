import json
import psycopg2
import os
import base64
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Upload author work with file to database and moderation
    Args: event with body (title, description, work_type, subject, price, fileName, fileSize, fileData), headers with X-User-Id
    Returns: Work ID, status and new balance with bonus
    '''
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
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    title = body_data.get('title', '').strip()
    description = body_data.get('description', '').strip()
    work_type = body_data.get('workType', '').strip()
    subject = body_data.get('subject', '').strip()
    price_points = body_data.get('price', 0)
    file_name = body_data.get('fileName', '')
    file_size = body_data.get('fileSize', 0)
    file_data = body_data.get('fileData', '')
    
    if not all([title, description, work_type, subject, price_points]):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Все поля обязательны'})
        }
    
    if not file_data or not file_name:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Файл не загружен'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Database configuration missing'})
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        file_url = f"temp_{user_id}_{datetime.now().timestamp()}_{file_name}"
        
        insert_work_query = '''
            INSERT INTO t_p63326274_course_download_plat.uploaded_works 
            (user_id, title, work_type, subject, description, price_points, 
             file_name, file_size, file_url, moderation_status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        '''
        
        cursor.execute(
            insert_work_query, 
            (int(user_id), title, work_type, subject, description, int(price_points),
             file_name, file_size, file_url, 'pending', datetime.now())
        )
        
        work_id = cursor.fetchone()[0]
        
        cursor.execute('''
            UPDATE t_p63326274_course_download_plat.users
            SET balance = balance + 100
            WHERE id = %s
            RETURNING balance
        ''', (int(user_id),))
        
        result = cursor.fetchone()
        new_balance = result[0] if result else 0
        
        cursor.execute('''
            INSERT INTO t_p63326274_course_download_plat.transactions
            (user_id, amount, transaction_type, description)
            VALUES (%s, %s, %s, %s)
        ''', (int(user_id), 100, 'work_upload', f'Загрузка работы: {title}'))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'workId': work_id,
                'status': 'pending',
                'message': 'Работа загружена и отправлена на модерацию',
                'bonusEarned': 100,
                'newBalance': new_balance
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Ошибка загрузки: {str(e)}'})
        }