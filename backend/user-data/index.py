import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get user's favorites, purchases, referral stats
    Args: event with httpMethod, queryStringParameters {user_id, action}
    Returns: User data (favorites, purchases, referrals)
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
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
            
            # Calculate total referral earnings (10% from transactions)
            cur.execute('''
                SELECT COALESCE(SUM(amount), 0) FROM t_p63326274_course_download_plat.transactions
                WHERE user_id = %s AND transaction_type = 'referral_bonus'
            ''', (user_id,))
            total_earned = cur.fetchone()[0]
            
            result['referral'] = {
                'code': referral_code,
                'referred_count': referred_count,
                'total_earned': total_earned
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(result)
        }
        
    finally:
        cur.close()
        conn.close()