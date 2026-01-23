import json
import urllib.request
import urllib.parse

def handler(event, context):
    '''
    Триггер для запуска populate-files-list функции
    Просто вызывает другую функцию через HTTP
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # URL функции populate-files-list
        base_url = 'https://functions.poehali.dev/f223384a-8ec5-4596-8058-0031ec710c9e'
        
        # Вызываем функцию батчами (по 50 работ)
        # Всего ~480 работ, значит нужно ~10 батчей
        total_updated = 0
        all_errors = []
        
        for batch in range(10):
            url = f'{base_url}?batch={batch}'
            
            req = urllib.request.Request(url, method='POST')
            req.add_header('Content-Type', 'application/json')
            
            try:
                with urllib.request.urlopen(req, timeout=60) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    total_updated += result.get('updated', 0)
                    all_errors.extend(result.get('errors', []))
                    
                    # Если больше нет работ, прекращаем
                    if result.get('total', 0) == 0:
                        break
            except Exception as e:
                all_errors.append(f'Batch {batch}: {str(e)}')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'total_updated': total_updated,
                'errors': all_errors[:20]
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }