import json
from typing import Dict, Any, List
import urllib.parse
import urllib.request

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get real file composition from Yandex Disk folder
    Args: event with httpMethod, queryStringParameters (folder_name, public_key)
          context with request_id
    Returns: HTTP response with list of files and their types
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters', {})
    folder_name: str = params.get('folder_name', '')
    public_key: str = params.get('public_key', 'https://disk.yandex.ru/d/usjmeUqnkY9IfQ')
    
    if not folder_name:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'folder_name is required'})
        }
    
    api_base = 'https://cloud-api.yandex.net/v1/disk/public/resources'
    url = f"{api_base}?public_key={urllib.parse.quote(public_key)}&path={urllib.parse.quote('/' + folder_name)}&limit=50"
    
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
        
        if '_embedded' not in data or 'items' not in data['_embedded']:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'files': [], 'composition': [], 'total_files': 0})
            }
        
        items = data['_embedded']['items']
        files: List[Dict[str, str]] = []
        composition_set = set()
        
        for item in items:
            if item.get('type') != 'file':
                continue
            
            name: str = item.get('name', '').lower()
            file_info = {
                'name': item.get('name', ''),
                'size': item.get('size', 0),
                'type': 'unknown'
            }
            
            if name.endswith('.pdf'):
                if 'пз' in name or 'пояснительная' in name or 'записка' in name:
                    file_info['type'] = 'pz'
                    composition_set.add('Пояснительная записка')
                elif 'презентация' in name or 'presentation' in name:
                    file_info['type'] = 'presentation'
                    composition_set.add('Презентация')
                elif 'чертеж' in name or 'dwg' in name or 'графика' in name:
                    file_info['type'] = 'drawing'
                    composition_set.add('Чертежи')
                elif 'отчет' in name or 'отчёт' in name:
                    file_info['type'] = 'report'
                    composition_set.add('Отчёт')
                elif 'дневник' in name:
                    file_info['type'] = 'diary'
                    composition_set.add('Дневник')
                elif 'раздаточный' in name:
                    file_info['type'] = 'handout'
                    composition_set.add('Раздаточный материал')
                else:
                    file_info['type'] = 'document'
                    composition_set.add('Документация')
            
            elif name.endswith(('.doc', '.docx')):
                file_info['type'] = 'word'
                composition_set.add('Word документы')
            
            elif name.endswith(('.dwg', '.cdw', '.frw')):
                file_info['type'] = 'cad'
                composition_set.add('Чертежи CAD')
            
            elif name.endswith(('.xls', '.xlsx')):
                file_info['type'] = 'excel'
                composition_set.add('Таблицы расчётов')
            
            elif name.endswith(('.ppt', '.pptx')):
                file_info['type'] = 'powerpoint'
                composition_set.add('Презентация')
            
            elif name.endswith(('.zip', '.rar', '.7z')):
                file_info['type'] = 'archive'
                composition_set.add('Архив')
            
            files.append(file_info)
        
        composition = sorted(list(composition_set))
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'files': files,
                'composition': composition,
                'total_files': len(files)
            })
        }
    
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'files': [], 'composition': [], 'total_files': 0})
            }
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }