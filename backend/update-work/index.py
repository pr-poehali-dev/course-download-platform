import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Update work details (title, description, composition) by admin
    Args: event with httpMethod POST, body with workId, title, description, composition
    Returns: HTTP response with success status
    '''
    method: str = event.get('httpMethod', 'POST')
    
    # Handle CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
    
    # Parse request body
    body_data = json.loads(event.get('body', '{}'))
    work_id = body_data.get('workId')
    title = body_data.get('title')
    description = body_data.get('description')
    composition = body_data.get('composition')
    
    if not work_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'workId required'})
        }
    
    # Connect to database
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database connection not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    # Build update query dynamically
    updates = []
    params = []
    
    if title is not None:
        updates.append('title = %s')
        params.append(title)
    
    if description is not None:
        updates.append('preview = %s')
        params.append(description)
    
    if composition is not None:
        # Convert list to string with comma separator
        composition_str = ', '.join(composition) if isinstance(composition, list) else composition
        updates.append('composition = %s')
        params.append(composition_str)
    
    if not updates:
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No fields to update'})
        }
    
    # Add workId to params
    params.append(int(work_id))
    
    # Execute update
    update_query = f"UPDATE works SET {', '.join(updates)} WHERE id = %s"
    cursor.execute(update_query, params)
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': True, 'message': 'Work updated successfully'})
    }
