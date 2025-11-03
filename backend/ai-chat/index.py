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
        
        import httpx
        import uuid
        
        gigachat_credentials = gigachat_credentials.strip()
        
        # Получаем Access Token
        token_url = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
        token_headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'RqUID': str(uuid.uuid4()),
            'Authorization': f'Basic {gigachat_credentials}'
        }
        token_data = 'scope=GIGACHAT_API_PERS'
        
        with httpx.Client(verify=False, timeout=25.0) as http_client:
            token_response = http_client.post(token_url, headers=token_headers, content=token_data)
            token_response.raise_for_status()
            access_token = token_response.json()['access_token']
        
        system_prompt = """Ты помощник студента. Учишь адаптировать работы, не пишешь за него. Давай короткие советы КАК делать, а не готовые решения. Стиль: дружелюбный наставник."""

        api_messages = [
            {'role': 'system', 'content': system_prompt}
        ]
        
        # Берем только последние 2 сообщения для контекста (экономим токены и время)
        recent_messages = messages[-2:] if len(messages) > 2 else messages
        
        for msg in recent_messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role in ['user', 'assistant']:
                api_messages.append({'role': role, 'content': content})
        
        if file_content and len(api_messages) > 1:
            for i in range(len(api_messages) - 1, -1, -1):
                if api_messages[i]['role'] == 'user':
                    file_label = "UPLOADED FILE"
                    safe_content = file_content[:2000].encode('utf-8', errors='ignore').decode('utf-8')
                    api_messages[i]['content'] += f"\n\n=== {file_label} ===\n{safe_content}\n=== END OF FILE ==="
                    break
        
        # Отправляем запрос к GigaChat API
        with httpx.Client(verify=False, timeout=25.0) as http_client:
            chat_url = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'
            chat_headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': f'Bearer {access_token}'
            }
            chat_payload = {
                'model': 'GigaChat',
                'messages': api_messages,
                'temperature': 0.3,
                'max_tokens': 300
            }
            
            chat_response = http_client.post(chat_url, headers=chat_headers, json=chat_payload)
            chat_response.raise_for_status()
            chat_data = chat_response.json()
            
            assistant_message = chat_data['choices'][0]['message']['content']
            total_tokens = chat_data.get('usage', {}).get('total_tokens', 0)
        
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