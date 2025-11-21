import json
import os
import psycopg2
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Activate promo code and add bonus points
    Args: event with POST body {user_id, promo_code}
    Returns: Success status and bonus points added
    '''
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
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    user_id = body_data.get('user_id')
    promo_code = body_data.get('promo_code', '').strip().upper()
    
    if not user_id or not promo_code:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'user_id and promo_code required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        # Find promo code
        cur.execute('''
            SELECT id, bonus_points, max_uses, current_uses, expires_at
            FROM t_p63326274_course_download_plat.promo_codes
            WHERE code = %s
        ''', (promo_code,))
        promo = cur.fetchone()
        
        if not promo:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Промокод не найден'})
            }
        
        promo_id, bonus_points, max_uses, current_uses, expires_at = promo
        
        # Check if expired
        if expires_at and expires_at < datetime.now():
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Промокод истёк'})
            }
        
        # Check max uses
        if max_uses and current_uses >= max_uses:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Промокод исчерпан'})
            }
        
        # Check if user already used this promo
        cur.execute('''
            SELECT id FROM t_p63326274_course_download_plat.user_promo_activations
            WHERE user_id = %s AND promo_code_id = %s
        ''', (user_id, promo_id))
        if cur.fetchone():
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Вы уже активировали этот промокод'})
            }
        
        # Add bonus to user balance
        cur.execute('''
            UPDATE t_p63326274_course_download_plat.users
            SET balance = balance + %s
            WHERE id = %s
            RETURNING balance
        ''', (bonus_points, user_id))
        new_balance = cur.fetchone()[0]
        
        # Record activation
        cur.execute('''
            INSERT INTO t_p63326274_course_download_plat.user_promo_activations
            (user_id, promo_code_id, bonus_received)
            VALUES (%s, %s, %s)
        ''', (user_id, promo_id, bonus_points))
        
        # Update promo usage count
        cur.execute('''
            UPDATE t_p63326274_course_download_plat.promo_codes
            SET current_uses = current_uses + 1
            WHERE id = %s
        ''', (promo_id,))
        
        # Add transaction record
        cur.execute('''
            INSERT INTO t_p63326274_course_download_plat.transactions
            (user_id, amount, type, description)
            VALUES (%s, %s, 'promo_code', %s)
        ''', (user_id, bonus_points, f'Промокод {promo_code}'))
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'bonus_points': bonus_points,
                'new_balance': new_balance,
                'message': f'Начислено {bonus_points} баллов!'
            })
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        cur.close()
        conn.close()