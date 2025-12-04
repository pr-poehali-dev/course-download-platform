'''
Business: Генерация динамического sitemap.xml с URL всех работ из базы данных
Args: event - dict с httpMethod, queryStringParameters (format: xml|json)
      context - объект с атрибутами request_id, function_name
Returns: XML sitemap или JSON для отладки
'''

import os
import json
from datetime import datetime
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # CORS
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters') or {}
    response_format = params.get('format', 'xml')  # xml или json для отладки
    
    database_url = os.environ.get('DATABASE_URL', '')
    works = []
    
    try:
        # Подключение к БД (если доступно)
        if database_url:
            print(f'Connecting to database...')
            conn = psycopg2.connect(database_url)
            cursor = conn.cursor()
            
            # Получаем все работы из БД
            cursor.execute("""
                SELECT id, title, updated_at, created_at
                FROM works
                WHERE id IS NOT NULL
                ORDER BY id DESC
            """)
            
            works = cursor.fetchall()
            cursor.close()
            conn.close()
            print(f'✅ Loaded {len(works)} works from database')
        else:
            print('⚠️ DATABASE_URL not found, using only static URLs')
        
        # Базовые статические страницы
        base_url = 'https://techforma.pro'
        today = datetime.now().strftime('%Y-%m-%d')
        
        static_urls = [
            {'loc': f'{base_url}/', 'lastmod': today, 'changefreq': 'daily', 'priority': '1.0'},
            {'loc': f'{base_url}/catalog', 'lastmod': today, 'changefreq': 'hourly', 'priority': '0.9'},
            {'loc': f'{base_url}/blog', 'lastmod': today, 'changefreq': 'weekly', 'priority': '0.8'},
            {'loc': f'{base_url}/marketplace', 'lastmod': today, 'changefreq': 'weekly', 'priority': '0.8'},
            {'loc': f'{base_url}/defense-kit', 'lastmod': today, 'changefreq': 'monthly', 'priority': '0.7'},
            {'loc': f'{base_url}/buy-points', 'lastmod': today, 'changefreq': 'monthly', 'priority': '0.6'},
            {'loc': f'{base_url}/upload', 'lastmod': today, 'changefreq': 'monthly', 'priority': '0.6'},
            {'loc': f'{base_url}/register', 'lastmod': today, 'changefreq': 'monthly', 'priority': '0.7'},
            {'loc': f'{base_url}/login', 'lastmod': today, 'changefreq': 'monthly', 'priority': '0.6'},
            {'loc': f'{base_url}/offer', 'lastmod': today, 'changefreq': 'yearly', 'priority': '0.5'},
            {'loc': f'{base_url}/privacy-policy', 'lastmod': today, 'changefreq': 'yearly', 'priority': '0.5'},
            {'loc': f'{base_url}/terms-of-service', 'lastmod': today, 'changefreq': 'yearly', 'priority': '0.5'},
            {'loc': f'{base_url}/usage-rules', 'lastmod': today, 'changefreq': 'yearly', 'priority': '0.4'},
            {'loc': f'{base_url}/requisites', 'lastmod': today, 'changefreq': 'yearly', 'priority': '0.3'},
        ]
        
        # Категории
        categories = ['курсовая', 'диплом', 'реферат', 'контрольная', 'эссе', 'отчет']
        for category in categories:
            static_urls.append({
                'loc': f'{base_url}/catalog?category={category}',
                'lastmod': today,
                'changefreq': 'daily',
                'priority': '0.8'
            })
        
        # SEO статьи блога (хардкод)
        blog_articles = [
            {'slug': 'kak-skachat-kursovuyu-rabotu-besplatno', 'date': '2025-12-03'},
            {'slug': 'gotovye-kursovye-raboty-po-inzhenernym-spetsialnostyam', 'date': '2025-12-03'},
            {'slug': 'kursovye-raboty-po-stroitelstvu-i-mashinostroeniyu', 'date': '2025-12-03'},
            {'slug': 'kak-vybrat-kursovuyu-rabotu', 'date': '2025-11-30'},
            {'slug': 'inzhenernye-chertezhi-dlya-studentov', 'date': '2025-11-29'},
            {'slug': 'kursovaya-rabota-po-elektrotekhnike', 'date': '2025-11-28'}
        ]
        
        for article in blog_articles:
            static_urls.append({
                'loc': f'{base_url}/blog/{article["slug"]}',
                'lastmod': article['date'],
                'changefreq': 'monthly',
                'priority': '0.8'
            })
        
        # Добавляем URL работ
        work_urls = []
        for work_id, title, updated_at, created_at in works:
            lastmod = (updated_at or created_at or datetime.now()).strftime('%Y-%m-%d')
            work_urls.append({
                'loc': f'{base_url}/work/{work_id}',
                'lastmod': lastmod,
                'changefreq': 'weekly',
                'priority': '0.7'
            })
        
        all_urls = static_urls + work_urls
        
        # JSON формат для отладки
        if response_format == 'json':
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'total_urls': len(all_urls),
                    'static_urls': len(static_urls),
                    'work_urls': len(work_urls),
                    'urls': all_urls[:50]  # Первые 50 для просмотра
                }, ensure_ascii=False, indent=2)
            }
        
        # XML формат (стандартный sitemap)
        xml_lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        ]
        
        for url_data in all_urls:
            xml_lines.append('  <url>')
            xml_lines.append(f'    <loc>{url_data["loc"]}</loc>')
            xml_lines.append(f'    <lastmod>{url_data["lastmod"]}</lastmod>')
            xml_lines.append(f'    <changefreq>{url_data["changefreq"]}</changefreq>')
            xml_lines.append(f'    <priority>{url_data["priority"]}</priority>')
            xml_lines.append('  </url>')
        
        xml_lines.append('</urlset>')
        xml_content = '\n'.join(xml_lines)
        
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/xml; charset=utf-8'},
            'body': xml_content
        }
        
    except Exception as e:
        print(f'Error generating sitemap: {e}')
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }