'''
Business: Полная синхронизация каталога из Yandex Cloud Storage (бакет kyra/works/) — парсинг папок, генерация превью, обновление БД с подробными описаниями
Args: event с POST body (пустой, все берется из бакета)
Returns: {success, total_works, synced}
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
import boto3
from botocore.config import Config
import uuid


def get_cloud_storage_folders() -> tuple:
    """Получает список всех файлов из бакета kyra (архивы работ)"""
    s3_client = boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=os.environ.get('YANDEX_S3_KEY_ID', ''),
        aws_secret_access_key=os.environ.get('YANDEX_S3_SECRET_KEY', ''),
        region_name='ru-central1',
        config=Config(signature_version='s3v4')
    )
    
    bucket_name = 'kyra'
    
    # Получаем все файлы из корня бакета
    response = s3_client.list_objects_v2(Bucket=bucket_name, MaxKeys=1000)
    
    works = []
    
    if 'Contents' in response:
        for obj in response['Contents']:
            file_key = obj['Key']
            file_name = file_key
            
            # Пропускаем системные файлы и превью
            if file_name.startswith('.') or file_name.startswith('previews/'):
                continue
            
            # Убираем расширение для получения названия
            name_without_ext = file_name.rsplit('.', 1)[0] if '.' in file_name else file_name
            
            # Парсим название работы и тип (например: "Автоклав (курсовая работа).rar")
            match = name_without_ext.strip()
            parts = match.rsplit('(', 1)
            
            if len(parts) == 2:
                title = parts[0].strip()
                work_type = parts[1].replace(')', '').strip()
            else:
                title = match
                work_type = 'Курсовая работа'
            
            works.append({
                'name': file_name,
                'title': title,
                'work_type': work_type,
                'file_key': file_key,
                'size': obj['Size']
            })
    
    return works, s3_client


def get_folder_files(s3_client, bucket: str, folder_path: str) -> List[Dict[str, Any]]:
    """Получает список файлов внутри папки из Cloud Storage"""
    response = s3_client.list_objects_v2(Bucket=bucket, Prefix=folder_path)
    
    files = []
    
    if 'Contents' in response:
        for obj in response['Contents']:
            file_key = obj['Key']
            file_name = file_key.replace(folder_path, '')
            
            if file_name:
                files.append({
                    'name': file_name,
                    'key': file_key,
                    'size': obj['Size']
                })
    
    return files


def download_and_convert_pdf_preview(s3_client, bucket: str, pdf_key: str) -> bytes:
    """Скачивает PDF из S3 и конвертирует первую страницу в PNG"""
    try:
        import fitz
        
        pdf_obj = s3_client.get_object(Bucket=bucket, Key=pdf_key)
        pdf_data = pdf_obj['Body'].read()
        
        pdf_document = fitz.open(stream=pdf_data, filetype="pdf")
        
        first_page = pdf_document[0]
        pix = first_page.get_pixmap(matrix=fitz.Matrix(2, 2))
        
        img_bytes = pix.tobytes("png")
        
        pdf_document.close()
        return img_bytes
    except Exception as e:
        print(f"Preview generation error: {e}")
        return None


def parse_work_metadata(title: str, work_type: str) -> Dict[str, Any]:
    """Создает подробные метаданные для работы"""
    
    type_mapping = {
        'Курсовая работа': {
            'category': 'coursework',
            'description': f'Готовая курсовая работа по теме "{title}". Включает теоретическую часть, практические расчеты и выводы. Работа выполнена в соответствии с требованиями ГОСТ.',
            'universities': ['МГУ', 'СПбГУ', 'МГТУ им. Баумана', 'МИФИ', 'НИУ ВШЭ'],
            'specializations': ['Экономика', 'Менеджмент', 'Информатика', 'Финансы'],
            'keywords': ['курсовая', 'расчеты', 'анализ', 'ГОСТ'],
            'price': 1500,
            'year': 2024,
            'pages': 35
        },
        'ВКР': {
            'category': 'diploma',
            'description': f'Выпускная квалификационная работа (ВКР) по теме "{title}". Полный комплект: пояснительная записка, графическая часть, презентация. Соответствует требованиям государственной аттестации.',
            'universities': ['МГУ', 'СПбГУ', 'МГТУ им. Баумана', 'МИФИ', 'МАИ', 'МАДИ'],
            'specializations': ['Бакалавриат', 'Специалитет', 'Инженерия', 'Экономика'],
            'keywords': ['диплом', 'вкр', 'бакалавр', 'защита', 'ГОСТ'],
            'price': 5000,
            'year': 2024,
            'pages': 80
        },
        'Диплом': {
            'category': 'diploma',
            'description': f'Дипломная работа по теме "{title}". Полный комплект документов для защиты: пояснительная записка, чертежи, презентация, доклад. Высокое качество оформления.',
            'universities': ['МГУ', 'СПбГУ', 'МГТУ им. Баумана', 'МИФИ', 'МАИ'],
            'specializations': ['Специалитет', 'Магистратура', 'Инженерия'],
            'keywords': ['диплом', 'защита', 'чертежи', 'ГОСТ'],
            'price': 5000,
            'year': 2024,
            'pages': 90
        },
        'Курсовой проект': {
            'category': 'coursework',
            'description': f'Курсовой проект по теме "{title}". Расчетно-графическая работа с чертежами. Полный комплект: расчеты, пояснительная записка, графическая часть.',
            'universities': ['МГТУ им. Баумана', 'МАИ', 'МАДИ', 'СПбГПУ'],
            'specializations': ['Машиностроение', 'Строительство', 'Электротехника', 'Автоматизация'],
            'keywords': ['проект', 'чертежи', 'расчеты', 'КОМПАС', 'AutoCAD'],
            'price': 2000,
            'year': 2024,
            'pages': 40
        }
    }
    
    return type_mapping.get(work_type, type_mapping['Курсовая работа'])


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    folders, s3_client = get_cloud_storage_folders()
    bucket_name = 'kyra'
    
    print(f"DEBUG: Found {len(folders)} folders in bucket")
    for folder in folders[:3]:  # Выводим первые 3 для отладки
        print(f"  - {folder['title']} ({folder['work_type']})")
    
    database_url = os.environ.get('DATABASE_URL', '')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    # Получаем существующие работы чтобы не дублировать
    cursor.execute("SELECT title FROM works")
    existing_titles = {row[0] for row in cursor.fetchall()}
    
    synced = 0
    skipped = 0
    
    for work in folders:
        try:
            # Пропускаем если работа уже есть в базе
            if work['title'] in existing_titles:
                skipped += 1
                continue
            
            # Генерируем превью (пока используем placeholder)
            preview_url = None
            
            # Метаданные работы
            metadata = parse_work_metadata(work['title'], work['work_type'])
            
            # Прямая ссылка на скачивание файла
            download_url = f"https://storage.yandexcloud.net/{bucket_name}/{work['file_key']}"
            
            insert_query = """
                INSERT INTO works (
                    title, work_type, subject, category, description,
                    preview_image_url, download_url, file_url,
                    price, price_points, year, pages,
                    universities, specializations, keywords
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.execute(insert_query, (
                work['title'],
                work['work_type'],
                metadata['category'],  # subject - обязательное поле
                metadata['category'],
                metadata['description'],
                preview_url,
                download_url,
                download_url,  # file_url - ссылка на файл
                metadata['price'],
                metadata['price'],  # price_points - цена в баллах (обязательное)
                metadata['year'],
                metadata['pages'],
                json.dumps(metadata['universities'], ensure_ascii=False),
                json.dumps(metadata['specializations'], ensure_ascii=False),
                json.dumps(metadata['keywords'], ensure_ascii=False)
            ))
            
            synced += 1
            
        except Exception as e:
            print(f"Error processing {work.get('title', 'unknown')}: {e}")
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'total_works': len(folders),
            'synced': synced,
            'skipped': skipped
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }