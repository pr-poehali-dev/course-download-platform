import json
import bcrypt
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Тестовая функция для генерации и проверки bcrypt хешей
    Args: event - dict с httpMethod, body
          context - объект с request_id
    Returns: HTTP response с результатами теста
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        password = body_data.get('password', '12345678')
        test_hash = body_data.get('hash', '')
        
        # Генерируем новый хеш
        salt = bcrypt.gensalt()
        new_hash = bcrypt.hashpw(password.encode(), salt).decode('utf-8')
        
        # Проверяем новый хеш
        verify_new = bcrypt.checkpw(password.encode(), new_hash.encode())
        
        # Проверяем предоставленный хеш (если есть)
        verify_old = False
        if test_hash:
            try:
                verify_old = bcrypt.checkpw(password.encode(), test_hash.encode())
            except:
                verify_old = False
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'password': password,
                'new_hash': new_hash,
                'verify_new': verify_new,
                'old_hash': test_hash,
                'verify_old': verify_old,
                'bcrypt_version': bcrypt.__version__
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Send POST with password and optional hash to test'}),
        'isBase64Encoded': False
    }
