import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Delete work by ID (admin only)
    Args: event with httpMethod DELETE, queryStringParameters with workId
    Returns: HTTP response with success status
    '''
    method: str = event.get('httpMethod', 'DELETE')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Email',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'DELETE':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters', {})
    work_id = params.get('workId')
    
    if not work_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'workId required'})
        }
    
    admin_email = event.get('headers', {}).get('x-admin-email') or event.get('headers', {}).get('X-Admin-Email')
    
    if admin_email != 'rekrutiw@yandex.ru':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database connection not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    try:
        # Delete related records first
        cursor.execute(
            "DELETE FROM t_p63326274_course_download_plat.purchases WHERE work_id = %s",
            (int(work_id),)
        )
        
        cursor.execute(
            "DELETE FROM t_p63326274_course_download_plat.reviews WHERE work_id = %s",
            (int(work_id),)
        )
        
        cursor.execute(
            "DELETE FROM t_p63326274_course_download_plat.user_downloads WHERE work_id = %s",
            (int(work_id),)
        )
        
        cursor.execute(
            "DELETE FROM t_p63326274_course_download_plat.work_stats WHERE work_id = %s",
            (int(work_id),)
        )
        
        cursor.execute(
            "DELETE FROM t_p63326274_course_download_plat.download_tokens WHERE work_id = %s",
            (int(work_id),)
        )
        
        # Finally delete the work itself
        cursor.execute(
            "DELETE FROM t_p63326274_course_download_plat.works WHERE id = %s",
            (int(work_id),)
        )
        
        conn.commit()
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Database error: {str(e)}'})
        }
    
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': True, 'message': 'Work deleted successfully'})
    }