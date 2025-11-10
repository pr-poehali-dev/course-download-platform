import json
import os
import psycopg2
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Проверка работоспособности всей системы
    Args: event - dict с httpMethod
          context - объект с request_id
    Returns: HTTP response со статусом компонентов
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
    
    health = {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'components': {}
    }
    
    # Проверка подключения к БД
    try:
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(database_url, connect_timeout=5)
        cur = conn.cursor()
        
        # Простой запрос
        cur.execute('SELECT 1')
        result = cur.fetchone()
        
        # Проверка существования основных таблиц
        cur.execute("""
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 't_p63326274_course_download_plat' 
            AND table_name IN ('users', 'works', 'purchases')
        """)
        tables_count = cur.fetchone()[0]
        
        cur.close()
        conn.close()
        
        if tables_count >= 3:
            health['components']['database'] = {
                'status': 'healthy',
                'tables': 'ok',
                'connection': 'ok'
            }
        else:
            health['components']['database'] = {
                'status': 'degraded',
                'message': 'some tables missing'
            }
            health['status'] = 'degraded'
            
    except Exception as e:
        health['components']['database'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        health['status'] = 'unhealthy'
    
    # Проверка критичных переменных окружения
    required_vars = ['DATABASE_URL', 'JWT_SECRET']
    missing_vars = [v for v in required_vars if not os.environ.get(v)]
    
    if missing_vars:
        health['components']['environment'] = {
            'status': 'unhealthy',
            'missing_vars': missing_vars
        }
        health['status'] = 'unhealthy'
    else:
        health['components']['environment'] = {
            'status': 'healthy',
            'configured_vars': len(required_vars)
        }
    
    # Проверка времени работы функции
    if hasattr(context, 'request_id'):
        health['request_id'] = context.request_id
    
    # Определение HTTP статуса
    if health['status'] == 'healthy':
        status_code = 200
    elif health['status'] == 'degraded':
        status_code = 200  # Работает, но с проблемами
    else:
        status_code = 503  # Service Unavailable
    
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
        },
        'body': json.dumps(health, ensure_ascii=False),
        'isBase64Encoded': False
    }
