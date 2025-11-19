"""
Business: Get and manage user internal messages (support notifications)
Args: event with queryStringParameters: action (get/mark_read), user_id
Returns: JSON with messages list or success status
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
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database connection not configured'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'get')
    user_id = params.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id required'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    if method == 'GET' and action == 'get':
        cur.execute("""
            SELECT id, title, message, type, is_read, created_at
            FROM t_p63326274_course_download_plat.user_messages
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (user_id,))
        
        messages = []
        for row in cur.fetchall():
            messages.append({
                'id': row[0],
                'title': row[1],
                'message': row[2],
                'type': row[3],
                'is_read': row[4],
                'created_at': row[5].isoformat() if row[5] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'messages': messages}),
            'isBase64Encoded': False
        }
    
    elif method == 'POST' and action == 'mark_read':
        body_data = json.loads(event.get('body', '{}'))
        message_id = body_data.get('message_id')
        
        if not message_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'message_id required'}),
                'isBase64Encoded': False
            }
        
        cur.execute("""
            DELETE FROM t_p63326274_course_download_plat.user_messages
            WHERE id = %s AND user_id = %s
        """, (message_id, user_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    elif method == 'POST' and action == 'send':
        body_data = json.loads(event.get('body', '{}'))
        title = body_data.get('title')
        message = body_data.get('message')
        msg_type = body_data.get('type', 'info')
        
        if not title or not message:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'title and message required'}),
                'isBase64Encoded': False
            }
        
        cur.execute("""
            INSERT INTO t_p63326274_course_download_plat.user_messages 
            (user_id, title, message, type, is_read, created_at)
            VALUES (%s, %s, %s, %s, FALSE, NOW())
            RETURNING id
        """, (user_id, title, message, msg_type))
        
        message_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message_id': message_id}),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 400,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Invalid action'}),
        'isBase64Encoded': False
    }