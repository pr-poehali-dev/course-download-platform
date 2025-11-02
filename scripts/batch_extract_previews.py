#!/usr/bin/env python3
"""
Скрипт для массового извлечения изображений из архивов всех работ
"""

import os
import sys
import time
import requests
import psycopg2

FUNCTION_URL = 'https://functions.poehali.dev/29bd33fc-96f3-4da2-af7c-ce84a7103573'
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print('❌ DATABASE_URL не найден в переменных окружения')
    sys.exit(1)


def get_works_without_preview(limit=50, offset=0):
    """Получить работы без превью из БД"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT id, title, download_url, file_url
            FROM t_p63326274_course_download_plat.works
            WHERE title NOT LIKE '[УДАЛЕНО]%%'
              AND (download_url IS NOT NULL OR file_url IS NOT NULL)
              AND preview_image_url IS NULL
            ORDER BY id DESC
            LIMIT %s OFFSET %s
        """, (limit, offset))
        
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()


def extract_preview_for_work(work_id):
    """Вызвать функцию извлечения превью для одной работы"""
    try:
        response = requests.post(
            FUNCTION_URL,
            json={
                'work_id': work_id,
                'extract_from_archive': True
            },
            timeout=120
        )
        
        return response.json()
    except Exception as e:
        return {'success': False, 'error': str(e)}


def main():
    print('🚀 Начинаю массовое извлечение изображений из архивов...\n')
    
    stats = {
        'total': 0,
        'successful': 0,
        'no_images': 0,
        'failed': 0,
        'errors': []
    }
    
    offset = 0
    batch_size = 50
    
    while True:
        print(f'\n📦 Загрузка партии работ (offset={offset})...')
        works = get_works_without_preview(batch_size, offset)
        
        if not works:
            break
        
        print(f'📋 Найдено {len(works)} работ для обработки\n')
        
        for work in works:
            work_id, title, download_url, file_url = work
            stats['total'] += 1
            
            print(f'[{stats["total"]}] Обработка: {title[:60]}...')
            print(f'    ID: {work_id}')
            
            result = extract_preview_for_work(work_id)
            
            if result.get('success'):
                count = result.get('count', 0)
                if count > 0:
                    stats['successful'] += 1
                    print(f'    ✅ Извлечено {count} изображений')
                else:
                    stats['no_images'] += 1
                    print(f'    ⚠️  PNG не найдено в архиве')
            else:
                stats['failed'] += 1
                error_msg = result.get('error') or result.get('message', 'Unknown error')
                print(f'    ❌ Ошибка: {error_msg}')
                stats['errors'].append({
                    'work_id': work_id,
                    'title': title,
                    'error': error_msg
                })
            
            # Пауза между запросами
            time.sleep(2)
        
        offset += batch_size
        
        # Промежуточная статистика
        print('\n' + '='*60)
        print('📊 ПРОМЕЖУТОЧНАЯ СТАТИСТИКА:')
        print(f'   Всего обработано: {stats["total"]}')
        print(f'   ✅ Успешно: {stats["successful"]}')
        print(f'   ⚠️  Без изображений: {stats["no_images"]}')
        print(f'   ❌ Ошибки: {stats["failed"]}')
        print('='*60 + '\n')
    
    # Финальная статистика
    print('\n' + '='*60)
    print('🎉 ОБРАБОТКА ЗАВЕРШЕНА!')
    print('='*60)
    print('📊 ИТОГОВАЯ СТАТИСТИКА:')
    print(f'   Всего обработано: {stats["total"]}')
    print(f'   ✅ Успешно: {stats["successful"]} ({stats["successful"]/stats["total"]*100:.1f}%)')
    print(f'   ⚠️  Без изображений: {stats["no_images"]} ({stats["no_images"]/stats["total"]*100:.1f}%)')
    print(f'   ❌ Ошибки: {stats["failed"]} ({stats["failed"]/stats["total"]*100:.1f}%)')
    
    if stats['errors']:
        print('\n📝 Список ошибок:')
        for idx, err in enumerate(stats['errors'][:10], 1):
            print(f'   {idx}. Work #{err["work_id"]}: {err["error"]}')
        if len(stats['errors']) > 10:
            print(f'   ... и ещё {len(stats["errors"]) - 10} ошибок')
    
    print('='*60)


if __name__ == '__main__':
    main()
