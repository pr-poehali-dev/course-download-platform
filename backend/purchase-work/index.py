"""
Business: Покупка работы — проверка баланса, списание баллов, создание записи о покупке, уведомление автора
Args: event - dict с httpMethod, body (workId, userId, price)
      context - объект с request_id
Returns: Статус покупки и разрешение на скачивание
"""
import json
import os
from typing import Dict, Any
import psycopg2

# Загружаем func2url для отправки email через support API
try:
    with open('/function/backend/func2url.json', 'r') as f:
        func2url = json.load(f)
except:
    func2url = {}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {})
    action = params.get('action', 'purchase')
    
    if method == 'GET' and action == 'order-status':
        return get_order_status(event)
    
    if method == 'POST' and action == 'create-order':
        return create_order(event)
    
    if method == 'POST' and action == 'mock-pay':
        return mock_payment(event)
    
    if method == 'POST' and action == 'generate-token':
        return generate_download_token(event)
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_str = event.get('body') or '{}'
        body = json.loads(body_str) if body_str else {}
        work_id = body.get('workId')
        user_id = body.get('userId')
        client_price = body.get('price')
        
        print(f"[PURCHASE] Starting purchase: user_id={user_id}, work_id={work_id}, client_price={client_price}")
        
        if not all([work_id, user_id]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'workId and userId required'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(dsn)
        conn.autocommit = False
        cur = conn.cursor()
        
        try:
            # Проверяем существование работы и получаем РЕАЛЬНУЮ цену из БД
            cur.execute(
                "SELECT id, author_id, title, price_points FROM t_p63326274_course_download_plat.works WHERE id = %s",
                (work_id,)
            )
            work_result = cur.fetchone()
            
            if not work_result:
                conn.rollback()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Work not found'}),
                    'isBase64Encoded': False
                }
            
            db_work_id = work_result[0]
            work_author_id = work_result[1]
            work_title = work_result[2]
            price = work_result[3]
            
            # КРИТИЧНО: Игнорируем цену от клиента, используем только из БД
            if client_price and client_price != price:
                print(f"⚠️ SECURITY: Price manipulation attempt! User {user_id} tried to buy work {work_id} for {client_price}, real price is {price}")
                # Логируем попытку мошенничества
                cur.execute(
                    """INSERT INTO t_p63326274_course_download_plat.security_logs 
                    (user_id, event_type, details, ip_address) 
                    VALUES (%s, %s, %s, %s)""",
                    (user_id, 'price_manipulation', f'Attempted to pay {client_price} instead of {price} for work {work_id}', 
                     event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown'))
                )
            
            # КРИТИЧНО: Запрещаем авторам покупать свои работы
            if work_author_id and int(user_id) == int(work_author_id):
                conn.rollback()
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Вы не можете купить свою собственную работу'}),
                    'isBase64Encoded': False
                }
            
            # Проверяем роль пользователя из базы данных
            cur.execute(
                "SELECT balance, role, email FROM t_p63326274_course_download_plat.users WHERE id = %s",
                (user_id,)
            )
            user_result = cur.fetchone()
            
            if not user_result:
                conn.rollback()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            balance = user_result[0]
            role = user_result[1] if user_result[1] else 'user'
            buyer_email = user_result[2] if len(user_result) > 2 else None
            is_admin = (role == 'admin')
            
            print(f"[PURCHASE] User data: balance={balance}, role={role}, is_admin={is_admin}, price={price}")
            
            # Проверяем баланс только для не-админов
            if not is_admin and balance < price:
                conn.rollback()
                
                # Генерируем ссылку на пополнение баланса
                base_url = event.get('headers', {}).get('origin', 'https://techforma.pro')
                topup_url = f"{base_url}/buy-points"
                
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'error': 'Insufficient balance',
                        'balance': balance,
                        'required': price,
                        'payUrl': topup_url
                    }),
                    'isBase64Encoded': False
                }
            
            # Проверяем количество покупок за последний час (анти-фрод)
            cur.execute(
                """SELECT COUNT(*) FROM t_p63326274_course_download_plat.purchases 
                WHERE buyer_id = %s AND created_at > NOW() - INTERVAL '1 hour'""",
                (user_id,)
            )
            recent_purchases = cur.fetchone()[0]
            if recent_purchases >= 10:
                conn.rollback()
                return {
                    'statusCode': 429,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Слишком много покупок за последний час. Подождите немного.'}),
                    'isBase64Encoded': False
                }
            
            # Проверяем, не куплена ли уже эта работа
            cur.execute(
                "SELECT id FROM t_p63326274_course_download_plat.purchases WHERE buyer_id = %s AND work_id = %s",
                (user_id, db_work_id)
            )
            
            existing_purchase = cur.fetchone()
            if existing_purchase:
                print(f"[PURCHASE] Work already purchased, generating re-download token")
                # Генерируем новый токен для повторного скачивания
                import secrets
                from datetime import datetime, timedelta
                
                download_token = secrets.token_urlsafe(48)
                token_expires_at = datetime.now() + timedelta(minutes=30)
                ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
                
                cur.execute(
                    """INSERT INTO t_p63326274_course_download_plat.download_tokens 
                    (token, user_id, work_id, expires_at, ip_address) 
                    VALUES (%s, %s, %s, %s, %s)""",
                    (download_token, user_id, db_work_id, token_expires_at, ip_address)
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'alreadyPurchased': True,
                        'downloadToken': download_token,
                        'message': 'Work already purchased'
                    }),
                    'isBase64Encoded': False
                }
            
            # Списываем баллы (только если не админ)
            if not is_admin:
                print(f"[PURCHASE] Deducting {price} points from user {user_id}, current balance: {balance}")
                cur.execute(
                    "UPDATE t_p63326274_course_download_plat.users SET balance = balance - %s WHERE id = %s",
                    (price, user_id)
                )
            else:
                print(f"[PURCHASE] Admin user - skipping balance deduction")
            
            # Создаём запись о покупке с комиссией 15%
            commission = int(price * 0.10)
            cur.execute(
                """INSERT INTO t_p63326274_course_download_plat.purchases 
                (buyer_id, work_id, price_paid, commission) VALUES (%s, %s, %s, %s) RETURNING id""",
                (user_id, db_work_id, price, commission)
            )
            purchase_id = cur.fetchone()[0]
            
            # author_id уже получен в work_result выше
            author_id = work_author_id
            
            # Если есть автор, начисляем ему 90% (price - 10% комиссии)
            if author_id:
                author_share = int(price * 0.90)
                platform_fee = int(price * 0.10)
                
                # Начисляем автору 90% от цены работы
                cur.execute(
                    "UPDATE t_p63326274_course_download_plat.users SET balance = balance + %s WHERE id = %s",
                    (author_share, author_id)
                )
                
                # Записываем транзакцию выплаты
                cur.execute(
                    """INSERT INTO t_p63326274_course_download_plat.author_earnings 
                    (author_id, work_id, purchase_id, sale_amount, author_share, platform_fee, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (author_id, db_work_id, purchase_id, price, author_share, platform_fee, 'paid')
                )
                
                # Записываем транзакцию списания баллов у покупателя
                cur.execute(
                    """INSERT INTO t_p63326274_course_download_plat.transactions
                    (user_id, amount, transaction_type, description)
                    VALUES (%s, %s, %s, %s)""",
                    (user_id, -price, 'purchase', f'Покупка работы #{db_work_id}')
                )
                
                # Записываем транзакцию начисления автору
                cur.execute(
                    """INSERT INTO t_p63326274_course_download_plat.transactions
                    (user_id, amount, transaction_type, description)
                    VALUES (%s, %s, %s, %s)""",
                    (author_id, author_share, 'sale', f'Продажа работы #{db_work_id} (комиссия 15%)')
                )
                
                # Получаем email автора для уведомления
                cur.execute(
                    "SELECT email, username FROM t_p63326274_course_download_plat.users WHERE id = %s",
                    (author_id,)
                )
                author_result = cur.fetchone()
                author_email = author_result[0] if author_result else None
                author_username = author_result[1] if author_result else 'Автор'
                
                # Отправляем email автору о продаже его работы
                if author_email:
                    try:
                        import requests
                        support_url = func2url.get('support')
                        if support_url:
                            requests.post(
                                support_url,
                                json={
                                    'email': author_email,
                                    'subject': f'🎉 Ваша работа "{work_title}" куплена!',
                                    'message': f'''Здравствуйте, {author_username}!
                                    
Отличная новость! Вашу работу "{work_title}" только что приобрели.

💰 Начислено на баланс: {author_share} баллов
📊 Комиссия платформы: {platform_fee} баллов (10%)
💳 Стоимость работы: {price} баллов

Теперь у вас на балансе ещё больше баллов для покупки других работ!

С уважением,
Команда платформы'''
                                },
                                timeout=5
                            )
                    except Exception as email_err:
                        print(f"[WARN] Failed to send author notification: {email_err}")
            
            # Обновляем счётчик скачиваний
            cur.execute(
                "UPDATE t_p63326274_course_download_plat.works SET downloads = downloads + 1 WHERE id = %s",
                (db_work_id,)
            )
            
            # Генерируем временный токен для скачивания (30 минут)
            import secrets
            from datetime import datetime, timedelta
            
            download_token = secrets.token_urlsafe(48)
            token_expires_at = datetime.now() + timedelta(minutes=30)
            ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
            
            cur.execute(
                """INSERT INTO t_p63326274_course_download_plat.download_tokens 
                (token, user_id, work_id, expires_at, ip_address) 
                VALUES (%s, %s, %s, %s, %s)""",
                (download_token, user_id, db_work_id, token_expires_at, ip_address)
            )
            
            conn.commit()
            
            new_balance = balance if is_admin else balance - price
            print(f"[PURCHASE] Purchase completed! New balance: {new_balance}, token: {download_token[:20]}...")
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'newBalance': new_balance,
                    'message': 'Purchase successful',
                    'isAdmin': is_admin,
                    'downloadToken': download_token,
                    'tokenExpiresIn': 1800
                }),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        print(f"[ERROR] Purchase failed: {type(e).__name__}: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Purchase failed: {str(e)}'}),
            'isBase64Encoded': False
        }

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    conn.autocommit = False
    return conn

def user_has_paid(cur, user_id: int, work_id: int) -> bool:
    cur.execute(
        """
        SELECT 1 FROM t_p63326274_course_download_plat.purchases 
        WHERE buyer_id = %s AND work_id = %s
        UNION
        SELECT 1 FROM t_p63326274_course_download_plat.orders 
        WHERE user_id = %s AND work_id = %s AND status = 'paid'
        LIMIT 1
        """,
        (user_id, work_id, user_id, work_id)
    )
    return cur.fetchone() is not None

def create_order(event: Dict[str, Any]) -> Dict[str, Any]:
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    work_id = body_data.get('workId')
    
    if not work_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'workId обязателен'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT id, title, price FROM t_p63326274_course_download_plat.works WHERE id = %s",
            (work_id,)
        )
        work = cur.fetchone()
        
        if not work:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Работа не найдена'}),
                'isBase64Encoded': False
            }
        
        work_id_db, title, price = work
        
        if user_has_paid(cur, int(user_id), work_id_db):
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'ok': True,
                    'alreadyPaid': True,
                    'message': 'Работа уже куплена'
                }),
                'isBase64Encoded': False
            }
        
        cur.execute(
            """
            SELECT id, status, amount_cents FROM t_p63326274_course_download_plat.orders 
            WHERE user_id = %s AND work_id = %s AND status = 'pending'
            ORDER BY created_at DESC LIMIT 1
            """,
            (user_id, work_id)
        )
        existing_order = cur.fetchone()
        
        if existing_order:
            order_id, status, amount_cents = existing_order
            site_url = os.environ.get('SITE_URL', 'https://techforma.pro')
            pay_url = f"{site_url}/buy-points"
            
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'ok': True,
                    'orderId': order_id,
                    'amount_cents': amount_cents,
                    'payUrl': pay_url
                }),
                'isBase64Encoded': False
            }
        
        amount_cents = price
        site_url = os.environ.get('SITE_URL', 'https://techforma.pro')
        
        cur.execute(
            """
            INSERT INTO t_p63326274_course_download_plat.orders 
            (user_id, work_id, status, amount_cents) 
            VALUES (%s, %s, 'pending', %s) 
            RETURNING id
            """,
            (user_id, work_id, amount_cents)
        )
        order_id = cur.fetchone()[0]
        
        pay_url = f"{site_url}/buy-points"
        
        cur.execute(
            "UPDATE t_p63326274_course_download_plat.orders SET payment_url = %s WHERE id = %s",
            (pay_url, order_id)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'ok': True,
                'orderId': order_id,
                'amount_cents': amount_cents,
                'payUrl': pay_url
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        print(f"Create order error: {repr(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка создания заказа'}),
            'isBase64Encoded': False
        }

def get_order_status(event: Dict[str, Any]) -> Dict[str, Any]:
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {})
    order_id = params.get('orderId')
    
    if not order_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'orderId required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        """
        SELECT id, status, work_id, amount_cents FROM t_p63326274_course_download_plat.orders 
        WHERE id = %s AND user_id = %s
        """,
        (order_id, user_id)
    )
    order = cur.fetchone()
    cur.close()
    conn.close()
    
    if not order:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Заказ не найден'}),
            'isBase64Encoded': False
        }
    
    order_id_db, status, work_id, amount_cents = order
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'ok': True,
            'orderId': order_id_db,
            'status': status,
            'work_id': work_id,
            'amount_cents': amount_cents
        }),
        'isBase64Encoded': False
    }

def generate_download_token(event: Dict[str, Any]) -> Dict[str, Any]:
    """Генерация токена для скачивания уже купленной работы"""
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    work_id = body_data.get('workId')
    
    if not work_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'workId обязателен'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Проверяем роль пользователя
        cur.execute(
            "SELECT role FROM t_p63326274_course_download_plat.users WHERE id = %s",
            (user_id,)
        )
        user_result = cur.fetchone()
        
        if not user_result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь не найден'}),
                'isBase64Encoded': False
            }
        
        role = user_result[0] if user_result[0] else 'user'
        is_admin = (role == 'admin')
        
        # Получаем автора работы
        cur.execute(
            "SELECT author_id FROM t_p63326274_course_download_plat.works WHERE id = %s",
            (work_id,)
        )
        work_result = cur.fetchone()
        
        if not work_result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Работа не найдена'}),
                'isBase64Encoded': False
            }
        
        work_author_id = work_result[0]
        is_author = work_author_id and int(user_id) == int(work_author_id)
        
        # Проверяем покупку (кроме админов и авторов)
        if not is_admin and not is_author:
            if not user_has_paid(cur, int(user_id), int(work_id)):
                return {
                    'statusCode': 402,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'error': 'Payment required',
                        'message': 'Скачивание доступно только после оплаты'
                    }),
                    'isBase64Encoded': False
                }
        
        # Генерируем токен
        import secrets
        from datetime import datetime, timedelta
        
        download_token = secrets.token_urlsafe(48)
        token_expires_at = datetime.now() + timedelta(minutes=30)
        ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
        
        cur.execute(
            """INSERT INTO t_p63326274_course_download_plat.download_tokens 
            (token, user_id, work_id, expires_at, ip_address) 
            VALUES (%s, %s, %s, %s, %s)""",
            (download_token, user_id, work_id, token_expires_at, ip_address)
        )
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'token': download_token,
                'expiresAt': token_expires_at.isoformat(),
                'expiresIn': 1800
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] Token generation failed: {str(e)}")
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка генерации токена: {str(e)}'}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()

def mock_payment(event: Dict[str, Any]) -> Dict[str, Any]:
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    order_id = body_data.get('orderId')
    
    if not order_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'orderId обязателен'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT id, user_id, work_id, status, amount_cents 
            FROM t_p63326274_course_download_plat.orders 
            WHERE id = %s AND user_id = %s
            """,
            (order_id, user_id)
        )
        order = cur.fetchone()
        
        if not order:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Заказ не найден'}),
                'isBase64Encoded': False
            }
        
        order_id_db, user_id_db, work_id, status, amount_cents = order
        
        if status == 'paid':
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'ok': True,
                    'status': 'paid',
                    'message': 'Заказ уже оплачен'
                }),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "UPDATE t_p63326274_course_download_plat.orders SET status = 'paid', paid_at = NOW() WHERE id = %s",
            (order_id,)
        )
        
        cur.execute(
            """
            SELECT balance FROM t_p63326274_course_download_plat.users 
            WHERE id = %s
            """,
            (user_id,)
        )
        user = cur.fetchone()
        current_balance = user[0] if user else 0
        
        new_balance = current_balance - (amount_cents // 100)
        
        cur.execute(
            "UPDATE t_p63326274_course_download_plat.users SET balance = %s WHERE id = %s",
            (new_balance, user_id)
        )
        
        cur.execute(
            """
            INSERT INTO t_p63326274_course_download_plat.transactions 
            (user_id, type, amount, description) 
            VALUES (%s, 'purchase', %s, %s)
            """,
            (user_id, -(amount_cents // 100), f'Покупка работы #{work_id}')
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'ok': True,
                'status': 'paid',
                'message': 'Оплата прошла успешно',
                'new_balance': new_balance
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        print(f"Mock payment error: {repr(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка обработки оплаты'}),
            'isBase64Encoded': False
        }