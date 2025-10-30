"""
Business: Управление избранными работами пользователя
Args: event с httpMethod (GET/POST/DELETE), user_id через заголовок X-User-Id, work_id для добавления/удаления
Returns: HTTP response со списком избранных работ или результатом операции
"""

import json
import os
import psycopg2
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    headers = event.get('headers', {})
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute("""
                SELECT f.id, f.work_id, f.created_at,
                       w.title, w.work_type, w.subject, w.price_points, w.rating
                FROM t_p63326274_course_download_plat.favorites f
                JOIN t_p63326274_course_download_plat.works w ON f.work_id = w.id
                WHERE f.user_id = %s
                ORDER BY f.created_at DESC
            """, (user_id,))
            
            favorites = []
            for row in cur.fetchall():
                favorites.append({
                    'id': row[0],
                    'work_id': row[1],
                    'created_at': row[2].isoformat() if row[2] else None,
                    'work': {
                        'title': row[3],
                        'work_type': row[4],
                        'subject': row[5],
                        'price_points': row[6],
                        'rating': float(row[7]) if row[7] else 0
                    }
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'favorites': favorites})
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            work_id = body.get('work_id')
            
            if not work_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'work_id required'})
                }
            
            cur.execute("""
                SELECT id FROM t_p63326274_course_download_plat.favorites
                WHERE user_id = %s AND work_id = %s
            """, (user_id, work_id))
            
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Already in favorites'})
                }
            
            cur.execute("""
                INSERT INTO t_p63326274_course_download_plat.favorites (user_id, work_id)
                VALUES (%s, %s)
                RETURNING id
            """, (user_id, work_id))
            
            favorite_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': favorite_id, 'message': 'Added to favorites'})
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            work_id = query_params.get('work_id')
            
            if not work_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'work_id required'})
                }
            
            cur.execute("""
                DELETE FROM t_p63326274_course_download_plat.favorites
                WHERE user_id = %s AND work_id = %s
            """, (user_id, work_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Removed from favorites'})
            }
    
    finally:
        cur.close()
        conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
