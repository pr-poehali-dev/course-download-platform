import json
import os
from typing import Dict, Any, List
import urllib.parse
import urllib.request
import zipfile
import io

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Обновление списка файлов для всех работ в каталоге
    Args: event с httpMethod
          context с request_id
    Returns: HTTP response с количеством обновленных работ
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        import psycopg2
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Получаем работы батчами по 50 штук для избежания таймаута
        # Читаем параметр batch из query string (по умолчанию 0)
        query_params = event.get('queryStringParameters') or {}
        batch_num = int(query_params.get('batch', 0))
        batch_size = 50
        offset = batch_num * batch_size
        
        cur.execute("""
            SELECT id, title, download_url, file_url 
            FROM t_p63326274_course_download_plat.works 
            WHERE (download_url IS NOT NULL OR file_url IS NOT NULL)
            AND (files_list IS NULL OR files_list = '[]'::jsonb)
            ORDER BY id
            LIMIT %s OFFSET %s
        """, (batch_size, offset))
        
        works = cur.fetchall()
        updated_count = 0
        errors = []
        
        for work_id, title, download_url, file_url in works:
            archive_url = download_url or file_url
            if not archive_url:
                continue
            
            try:
                # Кодируем URL (кириллицу и пробелы)
                parsed = urllib.parse.urlparse(archive_url)
                encoded_path = urllib.parse.quote(parsed.path.encode('utf-8'), safe='/')
                encoded_url = urllib.parse.urlunparse((
                    parsed.scheme,
                    parsed.netloc,
                    encoded_path,
                    parsed.params,
                    parsed.query,
                    parsed.fragment
                ))
                
                # Скачиваем архив
                req = urllib.request.Request(encoded_url)
                req.add_header('User-Agent', 'Mozilla/5.0')
                
                with urllib.request.urlopen(req, timeout=30) as response:
                    archive_data = response.read()
                
                files_list = []
                
                # Определяем тип архива и извлекаем список файлов
                if archive_url.lower().endswith('.zip'):
                    with zipfile.ZipFile(io.BytesIO(archive_data)) as zf:
                        for file_info in zf.filelist:
                            if not file_info.is_dir():
                                # Исправляем кодировку имени файла из ZIP
                                try:
                                    # Пробуем декодировать как UTF-8
                                    file_name = file_info.filename.encode('cp437').decode('utf-8')
                                except (UnicodeDecodeError, UnicodeEncodeError):
                                    # Если не получилось, используем как есть
                                    file_name = file_info.filename
                                
                                file_name = file_name.split('/')[-1]
                                files_list.append({
                                    'name': file_name,
                                    'type': get_file_type(file_name),
                                    'size': file_info.file_size
                                })
                
                elif archive_url.lower().endswith('.rar'):
                    # Для RAR используем простой парсинг (без распаковки)
                    # В продакшене можно добавить unrar
                    files_list.append({
                        'name': 'Архив RAR',
                        'type': 'archive',
                        'size': len(archive_data)
                    })
                
                else:
                    # Для не-архивных файлов (PNG, DOC, PDF и т.д.)
                    file_name = archive_url.split('/')[-1]
                    files_list.append({
                        'name': file_name,
                        'type': get_file_type(file_name),
                        'size': len(archive_data)
                    })
                
                # Обновляем БД
                if files_list:
                    files_json = json.dumps(files_list, ensure_ascii=False)
                    cur.execute(
                        "UPDATE t_p63326274_course_download_plat.works SET files_list = %s WHERE id = %s",
                        (files_json, work_id)
                    )
                    updated_count += 1
                    print(f"Updated work {work_id}: {len(files_list)} files")
            
            except Exception as e:
                import traceback
                error_msg = f"Work {work_id} ({title[:50]}): {str(e)}"
                errors.append(error_msg)
                print(f"Error: {error_msg}")
                print(f"Traceback: {traceback.format_exc()}")
                continue
        
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
                'updated': updated_count,
                'total': len(works),
                'errors': errors[:10]  # Первые 10 ошибок
            })
        }
    
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }


def get_file_type(filename: str) -> str:
    '''Определяет тип файла по расширению'''
    name_lower = filename.lower()
    
    if name_lower.endswith(('.doc', '.docx')):
        return 'word'
    elif name_lower.endswith('.pdf'):
        return 'pdf'
    elif name_lower.endswith(('.dwg', '.cdw', '.frw')):
        return 'cad'
    elif name_lower.endswith(('.xls', '.xlsx')):
        return 'excel'
    elif name_lower.endswith(('.ppt', '.pptx')):
        return 'powerpoint'
    elif name_lower.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.gif')):
        return 'image'
    elif name_lower.endswith(('.zip', '.rar', '.7z')):
        return 'archive'
    elif name_lower.endswith('.txt'):
        return 'text'
    else:
        return 'unknown'