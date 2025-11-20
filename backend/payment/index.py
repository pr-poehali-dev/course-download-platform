"""
Business: Обработка платежей через Тинькофф Кассу с детальным логированием
Args: event с httpMethod, body, queryStringParameters
Returns: HTTP response с ссылкой на оплату или обработкой webhook уведомлений
"""

import json
import os
import hashlib
import psycopg2
from typing import Dict, Any

TINKOFF_TERMINAL_KEY = os.environ.get('TINKOFF_TERMINAL_KEY', '')
TINKOFF_PASSWORD = os.environ.get('TINKOFF_PASSWORD', '')
TINKOFF_API_URL = 'https://securepay.tinkoff.ru/v2/'
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
    """Генерация токена по документации Тинькофф"""
    token_params = {}
    for key, value in params.items():
        if key not in ['Token', 'DATA', 'Receipt']:
            token_params[key] = str(value)
    
    token_params['Password'] = TINKOFF_PASSWORD
    
    sorted_keys = sorted(token_params.keys())
    concatenated = ''.join([str(token_params[k]) for k in sorted_keys])
    
    return hashlib.sha256(concatenated.encode('utf-8')).hexdigest()

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
        
        print(f"[DEBUG] POST request, action={action}, body_keys={list(body_data.keys())}")
        
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
            
            print(f"[INIT_PAYMENT] user_id={user_id}, package_id={package_id}")
            print(f"[INIT_PAYMENT] Terminal={TINKOFF_TERMINAL_KEY}, PwdLen={len(TINKOFF_PASSWORD)}")
            
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
            
            init_params = {
                'TerminalKey': TINKOFF_TERMINAL_KEY,
                'Amount': amount_kopecks,
                'OrderId': order_id
            }
            
            token = generate_token(init_params)
            
            init_params['Token'] = token
            init_params['SuccessURL'] = success_url
            init_params['FailURL'] = fail_url
            
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
                
                print(f"[TINKOFF_RESPONSE] {json.dumps(result, ensure_ascii=False)}")
                
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