"""
Business: Обработка платежей через ЮКассу и Тинькофф Кассу (боевой терминал)
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
TINKOFF_TERMINAL_KEY = os.environ.get('TINKOFF_KEY', '')
TINKOFF_PASSWORD = os.environ.get('TINKOFF_PASSWORD', '')
DATABASE_URL = os.environ.get('DATABASE_URL', '')

TINKOFF_API_URL = 'https://securepay.tinkoff.ru/v2/'

BALANCE_PACKAGES = {
    '100': {'points': 100, 'price': 500, 'bonus': 10},
    '600': {'points': 600, 'price': 3000, 'bonus': 100},
    '1500': {'points': 1500, 'price': 7500, 'bonus': 300},
    '3000': {'points': 3000, 'price': 15000, 'bonus': 700},
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
    
    sorted_values = [str(token_params[k]) for k in sorted(token_params.keys())]
    concatenated = ''.join(sorted_values)
    
    return hashlib.sha256(concatenated.encode('utf-8')).hexdigest()

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
        
        # Определяем webhook от Тинькофф по наличию специфичных полей
        if 'TerminalKey' in body_data and 'Status' in body_data and not action:
            action = 'tinkoff_notification'
        
        if action == 'init_tinkoff':
            user_id = body_data.get('user_id')
            user_email = body_data.get('user_email')
            package_id = body_data.get('package_id')
            
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
            
            # URL для уведомлений от Тинькофф (webhook)
            # Используем URL из func2url.json
            import json as json_module
            try:
                with open('/function/backend/func2url.json', 'r') as f:
                    func_urls = json_module.load(f)
                    payment_url = func_urls.get('payment', 'https://functions.poehali.dev/4b9b82b8-34d8-43e7-a9ac-c3cb0bd67fb1')
            except:
                payment_url = 'https://functions.poehali.dev/4b9b82b8-34d8-43e7-a9ac-c3cb0bd67fb1'
            
            notification_url = f"{payment_url}?action=tinkoff_notification"
            
            init_params = {
                'TerminalKey': TINKOFF_TERMINAL_KEY,
                'Amount': amount_kopecks,
                'OrderId': order_id,
                'Description': f'Покупка {total_points} баллов',
                'NotificationURL': notification_url,
                'SuccessURL': success_url,
                'FailURL': fail_url
            }
            
            init_params['Token'] = generate_tinkoff_token(init_params)
            
            init_params['DATA'] = {
                'user_id': str(user_id),
                'user_email': user_email or '',
                'points': str(total_points),
                'package_id': package_id
            }
            
            init_params['Receipt'] = {
                'Email': user_email or 'noreply@techforma.pro',
                'Taxation': 'usn_income',
                'Items': [
                    {
                        'Name': f'Баллы TechForma',
                        'Price': amount_kopecks,
                        'Quantity': 1.00,
                        'Amount': amount_kopecks,
                        'Tax': 'none',
                        'PaymentMethod': 'full_payment',
                        'PaymentObject': 'service'
                    }
                ]
            }
            
            result = tinkoff_request('Init', init_params)
            
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
        
        if action == 'cancel_tinkoff':
            # Отмена платежа через API Тинькофф (для тестирования)
            payment_id = body_data.get('payment_id')
            
            if not payment_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'payment_id is required'})
                }
            
            cancel_params = {
                'TerminalKey': TINKOFF_TERMINAL_KEY,
                'PaymentId': str(payment_id)
            }
            
            cancel_params['Token'] = generate_tinkoff_token(cancel_params)
            
            result = tinkoff_request('Cancel', cancel_params)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result)
            }
        
        if action == 'tinkoff_notification':
            print(f"[TINKOFF] Received notification: {json.dumps(body_data, ensure_ascii=False)}")
            
            # КРИТИЧНО: Проверяем подпись webhook от Тинькофф
            received_token = body_data.get('Token', '')
            if received_token:
                # Генерируем ожидаемую подпись
                expected_token = generate_tinkoff_token(body_data)
                
                if received_token != expected_token:
                    print(f"[SECURITY] Invalid signature from Tinkoff webhook")
                    print(f"[SECURITY] Received: {received_token[:20]}...")
                    print(f"[SECURITY] Expected: {expected_token[:20]}...")
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'text/plain'},
                        'body': 'Invalid signature'
                    }
                
                print(f"[SECURITY] Webhook signature verified ✅")
            else:
                print(f"[WARN] No Token in webhook, skipping signature check (test mode?)")
            
            status = body_data.get('Status')
            payment_id = body_data.get('PaymentId')
            order_id = body_data.get('OrderId')
            
            print(f"[TINKOFF] Status={status}, PaymentId={payment_id}, OrderId={order_id}")
            
            if status == 'CONFIRMED':
                # Парсим OrderId: order_{user_id}_{package_id}_{request_id}
                order_parts = order_id.split('_')
                if len(order_parts) >= 3:
                    user_id = order_parts[1]
                    package_id = order_parts[2]
                else:
                    print(f"[ERROR] Cannot parse OrderId: {order_id}")
                    user_id = None
                    package_id = None
                
                # Получаем данные пакета
                if package_id and package_id in BALANCE_PACKAGES:
                    package = BALANCE_PACKAGES[package_id]
                    points = package['points'] + package['bonus']
                else:
                    points = 0
                
                if user_id and points > 0:
                    conn = get_db_connection()
                    cur = conn.cursor()
                    
                    try:
                        # ИДЕМПОТЕНТНОСТЬ: Проверяем, не обработан ли уже этот платёж
                        cur.execute("""
                            SELECT id FROM t_p63326274_course_download_plat.payments 
                            WHERE payment_id = %s
                        """, (str(payment_id),))
                        
                        if cur.fetchone():
                            print(f"[IDEMPOTENCY] Payment {payment_id} already processed, skipping")
                            conn.close()
                            return {
                                'statusCode': 200,
                                'headers': {'Content-Type': 'text/plain'},
                                'body': 'OK (already processed)'
                            }
                        
                        # Получаем email пользователя
                        cur.execute("""
                            SELECT email FROM t_p63326274_course_download_plat.users 
                            WHERE id = %s
                        """, (int(user_id),))
                        
                        user_record = cur.fetchone()
                        user_email = user_record[0] if user_record else ''
                        
                        # Начисляем баллы
                        cur.execute("""
                            UPDATE t_p63326274_course_download_plat.users 
                            SET balance = balance + %s 
                            WHERE id = %s
                        """, (points, int(user_id)))
                        
                        print(f"[TINKOFF] Updated balance for user_id={user_id}, added {points} points")
                        
                        # Записываем транзакцию
                        cur.execute("""
                            INSERT INTO t_p63326274_course_download_plat.transactions
                            (user_id, amount, type, description)
                            VALUES (%s, %s, 'balance_topup', %s)
                        """, (int(user_id), points, f'Пополнение через Тинькофф: {points} баллов'))
                        
                        amount_rubles = float(body_data.get('Amount', 0)) / 100
                        
                        # Записываем платёж
                        cur.execute("""
                            INSERT INTO t_p63326274_course_download_plat.payments 
                            (user_email, points, amount, payment_id, status, created_at)
                            VALUES (%s, %s, %s, %s, 'succeeded', NOW())
                        """, (user_email, points, amount_rubles, str(payment_id)))
                        
                        conn.commit()
                        print(f"[SUCCESS] Payment {payment_id} processed successfully")
                    
                    except Exception as e:
                        conn.rollback()
                        print(f"[ERROR] Failed to process payment {payment_id}: {e}")
                        # В production можно добавить отправку alert
                    
                    finally:
                        cur.close()
                        conn.close()
                else:
                    print(f"[WARN] Cannot process payment: user_id={user_id}, points={points}")
            
            elif status == 'REFUNDED' or status == 'PARTIAL_REFUNDED':
                # Обработка возврата средств
                # Тинькофф не передаёт DATA в уведомлении о возврате, поэтому ищем исходный платёж в БД
                conn = get_db_connection()
                cur = conn.cursor()
                
                try:
                    # Находим исходный платёж по payment_id
                    cur.execute("""
                        SELECT user_email, points FROM t_p63326274_course_download_plat.payments 
                        WHERE payment_id = %s AND status = 'succeeded'
                        LIMIT 1
                    """, (str(payment_id),))
                    
                    payment_record = cur.fetchone()
                    
                    if payment_record:
                        user_email, points = payment_record
                        
                        # Находим user_id по email
                        cur.execute("""
                            SELECT id FROM t_p63326274_course_download_plat.users 
                            WHERE email = %s
                            LIMIT 1
                        """, (user_email,))
                        
                        user_record = cur.fetchone()
                        
                        if user_record and points > 0:
                            user_id = user_record[0]
                            
                            # Списываем баллы у пользователя
                            cur.execute("""
                                UPDATE t_p63326274_course_download_plat.users 
                                SET balance = GREATEST(balance - %s, 0)
                                WHERE id = %s
                            """, (points, user_id))
                            
                            # Записываем транзакцию возврата
                            cur.execute("""
                                INSERT INTO t_p63326274_course_download_plat.transactions
                                (user_id, amount, type, description)
                                VALUES (%s, %s, 'refund', %s)
                            """, (user_id, -points, f'Возврат платежа Тинькофф (PaymentId: {payment_id})'))
                            
                            # Обновляем статус платежа
                            cur.execute("""
                                UPDATE t_p63326274_course_download_plat.payments 
                                SET status = 'refunded'
                                WHERE payment_id = %s
                            """, (str(payment_id),))
                            
                            conn.commit()
                            print(f"[INFO] Refund processed: user_id={user_id}, points={points}")
                        else:
                            print(f"[WARN] Cannot process refund: user not found or points=0 for payment_id={payment_id}")
                    else:
                        print(f"[WARN] Cannot process refund: original payment not found for payment_id={payment_id}")
                        
                finally:
                    cur.close()
                    conn.close()
            
            elif status == 'CANCELED' or status == 'REJECTED':
                # Платёж отменён или отклонён — ничего не делаем, но логируем
                print(f"[INFO] Payment {payment_id} status: {status} (OrderId: {order_id})")
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': 'OK'
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
        
        if action == 'request_refund':
            # Обработка запроса на возврат от пользователя
            user_id = body_data.get('user_id')
            transaction_id = body_data.get('transaction_id')
            reason = body_data.get('reason', '')
            
            if not user_id or not transaction_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'user_id и transaction_id обязательны'})
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            try:
                # Проверяем существование транзакции
                cur.execute("""
                    SELECT t.id, t.amount, t.created_at, t.user_id, u.balance
                    FROM t_p63326274_course_download_plat.transactions t
                    JOIN t_p63326274_course_download_plat.users u ON t.user_id = u.id
                    WHERE t.id = %s AND t.user_id = %s AND t.transaction_type = 'balance_topup'
                """, (transaction_id, user_id))
                
                transaction = cur.fetchone()
                
                if not transaction:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Транзакция не найдена'})
                    }
                
                trans_id, amount, created_at, trans_user_id, current_balance = transaction
                
                # Проверяем, что прошло менее 24 часов
                from datetime import datetime, timedelta
                if datetime.now() - created_at > timedelta(hours=24):
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Прошло более 24 часов с момента покупки. Возврат невозможен.'})
                    }
                
                # Проверяем, что баллы не были потрачены
                if current_balance < amount:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Баллы уже были частично использованы. Возврат невозможен.'})
                    }
                
                # Создаём запрос на возврат
                cur.execute("""
                    INSERT INTO t_p63326274_course_download_plat.refund_requests
                    (user_id, transaction_id, amount, reason, status, created_at)
                    VALUES (%s, %s, %s, %s, 'pending', NOW())
                    RETURNING id
                """, (user_id, transaction_id, amount, reason))
                
                refund_request_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'refund_request_id': refund_request_id,
                        'message': 'Запрос на возврат создан. Администратор рассмотрит его в течение 1-2 рабочих дней.'
                    })
                }
            except Exception as e:
                conn.rollback()
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': f'Ошибка: {str(e)}'})
                }
            finally:
                cur.close()
                conn.close()
        
        if action == 'admin_process_refund':
            # Обработка возврата администратором (одобрение/отклонение)
            admin_user_id = body_data.get('admin_user_id')
            refund_request_id = body_data.get('refund_request_id')
            decision = body_data.get('decision')  # 'approve' или 'reject'
            admin_comment = body_data.get('admin_comment', '')
            
            if not all([admin_user_id, refund_request_id, decision]):
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Недостаточно параметров'})
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            try:
                # Проверяем права админа
                cur.execute("""
                    SELECT role FROM t_p63326274_course_download_plat.users WHERE id = %s
                """, (admin_user_id,))
                
                admin_role = cur.fetchone()
                if not admin_role or admin_role[0] != 'admin':
                    return {
                        'statusCode': 403,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Недостаточно прав'})
                    }
                
                # Получаем информацию о запросе на возврат
                cur.execute("""
                    SELECT user_id, transaction_id, amount, status
                    FROM t_p63326274_course_download_plat.refund_requests
                    WHERE id = %s
                """, (refund_request_id,))
                
                refund_req = cur.fetchone()
                if not refund_req:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Запрос на возврат не найден'})
                    }
                
                user_id, transaction_id, amount, status = refund_req
                
                if status != 'pending':
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Запрос уже обработан'})
                    }
                
                if decision == 'approve':
                    # Списываем баллы у пользователя
                    cur.execute("""
                        UPDATE t_p63326274_course_download_plat.users
                        SET balance = balance - %s
                        WHERE id = %s AND balance >= %s
                    """, (amount, user_id, amount))
                    
                    if cur.rowcount == 0:
                        return {
                            'statusCode': 400,
                            'headers': {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            'body': json.dumps({'error': 'Недостаточно баллов на балансе'})
                        }
                    
                    # Записываем транзакцию возврата
                    cur.execute("""
                        INSERT INTO t_p63326274_course_download_plat.transactions
                        (user_id, amount, transaction_type, description)
                        VALUES (%s, %s, 'refund', %s)
                    """, (user_id, -amount, f'Возврат средств по запросу #{refund_request_id}'))
                    
                    # Обновляем статус запроса
                    cur.execute("""
                        UPDATE t_p63326274_course_download_plat.refund_requests
                        SET status = 'approved', admin_comment = %s, processed_at = NOW()
                        WHERE id = %s
                    """, (admin_comment, refund_request_id))
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': True,
                            'message': f'Возврат одобрен. {amount} баллов списано с баланса пользователя.'
                        })
                    }
                elif decision == 'reject':
                    # Отклоняем запрос
                    cur.execute("""
                        UPDATE t_p63326274_course_download_plat.refund_requests
                        SET status = 'rejected', admin_comment = %s, processed_at = NOW()
                        WHERE id = %s
                    """, (admin_comment, refund_request_id))
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': True,
                            'message': 'Запрос на возврат отклонён.'
                        })
                    }
                else:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Неверное решение'})
                    }
            except Exception as e:
                conn.rollback()
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': f'Ошибка: {str(e)}'})
                }
            finally:
                cur.close()
                conn.close()
        
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