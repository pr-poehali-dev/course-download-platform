'''
Business: Авторизация администраторов с JWT токенами и безопасным хешированием
Args: event - HTTP event с email/password или token
Returns: JWT token или user data
'''

import json
import os
import bcrypt
import hmac
import secrets
import time
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

try:
    import psycopg2
except ImportError:
    import sys
    sys.path.insert(0, '/opt/python/lib/python3.11/site-packages')
    import psycopg2

SECRET_KEY = os.environ.get('JWT_SECRET', 'default-secret-key-change-in-production')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        return handle_login(event)
    elif method == 'GET':
        return handle_verify(event)
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }

def hash_password(password: str) -> str:
    """Безопасное хеширование пароля с bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password supporting both bcrypt and legacy PBKDF2"""
    # Check if it's bcrypt format (starts with $2b$)
    if password_hash.startswith('$2b$') or password_hash.startswith('$2a$'):
        try:
            return bcrypt.checkpw(password.encode(), password_hash.encode())
        except:
            return False
    else:
        # Legacy PBKDF2 format
        import hashlib
        salt = hashlib.sha256(SECRET_KEY.encode()).hexdigest()[:16]
        legacy_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
        return legacy_hash == password_hash

def create_jwt(admin_id: int, email: str) -> str:
    """Создание простого JWT токена"""
    exp = int((datetime.utcnow() + timedelta(days=7)).timestamp())
    payload = f"{admin_id}:{email}:{exp}"
    signature = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{signature}"

def verify_jwt(token: str) -> Optional[Dict[str, Any]]:
    """Проверка JWT токена"""
    try:
        parts = token.split(':')
        if len(parts) != 4:
            return None
        
        admin_id, email, exp, signature = parts
        payload = f"{admin_id}:{email}:{exp}"
        expected_signature = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
        
        if signature != expected_signature:
            return None
        
        if int(exp) < int(datetime.utcnow().timestamp()):
            return None
        
        return {'admin_id': int(admin_id), 'email': email}
    except:
        return None

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def handle_login(event: Dict[str, Any]) -> Dict[str, Any]:
    """Авторизация администратора"""
    body = event.get('body', '{}')
    if not body or body == '':
        body = '{}'
    
    try:
        body_data = json.loads(body)
    except:
        body_data = {}
    
    email = body_data.get('email', '').strip().lower()
    password = body_data.get('password', '')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email and password required'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        SELECT id, email, password_hash, role 
        FROM t_p63326274_course_download_plat.admins 
        WHERE email = %s
    ''', (email,))
    
    admin = cur.fetchone()
    
    if not admin:
        cur.close()
        conn.close()
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid credentials'})
        }
    
    admin_id, admin_email, password_hash, role = admin
    
    if not verify_password(password, password_hash):
        cur.close()
        conn.close()
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid credentials'})
        }
    
    # Upgrade legacy hash to bcrypt
    if not password_hash.startswith('$2b$') and not password_hash.startswith('$2a$'):
        new_hash = hash_password(password)
        try:
            cur.execute(
                "UPDATE t_p63326274_course_download_plat.admins SET password_hash = %s WHERE id = %s",
                (new_hash, admin_id)
            )
        except Exception as e:
            print(f"Failed to upgrade admin password hash: {e}")
    
    cur.execute('''
        UPDATE t_p63326274_course_download_plat.admins 
        SET last_login = CURRENT_TIMESTAMP 
        WHERE id = %s
    ''', (admin_id,))
    
    cur.execute('''
        INSERT INTO t_p63326274_course_download_plat.admin_actions_log 
        (admin_id, action_type, description) 
        VALUES (%s, %s, %s)
    ''', (admin_id, 'login', f'Admin {admin_email} logged in'))
    
    conn.commit()
    cur.close()
    conn.close()
    
    token = create_jwt(admin_id, admin_email)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'token': token,
            'admin': {
                'id': admin_id,
                'email': admin_email,
                'role': role
            }
        })
    }

def handle_verify(event: Dict[str, Any]) -> Dict[str, Any]:
    """Проверка токена"""
    headers = event.get('headers', {})
    token = headers.get('X-Admin-Token') or headers.get('x-admin-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Token required'})
        }
    
    admin_data = verify_jwt(token)
    
    if not admin_data:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'})
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'admin': admin_data
        })
    }