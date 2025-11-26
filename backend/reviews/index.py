'''
Business: Управление отзывами - создание, получение, модерация
Args: event с httpMethod, body, queryStringParameters
Returns: HTTP response с данными отзывов
'''
import json
import os
import psycopg2
import random
from typing import Dict, Any
from datetime import datetime, timedelta

DATABASE_URL = os.environ.get('DATABASE_URL', '')

# Список реалистичных ников пользователей
FAKE_USERNAMES = [
    'techStudent2023', 'engineer_pro', 'study_helper', 'workMaster',
    'smartStudent', 'techGenius', 'courseKing', 'diplomPro',
    'fastLearner', 'topGrade', 'studyBuddy', 'engineerLife',
    'academicStar', 'gradeHunter', 'techSavvy', 'smartWorker',
    'studyGoals', 'examAce', 'projectPro', 'thesisGuru',
    'courseHelper', 'labExpert', 'designMaster', 'calcPro',
    'techWriter', 'acadHelper', 'studyMode', 'gradeBooster'
]

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
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'list')
    
    if method == 'GET' and action == 'list':
        return get_reviews(event)
    elif method == 'POST' and action == 'create':
        return create_review(event)
    elif method == 'POST' and action == 'generate_fake':
        return generate_fake_reviews(event)
    elif method == 'PUT' and action == 'moderate':
        return moderate_review(event)
    elif method == 'DELETE' and action == 'delete':
        return delete_review(event)
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }

def get_reviews(event: Dict[str, Any]) -> Dict[str, Any]:
    '''Получить отзывы для работы'''
    params = event.get('queryStringParameters') or {}
    work_id = params.get('work_id')
    status_filter = params.get('status', 'approved')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if work_id:
            work_id_int = int(work_id)
            query = f"""
                SELECT r.id, r.work_id, r.user_id, r.rating, r.comment, r.created_at, r.status,
                       u.username
                FROM t_p63326274_course_download_plat.reviews r
                JOIN t_p63326274_course_download_plat.users u ON r.user_id = u.id
                WHERE r.work_id = {work_id_int}
            """
            
            if status_filter == 'all':
                pass
            elif status_filter == 'pending':
                query += " AND r.status = 'pending'"
            else:
                query += " AND r.status = 'approved'"
            
            query += " ORDER BY r.created_at DESC"
            
            cur.execute(query)
        else:
            query = """
                SELECT r.id, r.work_id, r.user_id, r.rating, r.comment, r.created_at, r.status,
                       u.username, w.title
                FROM t_p63326274_course_download_plat.reviews r
                JOIN t_p63326274_course_download_plat.users u ON r.user_id = u.id
                JOIN t_p63326274_course_download_plat.works w ON r.work_id = w.id
            """
            
            if status_filter == 'pending':
                query += " WHERE r.status = 'pending'"
            elif status_filter != 'all':
                query += " WHERE r.status = 'approved'"
            
            query += " ORDER BY r.created_at DESC LIMIT 100"
            
            cur.execute(query)
        
        rows = cur.fetchall()
        
        reviews = []
        for row in rows:
            review = {
                'id': row[0],
                'work_id': row[1],
                'user_id': row[2],
                'rating': row[3],
                'comment': row[4],
                'created_at': row[5].isoformat() if row[5] else None,
                'status': row[6],
                'username': row[7]
            }
            if len(row) > 8:
                review['work_title'] = row[8]
            reviews.append(review)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'reviews': reviews}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f"Get reviews error: {repr(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Failed to get reviews'}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()

def create_review(event: Dict[str, Any]) -> Dict[str, Any]:
    '''Создать новый отзыв'''
    headers = event.get('headers') or {}
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User not authenticated'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        work_id = body.get('work_id')
        rating = body.get('rating')
        comment = body.get('comment', '')
        
        if not work_id or not rating:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'work_id and rating are required'}),
                'isBase64Encoded': False
            }
        
        if not (1 <= rating <= 5):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Rating must be between 1 and 5'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            # Проверка существования работы
            work_id_int = int(work_id)
            cur.execute(f"SELECT id FROM t_p63326274_course_download_plat.works WHERE id = {work_id_int}")
            if not cur.fetchone():
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Work not found'}),
                    'isBase64Encoded': False
                }
            
            # Проверка существования пользователя
            user_id_int = int(user_id)
            cur.execute(f"SELECT id FROM t_p63326274_course_download_plat.users WHERE id = {user_id_int}")
            if not cur.fetchone():
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            # Проверка, не оставил ли пользователь уже отзыв
            cur.execute(f"""
                SELECT id FROM t_p63326274_course_download_plat.reviews 
                WHERE work_id = {work_id_int} AND user_id = {user_id_int}
            """)
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'You have already reviewed this work'}),
                    'isBase64Encoded': False
                }
            
            # Создание отзыва
            rating_int = int(rating)
            comment_escaped = escape_sql_string(comment)
            cur.execute(f"""
                INSERT INTO t_p63326274_course_download_plat.reviews 
                (work_id, user_id, rating, comment, status, created_at)
                VALUES ({work_id_int}, {user_id_int}, {rating_int}, {comment_escaped}, 'pending', NOW())
                RETURNING id
            """)
            review_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': 'Review created successfully (pending moderation)',
                    'review_id': review_id
                }),
                'isBase64Encoded': False
            }
        except Exception as e:
            conn.rollback()
            print(f"Create review error: {repr(e)}")
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Failed to create review'}),
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

def generate_fake_reviews(event: Dict[str, Any]) -> Dict[str, Any]:
    '''Генерация фейковых отзывов для работ'''
    headers = event.get('headers') or {}
    admin_token = headers.get('x-admin-token') or headers.get('X-Admin-Token')
    
    # Простая проверка админского токена
    if admin_token != 'admin_secret_token_2024':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Admin access required'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        work_id = body.get('work_id')
        count = min(body.get('count', 3), 10)  # Максимум 10 отзывов за раз
        
        if not work_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'work_id is required'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            # Получить информацию о работе
            work_id_int = int(work_id)
            cur.execute(f"""
                SELECT id, work_type FROM t_p63326274_course_download_plat.works 
                WHERE id = {work_id_int}
            """)
            work = cur.fetchone()
            if not work:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Work not found'}),
                    'isBase64Encoded': False
                }
            
            work_type = work[1] if work[1] in REVIEW_TEMPLATES else 'другое'
            
            # Получить список пользователей, которые еще не оставили отзыв
            cur.execute(f"""
                SELECT u.id FROM t_p63326274_course_download_plat.users u
                WHERE NOT EXISTS (
                    SELECT 1 FROM t_p63326274_course_download_plat.reviews r
                    WHERE r.user_id = u.id AND r.work_id = {work_id_int}
                )
                ORDER BY RANDOM()
                LIMIT {int(count)}
            """)
            available_users = cur.fetchall()
            
            if not available_users:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No available users for fake reviews'}),
                    'isBase64Encoded': False
                }
            
            created_count = 0
            for user_row in available_users:
                user_id_val = user_row[0]
                rating = random.choices([4, 5], weights=[30, 70])[0]  # 70% пятерок, 30% четверок
                comment = random.choice(REVIEW_TEMPLATES[work_type])
                
                # Случайная дата в последние 30 дней
                days_ago = random.randint(1, 30)
                created_at = datetime.now() - timedelta(days=days_ago)
                created_at_str = created_at.strftime('%Y-%m-%d %H:%M:%S')
                
                rating_int = int(rating)
                user_id_int = int(user_id_val)
                comment_escaped = escape_sql_string(comment)
                
                cur.execute(f"""
                    INSERT INTO t_p63326274_course_download_plat.reviews 
                    (work_id, user_id, rating, comment, status, created_at)
                    VALUES ({work_id_int}, {user_id_int}, {rating_int}, {comment_escaped}, 'approved', '{created_at_str}')
                """)
                created_count += 1
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': f'Generated {created_count} fake reviews',
                    'count': created_count
                }),
                'isBase64Encoded': False
            }
        except Exception as e:
            conn.rollback()
            print(f"Generate fake reviews error: {repr(e)}")
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Failed to generate fake reviews'}),
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

def moderate_review(event: Dict[str, Any]) -> Dict[str, Any]:
    '''Модерация отзыва (одобрить/отклонить)'''
    headers = event.get('headers') or {}
    admin_token = headers.get('x-admin-token') or headers.get('X-Admin-Token')
    
    # Простая проверка админского токена
    if admin_token != 'admin_secret_token_2024':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Admin access required'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        review_id = body.get('review_id')
        action = body.get('action')  # 'approve' or 'reject'
        
        if not review_id or not action:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'review_id and action are required'}),
                'isBase64Encoded': False
            }
        
        if action not in ['approve', 'reject']:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'action must be either "approve" or "reject"'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            review_id_int = int(review_id)
            
            if action == 'approve':
                cur.execute(f"""
                    UPDATE t_p63326274_course_download_plat.reviews
                    SET status = 'approved'
                    WHERE id = {review_id_int}
                """)
            else:  # reject
                cur.execute(f"""
                    UPDATE t_p63326274_course_download_plat.reviews
                    SET status = 'rejected'
                    WHERE id = {review_id_int}
                """)
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': f'Review {action}d successfully'
                }),
                'isBase64Encoded': False
            }
        except Exception as e:
            conn.rollback()
            print(f"Moderate review error: {repr(e)}")
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Failed to moderate review'}),
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

def delete_review(event: Dict[str, Any]) -> Dict[str, Any]:
    '''Удаление отзыва'''
    headers = event.get('headers') or {}
    admin_token = headers.get('x-admin-token') or headers.get('X-Admin-Token')
    
    # Простая проверка админского токена
    if admin_token != 'admin_secret_token_2024':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Admin access required'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    review_id = params.get('review_id')
    
    if not review_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'review_id is required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        review_id_int = int(review_id)
        cur.execute(f"""
            DELETE FROM t_p63326274_course_download_plat.reviews
            WHERE id = {review_id_int}
        """)
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Review deleted successfully'
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        print(f"Delete review error: {repr(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Failed to delete review'}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()
