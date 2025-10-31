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
import zipfile
from io import BytesIO
import base64
from typing import Dict, Any, Optional

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
    work_id = params.get('workId')
    public_key = params.get('publicKey', 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ')
    
    if not work_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'workId required'}),
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
            cur.execute(
                "SELECT title, yandex_disk_link, file_url, folder_path FROM t_p63326274_course_download_plat.works WHERE id = %s",
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
            yandex_link = work_result[1] or work_result[2] or public_key
            folder_path = work_result[3]
            
            if not folder_path:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Folder path not found. Please re-import works.'}),
                    'isBase64Encoded': False
                }
            
        finally:
            cur.close()
            conn.close()
        
        # Формируем путь к папке (folder_path уже содержит полное имя папки)
        folder_path_full = '/' + folder_path
        
        # Получаем содержимое папки работы
        folder_url = f"https://cloud-api.yandex.net/v1/disk/public/resources?public_key={urllib.parse.quote(yandex_link)}&path={urllib.parse.quote(folder_path_full)}&limit=100"
        
        req = urllib.request.Request(folder_url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            folder_data = json.loads(resp.read().decode())
        
        # Создаем ZIP архив в памяти
        zip_buffer = BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            if '_embedded' in folder_data and 'items' in folder_data['_embedded']:
                for file_item in folder_data['_embedded']['items']:
                    file_name = file_item.get('name', '')
                    
                    # Пропускаем превью
                    if 'preview' in file_name.lower():
                        continue
                    
                    # Получаем ссылку на скачивание файла
                    download_url = get_download_url(yandex_link, folder_path_full + '/' + file_name)
                    
                    if download_url:
                        try:
                            # Скачиваем файл
                            file_data = download_file(download_url)
                            
                            # Добавляем в архив
                            zip_file.writestr(file_name, file_data)
                            print(f"[DEBUG] Added file to archive: {file_name} ({len(file_data)} bytes)")
                        except Exception as e:
                            print(f"[ERROR] Failed to download file {file_name}: {e}")
                            continue
        
        # Получаем содержимое архива
        zip_buffer.seek(0)
        zip_data = zip_buffer.read()
        
        # Кодируем в base64 для передачи
        zip_base64 = base64.b64encode(zip_data).decode('utf-8')
        
        # Безопасное имя файла для архива
        safe_name = ''.join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in folder_path[:50])
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/zip',
                'Content-Disposition': f'attachment; filename="{safe_name}.zip"',
                'Access-Control-Allow-Origin': '*'
            },
            'body': zip_base64,
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


def get_download_url(public_key: str, file_path: str) -> Optional[str]:
    try:
        download_url = f"https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key={urllib.parse.quote(public_key)}&path={urllib.parse.quote(file_path)}"
        req = urllib.request.Request(download_url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            return data.get('href')
    except Exception as e:
        print(f"[ERROR] Error getting download URL: {type(e).__name__}: {str(e)}")
        return None


def download_file(url: str) -> bytes:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()