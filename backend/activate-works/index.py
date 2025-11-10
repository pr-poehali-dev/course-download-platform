"""
Business: Массовая активация работ из статуса pending в active
Args: event с httpMethod, body (limit, offset)
Returns: HTTP response с количеством активированных работ
"""

import json
import os
import psycopg2
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
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
        body_data = json.loads(event.get('body', '{}'))
        limit = body_data.get('limit', 100)
        offset = body_data.get('offset', 0)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            UPDATE t_p63326274_course_download_plat.works 
            SET status = 'approved', updated_at = NOW()
            WHERE id IN (
                SELECT id FROM t_p63326274_course_download_plat.works 
                WHERE status = 'pending' 
                ORDER BY created_at DESC 
                LIMIT %s OFFSET %s
            )
            RETURNING id
        """, (limit, offset))
        
        activated_ids = [row[0] for row in cur.fetchall()]
        activated_count = len(activated_ids)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'activated': activated_count,
                'ids': activated_ids,
                'message': f'Активировано {activated_count} работ'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }