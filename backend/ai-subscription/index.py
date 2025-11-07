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
            params = event.get('queryStringParameters', {}) or {}
            check_user_id = params.get('user_id') or user_id
            
            cur.execute("""
                SELECT role FROM users WHERE id = %s
            """, (check_user_id,))
            user_row = cur.fetchone()
            
            if user_row and user_row[0] == 'admin':
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'subscription': {
                            'id': 'admin',
                            'type': 'unlimited',
                            'requestsTotal': -1,
                            'requestsUsed': 0,
                            'requestsLeft': -1,
                            'expiresAt': None,
                            'createdAt': None,
                            'price': 0
                        },
                        'has_access': True,
                        'hasSubscription': True,
                        'isAdmin': True
                    })
                }
            
            cur.execute("""
                SELECT id, subscription_type, requests_total, requests_used, 
                       expires_at, is_active, created_at, price_points
                FROM ai_subscriptions 
                WHERE user_id = %s AND is_active = true
                ORDER BY created_at DESC
                LIMIT 1
            """, (check_user_id,))
            
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
                        'has_access': False,
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
                        'has_access': False,
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
                    'has_access': True,
                    'hasSubscription': True
                })
            }
        
        elif method == 'POST':
            body = event.get('body', '{}')
            body_data = json.loads(body)
            
            sub_type = body_data.get('plan') or body_data.get('subscriptionType')
            post_user_id = body_data.get('user_id') or user_id
            
            if sub_type not in ['monthly', 'yearly']:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid subscription type'})
                }
            
            pricing = {
                'monthly': {'price_rub': 299, 'days': 30},
                'yearly': {'price_rub': 2490, 'days': 365}
            }
            
            plan = pricing[sub_type]
            
            yookassa_secret = os.environ.get('YOOKASSA_SECRET_KEY')
            yookassa_shop_id = os.environ.get('YOOKASSA_SHOP_ID')
            
            if not yookassa_secret or not yookassa_shop_id:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Payment system not configured'})
                }
            
            import requests
            import base64
            from uuid import uuid4
            
            auth_string = f"{yookassa_shop_id}:{yookassa_secret}"
            auth_b64 = base64.b64encode(auth_string.encode()).decode()
            
            payment_data = {
                "amount": {
                    "value": f"{plan['price_rub']}.00",
                    "currency": "RUB"
                },
                "confirmation": {
                    "type": "redirect",
                    "return_url": "https://techforma.ru/mentor?payment=success"
                },
                "capture": True,
                "description": f"TechMentor подписка ({sub_type})",
                "metadata": {
                    "user_id": str(post_user_id),
                    "plan": sub_type
                }
            }
            
            response = requests.post(
                'https://api.yookassa.ru/v3/payments',
                json=payment_data,
                headers={
                    'Authorization': f'Basic {auth_b64}',
                    'Idempotence-Key': str(uuid4()),
                    'Content-Type': 'application/json'
                }
            )
            
            if response.status_code != 200:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Failed to create payment'})
                }
            
            payment_result = response.json()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'payment_url': payment_result['confirmation']['confirmation_url'],
                    'payment_id': payment_result['id']
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