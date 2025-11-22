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
        elif path == 'get-security-question':
            return get_security_question(event)
        elif path == 'verify-security-answer':
            return verify_security_answer(event)
        elif path == 'reset-password':
            return reset_password(event)
    
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

def cleanup_expired_tokens(conn):
    """Clean up expired and used password reset tokens"""
    try:
        cur = conn.cursor()
        cur.execute(
            """
            DELETE FROM t_p63326274_course_download_plat.password_reset_tokens 
            WHERE expires_at < NOW() OR used = true
            """
        )
        deleted_count = cur.rowcount
        conn.commit()
        cur.close()
        print(f"Cleaned up {deleted_count} expired/used tokens")
    except Exception as e:
        print(f"Token cleanup error: {repr(e)}")
        conn.rollback()

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password supporting both bcrypt and legacy SHA256"""
    if password_hash.startswith('$2b$') or password_hash.startswith('$2a$'):
        try:
            result = bcrypt.checkpw(password.encode(), password_hash.encode())
            print(f"VERIFY: bcrypt check result={result}")
            return result
        except Exception as e:
            print(f"VERIFY: bcrypt error={e}")
            return False
    else:
        sha_hash = hashlib.sha256(password.encode()).hexdigest()
        result = sha_hash == password_hash
        print(f"VERIFY: sha256 check result={result}")
        return result

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



def _norm(s: str) -> str:
    return (s or "").strip()

def _norm_email(s: str) -> str:
    return _norm(s).lower()

def _norm_username(s: str) -> str:
    return _norm(s)

def register_user(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    username = _norm_username(body_data.get('username', ''))
    email = _norm_email(body_data.get('email', ''))
    password = body_data.get('password', '')
    security_question = body_data.get('security_question', '')
    security_answer = body_data.get('security_answer', '')
    
    if not username or not email or not password or not security_question or not security_answer:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Заполните все поля, включая секретный вопрос'}),
            'isBase64Encoded': False
        }
    
    if len(password) < 8:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пароль должен быть не короче 8 символов'}),
            'isBase64Encoded': False
        }
    
    # Получаем IP адрес пользователя
    ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # КРИТИЧНО: Проверка на дубликат username/email
        cur.execute(
            "SELECT id FROM t_p63326274_course_download_plat.users WHERE lower(username) = lower(%s) OR lower(email) = lower(%s)",
            (username, email)
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
        
        # КРИТИЧНО: Анти-фрод - лимит 3 регистрации с одного IP за 24 часа
        cur.execute(
            """SELECT COUNT(*) FROM t_p63326274_course_download_plat.users 
            WHERE registration_ip = %s AND created_at > NOW() - INTERVAL '24 hours'""",
            (ip_address,)
        )
        recent_registrations = cur.fetchone()[0]
        
        if recent_registrations >= 3:
            # Логируем подозрительную активность
            cur.execute(
                """INSERT INTO t_p63326274_course_download_plat.security_logs 
                (user_id, event_type, details, ip_address) 
                VALUES (%s, %s, %s, %s)""",
                (None, 'registration_limit_exceeded', f'Попытка создать {recent_registrations + 1} аккаунт за 24 часа', ip_address)
            )
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 429,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Превышен лимит регистраций с этого устройства. Попробуйте позже или обратитесь в поддержку.'}),
                'isBase64Encoded': False
            }
        
        password_hash = hash_password(password)
        security_answer_hash = hashlib.sha256(security_answer.lower().strip().encode()).hexdigest()
        referral_code = generate_referral_code(username)
        
        cur.execute(
            """
            INSERT INTO t_p63326274_course_download_plat.users 
            (username, email, password_hash, referral_code, balance, security_question, security_answer_hash, registration_ip) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) 
            RETURNING id
            """,
            (username, email, password_hash, referral_code, 1000, security_question, security_answer_hash, ip_address)
        )
        user_id = cur.fetchone()[0]
        
        cur.execute(
            """
            INSERT INTO t_p63326274_course_download_plat.transactions 
            (user_id, type, amount, description) 
            VALUES (%s, %s, %s, %s)
            """,
            (user_id, 'refill', 1000, 'Бонус при регистрации')
        )
        
        conn.commit()
        
        cleanup_expired_tokens(conn)
        
        cur.close()
        conn.close()
        
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
                    'balance': 1000,
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
    login = _norm(body_data.get('username', ''))
    password = body_data.get('password', '')
    
    print(f"LOGIN: login={login}, password_len={len(password)}")
    
    if not login or not password:
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
        SELECT id, username, email, password_hash, balance, referral_code, created_at 
        FROM t_p63326274_course_download_plat.users 
        WHERE lower(username) = lower(%s) OR lower(email) = lower(%s)
        """,
        (login, login)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user:
        print(f"LOGIN FAIL: user not found for {login}")
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный логин или пароль'}),
            'isBase64Encoded': False
        }
    
    user_id, db_username, email, password_hash, balance, referral_code, created_at = user
    print(f"LOGIN: found user_id={user_id}, hash_start={password_hash[:20]}")
    
    verified = verify_password(password, password_hash)
    print(f"LOGIN: password verified={verified}")
    
    if not verified:
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
                'referral_code': referral_code,
                'created_at': created_at.isoformat() if created_at else None
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
            SELECT id, username, email, balance, referral_code, is_premium, premium_expires_at, created_at, role
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
        
        user_id, username, email, balance, referral_code, is_premium, premium_expires_at, created_at, role = user
        
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
                    'role': role,
                    'is_premium': is_premium,
                    'premium_expires_at': premium_expires_at.isoformat() if premium_expires_at else None,
                    'created_at': created_at.isoformat() if created_at else None
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

def get_security_question(event: Dict[str, Any]) -> Dict[str, Any]:
    '''Get security question for user by email'''
    body_data = json.loads(event.get('body', '{}'))
    email = _norm_email(body_data.get('email', ''))
    
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
        "SELECT id, security_question FROM t_p63326274_course_download_plat.users WHERE lower(email) = lower(%s)",
        (email,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пользователь не найден'}),
            'isBase64Encoded': False
        }
    
    user_id, security_question = user
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'security_question': security_question}),
        'isBase64Encoded': False
    }

def verify_security_answer(event: Dict[str, Any]) -> Dict[str, Any]:
    '''Verify security answer only'''
    body_data = json.loads(event.get('body', '{}'))
    email = _norm_email(body_data.get('email', ''))
    security_answer = body_data.get('security_answer', '').strip()
    
    if not email or not security_answer:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Все поля обязательны'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT id, security_answer_hash FROM t_p63326274_course_download_plat.users WHERE lower(email) = lower(%s)",
            (email,)
        )
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь не найден'}),
                'isBase64Encoded': False
            }
        
        user_id, security_answer_hash = user
        
        answer_hash = hashlib.sha256(security_answer.lower().strip().encode()).hexdigest()
        
        if answer_hash != security_answer_hash:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный ответ на секретный вопрос'}),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Ответ верный'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        print(f"Verify security answer error: {repr(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка при проверке ответа'}),
            'isBase64Encoded': False
        }

def reset_password(event: Dict[str, Any]) -> Dict[str, Any]:
    '''Reset password after security answer verification'''
    body_data = json.loads(event.get('body', '{}'))
    email = _norm_email(body_data.get('email', ''))
    new_password = body_data.get('new_password', '')
    
    if not email or not new_password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Все поля обязательны'}),
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
    
    try:
        cur.execute(
            "SELECT id, username FROM t_p63326274_course_download_plat.users WHERE lower(email) = lower(%s)",
            (email,)
        )
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь не найден'}),
                'isBase64Encoded': False
            }
        
        user_id, username = user
        new_password_hash = hash_password(new_password)
        
        cur.execute(
            "UPDATE t_p63326274_course_download_plat.users SET password_hash = %s WHERE id = %s",
            (new_password_hash, user_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Пароль успешно изменен'}),
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
            'body': json.dumps({'error': 'Ошибка при смене пароля'}),
            'isBase64Encoded': False
        }