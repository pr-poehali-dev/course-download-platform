"""
Массовое извлечение превью из архивов всех работ
Запускается один раз, работает автономно в облаке
"""

import json
import os
import time
import requests
import psycopg2
from typing import Dict, Any

FUNCTION_URL = 'https://functions.poehali.dev/29bd33fc-96f3-4da2-af7c-ce84a7103573'
DATABASE_URL = os.environ.get('DATABASE_URL')


def get_works_without_preview(limit: int = 10) -> list:
    """Получить работы без превью из БД"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT id, title, download_url
            FROM t_p63326274_course_download_plat.works
            WHERE title NOT LIKE '[УДАЛЕНО]%%'
              AND download_url IS NOT NULL
              AND preview_image_url IS NULL
            ORDER BY id DESC
            LIMIT %s
        """, (limit,))
        
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()


def extract_preview(work_id: int) -> dict:
    """Извлечь превью для одной работы"""
    try:
        response = requests.post(
            FUNCTION_URL,
            json={'work_id': work_id, 'extract_from_archive': True},
            timeout=120
        )
        return response.json()
    except Exception as e:
        return {'success': False, 'error': str(e)}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Массовое извлечение превью из архивов всех работ
    Args: event - запрос с параметром batch_size (опционально)
    Returns: Статистика обработки
    """
    method = event.get('httpMethod', 'GET')
    
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
    
    # Получить размер батча из параметров
    params = event.get('queryStringParameters', {}) or {}
    batch_size = int(params.get('batch_size', 10))
    
    stats = {
        'processed': 0,
        'successful': 0,
        'no_images': 0,
        'failed': 0,
        'errors': []
    }
    
    # Получить работы без превью
    works = get_works_without_preview(batch_size)
    
    if not works:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'message': 'Все работы уже обработаны!',
                'stats': stats
            })
        }
    
    # Обработать каждую работу
    for work in works:
        work_id, title, download_url = work
        stats['processed'] += 1
        
        result = extract_preview(work_id)
        
        if result.get('success'):
            count = result.get('count', 0)
            if count > 0:
                stats['successful'] += 1
            else:
                stats['no_images'] += 1
        else:
            stats['failed'] += 1
            stats['errors'].append({
                'work_id': work_id,
                'title': title[:60],
                'error': result.get('error', 'Unknown error')
            })
        
        # Небольшая пауза между запросами
        time.sleep(1)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'message': f'Обработано {stats["processed"]} работ',
            'stats': stats,
            'remaining': 'Запустите снова для обработки следующей партии'
        }, ensure_ascii=False)
    }
