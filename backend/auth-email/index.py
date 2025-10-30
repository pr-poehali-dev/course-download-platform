'''
Business: Отправка email для регистрации и восстановления пароля
Args: event - HTTP event, context - function context
Returns: JSON response with status
'''

import json
import os
import psycopg2
import hashlib
import smtplib
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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

def send_email(to_email: str, subject: str, html_content: str) -> bool:
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    msg = MIMEMultipart('alternative')
    msg['From'] = f"Tech Forma <{smtp_user}>"
    msg['To'] = to_email
    msg['Subject'] = subject
    
    html_part = MIMEText(html_content, 'html', 'utf-8')
    msg.attach(html_part)
    
    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f'Email send error: {e}')
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
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Добро пожаловать!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Привет, <strong>{name}</strong>!</p>
                            <p style="font-size: 14px; color: #666; line-height: 1.6;">
                                Спасибо за регистрацию в <strong>Tech Forma</strong> — платформе для обмена курсовыми, дипломными и другими учебными работами!
                            </p>
                            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 20px;">
                                🎁 Мы начислили вам <strong>100 бонусных баллов</strong> для первой покупки!
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                                <tr>
                                    <td align="center">
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
                                © 2024 Tech Forma
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
    
    send_email(email, 'Добро пожаловать в Tech Forma! 🎉', html_content)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': True})
    }
