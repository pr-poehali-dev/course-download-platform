#!/usr/bin/env python3
"""
Упрощённый скрипт для пакетной конвертации RAR → ZIP
Обрабатывает файлы небольшими пакетами (безопаснее для больших объёмов)
"""

import os
import sys
import boto3
from botocore.config import Config
import rarfile
import zipfile
import io
import psycopg2
from tqdm import tqdm
import time

# ============================================
# НАСТРОЙКИ
# ============================================

YANDEX_S3_KEY_ID = "YOUR_KEY_ID_HERE"
YANDEX_S3_SECRET_KEY = "YOUR_SECRET_KEY_HERE"
DATABASE_URL = "YOUR_DATABASE_URL_HERE"

BATCH_SIZE = 50  # Обрабатывать по 50 файлов за раз
DELAY_BETWEEN_FILES = 0.1  # Задержка между файлами (секунды)

# ============================================

def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=YANDEX_S3_KEY_ID,
        aws_secret_access_key=YANDEX_S3_SECRET_KEY,
        region_name='ru-central1',
        config=Config(signature_version='s3v4')
    )


def convert_rar_to_zip(rar_data: bytes) -> bytes:
    """Конвертирует RAR в ZIP"""
    rar_file = rarfile.RarFile(io.BytesIO(rar_data))
    
    zip_buffer = io.BytesIO()
    zip_file = zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED, compresslevel=6)
    
    file_count = 0
    for member in rar_file.infolist():
        if not member.isdir() and not member.filename.startswith('__MACOSX'):
            data = rar_file.read(member)
            zip_file.writestr(member.filename, data)
            file_count += 1
    
    zip_file.close()
    zip_buffer.seek(0)
    
    return zip_buffer.getvalue(), file_count


def process_batch(works, s3_client, bucket_name, conn):
    """Обрабатывает один пакет файлов"""
    cursor = conn.cursor()
    converted = 0
    errors = []
    
    for work_id, title, download_url in tqdm(works, desc="Пакет", leave=False):
        try:
            file_key = download_url.replace('https://storage.yandexcloud.net/kyra/', '')
            
            # Скачиваем RAR
            response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
            rar_data = response['Body'].read()
            
            # Конвертируем
            zip_data, file_count = convert_rar_to_zip(rar_data)
            
            # Новое имя
            new_key = file_key.replace('.rar', '.zip')
            
            # Загружаем ZIP
            s3_client.put_object(
                Bucket=bucket_name,
                Key=new_key,
                Body=zip_data,
                ContentType='application/zip',
                ACL='public-read'
            )
            
            # Обновляем БД
            new_url = f'https://storage.yandexcloud.net/{bucket_name}/{new_key}'
            safe_url = new_url.replace("'", "''")
            cursor.execute(
                f"UPDATE works SET download_url = '{safe_url}' WHERE id = {work_id}"
            )
            conn.commit()
            
            converted += 1
            
            # Небольшая задержка
            time.sleep(DELAY_BETWEEN_FILES)
            
        except Exception as e:
            error_msg = f"Work {work_id}: {str(e)[:100]}"
            errors.append(error_msg)
            tqdm.write(f"❌ {error_msg}")
    
    cursor.close()
    return converted, errors


def main():
    if YANDEX_S3_KEY_ID == "YOUR_KEY_ID_HERE":
        print("❌ Заполни настройки в начале скрипта!")
        sys.exit(1)
    
    print("🚀 Пакетная конвертация RAR → ZIP")
    print(f"📦 Размер пакета: {BATCH_SIZE} файлов")
    print("=" * 60)
    
    s3_client = get_s3_client()
    bucket_name = 'kyra'
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Считаем всего
    cursor.execute("""
        SELECT COUNT(*) 
        FROM works 
        WHERE download_url LIKE '%.rar'
        AND preview_image_url IS NULL
    """)
    total_count = cursor.fetchone()[0]
    
    print(f"📊 Всего RAR файлов: {total_count}")
    print(f"📦 Будет обработано {(total_count + BATCH_SIZE - 1) // BATCH_SIZE} пакетов")
    print()
    
    answer = input("Начать конвертацию? (yes/no): ").lower()
    if answer not in ['yes', 'y']:
        print("❌ Отменено")
        return
    
    print("\n🔄 Начинаю обработку пакетами...\n")
    
    total_converted = 0
    all_errors = []
    offset = 0
    batch_num = 1
    
    while offset < total_count:
        # Получаем следующий пакет
        cursor.execute(f"""
            SELECT id, title, download_url 
            FROM works 
            WHERE download_url LIKE '%.rar'
            AND preview_image_url IS NULL
            ORDER BY id
            LIMIT {BATCH_SIZE} OFFSET {offset}
        """)
        
        works = cursor.fetchall()
        if not works:
            break
        
        print(f"\n📦 Пакет {batch_num} ({offset + 1}-{offset + len(works)} из {total_count})")
        
        converted, errors = process_batch(works, s3_client, bucket_name, conn)
        
        total_converted += converted
        all_errors.extend(errors)
        
        print(f"✅ Пакет {batch_num}: конвертировано {converted}/{len(works)}")
        
        offset += BATCH_SIZE
        batch_num += 1
        
        # Пауза между пакетами
        if offset < total_count:
            time.sleep(1)
    
    cursor.close()
    conn.close()
    
    # Итоги
    print("\n" + "=" * 60)
    print("📊 ИТОГОВАЯ СТАТИСТИКА")
    print("=" * 60)
    print(f"✅ Успешно: {total_converted} из {total_count}")
    print(f"❌ Ошибок: {len(all_errors)}")
    print(f"📈 Успешность: {(total_converted/total_count*100):.1f}%")
    
    if all_errors:
        print(f"\n🔍 Первые 10 ошибок:")
        for err in all_errors[:10]:
            print(f"   {err}")
    
    print("\n🎉 Готово! Запусти /extract-previews для создания превью")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Прервано. Можно безопасно перезапустить - обработанные файлы будут пропущены")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
