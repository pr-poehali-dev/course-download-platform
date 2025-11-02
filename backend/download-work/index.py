"""
Business: Скачивание архива с файлами работы после оплаты
Args: event - dict с httpMethod, queryStringParameters (workId, publicKey, userId)
      context - объект с request_id
Returns: ZIP-архив с файлами работы
"""
import json
import os
import urllib.request
import base64
from typing import Dict, Any

try:
    import psycopg2
except ImportError:
    psycopg2 = None


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {})
    headers = event.get('headers', {})
    work_id = params.get('workId')
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    public_key = params.get('publicKey', 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ')
    
    print(f"[DEBUG] Headers: {headers}")
    print(f"[DEBUG] work_id={work_id}, user_id={user_id}")
    
    if not work_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'workId required'}),
            'isBase64Encoded': False
        }
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User authentication required'}),
            'isBase64Encoded': False
        }
    
    try:
        # Загружаем данные работы из БД
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        if not psycopg2:
            raise Exception('psycopg2 module not available')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        try:
            # Проверяем роль пользователя из базы данных
            cur.execute(
                "SELECT role FROM t_p63326274_course_download_plat.users WHERE id = %s",
                (user_id,)
            )
            user_result = cur.fetchone()
            
            if not user_result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            role = user_result[0] if user_result[0] else 'user'
            is_admin = (role == 'admin')
            
            print(f"[DEBUG] User {user_id}, role: {role}, is_admin: {is_admin}")
            
            # Проверяем покупку только для НЕ-админов
            if not is_admin:
                cur.execute(
                    "SELECT id FROM t_p63326274_course_download_plat.purchases WHERE buyer_id = %s AND work_id = %s",
                    (user_id, work_id)
                )
                
                if not cur.fetchone():
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Work not purchased. Please purchase before downloading.'}),
                        'isBase64Encoded': False
                    }
            
            cur.execute(
                "SELECT title, download_url, file_url FROM t_p63326274_course_download_plat.works WHERE id = %s",
                (work_id,)
            )
            work_result = cur.fetchone()
            
            if not work_result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Work not found in database'}),
                    'isBase64Encoded': False
                }
            
            title = work_result[0]
            download_url = work_result[1] or work_result[2]
            
            print(f"[DEBUG] Work found: title={title}, download_url={download_url}")
            
            if not download_url:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Download URL not found for this work.'}),
                    'isBase64Encoded': False
                }
            
        finally:
            cur.close()
            conn.close()
        
        # Скачиваем файл напрямую с Yandex Cloud Storage
        print(f"[DEBUG] Downloading file from: {download_url}")
        
        req = urllib.request.Request(download_url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            file_data = resp.read()
            print(f"[DEBUG] Downloaded file: {len(file_data)} bytes")
        
        # Кодируем в base64 для передачи
        file_base64 = base64.b64encode(file_data).decode('utf-8')
        print(f"[DEBUG] Base64 encoded: {len(file_base64)} chars")
        
        # Безопасное имя файла
        safe_name = ''.join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in title[:50])
        
        # Определяем тип файла по расширению URL
        file_extension = 'rar'
        if download_url:
            if download_url.lower().endswith('.zip'):
                file_extension = 'zip'
            elif download_url.lower().endswith('.rar'):
                file_extension = 'rar'
            elif download_url.lower().endswith('.7z'):
                file_extension = '7z'
        
        content_type = 'application/x-rar-compressed' if file_extension == 'rar' else 'application/zip'
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': content_type,
                'Content-Disposition': f'attachment; filename="{safe_name}.{file_extension}"',
                'Access-Control-Allow-Origin': '*'
            },
            'body': file_base64,
            'isBase64Encoded': True
        }
        
    except Exception as e:
        print(f"[ERROR] Download failed: {type(e).__name__}: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Download failed: {str(e)}'}),
            'isBase64Encoded': False
        }