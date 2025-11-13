"""
Business: Управление постами блога (CRUD операции)
Args: event - dict с httpMethod, queryStringParameters, body
      context - объект с request_id
Returns: HTTP response с данными постов
"""
import json
import os
from typing import Dict, Any
from datetime import datetime

try:
    import psycopg2
except ImportError:
    psycopg2 = None


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Admin-Auth',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action', 'list')
    
    if method == 'GET' and action == 'list':
        return get_posts(event)
    
    if method == 'GET' and action == 'get':
        return get_post(event)
    
    if method == 'POST' and action == 'create':
        return create_post(event)
    
    if method == 'PUT' and action == 'update':
        return update_post(event)
    
    if method == 'DELETE' and action == 'delete':
        return delete_post(event)
    
    return {
        'statusCode': 400,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Invalid action'}),
        'isBase64Encoded': False
    }


def is_admin(event: Dict[str, Any]) -> bool:
    """Проверка прав администратора"""
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return False
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn or not psycopg2:
        return False
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute(
            "SELECT role FROM t_p63326274_course_download_plat.users WHERE id = %s",
            (user_id,)
        )
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        return result and result[0] == 'admin'
    except:
        return False


def get_posts(event: Dict[str, Any]) -> Dict[str, Any]:
    """Получение списка постов (опубликованные для всех, все для админа)"""
    params = event.get('queryStringParameters', {}) or {}
    status_filter = params.get('status', 'published')
    limit = int(params.get('limit', '50'))
    offset = int(params.get('offset', '0'))
    
    admin = is_admin(event)
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn or not psycopg2:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if admin:
            if status_filter == 'all':
                query = """
                    SELECT id, title, slug, excerpt, cover_image_url, status, views_count, 
                           published_at, created_at, updated_at
                    FROM t_p63326274_course_download_plat.blog_posts
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                """
                cur.execute(query, (limit, offset))
            else:
                query = """
                    SELECT id, title, slug, excerpt, cover_image_url, status, views_count,
                           published_at, created_at, updated_at
                    FROM t_p63326274_course_download_plat.blog_posts
                    WHERE status = %s
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                """
                cur.execute(query, (status_filter, limit, offset))
        else:
            query = """
                SELECT id, title, slug, excerpt, cover_image_url, status, views_count,
                       published_at, created_at, updated_at
                FROM t_p63326274_course_download_plat.blog_posts
                WHERE status = 'published'
                ORDER BY published_at DESC
                LIMIT %s OFFSET %s
            """
            cur.execute(query, (limit, offset))
        
        rows = cur.fetchall()
        
        posts = []
        for row in rows:
            posts.append({
                'id': row[0],
                'title': row[1],
                'slug': row[2],
                'excerpt': row[3],
                'coverImageUrl': row[4],
                'status': row[5],
                'viewsCount': row[6],
                'publishedAt': row[7].isoformat() if row[7] else None,
                'createdAt': row[8].isoformat() if row[8] else None,
                'updatedAt': row[9].isoformat() if row[9] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'posts': posts}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def get_post(event: Dict[str, Any]) -> Dict[str, Any]:
    """Получение полного поста по slug"""
    params = event.get('queryStringParameters', {}) or {}
    slug = params.get('slug')
    
    if not slug:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'slug required'}),
            'isBase64Encoded': False
        }
    
    admin = is_admin(event)
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn or not psycopg2:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if admin:
            query = """
                SELECT id, title, slug, content, excerpt, cover_image_url, status, views_count,
                       published_at, created_at, updated_at
                FROM t_p63326274_course_download_plat.blog_posts
                WHERE slug = %s
            """
            cur.execute(query, (slug,))
        else:
            query = """
                SELECT id, title, slug, content, excerpt, cover_image_url, status, views_count,
                       published_at, created_at, updated_at
                FROM t_p63326274_course_download_plat.blog_posts
                WHERE slug = %s AND status = 'published'
            """
            cur.execute(query, (slug,))
        
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Post not found'}),
                'isBase64Encoded': False
            }
        
        # Увеличиваем счётчик просмотров (только для неадминов)
        if not admin:
            cur.execute(
                """UPDATE t_p63326274_course_download_plat.blog_posts 
                   SET views_count = views_count + 1 
                   WHERE slug = %s""",
                (slug,)
            )
            conn.commit()
        
        post = {
            'id': row[0],
            'title': row[1],
            'slug': row[2],
            'content': row[3],
            'excerpt': row[4],
            'coverImageUrl': row[5],
            'status': row[6],
            'viewsCount': row[7] + (0 if admin else 1),
            'publishedAt': row[8].isoformat() if row[8] else None,
            'createdAt': row[9].isoformat() if row[9] else None,
            'updatedAt': row[10].isoformat() if row[10] else None
        }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'post': post}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def create_post(event: Dict[str, Any]) -> Dict[str, Any]:
    """Создание нового поста (только для админа)"""
    if not is_admin(event):
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Admin access required'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
    except:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid JSON'}),
            'isBase64Encoded': False
        }
    
    title = body.get('title')
    slug = body.get('slug')
    content = body.get('content')
    excerpt = body.get('excerpt', '')
    cover_image_url = body.get('coverImageUrl', '')
    status = body.get('status', 'draft')
    
    if not all([title, slug, content]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'title, slug, content required'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn or not psycopg2:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        published_at = datetime.now() if status == 'published' else None
        
        cur.execute(
            """INSERT INTO t_p63326274_course_download_plat.blog_posts 
               (title, slug, content, excerpt, cover_image_url, status, published_at)
               VALUES (%s, %s, %s, %s, %s, %s, %s)
               RETURNING id""",
            (title, slug, content, excerpt, cover_image_url, status, published_at)
        )
        
        post_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'postId': post_id}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def update_post(event: Dict[str, Any]) -> Dict[str, Any]:
    """Обновление поста (только для админа)"""
    if not is_admin(event):
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Admin access required'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
    except:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid JSON'}),
            'isBase64Encoded': False
        }
    
    post_id = body.get('id')
    if not post_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'id required'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn or not psycopg2:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        updates = []
        values = []
        
        if 'title' in body:
            updates.append('title = %s')
            values.append(body['title'])
        
        if 'slug' in body:
            updates.append('slug = %s')
            values.append(body['slug'])
        
        if 'content' in body:
            updates.append('content = %s')
            values.append(body['content'])
        
        if 'excerpt' in body:
            updates.append('excerpt = %s')
            values.append(body['excerpt'])
        
        if 'coverImageUrl' in body:
            updates.append('cover_image_url = %s')
            values.append(body['coverImageUrl'])
        
        if 'status' in body:
            updates.append('status = %s')
            values.append(body['status'])
            
            # Устанавливаем published_at при публикации
            if body['status'] == 'published':
                cur.execute(
                    "SELECT published_at FROM t_p63326274_course_download_plat.blog_posts WHERE id = %s",
                    (post_id,)
                )
                result = cur.fetchone()
                if result and not result[0]:
                    updates.append('published_at = %s')
                    values.append(datetime.now())
        
        updates.append('updated_at = CURRENT_TIMESTAMP')
        values.append(post_id)
        
        query = f"""
            UPDATE t_p63326274_course_download_plat.blog_posts
            SET {', '.join(updates)}
            WHERE id = %s
        """
        
        cur.execute(query, values)
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def delete_post(event: Dict[str, Any]) -> Dict[str, Any]:
    """Удаление поста (только для админа)"""
    if not is_admin(event):
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Admin access required'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {}) or {}
    post_id = params.get('id')
    
    if not post_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'id required'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn or not psycopg2:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute(
            "DELETE FROM t_p63326274_course_download_plat.blog_posts WHERE id = %s",
            (post_id,)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
