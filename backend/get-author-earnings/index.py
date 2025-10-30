'''
Business: Get author earnings statistics and history
Args: event with queryStringParameters (author_id)
Returns: Total earnings, pending payments, and earnings history
'''

import json
import psycopg2
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters', {})
    author_id = params.get('author_id')
    
    if not author_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'author_id required'})
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
        
        total_query = '''
            SELECT 
                COALESCE(SUM(author_share), 0) as total_earned,
                COUNT(*) as total_sales
            FROM t_p63326274_course_download_plat.author_earnings
            WHERE author_id = %s AND status = 'paid'
        '''
        cursor.execute(total_query, (author_id,))
        total_result = cursor.fetchone()
        total_earned = int(total_result[0]) if total_result else 0
        total_sales = int(total_result[1]) if total_result else 0
        
        history_query = '''
            SELECT 
                ae.id,
                w.title,
                ae.sale_amount,
                ae.author_share,
                ae.platform_fee,
                ae.created_at
            FROM t_p63326274_course_download_plat.author_earnings ae
            JOIN t_p63326274_course_download_plat.works w ON ae.work_id = w.id
            WHERE ae.author_id = %s AND ae.status = 'paid'
            ORDER BY ae.created_at DESC
            LIMIT 50
        '''
        cursor.execute(history_query, (author_id,))
        history_rows = cursor.fetchall()
        
        earnings_history = []
        for row in history_rows:
            earnings_history.append({
                'id': row[0],
                'workTitle': row[1],
                'saleAmount': row[2],
                'authorShare': row[3],
                'platformFee': row[4],
                'createdAt': row[5].isoformat() if row[5] else None
            })
        
        works_query = '''
            SELECT 
                w.id,
                w.title,
                w.price_points,
                w.downloads,
                w.status
            FROM t_p63326274_course_download_plat.works w
            WHERE w.author_id = %s
            ORDER BY w.created_at DESC
        '''
        cursor.execute(works_query, (author_id,))
        works_rows = cursor.fetchall()
        
        author_works = []
        for row in works_rows:
            author_works.append({
                'id': row[0],
                'title': row[1],
                'price': row[2],
                'downloads': row[3],
                'status': row[4]
            })
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'totalEarned': total_earned,
                'totalSales': total_sales,
                'earningsHistory': earnings_history,
                'authorWorks': author_works
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
