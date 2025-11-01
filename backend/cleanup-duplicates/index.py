"""
Business: Remove duplicate works keeping only the latest entry per folder_path
Args: event - HTTP event with POST method
Returns: Number of duplicates removed
"""

import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Email',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Check admin authentication
    headers = event.get('headers', {})
    admin_email = headers.get('x-admin-email') or headers.get('X-Admin-Email')
    
    if admin_email != 'rekrutiw@yandex.ru':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Получаем список ID дубликатов (все кроме самой новой записи для каждой папки)
        cur.execute("""
            SELECT id
            FROM (
                SELECT id,
                       ROW_NUMBER() OVER (PARTITION BY folder_path ORDER BY id DESC) as rn
                FROM t_p63326274_course_download_plat.works
                WHERE folder_path IS NOT NULL
            ) t
            WHERE rn > 1
        """)
        
        duplicate_ids = [row[0] for row in cur.fetchall()]
        total_duplicates = len(duplicate_ids)
        
        if total_duplicates == 0:
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'removed': 0,
                    'message': 'No duplicates found'
                })
            }
        
        # Удаляем дубликаты по частям (по 100 записей)
        removed = 0
        batch_size = 100
        
        for i in range(0, len(duplicate_ids), batch_size):
            batch = duplicate_ids[i:i+batch_size]
            ids_str = ','.join(str(id) for id in batch)
            
            cur.execute(f"DELETE FROM t_p63326274_course_download_plat.works WHERE id IN ({ids_str})")
            removed += cur.rowcount
            conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'removed': removed,
                'message': f'Successfully removed {removed} duplicate works'
            })
        }
        
    except Exception as e:
        print(f"Error: {type(e).__name__}: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Cleanup failed: {str(e)}'})
        }
