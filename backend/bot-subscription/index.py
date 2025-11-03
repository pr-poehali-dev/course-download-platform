"""
Business: Управление подписками на Telegram-бота (проверка и активация)
Args: event - GET для проверки, POST для активации
Returns: JSON с информацией о подписке
"""
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    schema = 't_p63326274_course_download_plat'
    
    if method == 'GET':
        # Проверка подписки
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('user_id')
        telegram_user_id = params.get('telegram_user_id')
        
        if not user_id and not telegram_user_id:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'user_id or telegram_user_id required'})
            }
        
        # Проверка администратора
        if user_id:
            cursor.execute(f"SELECT role FROM {schema}.users WHERE id = %s", (user_id,))
            user_row = cursor.fetchone()
            
            if user_row and user_row['role'] == 'admin':
                cursor.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'has_access': True,
                        'status': 'admin',
                        'is_admin': True,
                        'message': 'Администратор имеет бесплатный доступ'
                    })
                }
        
        # Проверка подписки
        if user_id:
            cursor.execute(f"SELECT * FROM {schema}.bot_subscriptions WHERE user_id = %s", (user_id,))
        else:
            cursor.execute(f"SELECT * FROM {schema}.bot_subscriptions WHERE telegram_user_id = %s", (telegram_user_id,))
        
        subscription = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not subscription:
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'has_access': False,
                    'status': 'no_subscription',
                    'message': 'Подписка не найдена'
                })
            }
        
        now = datetime.now()
        expires_at = subscription['expires_at']
        
        if subscription['status'] == 'active' and expires_at and expires_at > now:
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'has_access': True,
                    'status': 'active',
                    'expires_at': expires_at.isoformat(),
                    'telegram_username': subscription.get('telegram_username'),
                    'message': 'Подписка активна'
                })
            }
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({
                'has_access': False,
                'status': 'expired' if expires_at and expires_at < now else 'inactive',
                'expires_at': expires_at.isoformat() if expires_at else None,
                'message': 'Подписка истекла' if expires_at and expires_at < now else 'Подписка не активна'
            })
        }
    
    elif method == 'POST':
        # Активация подписки
        body_str = event.get('body', '{}')
        if not body_str or body_str.strip() == '':
            body_str = '{}'
        body_data = json.loads(body_str)
        user_id = body_data.get('user_id')
        telegram_user_id = body_data.get('telegram_user_id')
        telegram_username = body_data.get('telegram_username')
        payment_id = body_data.get('payment_id')
        months = body_data.get('months', 1)
        
        if not user_id:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'user_id is required'})
            }
        
        # Проверка пользователя
        cursor.execute(f"SELECT id, role FROM {schema}.users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'User not found'})
            }
        
        # Администратор не нуждается в подписке
        if user['role'] == 'admin':
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Администратор имеет бесплатный доступ',
                    'is_admin': True
                })
            }
        
        now = datetime.now()
        expires_at = now + timedelta(days=30 * months)
        
        # Проверка существующей подписки
        cursor.execute(
            f"SELECT id, expires_at FROM {schema}.bot_subscriptions WHERE user_id = %s",
            (user_id,)
        )
        existing = cursor.fetchone()
        
        if existing:
            old_expires = existing['expires_at']
            if old_expires and old_expires > now:
                expires_at = old_expires + timedelta(days=30 * months)
            
            cursor.execute(
                f"""
                UPDATE {schema}.bot_subscriptions 
                SET status = 'active',
                    started_at = %s,
                    expires_at = %s,
                    payment_id = %s,
                    telegram_user_id = COALESCE(%s, telegram_user_id),
                    telegram_username = COALESCE(%s, telegram_username),
                    updated_at = %s
                WHERE user_id = %s
                """,
                (now, expires_at, payment_id, telegram_user_id, telegram_username, now, user_id)
            )
        else:
            cursor.execute(
                f"""
                INSERT INTO {schema}.bot_subscriptions 
                (user_id, telegram_user_id, telegram_username, status, started_at, expires_at, payment_id, amount, created_at, updated_at)
                VALUES (%s, %s, %s, 'active', %s, %s, %s, 3000.00, %s, %s)
                """,
                (user_id, telegram_user_id, telegram_username, now, expires_at, payment_id, now, now)
            )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'message': 'Подписка успешно активирована',
                'expires_at': expires_at.isoformat(),
                'months': months
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Method not allowed'})
    }