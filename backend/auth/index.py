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

def sql_escape(value: str) -> str:
    """Escape string for Simple Query Protocol"""
    return value.replace("'", "''")

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

def register_user(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    username = body_data.get('username', '').strip()
    email = body_data.get('email', '').strip()
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
        username_esc = sql_escape(username)
        email_esc = sql_escape(email)
        
        cur.execute(f"SELECT id FROM t_p63326274_course_download_plat.users WHERE username = '{username_esc}' OR email = '{email_esc}'")
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
        password_hash_esc = sql_escape(password_hash)
        referral_code = generate_referral_code(username)
        
        cur.execute(f"""
            INSERT INTO t_p63326274_course_download_plat.users 
            (username, email, password_hash, referral_code, balance) 
            VALUES ('{username_esc}', '{email_esc}', '{password_hash_esc}', '{referral_code}', 100) 
            RETURNING id
        """)
        user_id = cur.fetchone()[0]
        
        cur.execute(f"""
            INSERT INTO t_p63326274_course_download_plat.transactions 
            (user_id, type, amount, description) 
            VALUES ({user_id}, 'refill', 100, 'Бонус при регистрации')
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        
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
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        print(f"Registration error: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка регистрации'}),
            'isBase64Encoded': False
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
            'body': json.dumps({'error': 'Заполните все поля'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    username_esc = sql_escape(username)
    cur.execute(f"SELECT id, username, email, balance, referral_code, password_hash FROM t_p63326274_course_download_plat.users WHERE username = '{username_esc}'")
    user = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not user or not verify_password(password, user[5]):
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверное имя пользователя или пароль'}),
            'isBase64Encoded': False
        }
    
    old_hash = user[5]
    if not old_hash.startswith('$2b$') and not old_hash.startswith('$2a$'):
        new_hash = hash_password(password)
        new_hash_esc = sql_escape(new_hash)
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute(f"UPDATE t_p63326274_course_download_plat.users SET password_hash = '{new_hash_esc}' WHERE id = {user[0]}")
            conn.commit()
            cur.close()
            conn.close()
        except:
            pass
    
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
        }),
        'isBase64Encoded': False
    }

def verify_token(event: Dict[str, Any]) -> Dict[str, Any]:
    headers = event.get('headers', {})
    auth_header = headers.get('X-Auth-Token', '') or headers.get('x-auth-token', '')
    
    if not auth_header:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен не предоставлен'}),
            'isBase64Encoded': False
        }
    
    secret = os.environ.get('JWT_SECRET')
    
    try:
        payload = jwt.decode(auth_header, secret, algorithms=['HS256'])
        user_id = payload['user_id']
        
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(f"SELECT id, username, email, balance, referral_code FROM t_p63326274_course_download_plat.users WHERE id = {user_id}")
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
    email = body_data.get('email', '').strip()
    
    if not email:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email не указан'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    email_esc = sql_escape(email)
    cur.execute(f"SELECT id, username, email FROM t_p63326274_course_download_plat.users WHERE email = '{email_esc}'")
    user = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not user:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Инструкции по сбросу пароля отправлены на email'}),
            'isBase64Encoded': False
        }
    
    user_id, username, user_email = user
    
    reset_token = hashlib.sha256(f"{user_id}{email}{datetime.utcnow().timestamp()}".encode()).hexdigest()
    
    conn = get_db_connection()
    cur = conn.cursor()
    token_esc = sql_escape(reset_token)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    cur.execute(f"""
        INSERT INTO t_p63326274_course_download_plat.password_reset_tokens (user_id, token, expires_at)
        VALUES ({user_id}, '{token_esc}', '{expires_at.isoformat()}')
    """)
    conn.commit()
    cur.close()
    conn.close()
    
    try:
        send_reset_password_email(user_email, username, reset_token)
    except Exception as e:
        print(f"Failed to send reset password email: {e}")
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Инструкции по сбросу пароля отправлены на email'}),
        'isBase64Encoded': False
    }

def send_reset_password_email(email: str, username: str, reset_token: str):
    """Send password reset email via Resend API"""
    resend_key = os.environ.get('RESEND_API_KEY')
    if not resend_key:
        return
    
    import requests
    
    reset_url = f"https://techforma.ru/reset-password?token={reset_token}"
    
    response = requests.post(
        'https://api.resend.com/emails',
        headers={
            'Authorization': f'Bearer {resend_key}',
            'Content-Type': 'application/json'
        },
        json={
            'from': 'TechForma <noreply@techforma.ru>',
            'to': [email],
            'subject': 'Сброс пароля TechForma',
            'html': f'''
            <h1>Здравствуйте, {username}!</h1>
            <p>Вы запросили сброс пароля на платформе TechForma.</p>
            <p>Для сброса пароля перейдите по ссылке:</p>
            <p><a href="{reset_url}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Сбросить пароль</a></p>
            <p>Ссылка действительна в течение 1 часа.</p>
            <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
            <p>С уважением,<br>Команда TechForma</p>
            '''
        },
        timeout=5
    )

def confirm_reset_password(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    token = body_data.get('token', '').strip()
    new_password = body_data.get('password', '')
    
    if not token or not new_password:
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
    
    token_esc = sql_escape(token)
    cur.execute(f"""
        SELECT user_id, expires_at, used_at 
        FROM t_p63326274_course_download_plat.password_reset_tokens 
        WHERE token = '{token_esc}'
    """)
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
    new_hash_esc = sql_escape(new_hash)
    
    try:
        cur.execute(f"UPDATE t_p63326274_course_download_plat.users SET password_hash = '{new_hash_esc}' WHERE id = {user_id}")
        cur.execute(f"UPDATE t_p63326274_course_download_plat.password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = '{token_esc}'")
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
        print(f"Password reset error: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка при сбросе пароля'}),
            'isBase64Encoded': False
        }