import json
import os
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: AI chat endpoint for TechMentor - text responses
    Args: event with httpMethod POST, body with sessionId, userText, mode, pageContext
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
    
    openai_key = os.environ.get('OPENAI_API_KEY')
    if not openai_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'OpenAI API key not configured'})
        }
    
    try:
        body = event.get('body', '{}')
        body_data = json.loads(body)
        
        session_id = body_data.get('sessionId')
        user_text = body_data.get('userText')
        mode = body_data.get('mode', 'tutor')
        page_context = body_data.get('pageContext', {})
        
        if not session_id or not user_text:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'sessionId and userText are required'})
            }
        
        # System prompts by mode
        BASE_POLICY = """Ты — TechMentor платформы TechForma. Помогаешь студенту РАЗОБРАТЬСЯ и сделать работу САМОСТОЯТЕЛЬНО. Правила:
• Не пишешь работы целиком и не выдаёшь большие фрагменты; вместо этого — план, структура, методика, чек-листы, мини-примеры (до 6–8 предложений), вопросы для самопроверки.
• Если просят «сделай/напиши полностью» — мягко отказывайся и переводишь в учебный формат.
• Не выдумывай источники/ГОСТы; проси методичку/исходники, давай общий алгоритм поиска.
• Пиши по-русски, по шагам, коротко и конкретно."""
        
        if mode == 'rewrite':
            system_prompt = BASE_POLICY + "\nРежим: Переформулирование. Переписывай яснее и компактнее, без новых фактов; добавь 2–3 стилистические правки и чек-лист."
        elif mode == 'outline':
            system_prompt = BASE_POLICY + "\nРежим: План. Дай структуру, что раскрывать в каждом разделе, какие данные собрать, формат таблиц/рисунков и чек-лист."
        else:
            system_prompt = BASE_POLICY + "\nРежим: Репетитор. Объясняй по шагам, задавай наводящие вопросы, мини-примеры, типовые ошибки, критерии оценивания."
        
        # Guard text
        guard = 'Обычный запрос.'
        if any(word in user_text.lower() for word in ['сделай', 'напиши', 'выполни', 'оформи']):
            if any(word in user_text.lower() for word in ['за меня', 'полностью', 'всю', 'всё']):
                guard = 'Пользователь просит сделать за него: мягко откажись и предложи план, чек-лист и мини-пример.'
        
        # Build messages
        messages = [
            {'role': 'system', 'content': system_prompt},
            {'role': 'system', 'content': guard}
        ]
        
        if page_context:
            context_text = f"Контекст страницы: {json.dumps(page_context, ensure_ascii=False)}"
            messages.append({'role': 'system', 'content': context_text})
        else:
            messages.append({'role': 'system', 'content': 'Контекст страницы отсутствует.'})
        
        messages.append({'role': 'user', 'content': user_text})
        
        # Call OpenAI API
        import requests
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {openai_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'temperature': 0.5,
                'messages': messages
            },
            timeout=30
        )
        
        if response.status_code == 429:
            return {
                'statusCode': 429,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Лимит модели. Попробуйте позже.'})
            }
        
        if not response.ok:
            raise Exception(f'OpenAI API error: {response.status_code}')
        
        result = response.json()
        reply = result['choices'][0]['message']['content'].strip()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'reply': reply
            })
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
