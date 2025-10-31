'''
Business: API для управления тикетами техподдержки и отправки ответов на email
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: HTTP ответ с данными тикетов или статусом операции
'''

import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def send_email(to_email: str, subject: str, message: str) -> bool:
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_user = os.environ.get('SMTP_USER', 'rekrutiw@yandex.ru')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not smtp_password:
        print('SMTP password not configured')
        return False
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">Ответ от службы поддержки</h2>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="white-space: pre-line;">{message}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">
                    С уважением,<br>
                    Служба поддержки Tech Forma<br>
                    {smtp_user}
                </p>
            </div>
        </body>
    </html>
    """
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f'Tech Forma Support <{smtp_user}>'
        msg['To'] = to_email
        
        html_part = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(html_part)
        
        with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
            print(f'Email sent successfully via SMTP to {to_email}')
            return True
            
    except Exception as e:
        print(f'SMTP error: {e}')
        return False

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Email',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        user_email = body_data.get('email', '').strip()
        subject = body_data.get('subject', '').strip()
        message = body_data.get('message', '').strip()
        attachment_url = body_data.get('attachment_url', '').strip()
        
        if not user_email or not subject or not message:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Все поля обязательны'})
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "INSERT INTO support_tickets (user_email, subject, message, attachment_url, status) VALUES (%s, %s, %s, %s, 'new') RETURNING id",
            (user_email, subject, message, attachment_url if attachment_url else None)
        )
        ticket_id = cur.fetchone()[0]
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'ticket_id': ticket_id})
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        headers_dict = event.get('headers', {})
        print(f'DEBUG: Все заголовки: {headers_dict}')
        admin_email = headers_dict.get('x-admin-email', '') or headers_dict.get('X-Admin-Email', '')
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if admin_email == 'tech.forma@yandex.ru':
            cur.execute("""
                SELECT id, user_email, subject, message, attachment_url, status, admin_response, 
                       created_at, updated_at 
                FROM support_tickets 
                ORDER BY created_at DESC
            """)
        else:
            user_email = params.get('email', '')
            if not user_email:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Email обязателен'})
                }
            cur.execute("""
                SELECT id, user_email, subject, message, attachment_url, status, admin_response, 
                       created_at, updated_at 
                FROM support_tickets 
                WHERE user_email = %s
                ORDER BY created_at DESC
            """, (user_email,))
        
        tickets = cur.fetchall()
        cur.close()
        conn.close()
        
        tickets_list = []
        for ticket in tickets:
            tickets_list.append({
                'id': ticket['id'],
                'user_email': ticket['user_email'],
                'subject': ticket['subject'],
                'message': ticket['message'],
                'attachment_url': ticket['attachment_url'],
                'status': ticket['status'],
                'admin_response': ticket['admin_response'],
                'created_at': ticket['created_at'].isoformat() if ticket['created_at'] else None,
                'updated_at': ticket['updated_at'].isoformat() if ticket['updated_at'] else None
            })
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'tickets': tickets_list})
        }
    
    if method == 'PUT':
        headers_dict = event.get('headers', {})
        admin_email = headers_dict.get('x-admin-email', '') or headers_dict.get('X-Admin-Email', '')
        
        if admin_email != 'tech.forma@yandex.ru':
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({'error': 'Доступ запрещен'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        ticket_id = body_data.get('ticket_id')
        admin_response = body_data.get('admin_response', '').strip()
        
        if not ticket_id or not admin_response:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'ID тикета и ответ обязательны'})
            }
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            "SELECT user_email, subject FROM support_tickets WHERE id = %s",
            (ticket_id,)
        )
        ticket = cur.fetchone()
        
        if not ticket:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Тикет не найден'})
            }
        
        email_sent = send_email(
            ticket['user_email'],
            f"Re: {ticket['subject']}",
            admin_response
        )
        
        cur.execute(
            "UPDATE support_tickets SET admin_response = %s, status = 'answered', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (admin_response, ticket_id)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'email_sent': email_sent
            })
        }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Метод не поддерживается'})
    }