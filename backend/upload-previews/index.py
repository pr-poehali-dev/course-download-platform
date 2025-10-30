'''
Business: Upload preview images for works from local folders and update database
Args: event - HTTP event with multipart/form-data, context - function context
Returns: JSON response with upload status
'''

import json
import os
import base64
import psycopg2
from typing import Dict, Any, List
import re

def parse_multipart(body: str, boundary: str) -> Dict[str, Any]:
    """Parse multipart/form-data manually"""
    parts = body.split(f'--{boundary}')
    files = []
    work_id = None
    
    for part in parts:
        if not part or part == '--\r\n' or part == '--':
            continue
            
        if 'Content-Disposition' in part:
            lines = part.split('\r\n')
            
            filename = None
            name_field = None
            for line in lines:
                if 'filename=' in line:
                    match = re.search(r'filename="([^"]+)"', line)
                    if match:
                        filename = match.group(1)
                if 'name=' in line:
                    match = re.search(r'name="([^"]+)"', line)
                    if match:
                        name_field = match.group(1)
            
            content_start = part.find('\r\n\r\n')
            if content_start != -1:
                content = part[content_start + 4:].rstrip('\r\n')
                
                if filename and content:
                    files.append({
                        'filename': filename,
                        'content': content
                    })
                elif name_field == 'work_id':
                    work_id = content
    
    return {'files': files, 'work_id': work_id}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
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
    
    # Get database connection
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    # Parse request body
    headers = event.get('headers', {})
    content_type = headers.get('content-type', headers.get('Content-Type', ''))
    
    if 'multipart/form-data' not in content_type:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Content-Type must be multipart/form-data'})
        }
    
    boundary_match = re.search(r'boundary=([^;]+)', content_type)
    if not boundary_match:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No boundary found in Content-Type'})
        }
    
    boundary = boundary_match.group(1).strip()
    body = event.get('body', '')
    
    if event.get('isBase64Encoded'):
        body = base64.b64decode(body).decode('utf-8')
    
    parsed = parse_multipart(body, boundary)
    files = parsed['files']
    work_id_filter = parsed.get('work_id')
    
    if not files:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No files uploaded'})
        }
    
    # Connect to database
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    updated_count = 0
    errors = []
    
    # Process each file
    for file_data in files:
        filename = file_data['filename']
        
        # Extract work ID from filename (e.g., "work-123.jpg" -> "123")
        work_id_match = re.search(r'work-?(\d+)', filename, re.IGNORECASE)
        if not work_id_match:
            errors.append(f'Cannot extract work ID from filename: {filename}')
            continue
        
        work_id = work_id_match.group(1)
        
        # If work_id filter is specified, skip other files
        if work_id_filter and str(work_id) != str(work_id_filter):
            continue
        
        # For now, we'll store the file path reference
        # In production, you'd upload to S3/CDN here
        preview_url = f'/previews/{filename}'
        
        cur.execute('''
            UPDATE t_p63326274_course_download_plat.works
            SET preview_image_url = %s
            WHERE id = %s
        ''', (preview_url, int(work_id)))
        
        if cur.rowcount > 0:
            updated_count += 1
        else:
            errors.append(f'Work ID {work_id} not found in database')
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'updated_count': updated_count,
            'total_files': len(files),
            'errors': errors
        })
    }
