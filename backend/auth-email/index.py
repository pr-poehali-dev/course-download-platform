'''
Business: Отправка email для регистрации и восстановления пароля через SendGrid API
Args: event - HTTP event, context - function context
Returns: JSON response with status
Version: 1.0.1
'''

import json
import os
import psycopg2
import hashlib
import secrets
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    email = body_data.get('email', '').strip().lower()
    
    if action == 'forgot-password':
        return send_password_reset(email)
    elif action == 'welcome':
        name = body_data.get('name', '')
        return send_welcome_email(email, name)
    
    return {
        'statusCode': 400,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Unknown action'})
    }

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def send_email_sendgrid(to_email: str, subject: str, html_content: str) -> bool:
    """Отправка через SendGrid API"""
    api_key = os.environ.get('SENDGRID_API_KEY')
    from_email = os.environ.get('SENDGRID_FROM_EMAIL', 'noreply@techforma.ru')
    from_name = os.environ.get('SENDGRID_FROM_NAME', 'Tech Forma')
    
    if not api_key:
        print('SendGrid API key not configured')
        return False
    
    payload = {
        'personalizations': [{
            'to': [{'email': to_email}]
        }],
        'from': {
            'email': from_email,
            'name': from_name
        },
        'subject': subject,
        'content': [{
            'type': 'text/html',
            'value': html_content
        }]
    }
    
    try:
        req = urllib.request.Request(
            'https://api.sendgrid.com/v3/mail/send',
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status in [200, 202]:
                print(f'Email sent successfully via SendGrid to {to_email}')
                return True
            else:
                print(f'SendGrid API error: {response.status}')
                return False
                
    except urllib.error.HTTPError as e:
        print(f'SendGrid HTTP error: {e.code} - {e.read().decode()}')
        return False
    except Exception as e:
        print(f'SendGrid error: {e}')
        return False

def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Основная функция отправки с fallback"""
    # Сначала пробуем SendGrid
    if send_email_sendgrid(to_email, subject, html_content):
        return True
    
    print('SendGrid failed, email not sent')
    return False

def send_password_reset(email: str) -> Dict[str, Any]:
    if not email:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email required'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('SELECT id, username FROM t_p63326274_course_download_plat.users WHERE email = %s', (email,))
    user = cur.fetchone()
    
    if not user:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User not found'})
        }
    
    user_id, username = user
    
    reset_token = secrets.token_urlsafe(32)
    reset_hash = hashlib.sha256(reset_token.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    cur.execute('''
        INSERT INTO t_p63326274_course_download_plat.password_resets (user_id, token_hash, expires_at)
        VALUES (%s, %s, %s)
    ''', (user_id, reset_hash, expires_at))
    conn.commit()
    
    cur.close()
    conn.close()
    
    reset_url = f'https://course-download-platform--preview.poehali.dev/reset-password?token={reset_token}'
    
    html_content = f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Восстановление пароля</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Привет, <strong>{username}</strong>!</p>
                            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 25px;">
                                Мы получили запрос на восстановление пароля для вашего аккаунта в <strong>Tech Forma</strong>.
                                Если это были вы, нажмите на кнопку ниже:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="{reset_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                                            Сбросить пароль
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="font-size: 13px; color: #999; line-height: 1.6; margin-top: 20px;">
                                Или скопируйте эту ссылку в браузер:<br>
                                <a href="{reset_url}" style="color: #667eea; word-break: break-all;">{reset_url}</a>
                            </p>
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                                <p style="font-size: 12px; color: #999;">
                                    ⏰ Ссылка действительна в течение 24 часов<br>
                                    🔒 Если это были не вы, просто проигнорируйте это письмо
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                            <p style="font-size: 12px; color: #999; margin: 0;">
                                © 2024 Tech Forma. Все права защищены.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    '''
    
    success = send_email(email, 'Восстановление пароля — Tech Forma', html_content)
    
    if success:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'message': 'Email sent'})
        }
    else:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Failed to send email'})
        }

def send_welcome_email(email: str, name: str) -> Dict[str, Any]:
    html_content = f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Добро пожаловать!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Привет, <strong>{name}</strong>!</p>
                            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 25px;">
                                Спасибо за регистрацию в <strong>Tech Forma</strong> — платформе для обмена учебными работами!
                            </p>
                            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0;">
                                <h2 style="color: #667eea; margin: 0 0 15px 0; font-size: 20px;">🎁 Бонус при регистрации</h2>
                                <p style="font-size: 16px; color: #333; margin: 0;">
                                    На ваш счёт зачислено <strong style="color: #667eea; font-size: 24px;">100 баллов</strong>!
                                </p>
                            </div>
                            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 25px;">
                                Вы можете использовать баллы для:<br>
                                ✅ Скачивания курсовых и дипломных работ<br>
                                ✅ Доступа к решениям задач<br>
                                ✅ Просмотра готовых чертежей и проектов
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="https://course-download-platform--preview.poehali.dev/catalog" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                                            Перейти в каталог
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                            <p style="font-size: 12px; color: #999; margin: 0;">
                                © 2024 Tech Forma. Все права защищены.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    '''
    
    success = send_email(email, '🎉 Добро пожаловать в Tech Forma!', html_content)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': success})
    }