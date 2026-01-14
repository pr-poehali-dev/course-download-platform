import json
import os
import hashlib
import psycopg2
import bcrypt
import jwt
import string
import secrets
import resend
from datetime import datetime, timedelta
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Регистрация, авторизация и восстановление пароля пользователей
    Args: event - dict с httpMethod, body, headers
          context - объект с request_id
    Returns: HTTP response с JWT токеном или данными пользователя
    '''
    print("🚀 AUTH v2.0 - Password Reset via Email Enabled")
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, Authorization, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    query_params = event.get('queryStringParameters') or {}
    path = query_params.get('action', 'login')
    
    print(f"DEBUG: method={method}, path={path}, query_params={query_params}")
    
    if method == 'POST':
        if path == 'register':
            return register_user(event)
        elif path == 'login':
            return login_user(event)
        elif path == 'request-password-reset':
            return request_password_reset(event)
        elif path == 'change-password':
            return change_password(event)
    
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
            result = bcrypt.checkpw(password.encode(), password_hash.encode())
            return result
        except Exception as e:
            print(f"VERIFY: bcrypt error={e}")
            return False
    else:
        sha_hash = hashlib.sha256(password.encode()).hexdigest()
        return sha_hash == password_hash

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

def generate_temporary_password(length: int = 12) -> str:
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send email using Resend API"""
    try:
        resend_key = os.environ.get('RESEND_API_KEY')
        mail_from = os.environ.get('MAIL_FROM', 'TechForma <onboarding@resend.dev>')
        
        print(f"📧 Attempting to send email to {to_email}")
        print(f"📧 MAIL_FROM: {mail_from}")
        print(f"📧 RESEND_API_KEY present: {bool(resend_key)}")
        
        if not resend_key:
            print("❌ RESEND_API_KEY not configured")
            return False
        
        resend.api_key = resend_key
        
        params = {
            "from": mail_from,
            "to": [to_email],
            "subject": subject,
            "html": html_body
        }
        
        email_response = resend.Emails.send(params)
        print(f"✅ Email sent to {to_email}, response={email_response}")
        return True
    except Exception as e:
        print(f"❌ Email error: {type(e).__name__}: {str(e)}")
        print(f"❌ Full error: {repr(e)}")
        return False

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
    referred_by_code = body_data.get('referral_code', '').strip().upper()
    
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
    
    ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
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
        
        cur.execute(
            """SELECT COUNT(*) FROM t_p63326274_course_download_plat.users 
            WHERE registration_ip = %s AND created_at > NOW() - INTERVAL '24 hours'""",
            (ip_address,)
        )
        recent_registrations = cur.fetchone()[0]
        
        if recent_registrations >= 3:
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
        
        referrer_id = None
        if referred_by_code:
            cur.execute(
                "SELECT id FROM t_p63326274_course_download_plat.users WHERE referral_code = %s",
                (referred_by_code,)
            )
            referrer = cur.fetchone()
            if referrer:
                referrer_id = referrer[0]
                print(f"✅ Referral code {referred_by_code} matched to user_id={referrer_id}")
            else:
                print(f"⚠️ Invalid referral code: {referred_by_code}")
        
        password_hash = hash_password(password)
        referral_code = generate_referral_code(username)
        
        cur.execute(
            """
            INSERT INTO t_p63326274_course_download_plat.users 
            (username, email, password_hash, referral_code, balance, registration_ip, referred_by) 
            VALUES (%s, %s, %s, %s, %s, %s, %s) 
            RETURNING id
            """,
            (username, email, password_hash, referral_code, 0, ip_address, referrer_id)
        )
        user_id = cur.fetchone()[0]
        
        if referrer_id:
            cur.execute(
                """UPDATE t_p63326274_course_download_plat.users 
                SET balance = balance + 500 
                WHERE id = %s""",
                (user_id,)
            )
            
            cur.execute(
                """UPDATE t_p63326274_course_download_plat.users 
                SET balance = balance + 250 
                WHERE id = %s""",
                (referrer_id,)
            )
            
            cur.execute(
                """INSERT INTO t_p63326274_course_download_plat.transactions 
                (user_id, amount, type, description, created_at) 
                VALUES 
                (%s, %s, %s, %s, NOW()),
                (%s, %s, %s, %s, NOW())""",
                (
                    user_id, 500, 'referral_bonus', 'Бонус за регистрацию по реферальной ссылке',
                    referrer_id, 250, 'referral_reward', f'Награда за приглашение пользователя {username}'
                )
            )
        
        conn.commit()
        
        cur.execute(
            "SELECT balance FROM t_p63326274_course_download_plat.users WHERE id = %s",
            (user_id,)
        )
        balance = cur.fetchone()[0]
        
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
                    'referral_code': referral_code,
                    'balance': balance
                }
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Database error: {repr(e)}'}),
            'isBase64Encoded': False
        }

def login_user(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    username = _norm_username(body_data.get('username', ''))
    password = body_data.get('password', '')
    
    print(f"🔐 LOGIN attempt: username='{username}', password_length={len(password)}")
    
    if not username or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Заполните все поля'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        print(f"🔍 Searching user in DB: {username}")
        cur.execute(
            """
            SELECT id, username, email, password_hash, role, referral_code, balance, is_temporary_password
            FROM t_p63326274_course_download_plat.users 
            WHERE username = %s OR email = %s
            """,
            (username, username)
        )
        print(f"🔍 Query executed, fetching result...")
        user = cur.fetchone()
        print(f"🔍 Fetch result: {user is not None}")
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверное имя пользователя или пароль'}),
                'isBase64Encoded': False
            }
        
        user_id, db_username, db_email, password_hash, role, referral_code, balance, is_temporary_password = user
        is_admin = (role == 'admin')
        
        print(f"✅ User found: id={user_id}, username={db_username}")
        print(f"🔑 Password check: input='{password}' (len={len(password)})")
        
        if not verify_password(password, password_hash):
            print(f"❌ Password verification FAILED")
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверное имя пользователя или пароль'}),
                'isBase64Encoded': False
            }
        
        print(f"✅ Password verification SUCCESS")
        
        cur.close()
        conn.close()
        
        token = generate_jwt_token(user_id, db_username)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'token': token,
                'user': {
                    'id': user_id,
                    'username': db_username,
                    'email': db_email,
                    'is_admin': is_admin,
                    'referral_code': referral_code,
                    'balance': balance,
                    'is_temporary_password': is_temporary_password
                }
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"❌ LOGIN ERROR: {type(e).__name__}: {str(e)}")
        print(f"❌ Full error: {repr(e)}")
        cur.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Database error: {repr(e)}'}),
            'isBase64Encoded': False
        }

def request_password_reset(event: Dict[str, Any]) -> Dict[str, Any]:
    """Генерация временного пароля и отправка на email"""
    body_data = json.loads(event.get('body', '{}'))
    email = _norm_email(body_data.get('email', ''))
    print(f"🔐 Password reset request for: {email}")
    
    if not email:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Введите email'}),
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
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Если email существует, на него отправлен новый пароль'}),
                'isBase64Encoded': False
            }
        
        user_id, username = user
        
        new_password = generate_temporary_password()
        password_hash = hash_password(new_password)
        
        cur.execute(
            "UPDATE t_p63326274_course_download_plat.users SET password_hash = %s, is_temporary_password = TRUE WHERE id = %s",
            (password_hash, user_id)
        )
        
        conn.commit()
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <!-- Main Container -->
                  <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
                    <!-- Header with Gradient -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center;">
                        <div style="display: inline-block; background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin-bottom: 20px; line-height: 80px; font-size: 40px; backdrop-filter: blur(10px);">
                          🔐
                        </div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Восстановление доступа</h1>
                        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Tech Forma — Инженерная платформа</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 50px 40px;">
                        <p style="margin: 0 0 25px; font-size: 18px; color: #333; line-height: 1.6;">
                          Здравствуйте, <strong style="color: #667eea;">{username}</strong>!
                        </p>
                        
                        <p style="margin: 0 0 30px; font-size: 16px; color: #555; line-height: 1.6;">
                          Мы получили запрос на восстановление пароля для вашего аккаунта. Ваш новый временный пароль:
                        </p>
                        
                        <!-- Password Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 35px;">
                          <tr>
                            <td style="background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%); border: 2px dashed #667eea; border-radius: 12px; padding: 30px 20px; text-align: center;">
                              <div style="font-family: 'Courier New', monospace; font-size: 28px; font-weight: bold; color: #333; letter-spacing: 3px; word-break: break-all;">
                                {new_password}
                              </div>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Warning Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px;">
                          <tr>
                            <td style="background: linear-gradient(135deg, #fff3cd 0%, #ffe5a0 100%); border-left: 4px solid #ff9800; border-radius: 8px; padding: 20px;">
                              <p style="margin: 0; font-size: 15px; color: #856404; line-height: 1.5;">
                                <strong>⚠️ Важно:</strong> Этот пароль временный. После входа в систему обязательно смените его на постоянный в настройках личного кабинета.
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px;">
                          <tr>
                            <td align="center">
                              <a href="https://preview--course-download-platform.poehali.dev/" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                                Войти в систему →
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 0; font-size: 14px; color: #777; line-height: 1.6;">
                          Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо. Ваш аккаунт останется в безопасности.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                        <p style="margin: 0 0 10px; font-size: 14px; color: #666; text-align: center;">
                          С уважением,<br>
                          <strong style="color: #333;">Команда Tech Forma</strong>
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">
                          Это автоматическое письмо. Пожалуйста, не отвечайте на него.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Bottom Spacing -->
                  <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                      <td align="center" style="padding: 20px;">
                        <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.8);">
                          © 2026 Tech Forma. Все права защищены.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
        """
        
        email_sent = send_email(email, "Восстановление пароля Tech Forma", html_body)
        
        cur.close()
        conn.close()
        
        if email_sent:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Новый пароль отправлен на ваш email'}),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не удалось отправить email. Попробуйте позже'}),
                'isBase64Encoded': False
            }
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка восстановления пароля: {repr(e)}'}),
            'isBase64Encoded': False
        }

def verify_token(event: Dict[str, Any]) -> Dict[str, Any]:
    auth_header = event.get('headers', {}).get('X-Auth-Token', '')
    
    if not auth_header:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No token provided'}),
            'isBase64Encoded': False
        }
    
    try:
        secret = os.environ.get('JWT_SECRET')
        payload = jwt.decode(auth_header, secret, algorithms=['HS256'])
        
        user_id = payload.get('user_id')
        username = payload.get('username')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            """
            SELECT id, username, email, role, balance, referral_code, is_temporary_password
            FROM t_p63326274_course_download_plat.users 
            WHERE id = %s
            """,
            (user_id,)
        )
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        db_user_id, db_username, db_email, role, balance, referral_code, is_temporary_password = user
        is_admin = (role == 'admin')
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'user': {
                    'id': db_user_id,
                    'username': db_username,
                    'email': db_email,
                    'is_admin': is_admin,
                    'balance': balance,
                    'referral_code': referral_code,
                    'is_temporary_password': is_temporary_password
                }
            }),
            'isBase64Encoded': False
        }
        
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Token expired'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f"❌ Verify token error: {repr(e)}")
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
    except jwt.InvalidTokenError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }

def change_password(event: Dict[str, Any]) -> Dict[str, Any]:
    """Смена пароля пользователя"""
    headers = event.get('headers', {})
    auth_token = (
        headers.get('X-Auth-Token') or 
        headers.get('x-auth-token') or
        headers.get('X-Authorization', '').replace('Bearer ', '') or
        headers.get('x-authorization', '').replace('Bearer ', '')
    )
    
    print(f"🔑 Change password: headers={headers}")
    print(f"🔑 Token found: {bool(auth_token)}")
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    try:
        secret = os.environ.get('JWT_SECRET')
        payload = jwt.decode(auth_token, secret, algorithms=['HS256'])
        user_id = payload.get('user_id')
    except:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный токен'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    current_password = body_data.get('current_password', '')
    new_password = body_data.get('new_password', '')
    
    if not new_password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Введите новый пароль'}),
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
            "SELECT password_hash, is_temporary_password FROM t_p63326274_course_download_plat.users WHERE id = %s",
            (user_id,)
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
        
        password_hash, is_temporary_password = user
        
        if current_password and not is_temporary_password:
            if not verify_password(current_password, password_hash):
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный текущий пароль'}),
                    'isBase64Encoded': False
                }
        
        new_password_hash = hash_password(new_password)
        
        cur.execute(
            "UPDATE t_p63326274_course_download_plat.users SET password_hash = %s, is_temporary_password = FALSE WHERE id = %s",
            (new_password_hash, user_id)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Пароль успешно изменён'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }