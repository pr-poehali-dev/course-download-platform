"""
Серверная функция для обработки 404 ошибок
Возвращает HTML страницу со статусом 404
"""

import json
from pathlib import Path


def handler(event: dict, context) -> dict:
    """Обрабатывает 404 ошибки и возвращает HTML со статусом 404"""
    
    # Читаем статичный 404.html файл
    html_path = Path(__file__).parent / '404.html'
    
    if html_path.exists():
        html_content = html_path.read_text(encoding='utf-8')
    else:
        # Fallback если файл не найден
        html_content = """
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <title>Ошибка 404: Страница не найдена</title>
            <meta name="robots" content="noindex, nofollow">
        </head>
        <body>
            <h1>404 - Страница не найдена</h1>
            <p>Запрашиваемая страница не существует.</p>
            <a href="/">На главную</a>
        </body>
        </html>
        """
    
    # Возвращаем HTML со статусом 404
    return {
        'statusCode': 404,
        'headers': {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Robots-Tag': 'noindex, nofollow'
        },
        'body': html_content,
        'isBase64Encoded': False
    }
