import json
import os
from typing import Dict, Any
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: AI-помощник TechMentor для студентов - помощь с написанием курсовых и дипломов
    Args: event - dict с httpMethod, body (messages, context)
          context - объект с request_id
    Returns: HTTP response с ответом от OpenAI
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    user_message = body_data.get('message', '').strip()
    work_context = body_data.get('context', {})
    
    if not user_message:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Сообщение не может быть пустым'}),
            'isBase64Encoded': False
        }
    
    openai_key = os.environ.get('OPENAI_API_KEY')
    if not openai_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'OpenAI API key not configured'}),
            'isBase64Encoded': False
        }
    
    system_prompt = """Ты TechMentor — умный помощник для студентов платформы TechForma.

Твоя задача:
- Помогать с написанием курсовых и дипломных работ
- Давать советы по структуре, оформлению, содержанию
- Объяснять сложные темы простым языком
- Проверять работы на соответствие требованиям

Стиль общения:
- Дружелюбный, но профессиональный
- Короткие понятные ответы (2-4 абзаца)
- Конкретные советы и примеры
- Мотивируй студента, но не делай работу за него

Если студент просит написать за него целые главы — объясни, что ты помогаешь разобраться, но не делаешь работу полностью."""
    
    if work_context:
        title = work_context.get('title', '')
        subject = work_context.get('subject', '')
        if title or subject:
            system_prompt += f"\n\nКонтекст работы студента:\n- Тема: {title}\n- Предмет: {subject}"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]
    
    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {openai_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': messages,
                'temperature': 0.7,
                'max_tokens': 800
            },
            timeout=30
        )
        
        if response.status_code != 200:
            error_data = response.json() if response.text else {}
            error_code = error_data.get('error', {}).get('code', '')
            
            if error_code == 'unsupported_country_region_territory':
                error_msg = 'AI-помощник временно недоступен в вашем регионе. Попробуйте позже или обратитесь в поддержку.'
            else:
                error_msg = f'Ошибка AI-сервиса: {error_data.get("error", {}).get("message", "Unknown error")}'
            
            return {
                'statusCode': 503,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': error_msg}),
                'isBase64Encoded': False
            }
        
        data = response.json()
        ai_response = data['choices'][0]['message']['content']
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'response': ai_response,
                'usage': data.get('usage', {})
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Internal error: {str(e)}'}),
            'isBase64Encoded': False
        }