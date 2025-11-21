"""
Business: Аудит и проверка корректности списания баллов
Args: event - dict с httpMethod, queryStringParameters (action, user_id)
      context - объект с request_id
Returns: Результаты проверки баланса и транзакций
"""
import json
import os
from typing import Dict, Any, List
import psycopg2
from datetime import datetime, timedelta


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    
    params = event.get('queryStringParameters', {})
    action = params.get('action', 'full-audit')
    user_id = params.get('user_id')
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if action == 'full-audit':
            result = full_audit(cur)
        elif action == 'user-audit' and user_id:
            result = debug_user_points(cur, int(user_id))
        elif action == 'incomplete-operations':
            result = check_incomplete_operations(cur)
        elif action == 'balance-discrepancies':
            result = check_balance_discrepancies(cur)
        elif action == 'auto-correct':
            result = auto_correct_points_issues(cur, conn)
        else:
            result = {'error': 'Invalid action or missing user_id'}
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, default=str),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] Audit failed: {type(e).__name__}: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Audit failed: {str(e)}'}),
            'isBase64Encoded': False
        }


def full_audit(cur) -> Dict[str, Any]:
    """Комплексная проверка всей системы баллов"""
    print("[AUDIT] Running full audit...")
    
    discrepancies = check_balance_discrepancies(cur)
    incomplete = check_incomplete_operations(cur)
    orphaned = check_orphaned_transactions(cur)
    negative = check_negative_balances(cur)
    duplicates = check_duplicate_transactions(cur)
    
    total_issues = (
        len(discrepancies) + 
        len(incomplete) + 
        len(orphaned) + 
        len(negative) + 
        len(duplicates)
    )
    
    return {
        'status': 'healthy' if total_issues == 0 else 'issues_found',
        'timestamp': datetime.now().isoformat(),
        'summary': {
            'balance_discrepancies': len(discrepancies),
            'incomplete_operations': len(incomplete),
            'orphaned_transactions': len(orphaned),
            'negative_balances': len(negative),
            'duplicate_transactions': len(duplicates),
            'total_issues': total_issues
        },
        'details': {
            'balance_discrepancies': discrepancies[:10],  # Первые 10 для примера
            'incomplete_operations': incomplete[:10],
            'orphaned_transactions': orphaned[:10],
            'negative_balances': negative,
            'duplicate_transactions': duplicates[:10]
        }
    }


def check_balance_discrepancies(cur) -> List[Dict]:
    """Найти пользователей с несоответствием баланса"""
    print("[AUDIT] Checking balance discrepancies...")
    
    cur.execute("""
        SELECT 
            u.id as user_id,
            u.username,
            u.balance as current_balance,
            u.role,
            COALESCE(SUM(
                CASE 
                    WHEN t.type IN ('sale', 'bonus', 'refund', 'topup') THEN t.amount 
                    WHEN t.type IN ('purchase', 'withdrawal') THEN -t.amount
                    ELSE 0 
                END
            ), 0) as calculated_balance,
            COUNT(t.id) as total_transactions
        FROM t_p63326274_course_download_plat.users u
        LEFT JOIN t_p63326274_course_download_plat.transactions t ON u.id = t.user_id
        GROUP BY u.id, u.username, u.balance, u.role
        HAVING ABS(u.balance - COALESCE(SUM(
            CASE 
                WHEN t.type IN ('sale', 'bonus', 'refund', 'topup') THEN t.amount 
                WHEN t.type IN ('purchase', 'withdrawal') THEN -t.amount
                ELSE 0 
            END
        ), 0)) > 0.01
        ORDER BY ABS(u.balance - COALESCE(SUM(
            CASE 
                WHEN t.type IN ('sale', 'bonus', 'refund', 'topup') THEN t.amount 
                WHEN t.type IN ('purchase', 'withdrawal') THEN -t.amount
                ELSE 0 
            END
        ), 0)) DESC
        LIMIT 50
    """)
    
    discrepancies = []
    for row in cur.fetchall():
        user_id, username, current_balance, role, calculated_balance, total_transactions = row
        difference = current_balance - calculated_balance
        
        discrepancies.append({
            'user_id': user_id,
            'username': username,
            'role': role,
            'current_balance': float(current_balance),
            'calculated_balance': float(calculated_balance),
            'difference': float(difference),
            'total_transactions': total_transactions
        })
    
    print(f"[AUDIT] Found {len(discrepancies)} balance discrepancies")
    return discrepancies


def check_incomplete_operations(cur) -> List[Dict]:
    """Найти покупки без списания баллов"""
    print("[AUDIT] Checking incomplete operations...")
    
    cur.execute("""
        SELECT 
            p.id as purchase_id,
            p.buyer_id,
            u.username,
            u.role,
            p.work_id,
            w.title as work_title,
            p.price_paid,
            p.created_at,
            COUNT(t.id) as transaction_count
        FROM t_p63326274_course_download_plat.purchases p
        JOIN t_p63326274_course_download_plat.users u ON u.id = p.buyer_id
        JOIN t_p63326274_course_download_plat.works w ON w.id = p.work_id
        LEFT JOIN t_p63326274_course_download_plat.transactions t 
            ON t.user_id = p.buyer_id 
            AND t.type = 'purchase'
            AND t.amount = -p.price_paid
            AND t.created_at BETWEEN p.created_at - INTERVAL '10 seconds' 
                                 AND p.created_at + INTERVAL '10 seconds'
        WHERE p.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY p.id, p.buyer_id, u.username, u.role, p.work_id, w.title, p.price_paid, p.created_at
        HAVING COUNT(t.id) = 0
        ORDER BY p.created_at DESC
        LIMIT 100
    """)
    
    incomplete = []
    for row in cur.fetchall():
        purchase_id, buyer_id, username, role, work_id, work_title, price_paid, created_at, _ = row
        
        # Пропускаем админов - у них списание баллов отключено
        if role == 'admin':
            continue
        
        incomplete.append({
            'purchase_id': purchase_id,
            'buyer_id': buyer_id,
            'username': username,
            'work_id': work_id,
            'work_title': work_title,
            'price_paid': float(price_paid),
            'created_at': created_at.isoformat()
        })
    
    print(f"[AUDIT] Found {len(incomplete)} incomplete operations (excluding admins)")
    return incomplete


def check_orphaned_transactions(cur) -> List[Dict]:
    """Найти транзакции purchase без соответствующих покупок"""
    print("[AUDIT] Checking orphaned transactions...")
    
    cur.execute("""
        SELECT 
            t.id as transaction_id,
            t.user_id,
            u.username,
            t.amount,
            t.description,
            t.created_at
        FROM t_p63326274_course_download_plat.transactions t
        JOIN t_p63326274_course_download_plat.users u ON u.id = t.user_id
        WHERE t.type = 'purchase'
        AND t.description LIKE 'Покупка работы #%'
        AND NOT EXISTS (
            SELECT 1 FROM t_p63326274_course_download_plat.purchases p
            WHERE p.buyer_id = t.user_id
            AND p.price_paid = -t.amount
            AND p.created_at BETWEEN t.created_at - INTERVAL '10 seconds' 
                                 AND t.created_at + INTERVAL '10 seconds'
        )
        AND t.created_at >= NOW() - INTERVAL '30 days'
        ORDER BY t.created_at DESC
        LIMIT 50
    """)
    
    orphaned = []
    for row in cur.fetchall():
        transaction_id, user_id, username, amount, description, created_at = row
        orphaned.append({
            'transaction_id': transaction_id,
            'user_id': user_id,
            'username': username,
            'amount': float(amount),
            'description': description,
            'created_at': created_at.isoformat()
        })
    
    print(f"[AUDIT] Found {len(orphaned)} orphaned transactions")
    return orphaned


def check_negative_balances(cur) -> List[Dict]:
    """Найти пользователей с отрицательным балансом"""
    print("[AUDIT] Checking negative balances...")
    
    cur.execute("""
        SELECT 
            id, username, email, balance, role, created_at
        FROM t_p63326274_course_download_plat.users
        WHERE balance < 0
        ORDER BY balance ASC
    """)
    
    negative = []
    for row in cur.fetchall():
        user_id, username, email, balance, role, created_at = row
        negative.append({
            'user_id': user_id,
            'username': username,
            'email': email,
            'balance': float(balance),
            'role': role,
            'registered_at': created_at.isoformat()
        })
    
    print(f"[AUDIT] Found {len(negative)} users with negative balance")
    return negative


def check_duplicate_transactions(cur) -> List[Dict]:
    """Найти дублирующиеся транзакции"""
    print("[AUDIT] Checking duplicate transactions...")
    
    cur.execute("""
        SELECT 
            user_id,
            u.username,
            amount,
            type,
            description,
            created_at::date as transaction_date,
            COUNT(*) as duplicate_count
        FROM t_p63326274_course_download_plat.transactions t
        JOIN t_p63326274_course_download_plat.users u ON u.id = t.user_id
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY user_id, u.username, amount, type, description, created_at::date
        HAVING COUNT(*) > 1
        ORDER BY COUNT(*) DESC, created_at::date DESC
        LIMIT 50
    """)
    
    duplicates = []
    for row in cur.fetchall():
        user_id, username, amount, trans_type, description, trans_date, count = row
        duplicates.append({
            'user_id': user_id,
            'username': username,
            'amount': float(amount),
            'type': trans_type,
            'description': description,
            'transaction_date': trans_date.isoformat(),
            'duplicate_count': count
        })
    
    print(f"[AUDIT] Found {len(duplicates)} groups of duplicate transactions")
    return duplicates


def debug_user_points(cur, user_id: int) -> Dict[str, Any]:
    """Детальная диагностика баллов конкретного пользователя"""
    print(f"[AUDIT] Debugging user {user_id} points...")
    
    # Получить данные пользователя
    cur.execute("""
        SELECT id, username, email, balance, role, created_at
        FROM t_p63326274_course_download_plat.users
        WHERE id = %s
    """, (user_id,))
    
    user_row = cur.fetchone()
    if not user_row:
        return {'error': 'User not found'}
    
    user_id, username, email, balance, role, created_at = user_row
    
    # Получить транзакции
    cur.execute("""
        SELECT id, amount, type, description, created_at
        FROM t_p63326274_course_download_plat.transactions
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 100
    """, (user_id,))
    
    transactions = []
    total_accrual = 0
    total_deduction = 0
    
    for row in cur.fetchall():
        trans_id, amount, trans_type, description, trans_created = row
        transactions.append({
            'id': trans_id,
            'amount': float(amount),
            'type': trans_type,
            'description': description,
            'created_at': trans_created.isoformat()
        })
        
        if amount > 0:
            total_accrual += amount
        else:
            total_deduction += abs(amount)
    
    # Получить покупки
    cur.execute("""
        SELECT p.id, p.work_id, w.title, p.price_paid, p.created_at
        FROM t_p63326274_course_download_plat.purchases p
        JOIN t_p63326274_course_download_plat.works w ON w.id = p.work_id
        WHERE p.buyer_id = %s
        ORDER BY p.created_at DESC
        LIMIT 50
    """, (user_id,))
    
    purchases = []
    for row in cur.fetchall():
        purchase_id, work_id, work_title, price_paid, purch_created = row
        
        # Проверить наличие транзакции списания
        cur.execute("""
            SELECT COUNT(*) FROM t_p63326274_course_download_plat.transactions
            WHERE user_id = %s
            AND type = 'purchase'
            AND amount = %s
            AND created_at BETWEEN %s - INTERVAL '10 seconds' 
                               AND %s + INTERVAL '10 seconds'
        """, (user_id, -price_paid, purch_created, purch_created))
        
        has_transaction = cur.fetchone()[0] > 0
        
        purchases.append({
            'id': purchase_id,
            'work_id': work_id,
            'work_title': work_title,
            'price_paid': float(price_paid),
            'created_at': purch_created.isoformat(),
            'has_deduction_transaction': has_transaction
        })
    
    calculated_balance = total_accrual - total_deduction
    balance_match = abs(balance - calculated_balance) < 0.01
    
    purchases_without_transactions = [p for p in purchases if not p['has_deduction_transaction']]
    
    return {
        'user': {
            'id': user_id,
            'username': username,
            'email': email,
            'current_balance': float(balance),
            'role': role,
            'registered_at': created_at.isoformat()
        },
        'summary': {
            'current_balance': float(balance),
            'calculated_balance': float(calculated_balance),
            'balance_match': balance_match,
            'difference': float(balance - calculated_balance),
            'total_accrual': float(total_accrual),
            'total_deduction': float(total_deduction),
            'total_transactions': len(transactions),
            'total_purchases': len(purchases),
            'purchases_without_deduction': len(purchases_without_transactions)
        },
        'transactions': transactions[:20],  # Последние 20
        'purchases': purchases[:20],  # Последние 20
        'issues': {
            'purchases_without_transactions': purchases_without_transactions
        }
    }


def auto_correct_points_issues(cur, conn) -> Dict[str, Any]:
    """Автоматическое исправление найденных проблем"""
    print("[AUDIT] Starting auto-correction...")
    
    corrections_made = 0
    errors = []
    
    # Исправляем только покупки обычных пользователей без транзакций
    cur.execute("""
        SELECT 
            p.id as purchase_id,
            p.buyer_id,
            u.username,
            u.role,
            u.balance,
            p.work_id,
            p.price_paid,
            p.created_at
        FROM t_p63326274_course_download_plat.purchases p
        JOIN t_p63326274_course_download_plat.users u ON u.id = p.buyer_id
        LEFT JOIN t_p63326274_course_download_plat.transactions t 
            ON t.user_id = p.buyer_id 
            AND t.type = 'purchase'
            AND t.amount = -p.price_paid
            AND t.created_at BETWEEN p.created_at - INTERVAL '10 seconds' 
                                 AND p.created_at + INTERVAL '10 seconds'
        WHERE p.created_at >= NOW() - INTERVAL '30 days'
        AND u.role != 'admin'
        GROUP BY p.id, p.buyer_id, u.username, u.role, u.balance, p.work_id, p.price_paid, p.created_at
        HAVING COUNT(t.id) = 0
        LIMIT 100
    """)
    
    issues = cur.fetchall()
    
    for row in issues:
        purchase_id, buyer_id, username, role, current_balance, work_id, price_paid, created_at = row
        
        try:
            # Создать недостающую транзакцию (не меняя баланс!)
            cur.execute("""
                INSERT INTO t_p63326274_course_download_plat.transactions
                (user_id, amount, type, description, created_at)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                buyer_id,
                -price_paid,
                'purchase',
                f'Покупка работы #{work_id} (автокоррекция аудита)',
                created_at
            ))
            
            corrections_made += 1
            print(f"[AUDIT] Created missing transaction for purchase {purchase_id}, user {buyer_id}")
            
        except Exception as e:
            error_msg = f"Failed to correct purchase {purchase_id}: {str(e)}"
            errors.append(error_msg)
            print(f"[ERROR] {error_msg}")
    
    conn.commit()
    
    print(f"[AUDIT] Auto-correction complete: {corrections_made} corrections made, {len(errors)} errors")
    
    return {
        'status': 'completed',
        'corrections_made': corrections_made,
        'total_issues': len(issues),
        'errors': errors
    }
