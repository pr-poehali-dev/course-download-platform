import json
import os
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage AI assistant subscriptions - create, check, list
    Args: event with httpMethod (GET/POST), headers with X-User-Id, body with subscription data
    Returns: HTTP response with subscription info
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
    
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'User not authenticated'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = None
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        if method == 'GET':
            cur.execute("""
                SELECT id, subscription_type, requests_total, requests_used, 
                       expires_at, is_active, created_at, price_points
                FROM ai_subscriptions 
                WHERE user_id = %s AND is_active = true
                ORDER BY created_at DESC
                LIMIT 1
            """, (user_id,))
            
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'subscription': None,
                        'hasSubscription': False
                    })
                }
            
            sub_id, sub_type, total, used, expires_at, is_active, created_at, price = row
            
            if expires_at and datetime.now() > expires_at:
                cur.execute("""
                    UPDATE ai_subscriptions 
                    SET is_active = false 
                    WHERE id = %s
                """, (sub_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'subscription': None,
                        'hasSubscription': False,
                        'expired': True
                    })
                }
            
            requests_left = total - used if total > 0 else -1
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'subscription': {
                        'id': sub_id,
                        'type': sub_type,
                        'requestsTotal': total,
                        'requestsUsed': used,
                        'requestsLeft': requests_left,
                        'expiresAt': expires_at.isoformat() if expires_at else None,
                        'createdAt': created_at.isoformat(),
                        'price': price
                    },
                    'hasSubscription': True
                })
            }
        
        elif method == 'POST':
            body = event.get('body', '{}')
            body_data = json.loads(body)
            
            sub_type = body_data.get('subscriptionType')
            
            if sub_type not in ['single', 'monthly', 'yearly']:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid subscription type'})
                }
            
            pricing = {
                'single': {'points': 300, 'requests': 10, 'days': None},
                'monthly': {'points': 800, 'requests': 0, 'days': 30},
                'yearly': {'points': 7200, 'requests': 0, 'days': 365}
            }
            
            plan = pricing[sub_type]
            
            cur.execute("SELECT balance FROM t_p63326274_course_download_plat.users WHERE id = %s", (user_id,))
            user_row = cur.fetchone()
            
            if not user_row or user_row[0] < plan['points']:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Insufficient points'})
                }
            
            cur.execute("""
                UPDATE ai_subscriptions 
                SET is_active = false 
                WHERE user_id = %s AND is_active = true
            """, (user_id,))
            
            expires_at = None
            if plan['days']:
                expires_at = datetime.now() + timedelta(days=plan['days'])
            
            cur.execute("""
                INSERT INTO ai_subscriptions 
                (user_id, subscription_type, requests_total, requests_used, price_points, expires_at)
                VALUES (%s, %s, %s, 0, %s, %s)
                RETURNING id
            """, (user_id, sub_type, plan['requests'], plan['points'], expires_at))
            
            new_sub_id = cur.fetchone()[0]
            
            cur.execute("""
                UPDATE t_p63326274_course_download_plat.users 
                SET balance = balance - %s 
                WHERE id = %s
            """, (plan['points'], user_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'subscriptionId': new_sub_id,
                    'pointsSpent': plan['points']
                })
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'})
            }
            
    except Exception as e:
        if conn:
            conn.rollback()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if conn:
            cur.close()
            conn.close()