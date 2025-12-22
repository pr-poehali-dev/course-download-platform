import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get user's favorites, purchases, referral stats, admin users management
    Args: event with httpMethod, queryStringParameters {user_id, action}
    Returns: User data (favorites, purchases, referrals) or all users for admin
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Admin-Email',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    # Проверка админ-доступа
    admin_email = event.get('headers', {}).get('X-Admin-Email') or event.get('headers', {}).get('x-admin-email')
    is_admin = (admin_email == 'rekrutiw@yandex.ru')
    
    # Админ может запросить список всех пользователей
    if method == 'GET' and is_admin:
        params = event.get('queryStringParameters', {}) or {}
        if params.get('action') == 'all_users':
            return get_all_users(headers)
    
    # Админ может обновлять баланс
    if method == 'PUT' and is_admin:
        return update_user_balance(event, headers)
    
    # Админ может удалять тестовых пользователей
    if method == 'DELETE' and is_admin:
        params = event.get('queryStringParameters', {}) or {}
        if params.get('action') == 'delete_fake_users':
            return delete_fake_users(headers)
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('user_id')
        action = params.get('action', 'all')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'user_id required'})
            }
        
        result = {}
        
        # Get favorites with work details
        if action in ['all', 'favorites']:
            cur.execute('''
                SELECT w.id, w.title, w.work_type, w.subject, w.price_points, w.rating, w.downloads_count
                FROM t_p63326274_course_download_plat.favorites f
                JOIN t_p63326274_course_download_plat.works w ON f.work_id = w.id
                WHERE f.user_id = %s
                ORDER BY f.created_at DESC
            ''', (user_id,))
            favorites = []
            for row in cur.fetchall():
                favorites.append({
                    'id': row[0],
                    'title': row[1],
                    'type': row[2],
                    'subject': row[3],
                    'price': row[4],
                    'rating': float(row[5]) if row[5] else 0,
                    'downloads': row[6]
                })
            result['favorites'] = favorites
        
        # Get purchases with work details
        if action in ['all', 'purchases']:
            cur.execute('''
                SELECT w.id, w.title, w.work_type, w.subject, p.price_paid, p.created_at
                FROM t_p63326274_course_download_plat.purchases p
                JOIN t_p63326274_course_download_plat.works w ON p.work_id = w.id
                WHERE p.buyer_id = %s
                ORDER BY p.created_at DESC
            ''', (user_id,))
            purchases = []
            for row in cur.fetchall():
                purchases.append({
                    'id': row[0],
                    'title': row[1],
                    'type': row[2],
                    'subject': row[3],
                    'price_paid': row[4],
                    'purchased_at': row[5].isoformat() if row[5] else None
                })
            result['purchases'] = purchases
        
        # Get transactions history
        if action in ['all', 'transactions']:
            cur.execute('''
                SELECT id, type, amount, description, created_at
                FROM t_p63326274_course_download_plat.transactions
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT 100
            ''', (user_id,))
            transactions = []
            for row in cur.fetchall():
                transactions.append({
                    'id': row[0],
                    'type': row[1],
                    'amount': row[2],
                    'description': row[3],
                    'created_at': row[4].isoformat() if row[4] else None
                })
            result['transactions'] = transactions
        
        # Get referral stats
        if action in ['all', 'referrals']:
            # Get referral code
            cur.execute('''
                SELECT referral_code FROM t_p63326274_course_download_plat.users
                WHERE id = %s
            ''', (user_id,))
            ref_row = cur.fetchone()
            referral_code = ref_row[0] if ref_row else ''
            
            # Count referred users
            cur.execute('''
                SELECT COUNT(*) FROM t_p63326274_course_download_plat.users
                WHERE referred_by = %s
            ''', (user_id,))
            referred_count = cur.fetchone()[0]
            
            # Calculate total referral earnings from referral_bonus transactions
            cur.execute('''
                SELECT COALESCE(SUM(amount), 0) FROM t_p63326274_course_download_plat.transactions
                WHERE user_id = %s AND type = 'referral_bonus'
            ''', (user_id,))
            total_earned = cur.fetchone()[0]
            
            result['referral'] = {
                'code': referral_code,
                'referred_count': referred_count,
                'total_earned': total_earned
            }
        
        # Get user statistics (works uploaded by this user)
        if action in ['all', 'stats']:
            # Count works uploaded by user (where author_id = user_id)
            cur.execute('''
                SELECT COUNT(*) FROM t_p63326274_course_download_plat.works
                WHERE author_id = %s
            ''', (user_id,))
            works_uploaded = cur.fetchone()[0]
            
            # Count purchases by this user
            cur.execute('''
                SELECT COUNT(*) FROM t_p63326274_course_download_plat.purchases
                WHERE buyer_id = %s
            ''', (user_id,))
            works_purchased = cur.fetchone()[0]
            
            # Total earned from selling works (where user is author)
            cur.execute('''
                SELECT COALESCE(SUM(p.price_paid), 0) 
                FROM t_p63326274_course_download_plat.purchases p
                JOIN t_p63326274_course_download_plat.works w ON p.work_id = w.id
                WHERE w.author_id = %s
            ''', (user_id,))
            total_earned_from_sales = cur.fetchone()[0]
            
            # Total spent on purchases
            cur.execute('''
                SELECT COALESCE(SUM(price_paid), 0) 
                FROM t_p63326274_course_download_plat.purchases
                WHERE buyer_id = %s
            ''', (user_id,))
            total_spent = cur.fetchone()[0]
            
            result['stats'] = {
                'works_uploaded': works_uploaded,
                'works_purchased': works_purchased,
                'total_earned': total_earned_from_sales,
                'total_spent': total_spent
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(result)
        }
        
    finally:
        cur.close()
        conn.close()

def get_all_users(headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получить список всех зарегистрированных пользователей (без фейковых) для админа'''
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT 
                u.id,
                u.username,
                u.email,
                u.balance,
                u.created_at,
                u.registration_ip,
                u.referral_code,
                u.referred_by,
                COUNT(DISTINCT w.id) as total_uploads,
                COUNT(DISTINCT p.id) as total_purchases,
                COALESCE(SUM(CASE WHEN p2.work_id IN (SELECT id FROM t_p63326274_course_download_plat.works WHERE author_id = u.id) THEN p2.price_paid ELSE 0 END), 0) as total_earned,
                (
                    SELECT MAX(created_at) 
                    FROM (
                        SELECT created_at FROM t_p63326274_course_download_plat.purchases WHERE buyer_id = u.id
                        UNION ALL
                        SELECT created_at FROM t_p63326274_course_download_plat.transactions WHERE user_id = u.id
                        UNION ALL
                        SELECT created_at FROM t_p63326274_course_download_plat.favorites WHERE user_id = u.id
                    ) activities
                ) as last_activity
            FROM t_p63326274_course_download_plat.users u
            LEFT JOIN t_p63326274_course_download_plat.works w ON w.author_id = u.id
            LEFT JOIN t_p63326274_course_download_plat.purchases p ON p.buyer_id = u.id
            LEFT JOIN t_p63326274_course_download_plat.purchases p2 ON p2.work_id IN (SELECT id FROM t_p63326274_course_download_plat.works WHERE author_id = u.id)
            WHERE u.id < 1000000 AND u.email NOT LIKE '%@fake.local%'
            GROUP BY u.id, u.username, u.email, u.balance, u.created_at, u.registration_ip, u.referral_code, u.referred_by
            ORDER BY u.created_at DESC
        """)
        
        users = []
        for row in cur.fetchall():
            user_id = row[0]
            
            # Получаем количество скачиваний
            cur.execute("""
                SELECT COUNT(*) FROM t_p63326274_course_download_plat.user_downloads
                WHERE user_id = %s
            """, (user_id,))
            total_downloads = cur.fetchone()[0]
            
            # Получаем топ-3 категории по покупкам
            cur.execute("""
                SELECT w.category, COUNT(*) as count
                FROM t_p63326274_course_download_plat.purchases p
                JOIN t_p63326274_course_download_plat.works w ON p.work_id = w.id
                WHERE p.buyer_id = %s
                GROUP BY w.category
                ORDER BY count DESC
                LIMIT 3
            """, (user_id,))
            favorite_categories = [cat[0] for cat in cur.fetchall() if cat[0]]
            
            # Получаем топ-3 предмета по покупкам
            cur.execute("""
                SELECT w.subject, COUNT(*) as count
                FROM t_p63326274_course_download_plat.purchases p
                JOIN t_p63326274_course_download_plat.works w ON p.work_id = w.id
                WHERE p.buyer_id = %s AND w.subject IS NOT NULL
                GROUP BY w.subject
                ORDER BY count DESC
                LIMIT 3
            """, (user_id,))
            favorite_subjects = [subj[0] for subj in cur.fetchall() if subj[0]]
            
            users.append({
                'id': user_id,
                'name': row[1],
                'email': row[2],
                'balance': row[3],
                'registrationDate': row[4].isoformat() if row[4] else None,
                'registrationIp': row[5],
                'referralCode': row[6],
                'referredBy': row[7],
                'totalUploads': row[8],
                'totalPurchases': row[9],
                'totalEarned': int(row[10]),
                'totalDownloads': total_downloads,
                'favoriteCategories': favorite_categories,
                'favoriteSubjects': favorite_subjects,
                'status': 'active',
                'lastActivity': row[11].isoformat() if row[11] else (row[4].isoformat() if row[4] else None)
            })
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'users': users})
        }
    finally:
        cur.close()
        conn.close()

def update_user_balance(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Обновить баланс пользователя (только для админа)'''
    body_data = json.loads(event.get('body', '{}'))
    user_id = body_data.get('user_id')
    amount = body_data.get('amount', 0)
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'user_id required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    conn.autocommit = False
    cur = conn.cursor()
    
    try:
        # Обновляем баланс
        cur.execute(
            "UPDATE t_p63326274_course_download_plat.users SET balance = balance + %s WHERE id = %s",
            (amount, user_id)
        )
        
        # Добавляем транзакцию
        description = f'Корректировка баланса администратором ({amount:+d} баллов)'
        cur.execute(
            """INSERT INTO t_p63326274_course_download_plat.transactions 
            (user_id, type, amount, description) 
            VALUES (%s, %s, %s, %s)""",
            (user_id, 'admin_adjustment', abs(amount), description)
        )
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'message': 'Баланс обновлен'})
        }
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        cur.close()
        conn.close()

def delete_fake_users(headers: Dict[str, str]) -> Dict[str, Any]:
    '''Удалить всех тестовых пользователей с email @fake.local'''
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    conn.autocommit = False
    cur = conn.cursor()
    
    try:
        # Сначала получаем список ID тестовых пользователей
        cur.execute("""
            SELECT id FROM t_p63326274_course_download_plat.users 
            WHERE email LIKE '%@fake.local%'
        """)
        fake_user_ids = [row[0] for row in cur.fetchall()]
        
        if not fake_user_ids:
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'deleted': 0, 'message': 'Нет тестовых пользователей для удаления'})
            }
        
        # Удаляем связанные данные для каждого тестового пользователя
        for user_id in fake_user_ids:
            cur.execute("DELETE FROM t_p63326274_course_download_plat.favorites WHERE user_id = %s", (user_id,))
            cur.execute("DELETE FROM t_p63326274_course_download_plat.purchases WHERE buyer_id = %s", (user_id,))
            cur.execute("DELETE FROM t_p63326274_course_download_plat.transactions WHERE user_id = %s", (user_id,))
            cur.execute("DELETE FROM t_p63326274_course_download_plat.reviews WHERE user_id = %s", (user_id,))
            cur.execute("DELETE FROM t_p63326274_course_download_plat.download_tokens WHERE user_id = %s", (user_id,))
            cur.execute("DELETE FROM t_p63326274_course_download_plat.user_messages WHERE sender_id = %s OR recipient_id = %s", (user_id, user_id))
            cur.execute("DELETE FROM t_p63326274_course_download_plat.works WHERE author_id = %s", (user_id,))
        
        # Удаляем самих пользователей
        cur.execute("DELETE FROM t_p63326274_course_download_plat.users WHERE email LIKE '%@fake.local%'")
        deleted_count = cur.rowcount
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'deleted': deleted_count,
                'message': f'Удалено {deleted_count} тестовых пользователей'
            })
        }
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        cur.close()
        conn.close()