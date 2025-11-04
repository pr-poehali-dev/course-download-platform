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
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
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
        price = body.get('price')
        
        if not all([work_id, user_id, price]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'workId, userId and price required'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(dsn)
        conn.autocommit = False
        cur = conn.cursor()
        
        try:
            # Проверяем существование работы и получаем информацию о ней
            cur.execute(
                "SELECT id, author_id, title FROM t_p63326274_course_download_plat.works WHERE id = %s",
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
            
            # Проверяем баланс только для не-админов
            if not is_admin and balance < price:
                conn.rollback()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'error': 'Insufficient balance',
                        'balance': balance,
                        'required': price
                    }),
                    'isBase64Encoded': False
                }
            
            # Проверяем, не куплена ли уже эта работа
            cur.execute(
                "SELECT id FROM t_p63326274_course_download_plat.purchases WHERE buyer_id = %s AND work_id = %s",
                (user_id, db_work_id)
            )
            
            if cur.fetchone():
                conn.rollback()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'alreadyPurchased': True,
                        'message': 'Work already purchased'
                    }),
                    'isBase64Encoded': False
                }
            
            # Списываем баллы (только если не админ)
            if not is_admin:
                cur.execute(
                    "UPDATE t_p63326274_course_download_plat.users SET balance = balance - %s WHERE id = %s",
                    (price, user_id)
                )
            
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
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'newBalance': balance if is_admin else balance - price,
                    'message': 'Purchase successful',
                    'isAdmin': is_admin
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