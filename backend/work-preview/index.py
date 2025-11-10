import json
import os
import zipfile
import tempfile
import io
from typing import Dict, Any, List
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Получение превью первых страниц работы для просмотра перед покупкой
    Args: event - dict с httpMethod, queryStringParameters (work_id)
          context - объект с request_id
    Returns: HTTP response с URLs изображений первых страниц или текстом
    '''
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    work_id = event.get('queryStringParameters', {}).get('work_id')
    
    if not work_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'work_id required'}),
            'isBase64Encoded': False
        }
    
    try:
        # Получаем информацию о работе из БД
        import psycopg2
        database_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        cur.execute(
            """
            SELECT preview_image_url, title, description, composition 
            FROM t_p63326274_course_download_plat.works 
            WHERE id = %s
            """,
            (work_id,)
        )
        
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Work not found'}),
                'isBase64Encoded': False
            }
        
        preview_image_url, title, description, composition = result
        
        # Формируем превью данные
        preview_data = {
            'work_id': work_id,
            'title': title,
            'description': description or 'Описание отсутствует',
            'composition': composition.split(',') if composition else [],
            'preview_images': []
        }
        
        # Если есть готовое превью изображение - используем его
        if preview_image_url:
            preview_data['preview_images'] = [preview_image_url]
            preview_data['preview_type'] = 'image'
            preview_data['message'] = 'Доступно превью первой страницы'
        else:
            preview_data['preview_type'] = 'text'
            preview_data['message'] = 'Превью изображения отсутствует. Показано описание работы.'
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600'  # Кэш на 1 час
            },
            'body': json.dumps(preview_data, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"Error getting preview: {repr(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Failed to get preview', 'details': str(e)}),
            'isBase64Encoded': False
        }
