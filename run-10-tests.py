#!/usr/bin/env python3
"""
Запускает 10 тестов оплаты и показывает результаты
"""

import json
import urllib.request
import time
from datetime import datetime

API_URL = 'https://functions.poehali.dev/4b9b82b8-34d8-43e7-a9ac-c3cb0bd67fb1'

def run_test(test_num):
    """Запускает один тест"""
    print(f"\n{'='*60}")
    print(f"ТЕСТ #{test_num} - {datetime.now().strftime('%H:%M:%S')}")
    print('='*60)
    
    request_data = {
        'action': 'init_payment',
        'user_id': 1000015,
        'package_id': '100',
        'success_url': 'https://techforma.pro/payment/success',
        'fail_url': 'https://techforma.pro/payment/failed'
    }
    
    print(f"Отправляю запрос...")
    
    try:
        req = urllib.request.Request(
            API_URL,
            data=json.dumps(request_data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        if result.get('payment_url'):
            print(f"✅ УСПЕХ!")
            print(f"Payment URL: {result['payment_url']}")
            return True
        else:
            print(f"❌ ОШИБКА")
            print(f"Error: {result.get('error', 'Unknown')}")
            print(f"Details: {result.get('details', 'N/A')}")
            print(f"Error Code: {result.get('error_code', 'N/A')}")
            return False
            
    except Exception as e:
        print(f"❌ КРИТИЧЕСКАЯ ОШИБКА: {e}")
        return False

def main():
    print("="*60)
    print("ЗАПУСК СЕРИИ ИЗ 10 ТЕСТОВ ПЛАТЕЖНОЙ СИСТЕМЫ")
    print("="*60)
    
    results = []
    
    for i in range(1, 11):
        success = run_test(i)
        results.append(success)
        
        if i < 10:
            time.sleep(0.5)
    
    print(f"\n\n{'='*60}")
    print("ИТОГИ ТЕСТИРОВАНИЯ")
    print('='*60)
    
    total = len(results)
    successful = sum(results)
    failed = total - successful
    
    print(f"Всего тестов: {total}")
    print(f"✅ Успешно: {successful}")
    print(f"❌ Ошибок: {failed}")
    print(f"Процент успеха: {(successful/total)*100:.1f}%")
    
    print("\n" + "="*60)
    print("СЛЕДУЮЩИЙ ШАГ:")
    print("="*60)
    print("""
Теперь проверьте логи backend функции чтобы увидеть детали
генерации токена и запроса к Тинькофф API.

Команда для просмотра логов (если есть доступ):
get_logs(source='backend/payment', limit=200)
""")

if __name__ == '__main__':
    main()
