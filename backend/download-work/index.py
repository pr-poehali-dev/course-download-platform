"""
Business: Скачивание архива с файлами работы после оплаты
Args: event - dict с httpMethod, queryStringParameters (workId, publicKey, userId)
      context - объект с request_id
Returns: ZIP-архив с файлами работы
"""
import json
import os
import urllib.request
import urllib.parse
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
    token = params.get('token')
    public_key = params.get('publicKey', 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ')
    
    print(f"[DEBUG] Headers: {headers}")
    print(f"[DEBUG] work_id={work_id}, user_id={user_id}, token={token[:20] if token else None}...")
    
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
    
    # Токен теперь опциональный - проверяем покупку напрямую
    
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
            from datetime import datetime, timedelta
            
            # Проверяем покупку работы (7-дневный доступ)
            cur.execute(
                """SELECT id, created_at 
                FROM t_p63326274_course_download_plat.purchases 
                WHERE buyer_id = %s AND work_id = %s
                ORDER BY created_at DESC
                LIMIT 1""",
                (user_id, work_id)
            )
            purchase_result = cur.fetchone()
            
            if not purchase_result:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Вы не купили эту работу'}),
                    'isBase64Encoded': False
                }
            
            purchase_date = purchase_result[1]
            download_deadline = purchase_date + timedelta(days=7)
            
            # Проверяем, не истёк ли 7-дневный период
            if datetime.now() > download_deadline:
                days_passed = (datetime.now() - purchase_date).days
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'error': 'Download period expired', 
                        'message': f'Период скачивания истёк {days_passed - 7} дней назад. Для повторного доступа купите работу заново.'
                    }),
                    'isBase64Encoded': False
                }
            
            # Записываем факт скачивания
            cur.execute(
                """INSERT INTO t_p63326274_course_download_plat.user_downloads 
                (user_id, work_id, downloaded_at) 
                VALUES (%s, %s, NOW())""",
                (user_id, work_id)
            )
            conn.commit()
            
            # Токен уже проверен выше, просто получаем данные работы
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
            
            # Инкрементируем счётчик скачиваний
            cur.execute("""
                UPDATE t_p63326274_course_download_plat.works 
                SET downloads_count = COALESCE(downloads_count, 0) + 1 
                WHERE id = %s
            """, (work_id,))
            conn.commit()
            
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
        
        # Возвращаем прямую ссылку на файл (не проксируем через функцию)
        print(f"[DEBUG] Original URL: {download_url}")
        
        # Кодируем URL (кириллицу и пробелы в percent-encoding)
        parsed = urllib.parse.urlparse(download_url)
        encoded_path = urllib.parse.quote(parsed.path, safe='/')
        encoded_url = urllib.parse.urlunparse((
            parsed.scheme,
            parsed.netloc,
            encoded_path,
            parsed.params,
            parsed.query,
            parsed.fragment
        ))
        
        print(f"[DEBUG] Encoded URL: {encoded_url}")
        
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
        
        # Возвращаем JSON с прямой ссылкой на файл
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'download_url': encoded_url,
                'filename': f'{safe_name}.{file_extension}',
                'title': title
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] Download failed: {type(e).__name__}: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Download failed: {str(e)}'}),
            'isBase64Encoded': False
        }