#!/usr/bin/env python3
"""
Тестирование системы покупок
Проверяет, что баллы правильно списываются при покупке работы
"""

import requests
import json
from typing import Dict, Any


PURCHASE_URL = "https://functions.poehali.dev/7f219e70-5e9f-44d1-9011-e6246d4274a9"
DB_QUERY_URL = "https://functions.poehali.dev/c605690e-3ba9-40eb-86cd-4c470a0b3387"


def print_header(text: str):
    print(f"\n{'='*70}")
    print(f"{text}")
    print(f"{'='*70}\n")


def print_success(text: str):
    print(f"✅ {text}")


def print_fail(text: str):
    print(f"❌ {text}")


def print_info(text: str):
    print(f"ℹ️  {text}")


def get_user_balance(user_id: int) -> Dict[str, Any]:
    """Получить баланс пользователя через API"""
    try:
        response = requests.get(
            f"{DB_QUERY_URL}?userId={user_id}",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return {
                'success': True,
                'balance': data.get('balance', 0),
                'username': data.get('username', 'unknown')
            }
        else:
            return {'success': False, 'error': f'HTTP {response.status_code}'}
            
    except Exception as e:
        return {'success': False, 'error': str(e)}


def test_purchase(user_id: int, work_id: int, expected_price: int) -> Dict[str, Any]:
    """Тестирование покупки работы"""
    
    print_header(f"🛒 ТЕСТ ПОКУПКИ РАБОТЫ (User ID: {user_id}, Work ID: {work_id})")
    
    # 1. Получаем начальный баланс
    print_info("1️⃣ Получаю начальный баланс...")
    balance_before = get_user_balance(user_id)
    
    if not balance_before['success']:
        print_fail(f"Не удалось получить баланс: {balance_before.get('error')}")
        return {'success': False, 'error': 'Failed to get initial balance'}
    
    initial_balance = balance_before['balance']
    username = balance_before['username']
    print_success(f"Начальный баланс {username}: {initial_balance} баллов")
    
    # 2. Проверяем достаточность баланса
    if initial_balance < expected_price:
        print_fail(f"Недостаточно баллов! Нужно {expected_price}, есть {initial_balance}")
        return {'success': False, 'error': 'Insufficient balance'}
    
    # 3. Выполняем покупку
    print_info(f"2️⃣ Покупаю работу #{work_id} за {expected_price} баллов...")
    
    try:
        response = requests.post(
            PURCHASE_URL,
            json={
                'userId': user_id,
                'workId': work_id,
                'price': expected_price
            },
            headers={'Content-Type': 'application/json'},
            timeout=15
        )
        
        print_info(f"HTTP Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print_success("Покупка выполнена!")
            print_info(f"Ответ сервера: {json.dumps(result, ensure_ascii=False, indent=2)}")
        elif response.status_code == 400:
            error_data = response.json()
            if 'Work already purchased' in str(error_data):
                print_info("⚠️  Работа уже куплена ранее (это нормально для повторного теста)")
            else:
                print_fail(f"Ошибка покупки: {error_data}")
                return {'success': False, 'error': error_data}
        else:
            print_fail(f"HTTP {response.status_code}: {response.text}")
            return {'success': False, 'error': f'HTTP {response.status_code}'}
            
    except Exception as e:
        print_fail(f"Ошибка при покупке: {e}")
        return {'success': False, 'error': str(e)}
    
    # 4. Проверяем баланс после покупки
    print_info("3️⃣ Проверяю баланс после покупки...")
    
    import time
    time.sleep(1)  # Даем время на обработку транзакции
    
    balance_after = get_user_balance(user_id)
    
    if not balance_after['success']:
        print_fail(f"Не удалось получить баланс после покупки: {balance_after.get('error')}")
        return {'success': False, 'error': 'Failed to get final balance'}
    
    final_balance = balance_after['balance']
    print_success(f"Баланс после покупки: {final_balance} баллов")
    
    # 5. Вычисляем списанную сумму
    deducted = initial_balance - final_balance
    print_info(f"Списано баллов: {deducted}")
    
    # 6. Проверяем корректность списания
    if deducted == 0:
        print_fail("🚨 ПРОБЛЕМА: Баллы НЕ СПИСАЛИСЬ!")
        return {
            'success': False,
            'error': 'Balance not deducted',
            'initial_balance': initial_balance,
            'final_balance': final_balance,
            'expected_deduction': expected_price,
            'actual_deduction': 0
        }
    elif deducted == expected_price:
        print_success(f"✅ Списание корректное: {deducted} баллов")
        return {
            'success': True,
            'initial_balance': initial_balance,
            'final_balance': final_balance,
            'deducted': deducted
        }
    else:
        print_fail(f"⚠️  Неожиданная сумма списания: ожидалось {expected_price}, списано {deducted}")
        return {
            'success': False,
            'error': 'Incorrect deduction amount',
            'initial_balance': initial_balance,
            'final_balance': final_balance,
            'expected_deduction': expected_price,
            'actual_deduction': deducted
        }


def main():
    """Главная функция"""
    print_header("🧪 ТЕСТИРОВАНИЕ СИСТЕМЫ ПОКУПОК")
    
    # Тестовые данные
    test_cases = [
        {
            'user_id': 1000023,  # test_buyer
            'work_id': 4371,     # "Эксплуатация судовых энергетических установок"
            'expected_price': 600
        },
        {
            'user_id': 1000021,  # maximus
            'work_id': 4372,     # "[УДАЛЕНО] Техническая запись"
            'expected_price': 200
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'#'*70}")
        print(f"# ТЕСТ {i}/{len(test_cases)}")
        print(f"{'#'*70}")
        
        result = test_purchase(
            user_id=test_case['user_id'],
            work_id=test_case['work_id'],
            expected_price=test_case['expected_price']
        )
        
        results.append({
            'test_case': test_case,
            'result': result
        })
    
    # Итоговая сводка
    print_header("📊 ИТОГОВАЯ СВОДКА")
    
    passed = sum(1 for r in results if r['result'].get('success'))
    failed = len(results) - passed
    
    print(f"Всего тестов: {len(results)}")
    print(f"Пройдено: {passed}")
    print(f"Провалено: {failed}")
    print()
    
    if failed == 0:
        print_success("🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!")
        print_info("Система покупок работает корректно.")
    else:
        print_fail(f"🚨 {failed} тест(а/ов) провалено!")
        print_info("Требуется исправление.")
        
        for i, r in enumerate(results, 1):
            if not r['result'].get('success'):
                print(f"\nТест {i}:")
                print(f"  User ID: {r['test_case']['user_id']}")
                print(f"  Work ID: {r['test_case']['work_id']}")
                print(f"  Ошибка: {r['result'].get('error')}")
    
    print()


if __name__ == "__main__":
    main()
