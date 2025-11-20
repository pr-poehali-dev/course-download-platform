"""
Business: Обработка платежей через ЮКассу и Тинькофф Кассу
Args: event с httpMethod, body, queryStringParameters
Returns: HTTP response с ссылкой на оплату или обработкой уведомлений
"""

import json
import os
import uuid
import hashlib
import psycopg2
from typing import Dict, Any
from yookassa import Configuration, Payment
import urllib.request

SHOP_ID = os.environ.get('YOOKASSA_SHOP_ID', '')
SECRET_KEY = os.environ.get('YOOKASSA_SECRET_KEY', '')
TINKOFF_TERMINAL_KEY = '1763583059270DEMO'
TINKOFF_PASSWORD = 'Isvm4_ae1lIiD9RM'
DATABASE_URL = os.environ.get('DATABASE_URL', '')

print(f"[INIT_V5_DEBUG] Terminal: {TINKOFF_TERMINAL_KEY}")
print(f"[INIT_V5_DEBUG] Password chars: {[c for c in TINKOFF_PASSWORD]}")
print(f"[INIT_V5_DEBUG] Password length: {len(TINKOFF_PASSWORD)}")

TINKOFF_API_URL = 'https://securepay.tinkoff.ru/v2/'

BALANCE_PACKAGES = {
    '50': {'points': 50, 'price': 250, 'bonus': 0},
    '100': {'points': 100, 'price': 500, 'bonus': 20},
    '200': {'points': 200, 'price': 1000, 'bonus': 50},
    '500': {'points': 500, 'price': 2500, 'bonus': 150},
    '1000': {'points': 1000, 'price': 5000, 'bonus': 350},
}

if SHOP_ID and SECRET_KEY:
    Configuration.account_id = SHOP_ID
    Configuration.secret_key = SECRET_KEY

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def generate_tinkoff_token(params: Dict[str, Any]) -> str:
    """Генерация токена для подписи запроса к Тинькофф"""
    token_params = {k: str(v) for k, v in params.items() if k != 'Token' and k != 'DATA' and k != 'Receipt'}
    token_params['Password'] = TINKOFF_PASSWORD
    
    print(f"[TOKEN_GEN] Token params keys (sorted): {sorted(token_params.keys())}")
    print(f"[TOKEN_GEN] Token params values: {[(k, token_params[k]) for k in sorted(token_params.keys())]}")
    
    sorted_values = [str(token_params[k]) for k in sorted(token_params.keys())]
    concatenated = ''.join(sorted_values)
    
    print(f"[TOKEN_GEN] Concatenated string: {concatenated}")
    print(f"[TOKEN_GEN] Concatenated length: {len(concatenated)}")
    
    token = hashlib.sha256(concatenated.encode('utf-8')).hexdigest()
    print(f"[TOKEN_GEN] Generated token: {token}")
    
    return token

def tinkoff_request(endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Отправка запроса к API Тинькофф"""
    url = TINKOFF_API_URL + endpoint
    
    json_data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(
        url,
        data=json_data,
        headers={'Content-Type': 'application/json'}
    )
    
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Email',
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
                'ready': bool(TINKOFF_TERMINAL_KEY and TINKOFF_PASSWORD),
                'yookassa_ready': bool(SHOP_ID and SECRET_KEY)
            })
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        provider = body_data.get('provider', 'yookassa')
        
        print(f"[PAYMENT] POST request, action={action}, body_keys={list(body_data.keys())}")
        
        # Определяем webhook от Тинькофф по наличию TerminalKey и Status
        if 'TerminalKey' in body_data and 'Status' in body_data and not action:
            print(f"[TINKOFF_WEBHOOK] Detected webhook: Status={body_data.get('Status')}, PaymentId={body_data.get('PaymentId')}")
            status = body_data.get('Status')
            payment_id = body_data.get('PaymentId')
            order_id = body_data.get('OrderId')
            
            if status == 'CONFIRMED':
                print(f"[TINKOFF_WEBHOOK] Payment confirmed: {order_id}")
                
                # Извлекаем user_id и points из OrderId (формат: order_{user_id}_{package_id}_{random})
                order_parts = order_id.split('_')
                if len(order_parts) >= 3:
                    user_id = order_parts[1]
                    package_id = order_parts[2]
                    
                    print(f"[TINKOFF_WEBHOOK] Parsed: user_id={user_id}, package_id={package_id}")
                    
                    if package_id in BALANCE_PACKAGES:
                        package = BALANCE_PACKAGES[package_id]
                        points = package['points'] + package['bonus']
                        
                        print(f"[TINKOFF_WEBHOOK] Crediting {points} points to user {user_id}")
                        
                        conn = get_db_connection()
                        cur = conn.cursor()
                        
                        try:
                            cur.execute("""
                                UPDATE t_p63326274_course_download_plat.users 
                                SET balance = balance + %s 
                                WHERE id = %s
                            """, (points, int(user_id)))
                            
                            cur.execute("""
                                INSERT INTO t_p63326274_course_download_plat.transactions
                                (user_id, amount, transaction_type, description)
                                VALUES (%s, %s, 'balance_topup', %s)
                            """, (int(user_id), points, f'Пополнение через Тинькофф: {points} баллов'))
                            
                            amount_rubles = float(body_data.get('Amount', 0)) / 100
                            
                            cur.execute("""
                                SELECT email FROM t_p63326274_course_download_plat.users WHERE id = %s
                            """, (int(user_id),))
                            user_email_row = cur.fetchone()
                            user_email = user_email_row[0] if user_email_row else ''
                            
                            cur.execute("""
                                INSERT INTO t_p63326274_course_download_plat.payments 
                                (user_email, points, amount, payment_id, status, created_at)
                                VALUES (%s, %s, %s, %s, 'succeeded', NOW())
                            """, (user_email, points, amount_rubles, str(payment_id)))
                            
                            conn.commit()
                            print(f"[TINKOFF_WEBHOOK] Successfully credited {points} points to user {user_id}")
                        except Exception as e:
                            print(f"[TINKOFF_WEBHOOK] Error: {e}")
                            conn.rollback()
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
        
        if action == 'init_tinkoff':
            user_id = body_data.get('user_id')
            user_email = body_data.get('user_email')
            package_id = body_data.get('package_id')
            
            print(f"[TINKOFF] Init payment: user_id={user_id}, package_id={package_id}, email={user_email}")
            
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
            total_points = package['points'] + package['bonus']
            amount_kopecks = package['price'] * 100
            
            order_id = f"order_{user_id}_{package_id}_{context.request_id[:8]}"
            
            success_url = body_data.get('success_url', 'https://techforma.pro/payment/success')
            fail_url = body_data.get('fail_url', 'https://techforma.pro/payment/failed')
            
            # Сначала создаём параметры БЕЗ DATA для генерации токена - только обязательные
            token_params = {
                'TerminalKey': TINKOFF_TERMINAL_KEY,
                'Amount': amount_kopecks,
                'OrderId': order_id
            }
            
            # Генерируем токен
            token = generate_tinkoff_token(token_params)
            
            # Теперь создаём полный набор параметров с токеном и DATA
            init_params = {
                'TerminalKey': TINKOFF_TERMINAL_KEY,
                'Amount': amount_kopecks,
                'OrderId': order_id,
                'Token': token,
                'DATA': {
                    'user_id': str(user_id),
                    'user_email': user_email or '',
                    'points': str(total_points),
                    'package_id': package_id
                },
                'SuccessURL': success_url,
                'FailURL': fail_url
            }
            
            print(f"[TINKOFF] Sending Init request: OrderId={order_id}, Amount={amount_kopecks}")
            print(f"[TINKOFF] Init params keys: {list(init_params.keys())}")
            print(f"[TINKOFF] Token length: {len(init_params.get('Token', ''))}")
            result = tinkoff_request('Init', init_params)
            print(f"[TINKOFF] Response: Success={result.get('Success')}, ErrorCode={result.get('ErrorCode')}, Message={result.get('Message')}")
            if not result.get('Success'):
                print(f"[TINKOFF] Full error response: {result}")
            
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
                        'order_id': order_id,
                        'status': result.get('Status')
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
        
        if action == 'tinkoff_notification':
            status = body_data.get('Status')
            payment_id = body_data.get('PaymentId')
            
            if status == 'CONFIRMED':
                data_field = body_data.get('DATA', {})
                user_id = data_field.get('user_id')
                user_email = data_field.get('user_email')
                points = int(data_field.get('points', 0)) if data_field.get('points') else 0
                
                if user_id and points > 0:
                    conn = get_db_connection()
                    cur = conn.cursor()
                    
                    try:
                        cur.execute("""
                            UPDATE t_p63326274_course_download_plat.users 
                            SET balance = balance + %s 
                            WHERE id = %s
                        """, (points, int(user_id)))
                        
                        cur.execute("""
                            INSERT INTO t_p63326274_course_download_plat.transactions
                            (user_id, amount, transaction_type, description)
                            VALUES (%s, %s, 'balance_topup', %s)
                        """, (int(user_id), points, f'Пополнение через Тинькофф: {points} баллов'))
                        
                        amount_rubles = float(body_data.get('Amount', 0)) / 100
                        
                        cur.execute("""
                            INSERT INTO t_p63326274_course_download_plat.payments 
                            (user_email, points, amount, payment_id, status, created_at)
                            VALUES (%s, %s, %s, %s, 'succeeded', NOW())
                        """, (user_email or '', points, amount_rubles, str(payment_id)))
                        
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
        
        if action == 'create_payment':
            user_email = body_data.get('user_email')
            user_id = body_data.get('user_id')
            package_id = body_data.get('package_id')
            points = body_data.get('points', 0)
            price = body_data.get('price', 0)
            payment_type = body_data.get('payment_type', 'points')  # 'points' or 'premium'
            
            if package_id and package_id in BALANCE_PACKAGES:
                package = BALANCE_PACKAGES[package_id]
                points = package['points']
                price = package['price']
            
            if not user_email or not price:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing required fields'})
                }
            
            idempotence_key = str(uuid.uuid4())
            
            if payment_type == 'premium':
                description = "Подписка Premium на 30 дней"
            else:
                description = f"Покупка {points} баллов"
            
            payment = Payment.create({
                "amount": {
                    "value": str(price),
                    "currency": "RUB"
                },
                "confirmation": {
                    "type": "redirect",
                    "return_url": body_data.get('return_url', 'https://example.com/success')
                },
                "capture": True,
                "description": description,
                "metadata": {
                    "user_email": user_email,
                    "user_id": str(user_id) if user_id else "",
                    "points": str(points),
                    "payment_type": payment_type
                }
            }, idempotence_key)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'payment_id': payment.id,
                    'confirmation_url': payment.confirmation.confirmation_url,
                    'status': payment.status
                })
            }
        
        if action == 'webhook':
            notification_type = body_data.get('event')
            
            if notification_type == 'payment.succeeded':
                payment_obj = body_data.get('object', {})
                payment_id = payment_obj.get('id')
                metadata = payment_obj.get('metadata', {})
                user_email = metadata.get('user_email')
                user_id = metadata.get('user_id')
                points = int(metadata.get('points', 0)) if metadata.get('points') else 0
                payment_type = metadata.get('payment_type', 'points')
                
                conn = get_db_connection()
                cur = conn.cursor()
                
                try:
                    if payment_type == 'premium' and user_id:
                        # Активировать Premium подписку
                        from datetime import datetime, timedelta
                        expires_at = datetime.now() + timedelta(days=30)
                        
                        cur.execute("""
                            UPDATE t_p63326274_course_download_plat.users 
                            SET is_premium = TRUE, premium_expires_at = %s
                            WHERE id = %s
                        """, (expires_at, int(user_id)))
                        
                        cur.execute("""
                            INSERT INTO t_p63326274_course_download_plat.subscriptions
                            (user_id, subscription_type, amount, status, starts_at, expires_at, payment_id)
                            VALUES (%s, 'premium_monthly', 299, 'active', NOW(), %s, %s)
                        """, (int(user_id), expires_at, payment_id))
                        
                        conn.commit()
                    
                    elif user_email and points > 0:
                        # Начислить баллы
                        cur.execute("""
                            UPDATE t_p63326274_course_download_plat.users 
                            SET balance = balance + %s 
                            WHERE email = %s
                        """, (points, user_email))
                        
                        cur.execute("""
                            INSERT INTO t_p63326274_course_download_plat.transactions
                            (user_id, amount, transaction_type, description)
                            SELECT id, %s, 'balance_topup', 'Пополнение баланса'
                            FROM t_p63326274_course_download_plat.users WHERE email = %s
                        """, (points, user_email))
                        
                        conn.commit()
                    
                    # Записать платёж
                    cur.execute("""
                        INSERT INTO t_p63326274_course_download_plat.payments 
                        (user_email, points, amount, payment_id, status, created_at)
                        VALUES (%s, %s, %s, %s, 'succeeded', NOW())
                    """, (user_email, points, float(payment_obj.get('amount', {}).get('value', 0)), payment_id))
                    
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
                    'body': json.dumps({'status': 'ok'})
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'status': 'ok'})
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