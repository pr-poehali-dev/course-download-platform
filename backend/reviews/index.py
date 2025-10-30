"""
Business: Управление отзывами на работы
Args: event с httpMethod (GET/POST), work_id для получения/добавления отзывов, user_id через заголовок
Returns: HTTP response со списком отзывов или результатом добавления
"""

import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime

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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {})
            work_id = query_params.get('work_id')
            
            if not work_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'work_id required'})
                }
            
            cur.execute("""
                SELECT r.id, r.user_id, r.rating, r.comment, r.created_at,
                       u.username
                FROM t_p63326274_course_download_plat.reviews r
                JOIN t_p63326274_course_download_plat.users u ON r.user_id = u.id
                WHERE r.work_id = %s
                ORDER BY r.created_at DESC
            """, (work_id,))
            
            reviews = []
            for row in cur.fetchall():
                reviews.append({
                    'id': row[0],
                    'user_id': row[1],
                    'rating': row[2],
                    'comment': row[3],
                    'created_at': row[4].isoformat() if row[4] else None,
                    'username': row[5]
                })
            
            avg_rating = sum(r['rating'] for r in reviews) / len(reviews) if reviews else 0
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'reviews': reviews,
                    'average_rating': round(avg_rating, 1),
                    'total_reviews': len(reviews)
                })
            }
        
        elif method == 'POST':
            user_id = headers.get('X-User-Id') or headers.get('x-user-id')
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User ID required'})
                }
            
            body = json.loads(event.get('body', '{}'))
            work_id = body.get('work_id')
            rating = body.get('rating')
            comment = body.get('comment', '')
            
            if not work_id or not rating:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'work_id and rating required'})
                }
            
            if not (1 <= rating <= 5):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Rating must be between 1 and 5'})
                }
            
            cur.execute("""
                SELECT id FROM t_p63326274_course_download_plat.reviews
                WHERE user_id = %s AND work_id = %s
            """, (user_id, work_id))
            
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Review already exists'})
                }
            
            cur.execute("""
                INSERT INTO t_p63326274_course_download_plat.reviews 
                (user_id, work_id, rating, comment)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (user_id, work_id, rating, comment))
            
            review_id = cur.fetchone()[0]
            
            cur.execute("""
                UPDATE t_p63326274_course_download_plat.works
                SET rating = (
                    SELECT AVG(rating) FROM t_p63326274_course_download_plat.reviews WHERE work_id = %s
                )
                WHERE id = %s
            """, (work_id, work_id))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': review_id, 'message': 'Review added successfully'})
            }
    
    finally:
        cur.close()
        conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
