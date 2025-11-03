import os
import sys
import psycopg2
import boto3
from botocore.config import Config
import zipfile
import io
from urllib.parse import urlparse

DATABASE_URL = os.environ.get('DATABASE_URL')
YANDEX_S3_KEY_ID = os.environ.get('YANDEX_S3_KEY_ID')
YANDEX_S3_SECRET_KEY = os.environ.get('YANDEX_S3_SECRET_KEY')

IMAGE_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')

def get_works_without_previews(limit=10):
    """Получает работы без превью"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT id, title, download_url 
        FROM works 
        WHERE preview_url IS NULL 
        AND download_url IS NOT NULL 
        AND download_url != ''
        LIMIT %s
    """, (limit,))
    
    works = cur.fetchall()
    cur.close()
    conn.close()
    
    return works

def download_from_s3(download_url):
    """Скачивает файл из S3"""
    parsed = urlparse(download_url)
    path_parts = parsed.path.lstrip('/').split('/', 1)
    
    if len(path_parts) != 2:
        raise ValueError(f"Invalid S3 URL format: {download_url}")
    
    bucket_name = path_parts[0]
    object_key = path_parts[1]
    
    s3_client = boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=YANDEX_S3_KEY_ID,
        aws_secret_access_key=YANDEX_S3_SECRET_KEY,
        config=Config(signature_version='s3v4'),
        region_name='ru-central1'
    )
    
    response = s3_client.get_object(Bucket=bucket_name, Key=object_key)
    return response['Body'].read()

def find_images_in_zip(zip_data):
    """Находит все изображения в ZIP архиве"""
    images = []
    
    try:
        with zipfile.ZipFile(io.BytesIO(zip_data)) as zf:
            for file_info in zf.filelist:
                filename = file_info.filename.lower()
                if any(filename.endswith(ext) for ext in IMAGE_EXTENSIONS):
                    images.append({
                        'path': file_info.filename,
                        'size': file_info.file_size,
                        'is_jpeg': filename.endswith(('.jpg', '.jpeg'))
                    })
    except Exception as e:
        print(f"  ❌ Ошибка при чтении ZIP: {e}")
    
    return images

def main():
    print("=" * 80)
    print("ПРОВЕРКА ИЗОБРАЖЕНИЙ В АРХИВАХ РАБОТ")
    print("=" * 80)
    print()
    
    if not all([DATABASE_URL, YANDEX_S3_KEY_ID, YANDEX_S3_SECRET_KEY]):
        print("❌ Ошибка: не заданы переменные окружения")
        print("Необходимо установить: DATABASE_URL, YANDEX_S3_KEY_ID, YANDEX_S3_SECRET_KEY")
        sys.exit(1)
    
    print("📊 Получаю список работ без превью...")
    works = get_works_without_previews(10)
    print(f"✓ Найдено работ: {len(works)}")
    print()
    
    results = []
    total_images = 0
    works_with_images = 0
    jpeg_count = 0
    
    for idx, (work_id, title, download_url) in enumerate(works, 1):
        print(f"[{idx}/{len(works)}] Работа #{work_id}: {title[:50]}...")
        
        try:
            print(f"  → Скачиваю архив...")
            zip_data = download_from_s3(download_url)
            print(f"  ✓ Скачано {len(zip_data)} байт")
            
            print(f"  → Ищу изображения...")
            images = find_images_in_zip(zip_data)
            
            if images:
                works_with_images += 1
                total_images += len(images)
                has_jpeg = any(img['is_jpeg'] for img in images)
                if has_jpeg:
                    jpeg_count += 1
                
                print(f"  ✓ Найдено изображений: {len(images)} {'🟡 ЕСТЬ JPEG!' if has_jpeg else ''}")
                for img in images:
                    marker = "📸 JPEG" if img['is_jpeg'] else "🖼️"
                    print(f"    {marker} {img['path']} ({img['size']} байт)")
            else:
                print(f"  ⚠️ Изображений не найдено")
            
            results.append({
                'id': work_id,
                'title': title,
                'images': images,
                'has_jpeg': any(img['is_jpeg'] for img in images) if images else False
            })
            
        except Exception as e:
            print(f"  ❌ Ошибка: {e}")
            results.append({
                'id': work_id,
                'title': title,
                'images': [],
                'error': str(e)
            })
        
        print()
    
    print("=" * 80)
    print("ИТОГОВАЯ ТАБЛИЦА")
    print("=" * 80)
    print(f"{'ID':<8} {'Название':<40} {'Картинок':<10} {'JPEG'}")
    print("-" * 80)
    
    for result in results:
        title = result['title'][:38]
        img_count = len(result['images'])
        has_jpeg = '✓' if result.get('has_jpeg') else ''
        error = '❌' if result.get('error') else ''
        
        print(f"{result['id']:<8} {title:<40} {img_count:<10} {has_jpeg} {error}")
    
    print("-" * 80)
    print(f"Всего работ проверено: {len(works)}")
    print(f"Работ с изображениями: {works_with_images}")
    print(f"Всего найдено изображений: {total_images}")
    print(f"Работ с JPEG файлами: {jpeg_count}")
    print()

if __name__ == '__main__':
    main()
