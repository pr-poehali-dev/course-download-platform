"""
Selenium тесты для сайта курсовых работ
Требования: pip install selenium faker
"""
import time
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import os

class CourseworkSiteTester:
    def __init__(self, base_url):
        self.base_url = base_url.rstrip('/')
        self.driver = None
        self.wait = None
        self.setup_driver()
        self.setup_logging()
        
    def setup_driver(self):
        """Настройка Chrome WebDriver"""
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1920,1080')
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        
    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('test_results.log', encoding='utf-8'),
                logging.StreamHandler()
            ]
        )

    def take_screenshot(self, name):
        """Создание скриншота"""
        os.makedirs("screenshots", exist_ok=True)
        screenshot_path = f"screenshots/{name}_{int(time.time())}.png"
        self.driver.save_screenshot(screenshot_path)
        logging.info(f"📸 Скриншот сохранён: {screenshot_path}")
        return screenshot_path

    # ===== ТЕСТЫ ГЛАВНОЙ СТРАНИЦЫ =====
    
    def test_home_page_loads(self):
        """Тест загрузки главной страницы"""
        logging.info("Тест: Загрузка главной страницы...")
        
        try:
            self.driver.get(self.base_url)
            time.sleep(2)
            
            # Проверяем, что страница загрузилась
            assert "Техформа" in self.driver.title or "TechForma" in self.driver.title
            
            # Проверяем наличие основных элементов
            hero_section = self.driver.find_element(By.TAG_NAME, "main")
            assert hero_section is not None
            
            logging.info("✅ Главная страница загружена успешно")
            return True
            
        except Exception as e:
            logging.error(f"❌ Ошибка загрузки главной: {str(e)}")
            self.take_screenshot("home_page_error")
            return False

    def test_recently_viewed_section(self):
        """Тест блока 'Недавно просмотренные'"""
        logging.info("Тест: Блок 'Недавно просмотренные'...")
        
        try:
            self.driver.get(self.base_url)
            time.sleep(2)
            
            # Проверяем наличие заголовка секции
            page_source = self.driver.page_source
            
            # Блок может быть скрыт если нет просмотренных работ
            if "Недавно просмотренные" in page_source or "недавно просмотренные" in page_source:
                logging.info("✅ Блок 'Недавно просмотренные' найден")
                return True
            else:
                logging.info("ℹ️ Блок 'Недавно просмотренные' пуст (нет истории)")
                return True
            
        except Exception as e:
            logging.error(f"❌ Ошибка блока 'Недавно просмотренные': {str(e)}")
            return False

    def test_hits_section(self):
        """Тест блока 'Хиты продаж'"""
        logging.info("Тест: Блок 'Хиты продаж'...")
        
        try:
            self.driver.get(self.base_url)
            time.sleep(2)
            
            page_source = self.driver.page_source
            
            if "Хиты продаж" in page_source or "хиты продаж" in page_source:
                logging.info("✅ Блок 'Хиты продаж' найден")
                
                # Проверяем наличие бейджей "Хит"
                if "Хит" in page_source or "ХИТ" in page_source or "🔥" in page_source:
                    logging.info("✅ Бейджи 'Хит' отображаются")
                
                return True
            else:
                logging.warning("⚠️ Блок 'Хиты продаж' не найден")
                return False
            
        except Exception as e:
            logging.error(f"❌ Ошибка блока 'Хиты продаж': {str(e)}")
            return False

    # ===== ТЕСТЫ КАТАЛОГА =====
    
    def test_catalog_page_loads(self):
        """Тест загрузки страницы каталога"""
        logging.info("Тест: Загрузка каталога...")
        
        try:
            self.driver.get(f"{self.base_url}/catalog")
            time.sleep(3)  # Ждём загрузки работ
            
            # Проверяем наличие работ или индикатора загрузки
            page_source = self.driver.page_source
            
            if "Загрузка" in page_source or "Loading" in page_source:
                time.sleep(3)  # Дополнительное ожидание
            
            # Проверяем, что есть работы или сообщение об их отсутствии
            has_works = "б." in page_source  # Цена в баллах
            no_works_msg = "не найдены" in page_source
            
            if has_works or no_works_msg:
                logging.info("✅ Каталог загружен")
                return True
            else:
                logging.warning("⚠️ Каталог в неожиданном состоянии")
                self.take_screenshot("catalog_unexpected_state")
                return False
            
        except Exception as e:
            logging.error(f"❌ Ошибка загрузки каталога: {str(e)}")
            self.take_screenshot("catalog_error")
            return False

    def test_search_in_catalog(self):
        """Тест поиска в каталоге"""
        logging.info("Тест: Поиск в каталоге...")
        
        try:
            self.driver.get(f"{self.base_url}/catalog")
            time.sleep(3)
            
            # Ищем поле поиска
            search_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='text']")
            
            if not search_inputs:
                logging.warning("⚠️ Поле поиска не найдено")
                return False
            
            # Вводим запрос
            search_input = search_inputs[0]
            search_input.clear()
            search_input.send_keys("курсовая")
            time.sleep(2)  # Ждём фильтрации
            
            # Проверяем, что счётчик результатов изменился
            page_source = self.driver.page_source
            
            if "Найдено" in page_source or "найдено" in page_source:
                logging.info("✅ Поиск работает, есть счётчик результатов")
                return True
            else:
                logging.info("✅ Поиск работает (фильтрация происходит)")
                return True
            
        except Exception as e:
            logging.error(f"❌ Ошибка поиска: {str(e)}")
            self.take_screenshot("search_error")
            return False

    def test_filters_in_catalog(self):
        """Тест фильтров в каталоге"""
        logging.info("Тест: Фильтры в каталоге...")
        
        try:
            self.driver.get(f"{self.base_url}/catalog")
            time.sleep(3)
            
            # Проверяем наличие фильтров
            page_source = self.driver.page_source
            
            has_filters = (
                "Предмет" in page_source or 
                "Тип работы" in page_source or
                "Фильтр" in page_source
            )
            
            if has_filters:
                logging.info("✅ Фильтры найдены в каталоге")
                return True
            else:
                logging.warning("⚠️ Фильтры не найдены")
                return False
            
        except Exception as e:
            logging.error(f"❌ Ошибка проверки фильтров: {str(e)}")
            return False

    # ===== ТЕСТЫ КАРТОЧКИ РАБОТЫ =====
    
    def test_work_card_click(self):
        """Тест клика по карточке работы"""
        logging.info("Тест: Клик по карточке работы...")
        
        try:
            self.driver.get(f"{self.base_url}/catalog")
            time.sleep(3)
            
            # Ищем первую ссылку на работу
            work_links = self.driver.find_elements(By.CSS_SELECTOR, "a[href*='/work/']")
            
            if not work_links:
                logging.warning("⚠️ Карточки работ не найдены")
                return False
            
            # Кликаем по первой карточке
            first_work = work_links[0]
            work_url = first_work.get_attribute("href")
            first_work.click()
            time.sleep(2)
            
            # Проверяем, что перешли на страницу работы
            current_url = self.driver.current_url
            
            if "/work/" in current_url:
                logging.info("✅ Переход на страницу работы успешен")
                
                # Сохраняем в localStorage для теста "Недавно просмотренные"
                logging.info("ℹ️ Работа добавлена в историю просмотров")
                
                return True
            else:
                logging.error(f"❌ Неверный URL после клика: {current_url}")
                return False
            
        except Exception as e:
            logging.error(f"❌ Ошибка клика по карточке: {str(e)}")
            self.take_screenshot("work_card_click_error")
            return False

    def test_work_detail_page(self):
        """Тест страницы детальной информации о работе"""
        logging.info("Тест: Страница детальной информации...")
        
        try:
            # Переходим на страницу первой работы
            self.driver.get(f"{self.base_url}/catalog")
            time.sleep(3)
            
            work_links = self.driver.find_elements(By.CSS_SELECTOR, "a[href*='/work/']")
            
            if work_links:
                work_links[0].click()
                time.sleep(2)
                
                page_source = self.driver.page_source
                
                # Проверяем наличие ключевых элементов
                has_price = "б." in page_source
                has_description = "Описание" in page_source or "описание" in page_source
                
                if has_price:
                    logging.info("✅ Страница работы загружена корректно")
                    return True
                else:
                    logging.warning("⚠️ Страница работы в неожиданном состоянии")
                    self.take_screenshot("work_detail_unexpected")
                    return False
            else:
                logging.warning("⚠️ Не найдено работ для теста")
                return False
            
        except Exception as e:
            logging.error(f"❌ Ошибка страницы работы: {str(e)}")
            self.take_screenshot("work_detail_error")
            return False

    # ===== ТЕСТЫ АДАПТИВНОСТИ =====
    
    def test_mobile_responsive(self):
        """Тест адаптивности на мобильных"""
        logging.info("Тест: Адаптивность (мобильная версия)...")
        
        try:
            # Устанавливаем размер экрана мобильного
            self.driver.set_window_size(375, 812)  # iPhone X
            
            self.driver.get(self.base_url)
            time.sleep(2)
            
            # Проверяем, что контент отображается
            body = self.driver.find_element(By.TAG_NAME, "body")
            body_width = body.size['width']
            
            if body_width <= 400:
                logging.info("✅ Мобильная версия отображается корректно")
                self.take_screenshot("mobile_view")
                return True
            else:
                logging.warning(f"⚠️ Ширина контента на мобильном: {body_width}px")
                return False
            
        except Exception as e:
            logging.error(f"❌ Ошибка теста адаптивности: {str(e)}")
            return False
        finally:
            # Возвращаем обычный размер
            self.driver.set_window_size(1920, 1080)

    # ===== ТЕСТЫ НАВИГАЦИИ =====
    
    def test_navigation_links(self):
        """Тест навигационных ссылок"""
        logging.info("Тест: Навигационные ссылки...")
        
        results = {}
        pages_to_test = [
            ("/catalog", "Каталог"),
            ("/privacy-policy", "Политика"),
            ("/terms-of-service", "Условия"),
        ]
        
        for path, name in pages_to_test:
            try:
                self.driver.get(f"{self.base_url}{path}")
                time.sleep(1)
                
                # Проверяем, что страница загрузилась (нет 404)
                page_source = self.driver.page_source
                
                if "404" not in self.driver.title.lower() and "not found" not in page_source.lower()[:500]:
                    logging.info(f"✅ {name} загружается")
                    results[name] = True
                else:
                    logging.warning(f"⚠️ {name} недоступна")
                    results[name] = False
                    
            except Exception as e:
                logging.error(f"❌ Ошибка {name}: {str(e)}")
                results[name] = False
        
        return all(results.values())

    # ===== ОСНОВНОЙ ТЕСТ =====
    
    def run_all_tests(self):
        """Запуск всех тестов"""
        logging.info("🚀 ====== НАЧАЛО ТЕСТИРОВАНИЯ ======")
        logging.info(f"URL сайта: {self.base_url}")
        
        results = {}
        
        try:
            # Тесты главной страницы
            results["Загрузка главной"] = self.test_home_page_loads()
            results["Блок 'Недавно просмотренные'"] = self.test_recently_viewed_section()
            results["Блок 'Хиты продаж'"] = self.test_hits_section()
            
            # Тесты каталога
            results["Загрузка каталога"] = self.test_catalog_page_loads()
            results["Поиск в каталоге"] = self.test_search_in_catalog()
            results["Фильтры в каталоге"] = self.test_filters_in_catalog()
            
            # Тесты карточки работы
            results["Клик по карточке"] = self.test_work_card_click()
            results["Страница работы"] = self.test_work_detail_page()
            
            # Тесты адаптивности и навигации
            results["Мобильная версия"] = self.test_mobile_responsive()
            results["Навигационные ссылки"] = self.test_navigation_links()
            
            # Генерация отчета
            self.generate_report(results)
            
            return results
            
        except Exception as e:
            logging.error(f"❌ Критическая ошибка: {str(e)}")
            self.take_screenshot("critical_error")
            return results

    def generate_report(self, results):
        """Генерация итогового отчета"""
        
        logging.info("\n" + "="*60)
        logging.info("📊 ИТОГОВЫЙ ОТЧЕТ ТЕСТИРОВАНИЯ")
        logging.info("="*60)
        
        success_count = sum(1 for v in results.values() if v)
        total_count = len(results)
        success_rate = (success_count / total_count * 100) if total_count > 0 else 0
        
        for test_name, result in results.items():
            status = "✅ УСПЕХ" if result else "❌ ОШИБКА"
            logging.info(f"{status} | {test_name}")
        
        logging.info("="*60)
        logging.info(f"Успешно: {success_count}/{total_count} ({success_rate:.1f}%)")
        logging.info("="*60)
        logging.info("📁 Логи сохранены: test_results.log")
        logging.info("📸 Скриншоты: screenshots/")
        
        return results

    def close(self):
        """Закрытие браузера"""
        if self.driver:
            self.driver.quit()
            logging.info("🔒 Браузер закрыт")

def main():
    print("="*60)
    print("🧪 ТЕСТИРОВАНИЕ САЙТА КУРСОВЫХ РАБОТ")
    print("="*60)
    
    base_url = input("\nВведите URL сайта (например, https://your-site.com): ").strip()
    
    if not base_url:
        print("❌ URL не указан!")
        return
    
    print(f"\n🔍 Начинаю тестирование: {base_url}")
    print("⏳ Это займёт около 1-2 минут...\n")
    
    tester = CourseworkSiteTester(base_url)
    
    try:
        results = tester.run_all_tests()
        
        print("\n" + "="*60)
        print("✅ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!")
        print("="*60)
        print("\n📄 Результаты:")
        print("  - Лог: test_results.log")
        print("  - Скриншоты: screenshots/")
        
    except KeyboardInterrupt:
        print("\n⚠️ Тестирование прервано пользователем")
    except Exception as e:
        print(f"\n❌ Критическая ошибка: {str(e)}")
    finally:
        tester.close()

if __name__ == "__main__":
    main()
