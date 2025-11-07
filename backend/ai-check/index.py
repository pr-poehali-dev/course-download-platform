import json
import os
import base64
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Check student work files (PDF/DOCX) using AI
    Args: event with httpMethod POST, body with fileData (base64), requirements
    Returns: HTTP response with AI feedback on the work
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
        
        file_data = body_data.get('fileData', '')
        file_name = body_data.get('fileName', '')
        requirements = body_data.get('requirements', '')
        
        if not file_data:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'fileData is required'})
            }
        
        # Extract text from file based on type
        file_text = ''
        
        if file_name.endswith('.pdf'):
            # For PDF files - simple text extraction
            try:
                import PyPDF2
                import io
                
                # Decode base64
                file_bytes = base64.b64decode(file_data.split(',')[1] if ',' in file_data else file_data)
                pdf_file = io.BytesIO(file_bytes)
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                
                for page in pdf_reader.pages:
                    file_text += page.extract_text() + '\n'
                    
            except Exception as e:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': f'Failed to parse PDF: {str(e)}'})
                }
        
        elif file_name.endswith('.docx'):
            # For DOCX files
            try:
                import docx
                import io
                
                # Decode base64
                file_bytes = base64.b64decode(file_data.split(',')[1] if ',' in file_data else file_data)
                doc_file = io.BytesIO(file_bytes)
                doc = docx.Document(doc_file)
                
                for paragraph in doc.paragraphs:
                    file_text += paragraph.text + '\n'
                    
            except Exception as e:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': f'Failed to parse DOCX: {str(e)}'})
                }
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Only PDF and DOCX files are supported'})
            }
        
        # Limit text length for API
        max_length = 8000
        if len(file_text) > max_length:
            file_text = file_text[:max_length] + '\n\n[...текст обрезан для анализа...]'
        
        # Build AI prompt
        prompt = f"""Ты — TechMentor, проверяешь студенческую работу. Проанализируй текст и дай обратную связь:

1. **Структура** — есть ли введение, основная часть, заключение, список литературы
2. **Логика** — последовательность изложения, связность разделов
3. **Оформление** — соответствие требованиям (если указаны)
4. **Рекомендации** — что улучшить, какие разделы доработать

Требования вуза: {requirements if requirements else 'не указаны'}

Текст работы:
{file_text}

Дай краткий отчёт (до 1000 символов) с конкретными рекомендациями."""
        
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
                'messages': [
                    {'role': 'system', 'content': 'Ты — TechMentor, помогаешь студентам улучшать их работы.'},
                    {'role': 'user', 'content': prompt}
                ]
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
                'reply': reply,
                'fileName': file_name
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
