#!/usr/bin/env python3
"""
Скрипт для массовой конвертации RAR → ZIP в Yandex Object Storage
Запускается ЛОКАЛЬНО на вашем компьютере один раз.

Требования:
- Python 3.8+
- Установленный unrar (brew install unrar или apt-get install unrar)
- pip install boto3 rarfile psycopg2-binary tqdm

Использование:
1. Заполните секреты ниже (DATABASE_URL, YANDEX_S3_KEY_ID, YANDEX_S3_SECRET_KEY)
2. Запустите: python3 convert_rar_to_zip_local.py
3. Ждите завершения (~20-30 минут для 485 файлов)
"""

import os
import sys
import boto3
from botocore.config import Config
import rarfile
import zipfile
import io
import tempfile
import psycopg2
from tqdm import tqdm

# ============================================
# НАСТРОЙКИ - ЗАПОЛНИТЕ СВОИ ДАННЫЕ
# ============================================

YANDEX_S3_KEY_ID = "YOUR_KEY_ID_HERE"  # Получить в Yandex Cloud Console
YANDEX_S3_SECRET_KEY = "YOUR_SECRET_KEY_HERE"  # Получить в Yandex Cloud Console
DATABASE_URL = "postgresql://user:password@host:port/database"  # Подключение к БД

BUCKET_NAME = "kyra"

# ============================================


def get_s3_client():
    """Создаёт S3 клиента для Yandex Object Storage"""
    return boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=YANDEX_S3_KEY_ID,
        aws_secret_access_key=YANDEX_S3_SECRET_KEY,
        region_name='ru-central1',
        config=Config(signature_version='s3v4')
    )


def convert_rar_to_zip(s3_client, bucket_name, rar_key):
    """
    Конвертирует один RAR файл в ZIP
    Returns: (success, new_url, error_message)
    """
    try:
        print(f"  ↓ Скачиваю RAR: {rar_key[:60]}...")
        response = s3_client.get_object(Bucket=bucket_name, Key=rar_key)
        rar_data = response['Body'].read()
        
        # Создаём временный файл для RAR
        with tempfile.NamedTemporaryFile(suffix='.rar', delete=False) as temp_rar:
            temp_rar.write(rar_data)
            temp_rar_path = temp_rar.name
        
        try:
            print(f"  🔄 Конвертирую в ZIP...")
            zip_buffer = io.BytesIO()
            
            # Извлекаем RAR и создаём ZIP
            with rarfile.RarFile(temp_rar_path, 'r') as rf:
                with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
                    for file_info in rf.infolist():
                        if not file_info.isdir():
                            file_data = rf.read(file_info.filename)
                            zf.writestr(file_info.filename, file_data)
            
            # Новый ключ ZIP (заменяем .rar на .zip)
            zip_key = rar_key[:-4] + '.zip'
            
            print(f"  ↑ Загружаю ZIP в S3...")
            zip_buffer.seek(0)
            s3_client.put_object(
                Bucket=bucket_name,
                Key=zip_key,
                Body=zip_buffer.getvalue(),
                ContentType='application/zip',
                ACL='public-read'
            )
            
            new_url = f'https://storage.yandexcloud.net/{bucket_name}/{zip_key}'
            
            # Удаляем старый RAR
            print(f"  🗑️  Удаляю старый RAR...")
            s3_client.delete_object(Bucket=bucket_name, Key=rar_key)
            
            return True, new_url, None
            
        finally:
            # Удаляем временный файл
            if os.path.exists(temp_rar_path):
                os.unlink(temp_rar_path)
                
    except Exception as e:
        return False, None, str(e)


def main():
    print("=" * 70)
    print("🚀 Конвертация RAR → ZIP для Yandex Object Storage")
    print("=" * 70)
    print()
    
    # Проверка настроек
    if "YOUR_KEY_ID_HERE" in YANDEX_S3_KEY_ID:
        print("❌ ОШИБКА: Заполните YANDEX_S3_KEY_ID в скрипте!")
        sys.exit(1)
    
    if "YOUR_SECRET_KEY_HERE" in YANDEX_S3_SECRET_KEY:
        print("❌ ОШИБКА: Заполните YANDEX_S3_SECRET_KEY в скрипте!")
        sys.exit(1)
    
    if "postgresql://user:password" in DATABASE_URL:
        print("❌ ОШИБКА: Заполните DATABASE_URL в скрипте!")
        sys.exit(1)
    
    # Проверка unrar
    try:
        rarfile.tool_setup()
    except Exception:
        print("❌ ОШИБКА: Не установлен unrar!")
        print("   macOS: brew install unrar")
        print("   Ubuntu: sudo apt-get install unrar")
        print("   Windows: Скачайте с https://www.rarlab.com/")
        sys.exit(1)
    
    print("✅ Настройки проверены")
    print()
    
    # Подключение к БД
    print("📊 Подключаюсь к базе данных...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
    except Exception as e:
        print(f"❌ ОШИБКА подключения к БД: {e}")
        sys.exit(1)
    
    # Получаем список RAR файлов
    print("🔍 Ищу RAR файлы в базе...")
    cursor.execute("""
        SELECT id, title, download_url 
        FROM works 
        WHERE download_url LIKE '%.rar'
        ORDER BY id
    """)
    
    works = cursor.fetchall()
    total_count = len(works)
    
    if total_count == 0:
        print("✅ Нет RAR файлов для конвертации!")
        cursor.close()
        conn.close()
        return
    
    print(f"📦 Найдено RAR файлов: {total_count}")
    print()
    
    # Подтверждение
    response = input(f"❓ Конвертировать {total_count} файлов? (yes/no): ")
    if response.lower() not in ['yes', 'y', 'да']:
        print("❌ Отменено пользователем")
        sys.exit(0)
    
    print()
    print("🚀 Начинаю конвертацию...")
    print()
    
    # S3 клиент
    s3_client = get_s3_client()
    
    # Статистика
    success_count = 0
    error_count = 0
    errors = []
    
    # Прогресс-бар
    with tqdm(total=total_count, desc="Конвертация", unit="файл") as pbar:
        for work_id, title, download_url in works:
            file_key = download_url.replace(f'https://storage.yandexcloud.net/{BUCKET_NAME}/', '')
            
            pbar.set_description(f"Work {work_id}: {title[:30]}")
            
            # Конвертируем
            success, new_url, error_msg = convert_rar_to_zip(s3_client, BUCKET_NAME, file_key)
            
            if success:
                # Обновляем БД
                safe_url = new_url.replace("'", "''")
                cursor.execute(f"""
                    UPDATE works 
                    SET download_url = '{safe_url}', file_url = '{safe_url}'
                    WHERE id = {work_id}
                """)
                conn.commit()
                
                success_count += 1
                pbar.write(f"  ✅ Work {work_id}: успешно → {new_url}")
            else:
                error_count += 1
                error_msg_short = error_msg[:100] if error_msg else "Unknown error"
                errors.append(f"Work {work_id}: {error_msg_short}")
                pbar.write(f"  ❌ Work {work_id}: ОШИБКА - {error_msg_short}")
            
            pbar.update(1)
    
    cursor.close()
    conn.close()
    
    # Итоги
    print()
    print("=" * 70)
    print("📊 РЕЗУЛЬТАТЫ КОНВЕРТАЦИИ")
    print("=" * 70)
    print(f"✅ Успешно:     {success_count}/{total_count}")
    print(f"❌ Ошибок:      {error_count}/{total_count}")
    print(f"📈 Успешность:  {(success_count/total_count*100):.1f}%")
    print()
    
    if errors:
        print("❌ ОШИБКИ (первые 10):")
        for err in errors[:10]:
            print(f"   • {err}")
        print()
    
    if success_count > 0:
        print("🎉 Конвертация завершена!")
        print()
        print("📝 СЛЕДУЮЩИЙ ШАГ:")
        print("   Откройте /extract-previews на сайте и запустите")
        print("   'Извлечение превью' для создания превью всех работ.")
    
    print()
    print("=" * 70)


if __name__ == "__main__":
    main()
