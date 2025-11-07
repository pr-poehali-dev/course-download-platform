import json
import os
import hashlib
import psycopg2
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Регистрация, авторизация и проверка сессий пользователей
    Args: event - dict с httpMethod, body, headers
          context - объект с request_id
    Returns: HTTP response с JWT токеном или данными пользователя
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    path = event.get('queryStringParameters', {}).get('action', 'login')
    
    if method == 'POST':
        if path == 'register':
            return register_user(event)
        elif path == 'login':
            return login_user(event)
        elif path == 'reset-password':
            return reset_password(event)
    
    if method == 'GET' and path == 'verify':
        return verify_token(event)
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    return conn

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password supporting both bcrypt and legacy SHA256"""
    # Check if it's bcrypt format (starts with $2b$)
    if password_hash.startswith('$2b$') or password_hash.startswith('$2a$'):
        try:
            return bcrypt.checkpw(password.encode(), password_hash.encode())
        except:
            return False
    else:
        # Legacy SHA256 format
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest() == password_hash

def generate_referral_code(username: str) -> str:
    return hashlib.md5(username.encode()).hexdigest()[:8].upper()

def generate_jwt_token(user_id: int, username: str) -> str:
    secret = os.environ.get('JWT_SECRET')
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, secret, algorithm='HS256')

def register_user(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    username = body_data.get('username', '').strip()
    email = body_data.get('email', '').strip()
    password = body_data.get('password', '')
    
    if not username or not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Заполните все поля'})
        }
    
    if len(password) < 6:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пароль должен быть минимум 6 символов'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT id FROM t_p63326274_course_download_plat.users WHERE username = %s OR email = %s", (username, email))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пользователь с таким именем или email уже существует'})
        }
    
    password_hash = hash_password(password)
    referral_code = generate_referral_code(username)
    
    cur.execute(
        "INSERT INTO t_p63326274_course_download_plat.users (username, email, password_hash, referral_code, balance) VALUES (%s, %s, %s, %s, %s) RETURNING id",
        (username, email, password_hash, referral_code, 100)
    )
    user_id = cur.fetchone()[0]
    conn.commit()
    
    cur.execute(
        "INSERT INTO t_p63326274_course_download_plat.transactions (user_id, type, amount, description) VALUES (%s, %s, %s, %s)",
        (user_id, 'refill', 100, 'Бонус при регистрации')
    )
    conn.commit()
    
    cur.close()
    conn.close()
    
    # Send welcome email
    try:
        send_welcome_email(email, username)
    except Exception as e:
        print(f"Failed to send welcome email: {e}")
    
    token = generate_jwt_token(user_id, username)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'token': token,
            'user': {
                'id': user_id,
                'username': username,
                'email': email,
                'balance': 100,
                'referral_code': referral_code
            }
        })
    }

def send_welcome_email(email: str, username: str):
    """Send welcome email via Resend API"""
    resend_key = os.environ.get('RESEND_API_KEY')
    if not resend_key:
        return
    
    import requests
    
    response = requests.post(
        'https://api.resend.com/emails',
        headers={
            'Authorization': f'Bearer {resend_key}',
            'Content-Type': 'application/json'
        },
        json={
            'from': 'TechForma <noreply@techforma.ru>',
            'to': [email],
            'subject': f'Добро пожаловать в TechForma, {username}!',
            'html': f'''
            <h1>Привет, {username}!</h1>
            <p>Спасибо за регистрацию на TechForma — платформе для студентов.</p>
            <p>Тебе начислено <strong>100 баллов</strong> в подарок!</p>
            <h3>Что можно делать:</h3>
            <ul>
                <li>Покупать готовые курсовые и дипломы за баллы</li>
                <li>Загружать свои работы и зарабатывать баллы</li>
                <li>Использовать AI-помощника для учёбы</li>
            </ul>
            <p><a href="https://techforma.ru" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Перейти на платформу</a></p>
            <p>С уважением,<br>Команда TechForma</p>
            '''
        },
        timeout=5
    )

def login_user(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    username = body_data.get('username', '').strip()
    password = body_data.get('password', '')
    
    if not username or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Заполните все поля'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "SELECT id, username, email, balance, referral_code, password_hash FROM t_p63326274_course_download_plat.users WHERE username = %s",
        (username,)
    )
    user = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not user or not verify_password(password, user[5]):
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверное имя пользователя или пароль'})
        }
    
    # Upgrade legacy hash to bcrypt
    old_hash = user[5]
    if not old_hash.startswith('$2b$') and not old_hash.startswith('$2a$'):
        new_hash = hash_password(password)
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute(
                "UPDATE t_p63326274_course_download_plat.users SET password_hash = %s WHERE id = %s",
                (new_hash, user[0])
            )
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            print(f"Failed to upgrade password hash: {e}")
    
    token = generate_jwt_token(user[0], user[1])
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'token': token,
            'user': {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'balance': user[3],
                'referral_code': user[4]
            }
        })
    }

def reset_password(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    token = body_data.get('token', '').strip()
    new_password = body_data.get('password', '')
    
    if not token or not new_password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Укажите токен и новый пароль'})
        }
    
    if len(new_password) < 6:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пароль должен быть минимум 6 символов'})
        }
    
    secret = os.environ.get('JWT_SECRET')
    
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        user_id = payload.get('user_id')
        reset_purpose = payload.get('purpose')
        
        if reset_purpose != 'password_reset':
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный токен сброса'})
            }
        
        password_hash = hash_password(new_password)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "UPDATE t_p63326274_course_download_plat.users SET password_hash = %s WHERE id = %s",
            (password_hash, user_id)
        )
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Пароль успешно изменён'})
        }
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ссылка для сброса пароля истекла'})
        }
    except jwt.InvalidTokenError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверная ссылка для сброса пароля'})
        }

def verify_token(event: Dict[str, Any]) -> Dict[str, Any]:
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен не предоставлен'})
        }
    
    secret = os.environ.get('JWT_SECRET')
    
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        user_id = payload['user_id']
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "SELECT id, username, email, balance, referral_code FROM t_p63326274_course_download_plat.users WHERE id = %s",
            (user_id,)
        )
        user = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь не найден'})
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'user': {
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'balance': user[3],
                    'referral_code': user[4]
                }
            })
        }
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен истек'})
        }
    except jwt.InvalidTokenError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный токен'})
        }