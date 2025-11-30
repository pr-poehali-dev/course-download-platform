'''
Business: Автоматическая генерация отзывов для всех работ одним запросом
Args: event с httpMethod, body (reviews_per_work)
Returns: HTTP response с статистикой генерации
'''
import json
import os
import psycopg2
import random
from typing import Dict, Any
from datetime import datetime, timedelta

DATABASE_URL = os.environ.get('DATABASE_URL', '')

# Шаблоны положительных отзывов
REVIEW_TEMPLATES = {
    'курсовая': [
        'Отличная курсовая работа! Все расчеты выполнены правильно, оформление по ГОСТу. Преподаватель принял с первого раза на "отлично". Очень доволен покупкой!',
        'Качественная работа, все требования соблюдены. Графическая часть выполнена профессионально. Защитился без замечаний. Рекомендую!',
        'Купил эту курсовую для своего проекта. Все четко, понятно, расчеты верные. Сэкономил кучу времени. Спасибо автору за качество!',
        'Работа соответствует всем требованиям методички. Чертежи читаемые, пояснительная записка структурирована. Получил 5 баллов за защиту.',
        'Хорошая основа для курсовой работы. Немного доработал под свои требования и успешно защитил. Качество материала на высоте!',
    ],
    'диплом': [
        'Дипломная работа высокого уровня! Все разделы проработаны детально, актуальные данные, качественные чертежи. Комиссия была впечатлена. Получил "отлично"!',
        'Потрясающий диплом! Теоретическая и практическая части выполнены профессионально. Все расчеты проверены, презентация информативная. Защитился на 5!',
        'Отличная дипломная работа. Все соответствует ГОСТ, актуальные источники литературы, грамотное оформление. Рекомендую для защиты!',
        'Качественный диплом с детальной проработкой темы. Графическая часть выполнена в AutoCAD профессионально. Комиссия оценила работу очень высоко.',
        'Купил этот диплом как основу для своей работы. Сэкономил месяцы работы! Все разделы проработаны, только немного адаптировал под свой вуз.',
    ],
    'реферат': [
        'Хороший реферат, все основные моменты раскрыты. Список литературы актуальный. Преподаватель принял без замечаний.',
        'Качественная работа для реферата. Структура логичная, материал изложен понятно. Получил зачет с первого раза.',
        'Отличный реферат! Тема раскрыта полностью, есть введение, основная часть и выводы. Оформление по стандартам.',
    ],
    'чертеж': [
        'Чертежи выполнены профессионально в КОМПАС-3D. Все размеры проставлены, спецификация заполнена. Преподаватель принял сразу.',
        'Качественная графическая работа! Чертежи читаемые, оформление по ЕСКД. Очень доволен результатом.',
        'Отличные чертежи, все по стандартам. Сэкономил много времени на черчении. Рекомендую!',
    ],
    'лабораторная': [
        'Отличная лабораторная работа! Все расчеты выполнены, графики построены, выводы сделаны. Преподаватель принял на отлично.',
        'Качественная работа, все данные реальные, расчеты верные. Получил максимальный балл.',
        'Хорошая лабораторная, все по методичке. Немного доработал выводы и защитил на 5.',
    ],
    'контрольная': [
        'Все задания решены правильно, оформление аккуратное. Преподаватель поставил зачет без вопросов.',
        'Качественная контрольная работа. Все задачи с подробными решениями. Очень помогло разобраться в теме.',
        'Отличная работа! Все примеры решены с пояснениями. Сдал на отлично.',
    ],
    'другое': [
        'Качественная работа, все требования выполнены. Преподаватель принял с первого раза. Рекомендую!',
        'Отличная работа! Все четко, понятно, оформлено по стандартам. Очень доволен покупкой.',
        'Хорошая работа за свою цену. Сэкономил время и получил хороший результат.',
    ]
}

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def escape_sql_string(s):
    """Escape single quotes in strings for SQL by doubling them"""
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers') or {}
    admin_token = headers.get('x-admin-token') or headers.get('X-Admin-Token')
    
    if admin_token != 'admin_secret_token_2024':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Admin access required'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        reviews_per_work = min(body.get('reviews_per_work', 3), 5)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            # Получаем все работы
            cur.execute("""
                SELECT id, work_type FROM t_p63326274_course_download_plat.works 
                ORDER BY id
            """)
            works = cur.fetchall()
            
            # Получаем всех пользователей
            cur.execute("SELECT id FROM t_p63326274_course_download_plat.users")
            all_users = [row[0] for row in cur.fetchall()]
            
            if not all_users:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No users available'}),
                    'isBase64Encoded': False
                }
            
            # Загружаем ВСЕ существующие отзывы одним запросом
            cur.execute("""
                SELECT work_id, user_id FROM t_p63326274_course_download_plat.reviews
            """)
            existing_reviews = {}
            for row in cur.fetchall():
                work_id = row[0]
                user_id = row[1]
                if work_id not in existing_reviews:
                    existing_reviews[work_id] = set()
                existing_reviews[work_id].add(user_id)
            
            total_created = 0
            processed_works = 0
            skipped_works = 0
            
            for work_row in works:
                work_id_val = work_row[0]
                work_type = work_row[1] if work_row[1] in REVIEW_TEMPLATES else 'другое'
                
                # Получаем существующих рецензентов для этой работы
                existing_reviewers = existing_reviews.get(work_id_val, set())
                
                # Доступные пользователи для новых отзывов
                available_users = [u for u in all_users if u not in existing_reviewers]
                
                # Если недостаточно пользователей, пропускаем работу
                if len(available_users) < reviews_per_work:
                    skipped_works += 1
                    continue
                
                # Выбираем случайных пользователей
                selected_users = random.sample(available_users, reviews_per_work)
                
                # Создаем отзывы
                for user_id_val in selected_users:
                    rating = random.choices([4, 5], weights=[30, 70])[0]
                    comment = random.choice(REVIEW_TEMPLATES[work_type])
                    days_ago = random.randint(1, 90)
                    created_at = datetime.now() - timedelta(days=days_ago)
                    created_at_str = created_at.strftime('%Y-%m-%d %H:%M:%S')
                    
                    comment_escaped = escape_sql_string(comment)
                    
                    cur.execute(f"""
                        INSERT INTO t_p63326274_course_download_plat.reviews 
                        (work_id, user_id, rating, comment, status, created_at)
                        VALUES ({int(work_id_val)}, {int(user_id_val)}, {int(rating)}, {comment_escaped}, 'approved', '{created_at_str}')
                    """)
                    total_created += 1
                
                processed_works += 1
                
                # Коммитим каждые 100 работ для стабильности
                if processed_works % 100 == 0:
                    conn.commit()
            
            # Финальный коммит
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': f'Автогенерация завершена успешно',
                    'total_works': len(works),
                    'processed_works': processed_works,
                    'skipped_works': skipped_works,
                    'total_reviews_created': total_created,
                    'reviews_per_work': reviews_per_work
                }),
                'isBase64Encoded': False
            }
        except Exception as e:
            conn.rollback()
            print(f"Auto-generate error: {repr(e)}")
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Failed to auto-generate: {str(e)}'}),
                'isBase64Encoded': False
            }
        finally:
            cur.close()
            conn.close()
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid JSON'}),
            'isBase64Encoded': False
        }