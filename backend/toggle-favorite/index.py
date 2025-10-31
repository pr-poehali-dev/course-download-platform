import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Add or remove work from user favorites
    Args: event with POST body {user_id, work_id}
    Returns: Success status and updated favorites
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
    work_id = body_data.get('work_id')
    
    if not user_id or not work_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'user_id and work_id required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        # Check if already in favorites
        cur.execute('''
            SELECT id FROM t_p63326274_course_download_plat.favorites
            WHERE user_id = %s AND work_id = %s
        ''', (user_id, work_id))
        existing = cur.fetchone()
        
        if existing:
            # Remove from favorites
            cur.execute('''
                DELETE FROM t_p63326274_course_download_plat.favorites
                WHERE user_id = %s AND work_id = %s
            ''', (user_id, work_id))
            conn.commit()
            action = 'removed'
        else:
            # Add to favorites
            cur.execute('''
                INSERT INTO t_p63326274_course_download_plat.favorites (user_id, work_id)
                VALUES (%s, %s)
            ''', (user_id, work_id))
            conn.commit()
            action = 'added'
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'action': action,
                'work_id': work_id
            })
        }
        
    finally:
        cur.close()
        conn.close()
