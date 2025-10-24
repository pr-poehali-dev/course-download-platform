import json
import os
import psycopg2
import hashlib
from typing import Dict, Any, List, Tuple
from difflib import SequenceMatcher

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Проверка работ на уникальность и плагиат
    Args: event - dict с httpMethod, body (text_content, work_id, user_id)
          context - объект с request_id
    Returns: HTTP response с процентом уникальности и списком похожих работ
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        return check_plagiarism(event)
    
    if method == 'GET':
        return get_check_result(event)
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    return conn

def calculate_text_hash(text: str) -> str:
    normalized_text = ' '.join(text.lower().split())
    return hashlib.sha256(normalized_text.encode()).hexdigest()

def calculate_similarity(text1: str, text2: str) -> float:
    text1_normalized = ' '.join(text1.lower().split())
    text2_normalized = ' '.join(text2.lower().split())
    
    matcher = SequenceMatcher(None, text1_normalized, text2_normalized)
    return matcher.ratio() * 100

def find_similar_works(text_content: str, file_hash: str, conn) -> Tuple[float, List[Dict]]:
    cur = conn.cursor()
    
    cur.execute("""
        SELECT w.id, w.title, pc.text_content, pc.file_hash 
        FROM plagiarism_checks pc
        JOIN works w ON pc.work_id = w.id
        WHERE w.status = %s AND pc.text_content IS NOT NULL
    """, ('approved',))
    
    existing_works = cur.fetchall()
    cur.close()
    
    similar_works = []
    max_similarity = 0.0
    
    for work_id, title, existing_text, existing_hash in existing_works:
        if existing_hash == file_hash:
            return 0.0, [{'work_id': work_id, 'title': title, 'similarity': 100.0}]
        
        if existing_text:
            similarity = calculate_similarity(text_content, existing_text)
            
            if similarity > 30:
                similar_works.append({
                    'work_id': work_id,
                    'title': title,
                    'similarity': round(similarity, 2)
                })
                max_similarity = max(max_similarity, similarity)
    
    similar_works.sort(key=lambda x: x['similarity'], reverse=True)
    similar_works = similar_works[:5]
    
    uniqueness = 100.0 - max_similarity if similar_works else 100.0
    
    return uniqueness, similar_works

def check_plagiarism(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    text_content = body_data.get('text_content', '').strip()
    work_id = body_data.get('work_id')
    user_id = body_data.get('user_id')
    
    if not text_content:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Текст работы не предоставлен'})
        }
    
    if len(text_content) < 100:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Текст слишком короткий для проверки (минимум 100 символов)'})
        }
    
    file_hash = calculate_text_hash(text_content)
    
    conn = get_db_connection()
    
    uniqueness, similar_works = find_similar_works(text_content, file_hash, conn)
    
    cur = conn.cursor()
    
    check_id = None
    
    if work_id:
        cur.execute("SELECT id FROM works WHERE id = %s", (work_id,))
        if cur.fetchone():
            cur.execute(
                "UPDATE works SET file_hash = %s WHERE id = %s",
                (file_hash, work_id)
            )
            conn.commit()
            
            if user_id:
                cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
                if cur.fetchone():
                    cur.execute(
                        """INSERT INTO plagiarism_checks 
                           (work_id, user_id, file_hash, text_content, uniqueness_percent, similar_works, status)
                           VALUES (%s, %s, %s, %s, %s, %s, %s)
                           RETURNING id""",
                        (work_id, user_id, file_hash, text_content, uniqueness, json.dumps(similar_works), 'completed')
                    )
                    check_id = cur.fetchone()[0]
                    conn.commit()
    
    cur.close()
    conn.close()
    
    status = 'approved' if uniqueness >= 70 else 'warning' if uniqueness >= 50 else 'rejected'
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'check_id': check_id,
            'file_hash': file_hash,
            'uniqueness_percent': round(uniqueness, 2),
            'similar_works': similar_works,
            'status': status,
            'message': get_status_message(uniqueness)
        })
    }

def get_check_result(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {})
    check_id = params.get('check_id')
    work_id = params.get('work_id')
    
    if not check_id and not work_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Необходимо указать check_id или work_id'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    if check_id:
        cur.execute(
            """SELECT id, file_hash, uniqueness_percent, similar_works, status, created_at
               FROM plagiarism_checks WHERE id = %s""",
            (check_id,)
        )
    else:
        cur.execute(
            """SELECT id, file_hash, uniqueness_percent, similar_works, status, created_at
               FROM plagiarism_checks WHERE work_id = %s ORDER BY created_at DESC LIMIT 1""",
            (work_id,)
        )
    
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    if not result:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Проверка не найдена'})
        }
    
    check_id, file_hash, uniqueness, similar_works, status, created_at = result
    
    check_status = 'approved' if uniqueness >= 70 else 'warning' if uniqueness >= 50 else 'rejected'
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'check_id': check_id,
            'file_hash': file_hash,
            'uniqueness_percent': float(uniqueness),
            'similar_works': similar_works if isinstance(similar_works, list) else json.loads(similar_works),
            'status': check_status,
            'message': get_status_message(float(uniqueness)),
            'created_at': created_at.isoformat() if created_at else None
        })
    }

def get_status_message(uniqueness: float) -> str:
    if uniqueness >= 90:
        return 'Отличная уникальность! Работа готова к публикации.'
    elif uniqueness >= 70:
        return 'Хорошая уникальность. Работа одобрена.'
    elif uniqueness >= 50:
        return 'Средняя уникальность. Рекомендуется доработка.'
    else:
        return 'Низкая уникальность. Работа отклонена из-за плагиата.'