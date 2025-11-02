#!/usr/bin/env python3
"""
Скрипт для массовой конвертации RAR архивов в ZIP
Скачивает RAR из Yandex Object Storage, конвертирует в ZIP, загружает обратно
"""

import os
import sys
import boto3
from botocore.config import Config
import rarfile
import zipfile
import io
from pathlib import Path
import psycopg2
from tqdm import tqdm

# ============================================
# НАСТРОЙКИ - ЗАПОЛНИ СВОИ ДАННЫЕ
# ============================================

YANDEX_S3_KEY_ID = "YOUR_KEY_ID_HERE"
YANDEX_S3_SECRET_KEY = "YOUR_SECRET_KEY_HERE"
DATABASE_URL = "YOUR_DATABASE_URL_HERE"

# ============================================

def get_s3_client():
    """Создает S3 клиента для Yandex Object Storage"""
    return boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=YANDEX_S3_KEY_ID,
        aws_secret_access_key=YANDEX_S3_SECRET_KEY,
        region_name='ru-central1',
        config=Config(signature_version='s3v4')
    )


def convert_rar_to_zip(rar_data: bytes) -> bytes:
    """Конвертирует RAR архив в ZIP"""
    rar_file = rarfile.RarFile(io.BytesIO(rar_data))
    
    zip_buffer = io.BytesIO()
    zip_file = zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED)
    
    for member in rar_file.infolist():
        if not member.isdir():
            data = rar_file.read(member)
            zip_file.writestr(member.filename, data)
    
    zip_file.close()
    zip_buffer.seek(0)
    
    return zip_buffer.getvalue()


def main():
    """Основная функция"""
    
    # Проверка настроек
    if YANDEX_S3_KEY_ID == "YOUR_KEY_ID_HERE":
        print("❌ Ошибка: Заполни настройки в начале скрипта!")
        print("   - YANDEX_S3_KEY_ID")
        print("   - YANDEX_S3_SECRET_KEY")
        print("   - DATABASE_URL")
        sys.exit(1)
    
    print("🚀 Запуск конвертации RAR → ZIP")
    print("=" * 60)
    
    # Подключение к S3 и БД
    s3_client = get_s3_client()
    bucket_name = 'kyra'
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Получаем список всех RAR файлов
    cursor.execute("""
        SELECT id, title, download_url 
        FROM works 
        WHERE download_url LIKE '%.rar'
        AND preview_image_url IS NULL
        ORDER BY id
    """)
    
    works = cursor.fetchall()
    total_works = len(works)
    
    print(f"📦 Найдено RAR архивов: {total_works}")
    print()
    
    if total_works == 0:
        print("✅ Нет файлов для конвертации!")
        return
    
    # Подтверждение
    answer = input(f"⚠️  Конвертировать {total_works} файлов? (yes/no): ").lower()
    if answer not in ['yes', 'y', 'да', 'д']:
        print("❌ Отменено пользователем")
        return
    
    print()
    print("🔄 Начинаю конвертацию...")
    print()
    
    converted = 0
    errors = []
    
    # Обработка с прогресс-баром
    for work_id, title, download_url in tqdm(works, desc="Конвертация", unit="файл"):
        try:
            file_key = download_url.replace('https://storage.yandexcloud.net/kyra/', '')
            
            # Скачиваем RAR
            response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
            rar_data = response['Body'].read()
            
            # Конвертируем в ZIP
            zip_data = convert_rar_to_zip(rar_data)
            
            # Новое имя файла
            new_key = file_key.replace('.rar', '.zip')
            
            # Загружаем ZIP
            s3_client.put_object(
                Bucket=bucket_name,
                Key=new_key,
                Body=zip_data,
                ContentType='application/zip',
                ACL='public-read'
            )
            
            # Обновляем URL в БД
            new_url = f'https://storage.yandexcloud.net/{bucket_name}/{new_key}'
            safe_url = new_url.replace("'", "''")
            cursor.execute(
                f"UPDATE works SET download_url = '{safe_url}' WHERE id = {work_id}"
            )
            conn.commit()
            
            converted += 1
            
        except Exception as e:
            error_msg = f"Work {work_id} ({title[:50]}): {str(e)}"
            errors.append(error_msg)
            tqdm.write(f"❌ {error_msg}")
            continue
    
    cursor.close()
    conn.close()
    
    # Итоговый отчёт
    print()
    print("=" * 60)
    print("📊 ИТОГИ КОНВЕРТАЦИИ")
    print("=" * 60)
    print(f"✅ Успешно конвертировано: {converted} из {total_works}")
    print(f"❌ Ошибок: {len(errors)}")
    
    if errors:
        print()
        print("🔍 Первые 10 ошибок:")
        for err in errors[:10]:
            print(f"   - {err}")
    
    print()
    print("🎉 Готово! Теперь запусти извлечение превью на /extract-previews")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Прервано пользователем")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Критическая ошибка: {e}")
        sys.exit(1)
