'''
Business: Управление отзывами - создание, получение, модерация
Args: event с httpMethod, body, queryStringParameters
Returns: HTTP response с данными отзывов
'''
import json
import os
import psycopg2
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL', '')

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