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
        'Преподаватель сразу одобрил работу, никаких правок не потребовалось. Все формулы и расчеты проверены, графики наглядные.',
        'Скачал, распечатал, защитил на 5. Вся практическая часть выполнена идеально. Список литературы актуальный.',
        'Работа выполнена грамотно, без воды. Четкая структура, понятные выводы. Преподу понравилось.',
        'За эту цену просто отличный вариант! Не пришлось ничего переделывать. Оформление как в методичке.',
        'Купил за 3 дня до защиты, успел разобраться во всем. Защитился успешно, получил 5. Качество супер!',
    ],
    'диплом': [
        'Дипломная работа высокого уровня! Все разделы проработаны детально, актуальные данные, качественные чертежи. Комиссия была впечатлена. Получил "отлично"!',
        'Потрясающий диплом! Теоретическая и практическая части выполнены профессионально. Все расчеты проверены, презентация информативная. Защитился на 5!',
        'Отличная дипломная работа. Все соответствует ГОСТ, актуальные источники литературы, грамотное оформление. Рекомендую для защиты!',
        'Качественный диплом с детальной проработкой темы. Графическая часть выполнена в AutoCAD профессионально. Комиссия оценила работу очень высоко.',
        'Купил этот диплом как основу для своей работы. Сэкономил месяцы работы! Все разделы проработаны, только немного адаптировал под свой вуз.',
        'Защитился на красный диплом благодаря этой работе! Рецензент поставил высшую оценку. Очень благодарен автору.',
        'Вся комиссия была довольна качеством работы. Особенно отметили актуальность темы и глубину проработки.',
        'Диплом полностью готов к защите. Презентация прилагается, доклад написан. За 2 недели успел все изучить и выучить.',
        'Боялся брать диплом в интернете, но не пожалел. Качество на уровне, все по стандартам моего университета.',
        'Экономическая часть рассчитана идеально. Графики, таблицы - все на месте. Преподаватель даже удивился качеству.',
    ],
    'реферат': [
        'Хороший реферат, все основные моменты раскрыты. Список литературы актуальный. Преподаватель принял без замечаний.',
        'Качественная работа для реферата. Структура логичная, материал изложен понятно. Получил зачет с первого раза.',
        'Отличный реферат! Тема раскрыта полностью, есть введение, основная часть и выводы. Оформление по стандартам.',
        'Скачал, распечатал, сдал. Преподавателю понравилось. Не самая сложная работа, но качество хорошее.',
        'Для реферата отличный вариант. Все по делу, без лишней воды. Источники свежие, оформление правильное.',
        'Быстро, качественно, недорого. Именно то, что нужно для зачета. Преподаватель принял с первого раза.',
    ],
    'чертеж': [
        'Чертежи выполнены профессионально в КОМПАС-3D. Все размеры проставлены, спецификация заполнена. Преподаватель принял сразу.',
        'Качественная графическая работа! Чертежи читаемые, оформление по ЕСКД. Очень доволен результатом.',
        'Отличные чертежи, все по стандартам. Сэкономил много времени на черчении. Рекомендую!',
        'Все листы оформлены по ГОСТ. Размеры проставлены правильно, линии четкие. Препод принял без единого замечания.',
        'Чертежи в формате DWG, легко открываются в AutoCAD. Все слои настроены, спецификация заполнена.',
        'Графическая часть выполнена на 5+. Сечения, разрезы - все грамотно. Даже преподаватель похвалил.',
    ],
    'лабораторная': [
        'Отличная лабораторная работа! Все расчеты выполнены, графики построены, выводы сделаны. Преподаватель принял на отлично.',
        'Качественная работа, все данные реальные, расчеты верные. Получил максимальный балл.',
        'Хорошая лабораторная, все по методичке. Немного доработал выводы и защитил на 5.',
        'Таблицы заполнены правильно, формулы применены корректно. Графики построены в Excel. Все замечательно.',
        'Защитился без вопросов. Все расчеты проверены, погрешности рассчитаны. Преподаватель одобрил.',
        'Лаба полностью готова к сдаче. Экспериментальная часть описана подробно, выводы логичные.',
    ],
    'контрольная': [
        'Все задания решены правильно, оформление аккуратное. Преподаватель поставил зачет без вопросов.',
        'Качественная контрольная работа. Все задачи с подробными решениями. Очень помогло разобраться в теме.',
        'Отличная работа! Все примеры решены с пояснениями. Сдал на отлично.',
        'Решения подробные, понятные. Даже смог разобраться в теме благодаря этой работе. Препод доволен.',
        'Все задачи решены верно, проверял сам. Оформление по образцу. Получил максимальный балл.',
        'Контрольная работа выполнена грамотно. Все формулы расписаны, ответы правильные. Рекомендую!',
    ],
    'другое': [
        'Качественная работа, все требования выполнены. Преподаватель принял с первого раза. Рекомендую!',
        'Отличная работа! Все четко, понятно, оформлено по стандартам. Очень доволен покупкой.',
        'Хорошая работа за свою цену. Сэкономил время и получил хороший результат.',
        'Материал актуальный, оформление правильное. Преподаватель оценил на отлично.',
        'Работа выполнена грамотно, без ошибок. Все по делу, структура логичная. Спасибо автору!',
        'За такую цену просто отличный вариант. Качество хорошее, срок выполнения быстрый.',
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
            
            # Собираем все INSERT-ы в один батч
            values_list = []
            
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
                    
                    values_list.append(f"({int(work_id_val)}, {int(user_id_val)}, {int(rating)}, {comment_escaped}, 'approved', '{created_at_str}')")
                    total_created += 1
                
                processed_works += 1
            
            # Один массовый INSERT вместо тысяч отдельных
            if values_list:
                batch_size = 500
                for i in range(0, len(values_list), batch_size):
                    batch = values_list[i:i+batch_size]
                    values_str = ',\n'.join(batch)
                    cur.execute(f"""
                        INSERT INTO t_p63326274_course_download_plat.reviews 
                        (work_id, user_id, rating, comment, status, created_at)
                        VALUES {values_str}
                    """)
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