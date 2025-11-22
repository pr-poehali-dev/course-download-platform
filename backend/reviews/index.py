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

# Список реалистичных имен пользователей
FAKE_USERNAMES = [
    'Мария Иванова', 'Алексей Смирнов', 'Екатерина Петрова', 'Дмитрий Козлов',
    'Анна Васильева', 'Сергей Морозов', 'Ольга Соколова', 'Михаил Попов',
    'Татьяна Лебедева', 'Николай Новиков', 'Елена Волкова', 'Андрей Федоров',
    'Юлия Егорова', 'Владимир Макаров', 'Наталья Павлова', 'Игорь Семенов',
    'Светлана Григорьева', 'Артем Кузнецов', 'Виктория Степанова', 'Максим Орлов',
    'Ирина Романова', 'Павел Николаев', 'Марина Захарова', 'Денис Жуков',
    'Ксения Королева', 'Роман Беляев', 'Дарья Медведева', 'Станислав Фролов'
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
            query = """
                SELECT r.id, r.work_id, r.user_id, r.rating, r.comment, r.created_at, r.status,
                       u.username
                FROM t_p63326274_course_download_plat.reviews r
                JOIN t_p63326274_course_download_plat.users u ON r.user_id = u.id
                WHERE r.work_id = %s
            """
            
            if status_filter == 'all':
                pass
            elif status_filter == 'pending':
                query += " AND r.status = 'pending'"
            else:
                query += " AND r.status = 'approved'"
            
            query += " ORDER BY r.created_at DESC"
            
            cur.execute(query, (work_id,))
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
    try:
        body = json.loads(event.get('body', '{}'))
        work_id = body.get('work_id')
        user_id = body.get('user_id')
        rating = body.get('rating')
        comment = body.get('comment', '')
        
        if not all([work_id, user_id, rating]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'work_id, user_id и rating обязательны'}),
                'isBase64Encoded': False
            }
        
        if rating < 1 or rating > 5:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Рейтинг должен быть от 1 до 5'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute(
                """SELECT id FROM t_p63326274_course_download_plat.reviews 
                WHERE work_id = %s AND user_id = %s""",
                (work_id, user_id)
            )
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Вы уже оставили отзыв на эту работу'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """INSERT INTO t_p63326274_course_download_plat.reviews 
                (work_id, user_id, rating, comment, status, created_at) 
                VALUES (%s, %s, %s, %s, 'approved', NOW()) 
                RETURNING id""",
                (work_id, user_id, rating, comment)
            )
            review_id = cur.fetchone()[0]
            conn.commit()
            
            cur.execute(
                """UPDATE t_p63326274_course_download_plat.works 
                SET reviews_count = COALESCE(reviews_count, 0) + 1 
                WHERE id = %s""",
                (work_id,)
            )
            conn.commit()
            
            # Получаем информацию о работе и пользователе для уведомления
            cur.execute(
                """SELECT w.title, u.username 
                FROM t_p63326274_course_download_plat.works w, t_p63326274_course_download_plat.users u
                WHERE w.id = %s AND u.id = %s""",
                (work_id, user_id)
            )
            work_info = cur.fetchone()
            work_title = work_info[0] if work_info else 'Работа'
            username = work_info[1] if work_info else 'Пользователь'
            
            # Отправляем уведомление админу (user_id = 1)
            cur.execute(
                """INSERT INTO t_p63326274_course_download_plat.user_messages 
                (user_id, title, message, type, is_read, created_at)
                VALUES (1, %s, %s, 'info', FALSE, NOW())""",
                (
                    f'Новый отзыв на работу "{work_title}"',
                    f'Пользователь {username} оставил отзыв ({rating} звезд) на работу "{work_title}": {comment[:100]}...'
                )
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'review_id': review_id, 'message': 'Отзыв успешно опубликован'}),
                'isBase64Encoded': False
            }
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()
    except Exception as e:
        print(f"Create review error: {repr(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Failed to create review'}),
            'isBase64Encoded': False
        }

def moderate_review(event: Dict[str, Any]) -> Dict[str, Any]:
    '''Модерировать отзыв (одобрить/отклонить)'''
    try:
        headers = event.get('headers', {})
        admin_id = headers.get('X-User-Id') or headers.get('x-user-id')
        
        if not admin_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        body = json.loads(event.get('body', '{}'))
        review_id = body.get('review_id')
        new_status = body.get('status')
        
        if not all([review_id, new_status]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'review_id и status обязательны'}),
                'isBase64Encoded': False
            }
        
        if new_status not in ['approved', 'rejected']:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Статус должен быть approved или rejected'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute(
                """SELECT role FROM t_p63326274_course_download_plat.users WHERE id = %s""",
                (admin_id,)
            )
            user_role = cur.fetchone()
            if not user_role or user_role[0] != 'admin':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуются права администратора'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """UPDATE t_p63326274_course_download_plat.reviews 
                SET status = %s, moderated_at = NOW(), moderated_by = %s 
                WHERE id = %s""",
                (new_status, admin_id, review_id)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': f'Отзыв {new_status}'}),
                'isBase64Encoded': False
            }
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()
    except Exception as e:
        print(f"Moderate review error: {repr(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Failed to moderate review'}),
            'isBase64Encoded': False
        }

def delete_review(event: Dict[str, Any]) -> Dict[str, Any]:
    '''Удалить отзыв (только админ)'''
    try:
        headers = event.get('headers', {})
        admin_id = headers.get('X-User-Id') or headers.get('x-user-id')
        
        if not admin_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        body = json.loads(event.get('body', '{}'))
        review_id = body.get('review_id')
        
        if not review_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'review_id обязателен'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute(
                """SELECT role FROM t_p63326274_course_download_plat.users WHERE id = %s""",
                (admin_id,)
            )
            user_role = cur.fetchone()
            if not user_role or user_role[0] != 'admin':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуются права администратора'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """SELECT work_id FROM t_p63326274_course_download_plat.reviews WHERE id = %s""",
                (review_id,)
            )
            work_id_row = cur.fetchone()
            
            if not work_id_row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Отзыв не найден'}),
                    'isBase64Encoded': False
                }
            
            work_id = work_id_row[0]
            
            cur.execute(
                """DELETE FROM t_p63326274_course_download_plat.reviews WHERE id = %s""",
                (review_id,)
            )
            conn.commit()
            
            cur.execute(
                """UPDATE t_p63326274_course_download_plat.works 
                SET reviews_count = GREATEST(COALESCE(reviews_count, 0) - 1, 0) 
                WHERE id = %s""",
                (work_id,)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Отзыв удалён'}),
                'isBase64Encoded': False
            }
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()
    except Exception as e:
        print(f"Delete review error: {repr(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Failed to delete review'}),
            'isBase64Encoded': False
        }

def generate_fake_reviews(event: Dict[str, Any]) -> Dict[str, Any]:
    '''Генерировать фейковые отзывы для работ'''
    admin_email = event.get('headers', {}).get('x-admin-email') or event.get('headers', {}).get('X-Admin-Email')
    if admin_email != 'rekrutiw@yandex.ru':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    work_ids = body_data.get('work_ids', 'all')
    reviews_per_work = body_data.get('reviews_per_work', 2)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if work_ids == 'all':
            cur.execute("""
                SELECT id, title, work_type 
                FROM t_p63326274_course_download_plat.works 
                WHERE title NOT LIKE '[УДАЛЕНО]%'
                ORDER BY id
            """)
        else:
            placeholders = ','.join(['%s'] * len(work_ids))
            cur.execute(f"""
                SELECT id, title, work_type 
                FROM t_p63326274_course_download_plat.works 
                WHERE id IN ({placeholders})
            """, work_ids)
        
        works = cur.fetchall()
        
        total_created = 0
        total_skipped = 0
        errors = []
        
        for work_id, work_title, work_type in works:
            try:
                cur.execute("""
                    SELECT COUNT(*) 
                    FROM t_p63326274_course_download_plat.reviews 
                    WHERE work_id = %s
                """, (work_id,))
                existing_reviews = cur.fetchone()[0]
                
                if existing_reviews > 0:
                    total_skipped += 1
                    continue
                
                reviews_count = random.randint(reviews_per_work, reviews_per_work + 1)
                
                for i in range(reviews_count):
                    username = random.choice(FAKE_USERNAMES)
                    rating = 5 if random.random() < 0.9 else 4
                    
                    work_type_lower = work_type.lower()
                    template_key = 'другое'
                    for key in REVIEW_TEMPLATES.keys():
                        if key in work_type_lower:
                            template_key = key
                            break
                    
                    comment = random.choice(REVIEW_TEMPLATES[template_key])
                    days_ago = random.randint(1, 90)
                    created_at = datetime.now() - timedelta(days=days_ago)
                    
                    cur.execute("""
                        SELECT id FROM t_p63326274_course_download_plat.users 
                        WHERE username = %s
                    """, (username,))
                    
                    user_row = cur.fetchone()
                    if user_row:
                        user_id = user_row[0]
                    else:
                        fake_email = f"fake_{username.replace(' ', '_').lower()}@example.com"
                        cur.execute("""
                            INSERT INTO t_p63326274_course_download_plat.users 
                            (username, email, password_hash, role, balance, created_at)
                            VALUES (%s, %s, 'fake_hash', 'user', 0, NOW())
                            RETURNING id
                        """, (username, fake_email))
                        user_id = cur.fetchone()[0]
                    
                    cur.execute("""
                        INSERT INTO t_p63326274_course_download_plat.reviews 
                        (work_id, user_id, rating, comment, status, created_at)
                        VALUES (%s, %s, %s, %s, 'approved', %s)
                    """, (work_id, user_id, rating, comment, created_at))
                    
                    total_created += 1
                
                cur.execute("""
                    UPDATE t_p63326274_course_download_plat.works 
                    SET reviews_count = (
                        SELECT COUNT(*) 
                        FROM t_p63326274_course_download_plat.reviews 
                        WHERE work_id = %s AND status = 'approved'
                    )
                    WHERE id = %s
                """, (work_id, work_id))
                
                conn.commit()
                
            except Exception as e:
                conn.rollback()
                errors.append({
                    'work_id': work_id,
                    'work_title': work_title,
                    'error': str(e)
                })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'total_works': len(works),
                'reviews_created': total_created,
                'works_skipped': total_skipped,
                'errors': errors,
                'message': f'Создано {total_created} отзывов для {len(works) - total_skipped - len(errors)} работ'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"Generate fake reviews error: {repr(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Failed to generate reviews: {str(e)}'}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()