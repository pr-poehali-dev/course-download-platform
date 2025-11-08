# 🧪 Автотесты для сайта курсовых работ

## Что тестируется

Скрипт `test_coursework_site.py` проверяет:

### ✅ Главная страница
- Загрузка страницы
- Блок "Недавно просмотренные" (localStorage)
- Блок "Хиты продаж" с бейджами 🔥

### ✅ Каталог работ
- Загрузка списка работ
- Поиск по названию (с счётчиком)
- Фильтры (предмет, тип работы)
- Отображение карточек

### ✅ Страница работы
- Клик по карточке
- Загрузка детальной информации
- Отображение цены, описания

### ✅ Адаптивность
- Мобильная версия (iPhone X 375x812)
- Корректное отображение на разных экранах

### ✅ Навигация
- Переходы между страницами
- Отсутствие 404 ошибок

## Как запустить

### 1. Установка зависимостей

```bash
pip install -r test_requirements.txt
```

### 2. Установка Chrome WebDriver

**Автоматически (рекомендуется):**
```bash
pip install webdriver-manager
```

**Вручную:**
1. Скачайте ChromeDriver с https://chromedriver.chromium.org/
2. Поместите в PATH или рядом со скриптом

### 3. Запуск тестов

```bash
python test_coursework_site.py
```

Введите URL вашего сайта, например:
- https://your-site.poehali.dev
- http://localhost:5173 (для локальной разработки)

## Результаты

После тестирования создаются:

📄 **test_results.log** - подробный лог всех действий
```
2025-01-08 15:30:01 - INFO - Тест: Загрузка главной страницы...
2025-01-08 15:30:03 - INFO - ✅ Главная страница загружена успешно
...
```

📸 **screenshots/** - скриншоты при ошибках
```
screenshots/
  catalog_error_1234567890.png
  mobile_view_1234567890.png
```

## Пример вывода

```
🧪 ТЕСТИРОВАНИЕ САЙТА КУРСОВЫХ РАБОТ
============================================================
🔍 Начинаю тестирование: https://your-site.com
⏳ Это займёт около 1-2 минут...

============================================================
📊 ИТОГОВЫЙ ОТЧЕТ ТЕСТИРОВАНИЯ
============================================================
✅ УСПЕХ | Загрузка главной
✅ УСПЕХ | Блок 'Недавно просмотренные'
✅ УСПЕХ | Блок 'Хиты продаж'
✅ УСПЕХ | Загрузка каталога
✅ УСПЕХ | Поиск в каталоге
⚠️ ОШИБКА | Фильтры в каталоге
✅ УСПЕХ | Клик по карточке
✅ УСПЕХ | Страница работы
✅ УСПЕХ | Мобильная версия
✅ УСПЕХ | Навигационные ссылки
============================================================
Успешно: 9/10 (90.0%)
============================================================
```

## Изменение скрипта под себя

### Добавить новый тест

```python
def test_my_feature(self):
    """Тест моей фичи"""
    logging.info("Тест: Моя фича...")
    
    try:
        self.driver.get(f"{self.base_url}/my-page")
        time.sleep(2)
        
        # Ваши проверки
        element = self.driver.find_element(By.CLASS_NAME, "my-class")
        assert element is not None
        
        logging.info("✅ Моя фича работает")
        return True
        
    except Exception as e:
        logging.error(f"❌ Ошибка: {str(e)}")
        self.take_screenshot("my_feature_error")
        return False
```

Добавьте в `run_all_tests()`:
```python
results["Моя фича"] = self.test_my_feature()
```

## Частые проблемы

### ChromeDriver не найден
```
selenium.common.exceptions.WebDriverException: 'chromedriver' executable needs to be in PATH
```

**Решение:** Установите `webdriver-manager`:
```bash
pip install webdriver-manager
```

Измените `setup_driver()`:
```python
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def setup_driver(self):
    service = Service(ChromeDriverManager().install())
    self.driver = webdriver.Chrome(service=service, options=chrome_options)
```

### Таймаут при загрузке
Увеличьте время ожидания:
```python
self.wait = WebDriverWait(self.driver, 30)  # было 10
```

### Элемент не найден
Проверьте селектор:
```python
# Используйте разные стратегии поиска
element = self.driver.find_element(By.ID, "myId")
element = self.driver.find_element(By.CLASS_NAME, "myClass")
element = self.driver.find_element(By.CSS_SELECTOR, "div.my-class")
element = self.driver.find_element(By.XPATH, "//div[@class='my-class']")
```

## Автоматизация CI/CD

### GitHub Actions

Создайте `.github/workflows/test.yml`:
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    
    - name: Install Chrome
      run: |
        wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
        sudo sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
        sudo apt-get update
        sudo apt-get install google-chrome-stable
    
    - name: Install dependencies
      run: pip install -r test_requirements.txt webdriver-manager
    
    - name: Run tests
      run: python test_coursework_site.py
      env:
        TEST_URL: https://your-site.com
    
    - name: Upload screenshots
      if: failure()
      uses: actions/upload-artifact@v3
      with:
        name: screenshots
        path: screenshots/
```

## Контакты

Вопросы по тестам: https://t.me/+QgiLIa1gFRY4Y2Iy
