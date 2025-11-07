import json
import os
import hashlib
import psycopg2
import bcrypt
import jwt
import secrets
import requests
from datetime import datetime, timedelta
from typing import Dict, Any

RESEND_API = 'https://api.resend.com/emails'

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
            'body': '',
            'isBase64Encoded': False
        }
    
    path = event.get('queryStringParameters', {}).get('action', 'login')
    
    if method == 'POST':
        if path == 'register':
            return register_user(event)
        elif path == 'login':
            return login_user(event)
        elif path == 'reset-password':
            return reset_password(event)
        elif path == 'confirm-reset':
            return confirm_reset_password(event)
    
    if method == 'GET' and path == 'verify':
        return verify_token(event)
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    conn.autocommit = False
    return conn

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password supporting both bcrypt and legacy SHA256"""
    if password_hash.startswith('$2b$') or password_hash.startswith('$2a$'):
        try:
            return bcrypt.checkpw(password.encode(), password_hash.encode())
        except:
            return False
    else:
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

def _send_email_via_resend(*, to: str, subject: str, html: str) -> str:
    """Send email via Resend API with proper error handling"""
    key = os.environ.get('RESEND_API_KEY')
    if not key:
        raise RuntimeError('RESEND_API_KEY is not set')
    
    mail_from = os.environ.get('MAIL_FROM', 'TechForma <noreply@techforma.ru>')
    
    resp = requests.post(
        RESEND_API,
        headers={
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
        },
        json={
            'from': mail_from,
            'to': [to],
            'subject': subject,
            'html': html,
        },
        timeout=15,
    )
    
    if resp.status_code >= 300:
        raise RuntimeError(f"Resend error {resp.status_code}: {resp.text}")
    
    data = resp.json()
    if not data.get('id'):
        raise RuntimeError(f"Resend no id in response: {resp.text}")
    
    return data['id']

def send_welcome_email(email: str, username: str):
    """Send welcome email via Resend API"""
    html = f'''
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
        <h1>Привет, {username}!</h1>
        <p>Спасибо за регистрацию на <b>TechForma</b> — платформе для студентов.</p>
        <p>Тебе начислено <strong>100 баллов</strong> в подарок! 🎉</p>
        <h3>Что можно делать:</h3>
        <ul>
            <li>Покупать готовые курсовые и дипломы за баллы</li>
            <li>Загружать свои работы и зарабатывать баллы</li>
            <li>Использовать AI-помощника для учёбы</li>
        </ul>
        <p><a href="https://techforma.ru" style="display:inline-block;background:#3b82f6;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:16px">Перейти на платформу</a></p>
        <p>С уважением,<br>Команда TechForma</p>
    </div>
    '''
    return _send_email_via_resend(to=email, subject=f'Добро пожаловать, {username}!', html=html)

def send_reset_password_email(email: str, username: str, reset_token: str):
    """Send password reset email via Resend API"""
    base = os.environ.get('FRONTEND_RESET_URL', 'https://techforma.ru/reset-password')
    reset_url = f"{base}?token={reset_token}"
    
    html = f'''
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
        <h1>Здравствуйте, {username}!</h1>
        <p>Вы запросили сброс пароля на платформе TechForma.</p>
        <p>Для сброса пароля нажмите кнопку ниже:</p>
        <p style="text-align:center;margin:24px 0">
            <a href="{reset_url}" style="display:inline-block;padding:12px 18px;background:#3b82f6;color:white;text-decoration:none;border-radius:8px;font-weight:bold">
                Сбросить пароль
            </a>
        </p>
        <p>Если кнопка не работает, перейдите по ссылке:<br><a href="{reset_url}">{reset_url}</a></p>
        <p>Ссылка действительна в течение 1 часа.</p>
        <p style="color:#555">Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
        <p>С уважением,<br>Команда TechForma</p>
    </div>
    '''
    return _send_email_via_resend(to=email, subject='Сброс пароля — TechForma', html=html)

def register_user(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    username = body_data.get('username', '').strip()
    email = body_data.get('email', '').strip().lower()
    password = body_data.get('password', '')
    
    if not username or not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Заполните все поля'}),
            'isBase64Encoded': False
        }
    
    if len(password) < 8:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пароль должен быть не короче 8 символов'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT id FROM t_p63326274_course_download_plat.users WHERE LOWER(username) = %s OR LOWER(email) = %s",
            (username.lower(), email)
        )
        if cur.fetchone():
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь с таким именем или email уже существует'}),
                'isBase64Encoded': False
            }
        
        password_hash = hash_password(password)
        referral_code = generate_referral_code(username)
        
        cur.execute(
            """
            INSERT INTO t_p63326274_course_download_plat.users 
            (username, email, password_hash, referral_code, balance) 
            VALUES (%s, %s, %s, %s, %s) 
            RETURNING id
            """,
            (username, email, password_hash, referral_code, 100)
        )
        user_id = cur.fetchone()[0]
        
        cur.execute(
            """
            INSERT INTO t_p63326274_course_download_plat.transactions 
            (user_id, type, amount, description) 
            VALUES (%s, %s, %s, %s)
            """,
            (user_id, 'refill', 100, 'Бонус при регистрации')
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        try:
            send_welcome_email(email, username)
        except Exception as e:
            print(f"WELCOME EMAIL FAIL: {repr(e)}")
        
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
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        print(f"Registration error: {repr(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка регистрации'}),
            'isBase64Encoded': False
        }

def login_user(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    username = body_data.get('username', '').strip()
    password = body_data.get('password', '')
    
    if not username or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Заполните все поля'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        """
        SELECT id, username, email, password_hash, balance, referral_code 
        FROM t_p63326274_course_download_plat.users 
        WHERE LOWER(username) = %s OR LOWER(email) = %s
        """,
        (username.lower(), username.lower())
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный логин или пароль'}),
            'isBase64Encoded': False
        }
    
    user_id, db_username, email, password_hash, balance, referral_code = user
    
    if not verify_password(password, password_hash):
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный логин или пароль'}),
            'isBase64Encoded': False
        }
    
    token = generate_jwt_token(user_id, db_username)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'token': token,
            'user': {
                'id': user_id,
                'username': db_username,
                'email': email,
                'balance': balance,
                'referral_code': referral_code
            }
        }),
        'isBase64Encoded': False
    }

def verify_token(event: Dict[str, Any]) -> Dict[str, Any]:
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен не предоставлен'}),
            'isBase64Encoded': False
        }
    
    try:
        secret = os.environ.get('JWT_SECRET')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, username, email, balance, referral_code, is_premium, premium_expires_at
            FROM t_p63326274_course_download_plat.users 
            WHERE id = %s
            """,
            (payload['user_id'],)
        )
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь не найден'}),
                'isBase64Encoded': False
            }
        
        user_id, username, email, balance, referral_code, is_premium, premium_expires_at = user
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'user': {
                    'id': user_id,
                    'username': username,
                    'email': email,
                    'balance': balance,
                    'referral_code': referral_code,
                    'is_premium': is_premium,
                    'premium_expires_at': premium_expires_at.isoformat() if premium_expires_at else None
                }
            }),
            'isBase64Encoded': False
        }
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен истёк'}),
            'isBase64Encoded': False
        }
    except jwt.InvalidTokenError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недействительный токен'}),
            'isBase64Encoded': False
        }

def reset_password(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    email = body_data.get('email', '').strip().lower()
    
    if not email:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email обязателен'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "SELECT id, username FROM t_p63326274_course_download_plat.users WHERE LOWER(email) = %s",
        (email,)
    )
    user = cur.fetchone()
    
    if not user:
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Если пользователь существует, письмо отправлено'}),
            'isBase64Encoded': False
        }
    
    user_id, username = user
    
    token_raw = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token_raw.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    try:
        cur.execute(
            """
            INSERT INTO t_p63326274_course_download_plat.password_reset_tokens 
            (user_id, token, expires_at) 
            VALUES (%s, %s, %s)
            """,
            (user_id, token_hash, expires_at)
        )
        conn.commit()
        cur.close()
        conn.close()
        
        try:
            send_reset_password_email(email, username, token_raw)
        except Exception as e:
            print(f"RESET EMAIL FAIL: {repr(e)}")
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Письмо для сброса пароля отправлено'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        print(f"Reset password error: {repr(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка при сбросе пароля'}),
            'isBase64Encoded': False
        }

def confirm_reset_password(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    token_raw = body_data.get('token', '').strip()
    new_password = body_data.get('password', '')
    
    if not token_raw or not new_password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен и новый пароль обязательны'}),
            'isBase64Encoded': False
        }
    
    if len(new_password) < 8:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пароль должен быть не короче 8 символов'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    token_hash = hashlib.sha256(token_raw.encode()).hexdigest()
    
    cur.execute(
        """
        SELECT user_id, expires_at, used_at 
        FROM t_p63326274_course_download_plat.password_reset_tokens 
        WHERE token = %s
        """,
        (token_hash,)
    )
    reset_record = cur.fetchone()
    
    if not reset_record:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недействительный токен'}),
            'isBase64Encoded': False
        }
    
    user_id, expires_at, used_at = reset_record
    
    if used_at is not None:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен уже использован'}),
            'isBase64Encoded': False
        }
    
    if datetime.utcnow() > expires_at:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен истёк'}),
            'isBase64Encoded': False
        }
    
    new_hash = hash_password(new_password)
    
    try:
        cur.execute(
            "UPDATE t_p63326274_course_download_plat.users SET password_hash = %s WHERE id = %s",
            (new_hash, user_id)
        )
        cur.execute(
            "UPDATE t_p63326274_course_download_plat.password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = %s",
            (token_hash,)
        )
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Пароль успешно изменён'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        print(f"Password reset error: {repr(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка при сбросе пароля'}),
            'isBase64Encoded': False
        }
