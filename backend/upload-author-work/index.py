import json
import psycopg2
import os
import requests
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Upload author works, get user/pending works, moderate works
    Args: event with httpMethod POST/GET, url path, body, headers with X-User-Id or X-Admin
    Returns: Upload result, works list, or moderation result with email notification
    '''
    method: str = event.get('httpMethod', 'GET')
    url: str = event.get('url', '')
    query_params = event.get('queryStringParameters', {}) or {}
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Admin',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    dsn = os.environ.get('DATABASE_URL')
    
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    if method == 'GET':
        if 'user' in url or query_params.get('user_id'):
            user_id = query_params.get('user_id') or headers.get('X-User-Id') or headers.get('x-user-id')
            
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Требуется авторизация'})
                }
            
            try:
                conn = psycopg2.connect(dsn)
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT id, title, work_type, subject, description, price_points,
                           file_name, file_size, moderation_status, moderation_comment,
                           downloads_count, earnings_total, created_at
                    FROM t_p63326274_course_download_plat.uploaded_works
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                ''', (int(user_id),))
                
                rows = cursor.fetchall()
                works = []
                for row in rows:
                    works.append({
                        'id': row[0],
                        'title': row[1],
                        'work_type': row[2],
                        'subject': row[3],
                        'description': row[4],
                        'price_points': row[5],
                        'file_name': row[6],
                        'file_size': row[7],
                        'moderation_status': row[8],
                        'moderation_comment': row[9],
                        'downloads_count': row[10] or 0,
                        'earnings_total': row[11] or 0,
                        'created_at': row[12].isoformat() if row[12] else None
                    })
                
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'works': works})
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': f'Ошибка загрузки: {str(e)}'})
                }
        
        elif 'pending' in url:
            try:
                conn = psycopg2.connect(dsn)
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT id, user_id, title, work_type, subject, description, price_points,
                           file_name, file_size, moderation_status, created_at
                    FROM t_p63326274_course_download_plat.uploaded_works
                    WHERE moderation_status = %s
                    ORDER BY created_at ASC
                ''', ('pending',))
                
                rows = cursor.fetchall()
                works = []
                for row in rows:
                    works.append({
                        'id': row[0],
                        'user_id': row[1],
                        'title': row[2],
                        'work_type': row[3],
                        'subject': row[4],
                        'description': row[5],
                        'price_points': row[6],
                        'file_name': row[7],
                        'file_size': row[8],
                        'moderation_status': row[9],
                        'created_at': row[10].isoformat() if row[10] else None
                    })
                
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'works': works})
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': f'Ошибка загрузки: {str(e)}'})
                }
        
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Not found'})
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    if 'moderate' in url:
        work_id = body_data.get('workId')
        action = body_data.get('action')
        comment = body_data.get('comment', '')
        
        if not work_id or not action:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'workId и action обязательны'})
            }
        
        try:
            conn = psycopg2.connect(dsn)
            cursor = conn.cursor()
            
            if action == 'approve':
                cursor.execute('''
                    UPDATE t_p63326274_course_download_plat.uploaded_works
                    SET moderation_status = %s, moderated_at = %s, published_at = %s
                    WHERE id = %s
                    RETURNING user_id, title, work_type, subject, description, price_points, file_url
                ''', ('approved', datetime.now(), datetime.now(), int(work_id)))
                
                result = cursor.fetchone()
                if not result:
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Работа не найдена'})
                    }
                
                user_id, title, work_type, subject, description, price_points, file_url = result
                
                cursor.execute('''
                    SELECT email FROM t_p63326274_course_download_plat.users WHERE id = %s
                ''', (user_id,))
                
                email_result = cursor.fetchone()
                user_email = email_result[0] if email_result else None
                
                cursor.execute('''
                    INSERT INTO t_p63326274_course_download_plat.works
                    (title, work_type, subject, description, price_points, author_id, file_url, status, rating, downloads, views_count)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (title, work_type, subject, description, price_points, user_id, file_url or '', 'active', 0, 0, 0))
                
                published_work_id = cursor.fetchone()[0]
                
                conn.commit()
                cursor.close()
                conn.close()
                
                email_sent = False
                if user_email:
                    try:
                        smtp_user = os.environ.get('SMTP_USER', '')
                        smtp_pass = os.environ.get('SMTP_PASS', '')
                        smtp_host = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
                        smtp_port = int(os.environ.get('SMTP_PORTSMTP_PORT', '465'))
                        
                        if smtp_user and smtp_pass:
                            import smtplib
                            from email.mime.text import MIMEText
                            from email.mime.multipart import MIMEMultipart
                            
                            msg = MIMEMultipart('alternative')
                            msg['Subject'] = f'Ваша работа "{title}" одобрена и опубликована! 🎉'
                            msg['From'] = smtp_user
                            msg['To'] = user_email
                            
                            html = f'''
                            <html>
                            <body style="font-family: Arial, sans-serif;">
                                <h2 style="color: #10b981;">Поздравляем! Работа опубликована 🎉</h2>
                                <p>Ваша работа "<strong>{title}</strong>" успешно прошла модерацию и теперь доступна в каталоге!</p>
                                
                                <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px;">
                                    <h3 style="margin-top: 0; color: #059669;">Что дальше?</h3>
                                    <ul style="line-height: 1.8;">
                                        <li>Работа теперь видна всем пользователям платформы</li>
                                        <li>За каждую покупку вы будете получать <strong>{price_points} баллов</strong></li>
                                        <li>Отслеживайте статистику в личном кабинете (скачивания, заработок)</li>
                                        <li>Продолжайте загружать работы и помогайте сообществу!</li>
                                    </ul>
                                </div>
                                
                                <p style="margin-top: 30px;">
                                    <a href="https://techforma.ru" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                        Открыть личный кабинет
                                    </a>
                                </p>
                                
                                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                                    Спасибо, что делитесь знаниями с другими студентами! 💙
                                </p>
                                
                                <p>С уважением,<br>Команда TechForma</p>
                            </body>
                            </html>
                            '''
                            
                            msg.attach(MIMEText(html, 'html'))
                            
                            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
                            server.login(smtp_user, smtp_pass)
                            server.send_message(msg)
                            server.quit()
                            
                            email_sent = True
                    except Exception as email_error:
                        print(f'Email error on approve: {email_error}')
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'publishedWorkId': published_work_id,
                        'userEmail': user_email,
                        'emailSent': email_sent,
                        'message': 'Работа одобрена и опубликована'
                    })
                }
            
            elif action == 'reject':
                cursor.execute('''
                    UPDATE t_p63326274_course_download_plat.uploaded_works
                    SET moderation_status = %s, moderation_comment = %s, moderated_at = %s
                    WHERE id = %s
                    RETURNING user_id, title
                ''', ('rejected', comment, datetime.now(), int(work_id)))
                
                result = cursor.fetchone()
                if not result:
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Работа не найдена'})
                    }
                
                user_id, work_title = result
                
                cursor.execute('''
                    SELECT email FROM t_p63326274_course_download_plat.users WHERE id = %s
                ''', (user_id,))
                
                email_result = cursor.fetchone()
                user_email = email_result[0] if email_result else None
                
                conn.commit()
                cursor.close()
                conn.close()
                
                email_sent = False
                if user_email:
                    try:
                        smtp_user = os.environ.get('SMTP_USER', '')
                        smtp_pass = os.environ.get('SMTP_PASS', '')
                        smtp_host = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
                        smtp_port = int(os.environ.get('SMTP_PORTSMTP_PORT', '465'))
                        
                        if smtp_user and smtp_pass:
                            import smtplib
                            from email.mime.text import MIMEText
                            from email.mime.multipart import MIMEMultipart
                            
                            msg = MIMEMultipart('alternative')
                            msg['Subject'] = f'Ваша работа "{work_title}" отклонена модератором'
                            msg['From'] = smtp_user
                            msg['To'] = user_email
                            
                            html = f'''
                            <html>
                            <body style="font-family: Arial, sans-serif;">
                                <h2>Работа не прошла модерацию</h2>
                                <p>К сожалению, ваша работа "<strong>{work_title}</strong>" была отклонена модератором.</p>
                                <h3>Причина отклонения:</h3>
                                <p style="background: #f5f5f5; padding: 15px; border-left: 4px solid #e53e3e;">
                                    {comment}
                                </p>
                                <p>Вы можете внести исправления и загрузить работу заново через ваш личный кабинет.</p>
                                <p>С уважением,<br>Команда TechForma</p>
                            </body>
                            </html>
                            '''
                            
                            msg.attach(MIMEText(html, 'html'))
                            
                            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
                            server.login(smtp_user, smtp_pass)
                            server.send_message(msg)
                            server.quit()
                            
                            email_sent = True
                    except Exception as email_error:
                        print(f'Email error: {email_error}')
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'userEmail': user_email,
                        'workTitle': work_title,
                        'rejectionComment': comment,
                        'emailSent': email_sent,
                        'message': 'Работа отклонена' + (' и отправлено уведомление на email' if email_sent else '')
                    })
                }
            
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Неизвестное действие'})
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': f'Ошибка модерации: {str(e)}'})
            }
    
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    title = body_data.get('title', '').strip()
    description = body_data.get('description', '').strip()
    work_type = body_data.get('workType', '').strip()
    subject = body_data.get('subject', '').strip()
    price_points = body_data.get('price', 0)
    file_name = body_data.get('fileName', '')
    file_size = body_data.get('fileSize', 0)
    file_data = body_data.get('fileData', '')
    
    if not all([title, description, work_type, subject, price_points]):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Все поля обязательны'})
        }
    
    if not file_data or not file_name:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Файл не загружен'})
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        file_url = f"temp_{user_id}_{datetime.now().timestamp()}_{file_name}"
        
        insert_work_query = '''
            INSERT INTO t_p63326274_course_download_plat.uploaded_works 
            (user_id, title, work_type, subject, description, price_points, 
             file_name, file_size, file_url, moderation_status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        '''
        
        cursor.execute(
            insert_work_query, 
            (int(user_id), title, work_type, subject, description, int(price_points),
             file_name, file_size, file_url, 'pending', datetime.now())
        )
        
        work_id = cursor.fetchone()[0]
        
        cursor.execute('''
            UPDATE t_p63326274_course_download_plat.users
            SET balance = balance + 100
            WHERE id = %s
            RETURNING balance
        ''', (int(user_id),))
        
        result = cursor.fetchone()
        new_balance = result[0] if result else 0
        
        cursor.execute('''
            INSERT INTO t_p63326274_course_download_plat.transactions
            (user_id, amount, transaction_type, description)
            VALUES (%s, %s, %s, %s)
        ''', (int(user_id), 100, 'work_upload', f'Загрузка работы: {title}'))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'workId': work_id,
                'status': 'pending',
                'message': 'Работа загружена и отправлена на модерацию',
                'bonusEarned': 100,
                'newBalance': new_balance
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Ошибка загрузки: {str(e)}'})
        }