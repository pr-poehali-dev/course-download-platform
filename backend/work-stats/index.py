import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление статистикой работ (просмотры, скачивания, отзывы)
    Args: event - dict с httpMethod, queryStringParameters, body
          context - object с request_id
    Returns: HTTP response с данными статистики
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            work_id = params.get('work_id')
            
            if not work_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'work_id required'})
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT views_count, downloads_count, reviews_count FROM work_stats WHERE work_id = %s",
                    (int(work_id),)
                )
                stats = cur.fetchone()
                
                if not stats:
                    cur.execute(
                        "INSERT INTO work_stats (work_id, views_count, downloads_count, reviews_count) VALUES (%s, 0, 0, 0) RETURNING views_count, downloads_count, reviews_count",
                        (int(work_id),)
                    )
                    conn.commit()
                    stats = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'work_id': int(work_id),
                    'views': stats['views_count'],
                    'downloads': stats['downloads_count'],
                    'reviews': stats['reviews_count']
                })
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            work_id = body_data.get('work_id')
            action = body_data.get('action')
            
            if not work_id or not action:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'work_id and action required'})
                }
            
            if action not in ['view', 'download', 'review']:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'action must be view, download, or review'})
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                column_map = {
                    'view': 'views_count',
                    'download': 'downloads_count',
                    'review': 'reviews_count'
                }
                column = column_map[action]
                
                cur.execute(
                    f"INSERT INTO work_stats (work_id, {column}) VALUES (%s, 1) ON CONFLICT (work_id) DO UPDATE SET {column} = work_stats.{column} + 1, updated_at = CURRENT_TIMESTAMP RETURNING views_count, downloads_count, reviews_count",
                    (int(work_id),)
                )
                conn.commit()
                stats = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'work_id': int(work_id),
                    'views': stats['views_count'],
                    'downloads': stats['downloads_count'],
                    'reviews': stats['reviews_count']
                })
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()
