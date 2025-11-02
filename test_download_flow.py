#!/usr/bin/env python3
"""
Полный тест функционала скачивания работ для админа и обычного пользователя
"""
import requests
import json
import sys

# URLs функций
PURCHASE_URL = "https://functions.poehali.dev/7f219e70-5e9f-44d1-9011-e6246d4274a9"
DOWNLOAD_URL = "https://functions.poehali.dev/5898b2f2-c4d9-4ff7-bd15-9600829fed08"

# Тестовые данные
ADMIN_USER_ID = 999999  # Админ
REGULAR_USER_ID = 2     # Обычный пользователь (баланс 5000)
WORK_ID = 4431          # Работа за 500 баллов
WORK_PRICE = 500

def print_header(text):
    print("\n" + "="*80)
    print(f"  {text}")
    print("="*80)

def print_step(step_num, text):
    print(f"\n[ШАГ {step_num}] {text}")

def print_success(text):
    print(f"✅ {text}")

def print_error(text):
    print(f"❌ {text}")

def print_info(text):
    print(f"ℹ️  {text}")

def test_admin_download():
    """Тест скачивания админом БЕЗ покупки"""
    print_header("ТЕСТ 1: СКАЧИВАНИЕ АДМИНОМ (ID=999999)")
    
    print_step(1, "Попытка скачать работу без покупки (админ должен иметь доступ)")
    
    try:
        response = requests.get(
            f"{DOWNLOAD_URL}?workId={WORK_ID}",
            headers={'X-User-Id': str(ADMIN_USER_ID)},
            timeout=10
        )
        
        print_info(f"HTTP Status: {response.status_code}")
        print_info(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response body: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            if 'download_url' in data:
                print_success("Админ получил прямую ссылку на скачивание без покупки!")
                print_info(f"URL для скачивания: {data['download_url'][:100]}...")
                print_info(f"Имя файла: {data.get('filename', 'N/A')}")
                
                # Проверим что URL корректно закодирован
                if '%' in data['download_url']:
                    print_success("URL правильно закодирован (есть percent-encoding)")
                else:
                    print_error("URL не закодирован (могут быть проблемы с кириллицей)")
                
                # Проверим доступность файла
                print_step(2, "Проверка доступности файла по ссылке")
                try:
                    file_response = requests.head(data['download_url'], timeout=10)
                    if file_response.status_code == 200:
                        print_success(f"Файл доступен! Размер: {file_response.headers.get('Content-Length', 'unknown')} байт")
                        return True
                    else:
                        print_error(f"Файл недоступен: HTTP {file_response.status_code}")
                        return False
                except Exception as e:
                    print_error(f"Ошибка проверки файла: {e}")
                    return False
            else:
                print_error("В ответе нет поля 'download_url'")
                return False
        else:
            print_error(f"Ошибка: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Исключение: {e}")
        return False

def test_user_purchase_and_download():
    """Тест покупки и скачивания обычным пользователем"""
    print_header("ТЕСТ 2: ПОКУПКА И СКАЧИВАНИЕ ПОЛЬЗОВАТЕЛЕМ (ID=2)")
    
    print_step(1, "Покупка работы пользователем")
    
    try:
        # Покупка
        purchase_response = requests.post(
            PURCHASE_URL,
            headers={
                'Content-Type': 'application/json',
                'X-User-Id': str(REGULAR_USER_ID)
            },
            json={
                'workId': WORK_ID,
                'userId': REGULAR_USER_ID,
                'price': WORK_PRICE
            },
            timeout=10
        )
        
        print_info(f"HTTP Status: {purchase_response.status_code}")
        
        if purchase_response.status_code == 200:
            purchase_data = purchase_response.json()
            print_info(f"Response: {json.dumps(purchase_data, indent=2, ensure_ascii=False)}")
            
            if purchase_data.get('success'):
                if purchase_data.get('alreadyPurchased'):
                    print_success("Работа уже куплена ранее")
                else:
                    print_success(f"Покупка успешна! Новый баланс: {purchase_data.get('newBalance')}")
                
                # Теперь скачивание
                print_step(2, "Скачивание купленной работы")
                
                download_response = requests.get(
                    f"{DOWNLOAD_URL}?workId={WORK_ID}",
                    headers={'X-User-Id': str(REGULAR_USER_ID)},
                    timeout=10
                )
                
                print_info(f"HTTP Status: {download_response.status_code}")
                
                if download_response.status_code == 200:
                    download_data = download_response.json()
                    print_info(f"Response: {json.dumps(download_data, indent=2, ensure_ascii=False)}")
                    
                    if 'download_url' in download_data:
                        print_success("Пользователь получил ссылку на скачивание!")
                        print_info(f"URL: {download_data['download_url'][:100]}...")
                        
                        # Проверка доступности
                        print_step(3, "Проверка доступности файла")
                        file_response = requests.head(download_data['download_url'], timeout=10)
                        if file_response.status_code == 200:
                            print_success(f"Файл доступен! Размер: {file_response.headers.get('Content-Length', 'unknown')} байт")
                            return True
                        else:
                            print_error(f"Файл недоступен: HTTP {file_response.status_code}")
                            return False
                    else:
                        print_error("Нет поля 'download_url' в ответе")
                        return False
                else:
                    print_error(f"Ошибка скачивания: {download_response.text}")
                    return False
            else:
                print_error(f"Ошибка покупки: {purchase_data.get('error')}")
                return False
        else:
            print_error(f"HTTP {purchase_response.status_code}: {purchase_response.text}")
            return False
            
    except Exception as e:
        print_error(f"Исключение: {e}")
        return False

def test_user_download_without_purchase():
    """Тест попытки скачать без покупки (должна быть ошибка)"""
    print_header("ТЕСТ 3: ПОПЫТКА СКАЧАТЬ БЕЗ ПОКУПКИ (должна быть ошибка)")
    
    # Используем другую работу, которую точно не покупали
    test_work_id = 4564
    
    print_step(1, f"Попытка скачать работу {test_work_id} без покупки")
    
    try:
        response = requests.get(
            f"{DOWNLOAD_URL}?workId={test_work_id}",
            headers={'X-User-Id': str(REGULAR_USER_ID)},
            timeout=10
        )
        
        print_info(f"HTTP Status: {response.status_code}")
        
        if response.status_code == 403:
            print_success("Правильно! Получен HTTP 403 - доступ запрещен без покупки")
            return True
        elif response.status_code == 200:
            print_error("Ошибка! Пользователь получил доступ без покупки")
            return False
        else:
            print_info(f"Получен статус {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Исключение: {e}")
        return False

def main():
    print_header("КОМПЛЕКСНЫЙ ТЕСТ СИСТЕМЫ СКАЧИВАНИЯ")
    print_info("Тестируемая работа:")
    print_info(f"  ID: {WORK_ID}")
    print_info(f"  Цена: {WORK_PRICE} баллов")
    print_info(f"  Название: Изменение репертуара Т-клеточных рецепторов...")
    
    results = []
    
    # Тест 1: Админ
    results.append(("Скачивание админом", test_admin_download()))
    
    # Тест 2: Обычный пользователь
    results.append(("Покупка и скачивание пользователем", test_user_purchase_and_download()))
    
    # Тест 3: Скачивание без покупки
    results.append(("Блокировка скачивания без покупки", test_user_download_without_purchase()))
    
    # Итоги
    print_header("ИТОГИ ТЕСТИРОВАНИЯ")
    for test_name, result in results:
        if result:
            print_success(f"{test_name}: PASSED")
        else:
            print_error(f"{test_name}: FAILED")
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    print(f"\n{'='*80}")
    print(f"Пройдено тестов: {passed}/{total}")
    print(f"{'='*80}\n")
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
