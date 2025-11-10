"""
Business: Bulk approve pending works (change status from pending to approved)
Args: event with queryStringParameters.limit (default 100)
Returns: JSON with approved count
"""
import json
import os
import psycopg2
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database connection not configured'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    limit = int(params.get('limit', 100))
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cur.execute("""
        UPDATE t_p63326274_course_download_plat.works 
        SET status = 'approved', updated_at = NOW()
        WHERE id IN (
            SELECT id FROM t_p63326274_course_download_plat.works 
            WHERE status = 'pending' 
            LIMIT %s
        )
    """, (limit,))
    
    approved_count = cur.rowcount
    conn.commit()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'approved': approved_count,
            'message': f'Одобрено работ: {approved_count}'
        }),
        'isBase64Encoded': False
    }
