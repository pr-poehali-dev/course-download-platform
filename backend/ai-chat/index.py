import json
import os
import sys
import psycopg2
from datetime import datetime
from typing import Dict, Any

if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: AI chat assistant for student work adaptation with subscription check and file upload support
    Args: event with httpMethod, headers with X-User-Id, body containing messages array
    Returns: HTTP response with AI assistant reply
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'User not authenticated'})
        }
    
    try:
        body = event.get('body') or '{}'
        body_data = json.loads(body) if body else {}
        messages = body_data.get('messages', [])
        file_content = body_data.get('file_content', '')
        file_name = body_data.get('file_name', '')
        
        if not messages:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Messages array is required'})
            }
        
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Database not configured'})
            }
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        is_admin = (user_id == '999999')
        
        if is_admin:
            sub_id = 0
            sub_type = 'unlimited'
            total_requests = 0
            used_requests = 0
            expires_at = None
        else:
            cur.execute("""
                SELECT id, subscription_type, requests_total, requests_used, expires_at
                FROM t_p63326274_course_download_plat.ai_subscriptions
                WHERE user_id = %s AND is_active = true
                ORDER BY created_at DESC
                LIMIT 1
            """, (user_id,))
            
            sub_row = cur.fetchone()
            
            if not sub_row:
                cur.close()
                conn.close()
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'No active subscription'})
                }
            
            sub_id, sub_type, total_requests, used_requests, expires_at = sub_row
            
            if expires_at and datetime.now() > expires_at:
                cur.execute("UPDATE t_p63326274_course_download_plat.ai_subscriptions SET is_active = false WHERE id = %s", (sub_id,))
                conn.commit()
                cur.close()
                conn.close()
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Subscription expired'})
                }
            
            if total_requests > 0 and used_requests >= total_requests:
                cur.close()
                conn.close()
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Request limit reached'})
                }
        
        gigachat_credentials = os.environ.get('GIGACHAT_CREDENTIALS', '')
        
        if not gigachat_credentials:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'GigaChat credentials not configured'})
            }
        
        from gigachat import GigaChat
        
        client = GigaChat(credentials=gigachat_credentials, verify_ssl_certs=False)
        
        system_prompt = """Ты — умный помощник для студентов, который помогает адаптировать купленные работы под требования их ВУЗа.

ВАЖНО: Ты НЕ пишешь работу за студента! Ты учишь его работать самостоятельно.

Твои задачи:
1. Анализировать структуру работы и объяснять её
2. Подсказывать, КАК переформулировать текст (но не делать это за студента)
3. Направлять студента пошагово
4. Учить работать с источниками и оформлением
5. Задавать наводящие вопросы вместо готовых ответов

Стиль общения:
- Дружелюбный, как у наставника
- Короткие понятные инструкции
- Эмодзи для наглядности 📚
- Поощряй самостоятельную работу

Запрещено:
- Писать целые разделы работы
- Давать готовые формулировки для копирования
- Решать задачи полностью
- Генерировать большие куски текста

Разрешено:
- Объяснять как делать
- Показывать на примерах
- Давать алгоритмы действий
- Проверять и комментировать результат студента"""

        api_messages = [
            {'role': 'system', 'content': system_prompt}
        ]
        
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role in ['user', 'assistant']:
                api_messages.append({'role': role, 'content': content})
        
        if file_content and len(api_messages) > 1:
            for i in range(len(api_messages) - 1, -1, -1):
                if api_messages[i]['role'] == 'user':
                    file_label = "UPLOADED FILE"
                    safe_content = file_content[:15000].encode('utf-8', errors='ignore').decode('utf-8')
                    api_messages[i]['content'] += f"\n\n=== {file_label} ===\n{safe_content}\n=== END OF FILE ==="
                    break
        
        print(f"DEBUG: Sending {len(api_messages)} messages to GigaChat", file=sys.stderr)
        
        response = client.chat(api_messages, temperature=0.7, max_tokens=800)
        
        assistant_message = response.choices[0].message.content
        total_tokens = response.usage.total_tokens if hasattr(response, 'usage') else 0
        
        user_content = messages[-1].get('content', '') if messages else ''
        
        if not is_admin:
            cur.execute("""
                INSERT INTO t_p63326274_course_download_plat.ai_chat_history (user_id, subscription_id, role, content, file_name, tokens_used)
                VALUES (%s, %s, 'user', %s, %s, 0)
            """, (user_id, sub_id, user_content, file_name if file_name else None))
            
            cur.execute("""
                INSERT INTO t_p63326274_course_download_plat.ai_chat_history (user_id, subscription_id, role, content, tokens_used)
                VALUES (%s, %s, 'assistant', %s, %s)
            """, (user_id, sub_id, assistant_message, total_tokens))
            
            cur.execute("""
                UPDATE t_p63326274_course_download_plat.ai_subscriptions
                SET requests_used = requests_used + 1
                WHERE id = %s
            """, (sub_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'message': assistant_message,
                'usage': {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'completion_tokens': response.usage.completion_tokens,
                    'total_tokens': total_tokens
                }
            })
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except Exception as e:
        import traceback
        error_details = {
            'error': str(e),
            'type': type(e).__name__,
            'traceback': traceback.format_exc()
        }
        print(f"AI Chat Error: {json.dumps(error_details)}", file=sys.stderr)
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'{type(e).__name__}: {str(e)}'})
        }