"""
Business: Обработка платежей через ЮКассу (YooKassa)
Args: event с httpMethod, body, queryStringParameters
Returns: HTTP response с ссылкой на оплату или обработкой уведомлений
"""

import json
import os
import uuid
import psycopg2
from typing import Dict, Any
from yookassa import Configuration, Payment

SHOP_ID = os.environ.get('YOOKASSA_SHOP_ID', '')
SECRET_KEY = os.environ.get('YOOKASSA_SECRET_KEY', '')
DATABASE_URL = os.environ.get('DATABASE_URL', '')

if SHOP_ID and SECRET_KEY:
    Configuration.account_id = SHOP_ID
    Configuration.secret_key = SECRET_KEY

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

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
                'provider': 'yookassa',
                'ready': bool(SHOP_ID and SECRET_KEY)
            })
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'create_payment':
            user_email = body_data.get('user_email')
            points = body_data.get('points', 0)
            price = body_data.get('price', 0)
            
            if not user_email or not points or not price:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing required fields'})
                }
            
            idempotence_key = str(uuid.uuid4())
            
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
                "description": f"Покупка {points} баллов",
                "metadata": {
                    "user_email": user_email,
                    "points": points
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
                points = int(metadata.get('points', 0))
                
                if user_email and points > 0:
                    conn = get_db_connection()
                    cur = conn.cursor()
                    
                    try:
                        cur.execute("""
                            UPDATE t_p63326274_course_download_plat.users 
                            SET balance = balance + %s 
                            WHERE email = %s
                        """, (points, user_email))
                        
                        conn.commit()
                        
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
