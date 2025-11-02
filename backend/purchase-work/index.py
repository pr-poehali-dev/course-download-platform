"""
Business: Покупка работы — проверка баланса, списание баллов, создание записи о покупке
Args: event - dict с httpMethod, body (workId, userId, price)
      context - объект с request_id
Returns: Статус покупки и разрешение на скачивание
"""
import json
import os
from typing import Dict, Any
import psycopg2


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
            # Проверяем существование работы
            cur.execute(
                "SELECT id, author_id FROM t_p63326274_course_download_plat.works WHERE id = %s",
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
            
            # СНАЧАЛА проверяем является ли пользователь администратором
            # ID 999999 - это хардкод админ из фронтенда (AdminPanel.tsx:95)
            is_admin = (int(user_id) == 999999)
            
            # Для не-админов проверяем баланс
            balance = 0
            if not is_admin:
                cur.execute(
                    "SELECT balance FROM t_p63326274_course_download_plat.users WHERE id = %s",
                    (user_id,)
                )
                result = cur.fetchone()
                
                if not result:
                    conn.rollback()
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User not found'}),
                        'isBase64Encoded': False
                    }
                
                balance = result[0]
            
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
            
            # Создаём запись о покупке
            commission = int(price * 0.1)
            cur.execute(
                """INSERT INTO t_p63326274_course_download_plat.purchases 
                (buyer_id, work_id, price_paid, commission) VALUES (%s, %s, %s, %s) RETURNING id""",
                (user_id, db_work_id, price, commission)
            )
            purchase_id = cur.fetchone()[0]
            
            # author_id уже получен в work_result выше
            author_id = work_result[1]
            
            # Если есть автор, начисляем ему 90% + бонус за скачивание
            if author_id:
                author_share = int(price * 0.9)
                platform_fee = int(price * 0.1)
                download_bonus = 10  # Бонус за каждое скачивание
                
                # Начисляем автору 90% + 10 баллов бонуса
                cur.execute(
                    "UPDATE t_p63326274_course_download_plat.users SET balance = balance + %s WHERE id = %s",
                    (author_share + download_bonus, author_id)
                )
                
                # Записываем транзакцию выплаты
                cur.execute(
                    """INSERT INTO t_p63326274_course_download_plat.author_earnings 
                    (author_id, work_id, purchase_id, sale_amount, author_share, platform_fee, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (author_id, db_work_id, purchase_id, price, author_share, platform_fee, 'paid')
                )
                
                # Записываем бонус за скачивание
                cur.execute(
                    """INSERT INTO t_p63326274_course_download_plat.transactions
                    (user_id, amount, transaction_type, description)
                    VALUES (%s, %s, %s, %s)""",
                    (author_id, download_bonus, 'download_bonus', f'Бонус за скачивание работы #{db_work_id}')
                )
            
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