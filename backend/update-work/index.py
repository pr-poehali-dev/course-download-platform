import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Update work details (title, description, composition, language, software, keywords, authorName) by admin
    Args: event with httpMethod POST, body with workId and optional fields to update
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
    language = body_data.get('language')
    software = body_data.get('software')
    keywords = body_data.get('keywords')
    author_name = body_data.get('authorName')
    cover_images = body_data.get('coverImages')
    preview_image_url = body_data.get('previewImageUrl')
    yandex_disk_link = body_data.get('yandex_disk_link')
    category = body_data.get('category')
    price_points = body_data.get('price_points')
    status = body_data.get('status')
    
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
    
    # Build update query dynamically using Simple Query Protocol
    updates = []
    
    if title is not None:
        escaped_title = title.replace("'", "''")
        updates.append(f"title = '{escaped_title}'")
    
    if description is not None:
        escaped_desc = description.replace("'", "''")
        updates.append(f"description = '{escaped_desc}'")
    
    if composition is not None:
        composition_str = ', '.join(composition) if isinstance(composition, list) else composition
        escaped_comp = composition_str.replace("'", "''")
        updates.append(f"composition = '{escaped_comp}'")
    
    if language is not None:
        escaped_lang = language.replace("'", "''")
        updates.append(f"language = '{escaped_lang}'")
    
    if software is not None:
        software_json = json.dumps(software, ensure_ascii=False).replace("'", "''")
        updates.append(f"software = '{software_json}'")
    
    if keywords is not None:
        keywords_json = json.dumps(keywords, ensure_ascii=False).replace("'", "''")
        updates.append(f"keywords = '{keywords_json}'")
    
    if author_name is not None:
        if author_name == '':
            updates.append("author_name = NULL")
        else:
            escaped_author = author_name.replace("'", "''")
            updates.append(f"author_name = '{escaped_author}'")
    
    if cover_images is not None:
        cover_images_json = json.dumps(cover_images, ensure_ascii=False).replace("'", "''")
        updates.append(f"cover_images = '{cover_images_json}'")
    
    if preview_image_url is not None:
        if preview_image_url == '':
            updates.append("preview_image_url = NULL")
        else:
            escaped_preview = preview_image_url.replace("'", "''")
            updates.append(f"preview_image_url = '{escaped_preview}'")
    
    if yandex_disk_link is not None:
        if yandex_disk_link == '':
            updates.append("yandex_disk_link = NULL")
        else:
            escaped_link = yandex_disk_link.replace("'", "''")
            updates.append(f"yandex_disk_link = '{escaped_link}'")
    
    if category is not None:
        escaped_category = category.replace("'", "''")
        updates.append(f"category = '{escaped_category}'")
    
    if price_points is not None:
        updates.append(f"price_points = {int(price_points)}")
    
    if status is not None:
        escaped_status = status.replace("'", "''")
        updates.append(f"status = '{escaped_status}'")
    
    if not updates:
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No fields to update'})
        }
    
    # Execute update using Simple Query Protocol
    update_query = f"UPDATE t_p63326274_course_download_plat.works SET {', '.join(updates)} WHERE id = {int(work_id)}"
    cursor.execute(update_query)
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': True, 'message': 'Work updated successfully'})
    }