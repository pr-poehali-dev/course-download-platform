'''
Business: Upload author work to database with pending moderation status
Args: event with body (title, description, work_type, subject, price_points, file_url, author_id)
Returns: Work ID and moderation status
'''

import json
import psycopg2
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    title = body_data.get('title')
    description = body_data.get('description')
    work_type = body_data.get('work_type')
    subject = body_data.get('subject')
    price_points = body_data.get('price_points')
    file_url = body_data.get('file_url')
    author_id = body_data.get('author_id')
    
    if not all([title, description, work_type, subject, price_points, author_id]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing required fields'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Database configuration missing'})
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        insert_query = '''
            INSERT INTO t_p63326274_course_download_plat.works 
            (title, work_type, subject, description, price_points, author_id, file_url, status, rating, downloads, views_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        '''
        
        cursor.execute(
            insert_query, 
            (title, work_type, subject, description, price_points, author_id, file_url, 'pending', 0, 0, 0)
        )
        
        work_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'workId': work_id,
                'status': 'pending',
                'message': 'Work uploaded successfully and sent for moderation'
            })
        }
        
    except psycopg2.Error as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Database error: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Server error: {str(e)}'})
        }
