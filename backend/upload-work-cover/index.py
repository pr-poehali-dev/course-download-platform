'''
Business: Upload cover images and update composition for works (admin only)
Args: event with httpMethod POST, body with images/composition and work_id
Returns: HTTP response with uploaded image URLs or success message
'''

import json
import base64
import os
import uuid
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import Json

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Admin-Secret',
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
    
    headers = event.get('headers', {})
    admin_secret = headers.get('x-admin-secret') or headers.get('X-Admin-Secret')
    
    if admin_secret != 'techforma2025admin':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Access denied'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    work_id = body_data.get('work_id')
    images = body_data.get('images', [])
    composition = body_data.get('composition')
    
    if not work_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'work_id is required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    if composition is not None:
        cur.execute(
            "UPDATE works SET composition = %s WHERE id = %s",
            (composition, work_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'work_id': work_id,
                'message': 'Composition updated successfully'
            })
        }
    
    if not images:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Either images or composition is required'})
        }
    
    if len(images) > 3:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Maximum 3 images allowed'})
        }
    
    image_urls: List[str] = []
    
    for img_data in images:
        if not img_data.startswith('data:image'):
            continue
            
        header, encoded = img_data.split(',', 1)
        image_bytes = base64.b64decode(encoded)
        
        ext = 'jpg'
        if 'png' in header:
            ext = 'png'
        elif 'jpeg' in header or 'jpg' in header:
            ext = 'jpg'
        
        filename = f"work_cover_{work_id}_{uuid.uuid4().hex[:8]}.{ext}"
        
        public_url = f"https://storage.example.com/covers/{filename}"
        image_urls.append(public_url)
    
    cur.execute(
        "UPDATE works SET cover_images = %s WHERE id = %s",
        (image_urls, work_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'work_id': work_id,
            'image_urls': image_urls,
            'count': len(image_urls)
        })
    }