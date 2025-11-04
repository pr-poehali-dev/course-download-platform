"""
Business: Получение финансовой аналитики платформы - выручка, комиссии, выплаты авторам, топ авторов
Args: event - dict с httpMethod
      context - объект с request_id
Returns: Детальная финансовая статистика платформы
"""
import json
import os
from typing import Dict, Any
import psycopg2
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Общая статистика продаж
        cur.execute("""
            SELECT 
                COUNT(*) as total_purchases,
                COALESCE(SUM(price_paid), 0) as total_revenue,
                COALESCE(SUM(commission), 0) as total_commission
            FROM t_p63326274_course_download_plat.purchases
        """)
        purchases_stats = cur.fetchone()
        total_purchases = int(purchases_stats[0]) if purchases_stats else 0
        total_revenue = int(purchases_stats[1]) if purchases_stats else 0
        total_commission = int(purchases_stats[2]) if purchases_stats else 0
        
        # Выплачено авторам
        cur.execute("""
            SELECT COALESCE(SUM(author_share), 0) as total_paid_to_authors
            FROM t_p63326274_course_download_plat.author_earnings
            WHERE status = 'paid'
        """)
        authors_paid_result = cur.fetchone()
        total_paid_to_authors = int(authors_paid_result[0]) if authors_paid_result else 0
        
        # Количество пользователей
        cur.execute("SELECT COUNT(*) FROM t_p63326274_course_download_plat.users")
        total_users_result = cur.fetchone()
        total_users = int(total_users_result[0]) if total_users_result else 0
        
        # Количество работ
        cur.execute("SELECT COUNT(*) FROM t_p63326274_course_download_plat.works")
        total_works_result = cur.fetchone()
        total_works = int(total_works_result[0]) if total_works_result else 0
        
        # Топ авторов по заработку
        cur.execute("""
            SELECT 
                u.username,
                u.email,
                COALESCE(SUM(ae.author_share), 0) as total_earned,
                COUNT(ae.id) as sales_count
            FROM t_p63326274_course_download_plat.author_earnings ae
            JOIN t_p63326274_course_download_plat.users u ON ae.author_id = u.id
            WHERE ae.status = 'paid'
            GROUP BY u.id, u.username, u.email
            ORDER BY total_earned DESC
            LIMIT 10
        """)
        top_authors_rows = cur.fetchall()
        top_authors = []
        for row in top_authors_rows:
            top_authors.append({
                'username': row[0],
                'email': row[1],
                'totalEarned': int(row[2]),
                'salesCount': int(row[3])
            })
        
        # Продажи по дням (последние 30 дней)
        cur.execute("""
            SELECT 
                DATE(created_at) as sale_date,
                COUNT(*) as sales_count,
                COALESCE(SUM(price_paid), 0) as daily_revenue
            FROM t_p63326274_course_download_plat.purchases
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY sale_date DESC
        """)
        sales_by_day_rows = cur.fetchall()
        sales_by_day = []
        for row in sales_by_day_rows:
            sales_by_day.append({
                'date': row[0].isoformat() if row[0] else None,
                'salesCount': int(row[1]),
                'revenue': int(row[2])
            })
        
        # Топ работ по продажам
        cur.execute("""
            SELECT 
                w.title,
                w.price_points,
                COUNT(p.id) as sales_count,
                COALESCE(SUM(p.price_paid), 0) as total_revenue
            FROM t_p63326274_course_download_plat.purchases p
            JOIN t_p63326274_course_download_plat.works w ON p.work_id = w.id
            GROUP BY w.id, w.title, w.price_points
            ORDER BY sales_count DESC
            LIMIT 10
        """)
        top_works_rows = cur.fetchall()
        top_works = []
        for row in top_works_rows:
            top_works.append({
                'title': row[0],
                'price': int(row[1]) if row[1] else 0,
                'salesCount': int(row[2]),
                'totalRevenue': int(row[3])
            })
        
        # Последние транзакции
        cur.execute("""
            SELECT 
                p.id,
                u_buyer.username as buyer_name,
                u_author.username as author_name,
                w.title as work_title,
                p.price_paid,
                p.commission,
                p.created_at
            FROM t_p63326274_course_download_plat.purchases p
            JOIN t_p63326274_course_download_plat.users u_buyer ON p.buyer_id = u_buyer.id
            JOIN t_p63326274_course_download_plat.works w ON p.work_id = w.id
            LEFT JOIN t_p63326274_course_download_plat.users u_author ON w.author_id = u_author.id
            ORDER BY p.created_at DESC
            LIMIT 50
        """)
        transactions_rows = cur.fetchall()
        recent_transactions = []
        for row in transactions_rows:
            recent_transactions.append({
                'id': row[0],
                'buyerName': row[1],
                'authorName': row[2] if row[2] else 'Неизвестно',
                'workTitle': row[3],
                'pricePaid': int(row[4]),
                'commission': int(row[5]),
                'createdAt': row[6].isoformat() if row[6] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'totalPurchases': total_purchases,
                'totalRevenue': total_revenue,
                'totalCommission': total_commission,
                'totalPaidToAuthors': total_paid_to_authors,
                'totalUsers': total_users,
                'totalWorks': total_works,
                'topAuthors': top_authors,
                'salesByDay': sales_by_day,
                'topWorks': top_works,
                'recentTransactions': recent_transactions
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] Platform finances failed: {type(e).__name__}: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Failed to load finances: {str(e)}'}),
            'isBase64Encoded': False
        }
