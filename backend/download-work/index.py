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
        # Получаем список всех папок
        api_url = f"https://cloud-api.yandex.net/v1/disk/public/resources?public_key={urllib.parse.quote(public_key)}&limit=500"
        
        req = urllib.request.Request(api_url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        
        work_item = None
        if '_embedded' in data and 'items' in data['_embedded']:
            for item in data['_embedded']['items']:
                if item.get('resource_id') == work_id:
                    work_item = item
                    break
        
        if not work_item:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Work not found'}),
                'isBase64Encoded': False
            }
        
        folder_name = work_item['name']
        folder_path = '/' + folder_name
        
        # Получаем содержимое папки работы
        folder_url = f"https://cloud-api.yandex.net/v1/disk/public/resources?public_key={urllib.parse.quote(public_key)}&path={urllib.parse.quote(folder_path)}&limit=100"
        
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
                    download_url = get_download_url(public_key, folder_path + '/' + file_name)
                    
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
        safe_name = ''.join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in folder_name[:50])
        
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
