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
        work_id_int = int(work_id)
        
        # Удаляем все связанные записи в правильном порядке (учитывая внешние ключи)
        # Сначала удаляем зависимые записи, потом purchases, потом работу
        tables_to_clean = [
            'download_tokens',  # Ссылается на purchases
            'purchases',        # Ссылается на works
            'defense_kits',
            'favorites', 
            'reviews',
            'user_downloads',
            'work_stats'
        ]
        
        for table in tables_to_clean:
            try:
                cursor.execute(
                    f"DELETE FROM t_p63326274_course_download_plat.{table} WHERE work_id = %s",
                    (work_id_int,)
                )
                deleted_rows = cursor.rowcount
                if deleted_rows > 0:
                    print(f"✅ Deleted {deleted_rows} rows from {table}")
            except Exception as table_error:
                print(f"⚠️ Could not delete from {table}: {table_error}")
                # Продолжаем, даже если есть ошибки
        
        # Наконец удаляем саму работу
        cursor.execute(
            "DELETE FROM t_p63326274_course_download_plat.works WHERE id = %s",
            (work_id_int,)
        )
        print(f"✅ Work {work_id_int} deleted successfully")
        
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