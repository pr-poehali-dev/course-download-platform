"""
Business: Управление работами (добавление, получение, обновление)
Args: event с httpMethod, body, queryStringParameters
Returns: HTTP response с данными работ
"""

import json
import os
import psycopg2
from typing import Dict, Any, List, Optional

DATABASE_URL = os.environ.get('DATABASE_URL', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Email',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'GET':
        query_params = event.get('queryStringParameters') or {}
        work_id = query_params.get('id')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            if work_id:
                cur.execute("""
                    SELECT id, title, work_type, subject, description, composition, 
                           price_points, rating, downloads, created_at
                    FROM works WHERE id = %s
                """, (work_id,))
                row = cur.fetchone()
                
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Work not found'})
                    }
                
                work = {
                    'id': row[0],
                    'title': row[1],
                    'work_type': row[2],
                    'subject': row[3],
                    'description': row[4],
                    'composition': row[5],
                    'price_points': row[6],
                    'rating': float(row[7]) if row[7] else 0,
                    'downloads': row[8],
                    'created_at': row[9].isoformat() if row[9] else None
                }
                
                cur.execute("""
                    SELECT file_url, file_type, display_order
                    FROM work_files WHERE work_id = %s ORDER BY display_order
                """, (work_id,))
                
                work['files'] = [
                    {'url': f[0], 'type': f[1], 'order': f[2]}
                    for f in cur.fetchall()
                ]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(work)
                }
            else:
                cur.execute("""
                    SELECT id, title, work_type, subject, description, 
                           price_points, rating, downloads
                    FROM works ORDER BY created_at DESC
                """)
                
                works = []
                for row in cur.fetchall():
                    work = {
                        'id': row[0],
                        'title': row[1],
                        'work_type': row[2],
                        'subject': row[3],
                        'preview': row[4][:150] + '...' if len(row[4]) > 150 else row[4],
                        'price': row[5],
                        'rating': float(row[6]) if row[6] else 0,
                        'downloads': row[7]
                    }
                    works.append(work)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'works': works})
                }
        finally:
            cur.close()
            conn.close()
    
    if method == 'POST':
        admin_email = event.get('headers', {}).get('x-admin-email') or event.get('headers', {}).get('X-Admin-Email')
        
        if admin_email != 'rekrutiw@yandex.ru':
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        
        title = body_data.get('title')
        work_type = body_data.get('work_type')
        subject = body_data.get('subject')
        description = body_data.get('description')
        composition = body_data.get('composition', '')
        price_points = body_data.get('price_points')
        files = body_data.get('files', [])
        
        if not all([title, work_type, subject, description, price_points]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute("""
                INSERT INTO works (title, work_type, subject, description, composition, price_points)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (title, work_type, subject, description, composition, price_points))
            
            work_id = cur.fetchone()[0]
            
            for idx, file_url in enumerate(files):
                cur.execute("""
                    INSERT INTO work_files (work_id, file_url, file_type, display_order)
                    VALUES (%s, %s, %s, %s)
                """, (work_id, file_url, 'image', idx))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'work_id': work_id})
            }
        except Exception as e:
            conn.rollback()
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
        finally:
            cur.close()
            conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
