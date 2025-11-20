#!/usr/bin/env python3
"""
Тест генерации токена Тинькофф
Проверяет правильность алгоритма генерации токена
"""

import hashlib
import json

# Данные из секретов
TERMINAL_KEY = '1763583059270DEMO'
PASSWORD = 'Isvm4_ae1lIiD9RM'

def generate_token_v1(params, password):
    """Версия 1: Текущая реализация"""
    token_params = {}
    for key, value in params.items():
        if key not in ['Token', 'DATA', 'Receipt']:
            token_params[key] = str(value)
    
    token_params['Password'] = password
    sorted_keys = sorted(token_params.keys())
    values_list = [token_params[k] for k in sorted_keys]
    concatenated = ''.join(values_list)
    token_hash = hashlib.sha256(concatenated.encode('utf-8')).hexdigest()
    
    print(f"[V1] Sorted keys: {sorted_keys}")
    print(f"[V1] Values: {values_list}")
    print(f"[V1] Concatenated: {concatenated}")
    print(f"[V1] Token: {token_hash}")
    
    return token_hash

# Тестовые данные
test_params = {
    'TerminalKey': TERMINAL_KEY,
    'Amount': 100000,
    'OrderId': 'test_order_123'
}

print("="*60)
print("ТЕСТ ГЕНЕРАЦИИ ТОКЕНА ТИНЬКОФФ")
print("="*60)
print(f"\nTerminal: {TERMINAL_KEY}")
print(f"Password: {PASSWORD}")
print(f"Password length: {len(PASSWORD)}")
print(f"\nТестовые параметры:")
print(json.dumps(test_params, indent=2, ensure_ascii=False))
print()

print("="*60)
print("ГЕНЕРАЦИЯ ТОКЕНА")
print("="*60)
token = generate_token_v1(test_params, PASSWORD)

print("\n" + "="*60)
print("ИТОГОВЫЙ ТОКЕН")
print("="*60)
print(token)

print("\n" + "="*60)
print("ПРОВЕРКА С РАЗНЫМИ AMOUNTS")
print("="*60)

for amount in [25000, 50000, 100000, 200000]:
    test_params_copy = test_params.copy()
    test_params_copy['Amount'] = amount
    test_params_copy['OrderId'] = f'order_test_{amount}'
    
    print(f"\nAmount: {amount} копеек")
    token = generate_token_v1(test_params_copy, PASSWORD)
    print()

print("="*60)
print("АЛЬТЕРНАТИВНАЯ ПРОВЕРКА: Demo Password")
print("="*60)
print("\nПопробуем стандартный demo пароль: wvchd3k3ju9vms5e")
demo_password = 'wvchd3k3ju9vms5e'
token_demo = generate_token_v1(test_params, demo_password)
print()

print("="*60)
print("РЕКОМЕНДАЦИИ")
print("="*60)
print("""
1. Проверьте в личном кабинете Тинькофф:
   - Есть ли поле "Секретный ключ" (Secret Key)?
   - Это должно быть отдельно от поля "Пароль"
   
2. Для DEMO терминала обычно используется пароль: wvchd3k3ju9vms5e

3. Если ошибка 204 сохраняется:
   - Убедитесь что терминал активирован
   - Проверьте что используете правильный API endpoint
   - Свяжитесь с поддержкой Тинькофф для уточнения credentials
""")
