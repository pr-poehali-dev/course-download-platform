"""
Тест конвертации RAR → ZIP для одной работы
"""

import json
import os
import tempfile
import zipfile
import urllib.request
import urllib.parse
from typing import Dict, Any
import boto3
from botocore.config import Config

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Тест конвертации RAR → ZIP
    Args: event с GET параметром work_id
    Returns: Результат конвертации
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Тестовый URL
    test_url = 'https://storage.yandexcloud.net/kyra/увеличение износостойкости одноковшового экскаватора (курсовая работа).rar'
    
    # URL-кодируем
    parsed = urllib.parse.urlparse(test_url)
    encoded_path = urllib.parse.quote(parsed.path.encode('utf-8'))
    safe_url = f"{parsed.scheme}://{parsed.netloc}{encoded_path}"
    
    result = {
        'original_url': test_url,
        'encoded_url': safe_url,
        'steps': []
    }
    
    try:
        # Шаг 1: Скачиваем RAR
        result['steps'].append('Downloading RAR...')
        with tempfile.NamedTemporaryFile(delete=False, suffix='.rar') as tmp_rar:
            req = urllib.request.Request(safe_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=60) as response:
                rar_data = response.read()
                tmp_rar.write(rar_data)
            rar_path = tmp_rar.name
        
        rar_size = len(rar_data)
        result['rar_size_mb'] = round(rar_size / 1024 / 1024, 2)
        result['steps'].append(f'Downloaded {result["rar_size_mb"]} MB')
        
        # Шаг 2: Проверяем что это действительно RAR
        result['steps'].append('Checking RAR signature...')
        with open(rar_path, 'rb') as f:
            signature = f.read(7)
            is_rar = signature.startswith(b'Rar!')
            result['is_valid_rar'] = is_rar
            result['signature'] = signature.hex()
        
        if not is_rar:
            result['error'] = 'Not a valid RAR file'
            os.unlink(rar_path)
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result, ensure_ascii=False)
            }
        
        result['steps'].append('Valid RAR file confirmed')
        
        # Для полной конвертации нужно будет распаковать на сервере с unrar
        # Но в облачной функции это невозможно
        result['conclusion'] = 'RAR скачивается успешно, но распаковка требует внешний сервер с unrar'
        result['next_step'] = 'Нужен отдельный сервис для конвертации или локальный скрипт'
        
        os.unlink(rar_path)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, ensure_ascii=False)
        }
        
    except Exception as e:
        result['error'] = str(e)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, ensure_ascii=False)
        }
