import json
import os
from typing import Dict, Any
import requests

def get_mock_response(message: str, context: Dict[str, Any]) -> str:
    """Generate helpful mock response when API keys are not available"""
    message_lower = message.lower()
    
    if 'введение' in message_lower or 'вступление' in message_lower:
        return """**Структура введения курсовой работы:**

1. **Актуальность темы** (2-3 предложения) — почему эта тема важна сейчас
2. **Цель работы** — что вы хотите достичь  
3. **Задачи** (3-5 пунктов) — конкретные шаги для достижения цели
4. **Объект и предмет исследования** — что изучаете
5. **Методы исследования** — как будете изучать

Объем введения обычно 1,5-2 страницы. Пишите кратко и по существу!"""
    
    elif 'заключение' in message_lower or 'вывод' in message_lower:
        return """**Как написать заключение:**

1. Напишите, достигнута ли цель работы
2. Кратко опишите результаты по каждой задаче из введения
3. Сделайте общие выводы (3-5 пунктов)
4. Укажите практическую значимость

Заключение = зеркало введения. Проверьте, что все задачи из введения решены в заключении!"""
    
    elif 'список' in message_lower and 'литератур' in message_lower:
        return """**Оформление списка литературы (ГОСТ 7.1-2003):**

**Книга:**
Иванов И.И. Название книги. М.: Издательство, 2020. 250 с.

**Статья:**
Петров П.П. Название статьи // Журнал. 2021. №3. С. 45-52.

**Интернет-ресурс:**
Название сайта. URL: https://example.com (дата обращения: 01.11.2024).

Располагайте источники в алфавитном порядке. Минимум 15-20 источников для курсовой."""
    
    else:
        return f"""Я TechMentor — помощник для студентов! 

К сожалению, сейчас AI-сервис временно недоступен, но я дам вам общие рекомендации:

**Для курсовой работы важно:**
- Четкая структура (введение, главы, заключение)
- Соответствие ГОСТам по оформлению
- Актуальные источники (последние 5 лет)
- Логическая связь между разделами

**Задайте более конкретный вопрос:**
- Как оформить введение?
- Как написать заключение?  
- Как оформить список литературы?
- Как структурировать главу?

Я помогу вам с любым разделом работы!"""

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: AI-помощник TechMentor для студентов - помощь с написанием курсовых и дипломов (mock-режим)
    Args: event - dict с httpMethod, body (messages, context)
          context - объект с request_id
    Returns: HTTP response с полезными советами для студентов
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
    
    groq_key = os.environ.get('GROQ_API_KEY')
    openai_key = os.environ.get('OPENAI_API_KEY')
    
    use_mock = True
    
    if use_mock:
        mock_response = get_mock_response(user_message, work_context)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'response': mock_response,
                'usage': {'mock': True}
            }),
            'isBase64Encoded': False
        }
    
    use_groq = bool(groq_key)
    api_key = groq_key if use_groq else openai_key
    api_url = 'https://api.groq.com/openai/v1/chat/completions' if use_groq else 'https://api.openai.com/v1/chat/completions'
    model = 'llama-3.1-70b-versatile' if use_groq else 'gpt-4o-mini'
    
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
        print(f"AI Request: provider={'Groq' if use_groq else 'OpenAI'}, model={model}, url={api_url}")
        
        response = requests.post(
            api_url,
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': model,
                'messages': messages,
                'temperature': 0.7,
                'max_tokens': 800
            },
            timeout=30
        )
        
        print(f"AI Response: status={response.status_code}")
        
        if response.status_code != 200:
            error_data = response.json() if response.text else {}
            error_code = error_data.get('error', {}).get('code', '')
            error_message = error_data.get('error', {}).get('message', 'Unknown error')
            
            print(f"AI Error: code={error_code}, message={error_message}, full={error_data}")
            
            if error_code == 'unsupported_country_region_territory':
                error_msg = 'AI-помощник временно недоступен в вашем регионе. Попробуйте позже или обратитесь в поддержку.'
            else:
                error_msg = f'Ошибка AI-сервиса: {error_message}'
            
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