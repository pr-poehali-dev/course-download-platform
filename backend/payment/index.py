"""
Business: Обработка платежей через Тинькофф Кассу с детальным логированием v2
Args: event с httpMethod, body, queryStringParameters
Returns: HTTP response с ссылкой на оплату или обработкой webhook уведомлений
"""

import json
import os
import hashlib
import psycopg2
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

TINKOFF_TERMINAL_KEY = os.environ.get('TINKOFF_TERMINAL_KEY', '1763583059270DEMO')
TINKOFF_PASSWORD = os.environ.get('TINKOFF_PASSWORD', 'Isvm4_ae1lIiD9RM')
# DEMO терминал использует тестовый URL
TINKOFF_API_URL = 'https://rest-api-test.tinkoff.ru/v2/'
DATABASE_URL = os.environ.get('DATABASE_URL', '')

BALANCE_PACKAGES = {
    '50': {'points': 50, 'price': 250, 'bonus': 0},
    '100': {'points': 100, 'price': 500, 'bonus': 20},
    '200': {'points': 200, 'price': 1000, 'bonus': 50},
    '500': {'points': 500, 'price': 2500, 'bonus': 150},
    '1000': {'points': 1000, 'price': 5000, 'bonus': 350},
}

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def generate_token(params: Dict[str, Any]) -> str:
    """Генерация токена по документации Тинькофф
    
    Алгоритм:
    1. Берем параметры (кроме Token, DATA, Receipt)
    2. Добавляем Password как обычный параметр
    3. Сортируем по ключам
    4. Конкатенируем значения
    5. SHA256
    """
    token_params = {}
    for key, value in params.items():
        if key not in ['Token', 'DATA', 'Receipt']:
            token_params[key] = str(value)
    
    # Password добавляется как параметр с ключом
    token_params['Password'] = TINKOFF_PASSWORD
    
    logger.info(f"[TOKEN_STEP1] Original params: {params}")
    logger.info(f"[TOKEN_STEP2] After adding Password: {token_params}")
    logger.info(f"[TOKEN_STEP3] Password value: '{TINKOFF_PASSWORD}' (length={len(TINKOFF_PASSWORD)})")
    logger.info(f"[TOKEN_STEP4] TerminalKey: '{TINKOFF_TERMINAL_KEY}'")
    
    # Сортируем ключи
    sorted_keys = sorted(token_params.keys())
    logger.info(f"[TOKEN_STEP5] Sorted keys: {sorted_keys}")
    
    # Конкатенируем значения по порядку отсортированных ключей
    values_list = [token_params[k] for k in sorted_keys]
    concatenated = ''.join(values_list)
    
    logger.info(f"[TOKEN_STEP6] Values list: {values_list}")
    logger.info(f"[TOKEN_STEP7] Concatenated string: '{concatenated}'")
    logger.info(f"[TOKEN_STEP8] Concatenated length: {len(concatenated)}")
    
    # SHA256 хеш
    token_hash = hashlib.sha256(concatenated.encode('utf-8')).hexdigest()
    
    logger.info(f"[TOKEN_STEP9] Final SHA256 hash: {token_hash}")
    
    return token_hash

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            'body': ''
        }
    
    if method == 'GET':
        query_params = event.get('queryStringParameters', {})
        
        if query_params.get('test') == 'token':
            test_params = {
                'TerminalKey': TINKOFF_TERMINAL_KEY,
                'Amount': 100000,
                'OrderId': 'test_order_12345'
            }
            test_token = generate_token(test_params)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'test_mode': True,
                    'params': test_params,
                    'generated_token': test_token,
                    'terminal_key': TINKOFF_TERMINAL_KEY,
                    'password_length': len(TINKOFF_PASSWORD),
                    'password_first_4': TINKOFF_PASSWORD[:4] if len(TINKOFF_PASSWORD) >= 4 else TINKOFF_PASSWORD
                })
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'provider': 'tinkoff',
                'ready': True
            })
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        logger.info(f"[DEBUG] POST request, action={action}, body_keys={list(body_data.keys())}")
        
        if 'TerminalKey' in body_data and 'Status' in body_data and not action:
            status = body_data.get('Status')
            order_id = body_data.get('OrderId')
            
            if status == 'CONFIRMED':
                order_parts = order_id.split('_')
                if len(order_parts) >= 3:
                    user_id = int(order_parts[1])
                    package_id = order_parts[2]
                    
                    if package_id in BALANCE_PACKAGES:
                        package = BALANCE_PACKAGES[package_id]
                        points = package['points'] + package['bonus']
                        
                        conn = get_db_connection()
                        cur = conn.cursor()
                        
                        try:
                            cur.execute("""
                                UPDATE t_p63326274_course_download_plat.users 
                                SET balance = balance + %s 
                                WHERE id = %s
                            """, (points, user_id))
                            
                            conn.commit()
                        finally:
                            cur.close()
                            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'OK': 'OK'})
            }
        
        if action == 'init_payment':
            user_id = body_data.get('user_id')
            package_id = body_data.get('package_id')
            
            logger.info(f"\n{'='*60}")
            logger.info(f"[INIT_PAYMENT] Starting payment initialization")
            logger.info(f"[INIT_PAYMENT] user_id={user_id}, package_id={package_id}")
            logger.info(f"[INIT_PAYMENT] Terminal='{TINKOFF_TERMINAL_KEY}'")
            logger.info(f"[INIT_PAYMENT] Password length={len(TINKOFF_PASSWORD)}")
            logger.info(f"[INIT_PAYMENT] Password first 4 chars='{TINKOFF_PASSWORD[:4]}...'")
            logger.info(f"{'='*60}\n")
            
            if not package_id or package_id not in BALANCE_PACKAGES:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid package_id'})
                }
            
            package = BALANCE_PACKAGES[package_id]
            amount_kopecks = package['price'] * 100
            order_id = f"order_{user_id}_{package_id}_{context.request_id[:8]}"
            
            success_url = body_data.get('success_url', 'https://techforma.pro/payment/success')
            fail_url = body_data.get('fail_url', 'https://techforma.pro/payment/failed')
            
            # Параметры для Init запроса
            init_params = {
                'TerminalKey': TINKOFF_TERMINAL_KEY,
                'Amount': amount_kopecks,  # число в копейках
                'OrderId': order_id
            }
            
            # Генерируем токен (внутри все будет конвертировано в строки)
            token = generate_token(init_params)
            
            # Добавляем Token и URL-ы к параметрам запроса
            init_params['Token'] = token
            init_params['SuccessURL'] = success_url
            init_params['FailURL'] = fail_url
            
            logger.info(f"\n{'='*60}")
            logger.info(f"[REQUEST_TO_TINKOFF] Sending to: {TINKOFF_API_URL}Init")
            logger.info(f"[REQUEST_TO_TINKOFF] Params: {json.dumps(init_params, ensure_ascii=False, indent=2)}")
            logger.info(f"{'='*60}\n")
            
            import urllib.request
            import urllib.error
            
            try:
                req = urllib.request.Request(
                    TINKOFF_API_URL + 'Init',
                    data=json.dumps(init_params).encode('utf-8'),
                    headers={'Content-Type': 'application/json'}
                )
                
                with urllib.request.urlopen(req) as response:
                    result = json.loads(response.read().decode('utf-8'))
                
                logger.info(f"\n{'='*60}")
                logger.info(f"[TINKOFF_RESPONSE] Response received:")
                logger.info(f"[TINKOFF_RESPONSE] {json.dumps(result, ensure_ascii=False, indent=2)}")
                logger.info(f"{'='*60}\n")
                
                if result.get('Success'):
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'payment_id': result.get('PaymentId'),
                            'payment_url': result.get('PaymentURL'),
                            'order_id': order_id
                        })
                    }
                else:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'error': result.get('Message', 'Payment init failed'),
                            'details': result.get('Details'),
                            'error_code': result.get('ErrorCode')
                        })
                    }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': str(e)})
                }
        
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Unknown action'})
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }