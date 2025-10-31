import json
import os
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Premium management - check limits, subscribe, get status
    Args: event with httpMethod GET (check), POST (subscribe), queryParams/body
    Returns: Premium status, limits, or subscription confirmation
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            # Проверка лимитов скачиваний
            params = event.get('queryStringParameters', {}) or {}
            user_id = params.get('user_id')
            
            if not user_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}
            
            cur.execute('''
                SELECT is_premium, premium_expires_at, downloads_this_week, week_reset_at
                FROM t_p63326274_course_download_plat.users WHERE id = %s
            ''', (user_id,))
            
            user_data = cur.fetchone()
            if not user_data:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'User not found'})}
            
            is_premium, premium_expires_at, downloads_this_week, week_reset_at = user_data
            
            # Проверить Premium
            premium_active = is_premium and premium_expires_at and premium_expires_at > datetime.now()
            
            if premium_active:
                return {
                    'statusCode': 200, 'headers': headers,
                    'body': json.dumps({
                        'can_download': True, 'is_premium': True, 'unlimited': True,
                        'expires_at': premium_expires_at.isoformat(),
                        'message': 'Premium user - unlimited downloads'
                    })
                }
            
            # Проверить недельный лимит
            now = datetime.now()
            week_reset = week_reset_at or now
            
            if (now - week_reset).days >= 7:
                cur.execute('''
                    UPDATE t_p63326274_course_download_plat.users
                    SET downloads_this_week = 0, week_reset_at = %s WHERE id = %s
                ''', (now, user_id))
                conn.commit()
                downloads_this_week = 0
            
            FREE_WEEKLY_LIMIT = 2
            remaining = FREE_WEEKLY_LIMIT - (downloads_this_week or 0)
            
            return {
                'statusCode': 200, 'headers': headers,
                'body': json.dumps({
                    'can_download': remaining > 0, 'is_premium': False,
                    'downloads_this_week': downloads_this_week or 0,
                    'weekly_limit': FREE_WEEKLY_LIMIT, 'remaining': max(0, remaining),
                    'message': f'Осталось {remaining} бесплатных скачиваний' if remaining > 0 else 'Лимит исчерпан'
                })
            }
        
        elif method == 'POST':
            # Подписка на Premium
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            payment_id = body_data.get('payment_id', 'manual')
            
            if not user_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}
            
            cur.execute('''
                SELECT id, is_premium, premium_expires_at
                FROM t_p63326274_course_download_plat.users WHERE id = %s
            ''', (user_id,))
            
            user = cur.fetchone()
            if not user:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'User not found'})}
            
            _, current_is_premium, current_expires = user
            now = datetime.now()
            
            if current_is_premium and current_expires and current_expires > now:
                starts_at = current_expires
            else:
                starts_at = now
            
            expires_at = starts_at + timedelta(days=30)
            
            cur.execute('''
                UPDATE t_p63326274_course_download_plat.users
                SET is_premium = TRUE, premium_expires_at = %s, downloads_this_week = 0
                WHERE id = %s
            ''', (expires_at, user_id))
            
            cur.execute('''
                INSERT INTO t_p63326274_course_download_plat.subscriptions
                (user_id, subscription_type, amount, status, starts_at, expires_at, payment_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
            ''', (user_id, 'premium_monthly', 299, 'active', starts_at, expires_at, payment_id))
            
            subscription_id = cur.fetchone()[0]
            
            cur.execute('''
                INSERT INTO t_p63326274_course_download_plat.transactions
                (user_id, amount, transaction_type, description)
                VALUES (%s, %s, %s, %s)
            ''', (user_id, -299, 'premium_subscription', 'Подписка Premium'))
            
            conn.commit()
            
            return {
                'statusCode': 200, 'headers': headers,
                'body': json.dumps({
                    'success': True, 'subscription_id': subscription_id,
                    'expires_at': expires_at.isoformat(),
                    'message': 'Premium активирован на 30 дней!'
                })
            }
        
    except Exception as e:
        conn.rollback()
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}
    finally:
        cur.close()
        conn.close()
