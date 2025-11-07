"""
Business: Удаление тестовых пользователей из базы (все кроме admin ID=999999)
Args: event - dict с httpMethod
      context - объект с request_id
Returns: Результат удаления
"""
import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
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
        conn.autocommit = False
        cur = conn.cursor()
        
        # Обнуляем author_id в работах (чтобы работы остались)
        cur.execute("UPDATE t_p63326274_course_download_plat.works SET author_id = NULL WHERE author_id IS NOT NULL AND author_id != 999999")
        works_updated = cur.rowcount
        
        # Удаляем все связанные данные по порядку
        tables_with_user_id = [
            'ai_chat_history',
            'ai_subscriptions', 
            'author_earnings',
            'favorites',
            'password_reset_tokens',
            'password_resets',
            'reviews',
            'support_tickets',
            'transactions',
            'user_downloads',
            'user_promo_activations',
            'work_comments',
            'work_ratings',
            'uploaded_works',
            'bot_subscriptions',
            'admin_actions_log',
            'payments',
            'orders',
            'plagiarism_checks',
            'subscriptions'
        ]
        
        for table in tables_with_user_id:
            try:
                cur.execute(f"DELETE FROM t_p63326274_course_download_plat.{table} WHERE user_id IS NOT NULL AND user_id != 999999")
            except:
                pass
        
        # Удаляем покупки (buyer_id)
        cur.execute("DELETE FROM t_p63326274_course_download_plat.purchases WHERE buyer_id IS NOT NULL AND buyer_id != 999999")
        purchases_deleted = cur.rowcount
        
        # Удаляем заработки авторов (author_id)
        try:
            cur.execute("DELETE FROM t_p63326274_course_download_plat.author_earnings WHERE author_id IS NOT NULL AND author_id != 999999")
            earnings_deleted = cur.rowcount
        except:
            earnings_deleted = 0
        
        # Удаляем транзакции
        try:
            cur.execute("DELETE FROM t_p63326274_course_download_plat.transactions WHERE user_id IS NOT NULL AND user_id != 999999")
            transactions_deleted = cur.rowcount
        except:
            transactions_deleted = 0
        
        try:
            cur.execute("DELETE FROM t_p63326274_course_download_plat.password_reset_tokens WHERE user_id IS NOT NULL AND user_id != 999999")
            tokens_deleted = cur.rowcount
        except:
            tokens_deleted = 0
        
        # Удаляем всех пользователей кроме админа
        cur.execute("DELETE FROM t_p63326274_course_download_plat.users WHERE id != 999999")
        users_deleted = cur.rowcount
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'usersDeleted': users_deleted,
                'transactionsDeleted': transactions_deleted,
                'tokensDeleted': tokens_deleted,
                'purchasesDeleted': purchases_deleted,
                'earningsDeleted': earnings_deleted,
                'worksUpdated': works_updated,
                'message': f'Удалено {users_deleted} пользователей (кроме admin). Работы сохранены.'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
            cur.close()
            conn.close()
        
        print(f"[ERROR] Delete test users failed: {type(e).__name__}: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Failed to delete users: {str(e)}'}),
            'isBase64Encoded': False
        }