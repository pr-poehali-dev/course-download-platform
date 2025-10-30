import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: AI chat assistant for student work adaptation
    Args: event with httpMethod, body containing messages array
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
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        messages = body_data.get('messages', [])
        
        if not messages:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Messages array is required'})
            }
        
        openai_api_key = os.environ.get('OPENAI_API_KEY', '')
        
        if not openai_api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'OpenAI API key not configured'})
            }
        
        import openai
        
        client = openai.OpenAI(api_key=openai_api_key)
        
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
        
        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=api_messages,
            temperature=0.7,
            max_tokens=800
        )
        
        assistant_message = response.choices[0].message.content
        
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
                    'total_tokens': response.usage.total_tokens
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
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
