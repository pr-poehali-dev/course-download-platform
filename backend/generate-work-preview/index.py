import json
import os
import zipfile
import tempfile
from typing import Dict, Any, Optional
import requests
from docx import Document
import boto3
from PIL import Image, ImageDraw, ImageFont

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Генерация превью (скриншотов страниц "Содержание" и "Введение") из Word файлов в ZIP архиве работы
    Args: event - dict с httpMethod, queryStringParameters (work_id)
          context - объект с request_id
    Returns: HTTP response с URLs сгенерированных скриншотов
    '''
    
    if event.get('httpMethod') == 'OPTIONS':
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
    
    work_id = event.get('queryStringParameters', {}).get('work_id')
    
    if not work_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'work_id required'}),
            'isBase64Encoded': False
        }
    
    try:
        import psycopg2
        database_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Получаем информацию о работе
        cur.execute(
            "SELECT title, file_url FROM t_p63326274_course_download_plat.works WHERE id = %s",
            (work_id,)
        )
        
        result = cur.fetchone()
        
        if not result:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Work not found'}),
                'isBase64Encoded': False
            }
        
        title, file_url = result
        
        if not file_url:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'No file URL for this work'}),
                'isBase64Encoded': False
            }
        
        # Скачиваем ZIP архив
        print(f"Downloading ZIP from {file_url}")
        zip_response = requests.get(file_url, timeout=60)
        zip_response.raise_for_status()
        
        preview_urls = []
        
        # Обрабатываем ZIP архив
        with tempfile.TemporaryDirectory() as temp_dir:
            zip_path = os.path.join(temp_dir, 'work.zip')
            with open(zip_path, 'wb') as f:
                f.write(zip_response.content)
            
            # Распаковываем ZIP
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            # Ищем Word файлы
            docx_files = []
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    if file.endswith('.docx') and not file.startswith('~$'):
                        docx_files.append(os.path.join(root, file))
            
            if not docx_files:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'No Word files found in archive'}),
                    'isBase64Encoded': False
                }
            
            # Берем первый Word файл (обычно это ПЗ)
            docx_path = docx_files[0]
            print(f"Processing Word file: {docx_path}")
            
            # Создаем превью напрямую из DOCX
            preview_url = create_docx_preview_images(docx_path, work_id, temp_dir)
            if preview_url:
                preview_urls.append(preview_url)
        
        # Обновляем БД с первым скриншотом
        if preview_urls:
            cur.execute(
                "UPDATE t_p63326274_course_download_plat.works SET preview_image_url = %s WHERE id = %s",
                (preview_urls[0], work_id)
            )
            conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'preview_urls': preview_urls,
                'pages_found': len(preview_urls),
                'work_id': work_id
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"Error generating preview: {repr(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Failed to generate preview', 'details': str(e)}),
            'isBase64Encoded': False
        }


def create_docx_preview_images(docx_path: str, work_id: str, temp_dir: str) -> Optional[str]:
    """Создает превью изображения из DOCX с содержанием и введением"""
    try:
        doc = Document(docx_path)
        
        # Ищем разделы "Содержание" и "Введение"
        content_sections = []
        capture_next = 0
        
        for i, para in enumerate(doc.paragraphs):
            text = para.text.lower().strip()
            
            # Проверяем ключевые слова
            if any(keyword in text for keyword in ['содержание', 'оглавление', 'введение']):
                # Захватываем этот параграф и следующие 15
                for j in range(i, min(i + 15, len(doc.paragraphs))):
                    content_sections.append(doc.paragraphs[j].text)
                
                if len(content_sections) > 50:  # Достаточно текста
                    break
        
        if not content_sections:
            # Если не нашли, берем первые 20 параграфов
            content_sections = [p.text for p in doc.paragraphs[:20]]
        
        # Создаем изображение
        img_width = 800
        img_height = 1200
        img = Image.new('RGB', (img_width, img_height), color='white')
        draw = ImageDraw.Draw(img)
        
        # Используем Liberation Sans - хорошая поддержка кириллицы
        try:
            font = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 14)
            font_bold = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 16)
        except:
            try:
                # Fallback на DejaVu
                font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
                font_bold = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
            except:
                font = ImageFont.load_default()
                font_bold = ImageFont.load_default()
        
        y_position = 30
        x_margin = 40
        line_height = 25
        
        for line in content_sections:
            if y_position > img_height - 50:
                break
            
            # Разбиваем длинные строки
            if len(line) > 80:
                words = line.split()
                current_line = ""
                for word in words:
                    if len(current_line + word) < 80:
                        current_line += word + " "
                    else:
                        draw.text((x_margin, y_position), current_line.strip(), fill='black', font=font)
                        y_position += line_height
                        current_line = word + " "
                if current_line:
                    draw.text((x_margin, y_position), current_line.strip(), fill='black', font=font)
                    y_position += line_height
            else:
                draw.text((x_margin, y_position), line, fill='black', font=font)
                y_position += line_height
        
        # Добавляем водяной знак
        watermark_font = font_bold
        watermark_text = "ПРЕВЬЮ"
        draw.text((img_width - 120, img_height - 40), watermark_text, fill=(200, 200, 200), font=watermark_font)
        
        img_path = os.path.join(temp_dir, 'preview_content.png')
        img.save(img_path)
        
        return upload_to_s3(img_path, work_id, 0)
    except Exception as e:
        print(f"Error creating docx preview: {e}")
        import traceback
        traceback.print_exc()
        return None



def upload_to_s3(image_path: str, work_id: str, page_num: int) -> Optional[str]:
    """Загружает изображение в S3 и возвращает публичный URL"""
    try:
        s3_client = boto3.client(
            's3',
            endpoint_url='https://storage.yandexcloud.net',
            aws_access_key_id=os.environ.get('YANDEX_S3_KEY_ID'),
            aws_secret_access_key=os.environ.get('YANDEX_S3_SECRET_KEY'),
            region_name='ru-central1'
        )
        
        bucket_name = 'kyra'
        object_name = f'previews/work_{work_id}_page_{page_num}.png'
        
        s3_client.upload_file(
            image_path,
            bucket_name,
            object_name,
            ExtraArgs={'ACL': 'public-read', 'ContentType': 'image/png'}
        )
        
        return f'https://storage.yandexcloud.net/{bucket_name}/{object_name}'
    except Exception as e:
        print(f"Error uploading to S3: {e}")
        return None