"""
Business: Обработка платежей через CloudPayments
Args: event с httpMethod, body, queryStringParameters
Returns: HTTP response с результатом платежа или инициализацией
"""

import json
import os
import hmac
import hashlib
from typing import Dict, Any

PUBLIC_ID = os.environ.get('CLOUDPAYMENTS_PUBLIC_ID', '')
API_SECRET = os.environ.get('CLOUDPAYMENTS_API_SECRET', '')
DATABASE_URL = os.environ.get('DATABASE_URL', '')

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
    
    if method == 'GET':
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'public_id': PUBLIC_ID,
                'ready': bool(PUBLIC_ID and API_SECRET)
            })
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        callback_type = body_data.get('type')
        
        if callback_type == 'check':
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'code': 0})
            }
        
        if callback_type == 'pay':
            transaction_id = body_data.get('TransactionId')
            amount = body_data.get('Amount')
            currency = body_data.get('Currency', 'RUB')
            invoice_id = body_data.get('InvoiceId')
            account_id = body_data.get('AccountId')
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'code': 0,
                    'transaction_id': transaction_id,
                    'amount': amount,
                    'currency': currency,
                    'invoice_id': invoice_id,
                    'account_id': account_id
                })
            }
        
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Unknown callback type'})
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }