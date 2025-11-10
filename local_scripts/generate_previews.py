"""
Скрипт для генерации превью (скриншотов) Word документов из ZIP архивов
Запускается локально на компьютере пользователя

Требования:
- Python 3.8+
- Microsoft Word или LibreOffice
- Windows/Mac/Linux
"""

import os
import sys
import json
import zipfile
import tempfile
import time
from pathlib import Path
from typing import List, Optional, Tuple
import requests
import psycopg2
import boto3
from docx import Document
from PIL import Image
import io

# Конфигурация (будет заполнена из .env или вручную)
DATABASE_URL = "your_database_url_here"
YANDEX_S3_KEY_ID = "your_s3_key_id_here"
YANDEX_S3_SECRET_KEY = "your_s3_secret_key_here"


def load_config():
    """Загружает конфигурацию из переменных окружения или .env файла"""
    global DATABASE_URL, YANDEX_S3_KEY_ID, YANDEX_S3_SECRET_KEY
    
    # Попытка загрузить из .env файла
    env_file = Path(__file__).parent / '.env'
    if env_file.exists():
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    if key == 'DATABASE_URL':
                        DATABASE_URL = value.strip('"').strip("'")
                    elif key == 'YANDEX_S3_KEY_ID':
                        YANDEX_S3_KEY_ID = value.strip('"').strip("'")
                    elif key == 'YANDEX_S3_SECRET_KEY':
                        YANDEX_S3_SECRET_KEY = value.strip('"').strip("'")
    
    # Проверка заполнения
    if DATABASE_URL == "your_database_url_here":
        print("❌ ОШИБКА: Не указан DATABASE_URL")
        print("Создайте файл .env в папке local_scripts/ с содержимым:")
        print("")
        print("DATABASE_URL=postgresql://...")
        print("YANDEX_S3_KEY_ID=your_key")
        print("YANDEX_S3_SECRET_KEY=your_secret")
        sys.exit(1)


def get_works_without_preview() -> List[Tuple[int, str, str]]:
    """Получает список работ без превью из БД"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT id, title, file_url 
        FROM t_p63326274_course_download_plat.works 
        WHERE file_url IS NOT NULL 
        AND (preview_image_url IS NULL OR preview_image_url = '')
        ORDER BY id
    """)
    
    works = cur.fetchall()
    cur.close()
    conn.close()
    
    return works


def download_and_extract_zip(file_url: str, temp_dir: str) -> List[str]:
    """Скачивает ZIP и возвращает пути к .docx файлам"""
    print(f"  Скачиваю ZIP...")
    response = requests.get(file_url, timeout=120)
    response.raise_for_status()
    
    zip_path = os.path.join(temp_dir, 'work.zip')
    with open(zip_path, 'wb') as f:
        f.write(response.content)
    
    print(f"  Распаковываю ZIP...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(temp_dir)
    
    # Ищем .docx файлы
    docx_files = []
    for root, dirs, files in os.walk(temp_dir):
        for file in files:
            if file.endswith('.docx') and not file.startswith('~$'):
                docx_files.append(os.path.join(root, file))
    
    return docx_files


def find_pages_in_docx(docx_path: str) -> Tuple[Optional[int], Optional[int]]:
    """Находит номера страниц 'Содержание' и 'Введение' в документе"""
    try:
        doc = Document(docx_path)
        content_page = None
        intro_page = None
        
        for i, para in enumerate(doc.paragraphs):
            text_lower = para.text.lower().strip()
            
            if content_page is None and any(kw in text_lower for kw in ['содержание', 'оглавление']):
                content_page = 0  # Считаем что содержание в начале
            
            if intro_page is None and 'введение' in text_lower:
                intro_page = 1  # Введение обычно после содержания
        
        return content_page, intro_page
    except:
        return None, None


def screenshot_word_pages_windows(docx_path: str, output_dir: str) -> List[str]:
    """Создает скриншоты страниц Word на Windows через win32com"""
    try:
        import win32com.client
        import pyautogui
        
        screenshots = []
        
        print(f"  Открываю Word...")
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = True
        
        doc = word.Documents.Open(docx_path)
        time.sleep(2)  # Даем время на отрисовку
        
        # Скриншот первой страницы (обычно содержание)
        word.ActiveWindow.View.Type = 3  # Print Layout
        word.ActiveWindow.ActivePane.View.Zoom.PageFit = 1  # Fit to window
        time.sleep(1)
        
        screenshot = pyautogui.screenshot()
        screenshot_path = os.path.join(output_dir, 'page_0.png')
        screenshot.save(screenshot_path)
        screenshots.append(screenshot_path)
        print(f"  ✓ Скриншот страницы 1 сохранен")
        
        # Переход на следующую страницу (введение)
        word.Selection.GoTo(What=1, Which=1, Count=2)  # Page 2
        time.sleep(1)
        
        screenshot = pyautogui.screenshot()
        screenshot_path = os.path.join(output_dir, 'page_1.png')
        screenshot.save(screenshot_path)
        screenshots.append(screenshot_path)
        print(f"  ✓ Скриншот страницы 2 сохранен")
        
        doc.Close(False)
        word.Quit()
        
        return screenshots
        
    except ImportError:
        print("  ⚠ win32com или pyautogui не установлены")
        print("  Установите: pip install pywin32 pyautogui pillow")
        return []
    except Exception as e:
        print(f"  ❌ Ошибка при создании скриншотов: {e}")
        return []


def screenshot_word_pages_libreoffice(docx_path: str, output_dir: str) -> List[str]:
    """Конвертирует DOCX в PDF через LibreOffice, затем PDF в PNG"""
    import subprocess
    
    try:
        screenshots = []
        
        # Конвертируем в PDF
        print(f"  Конвертирую в PDF через LibreOffice...")
        subprocess.run([
            'soffice',
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', output_dir,
            docx_path
        ], check=True, timeout=60)
        
        # Находим созданный PDF
        pdf_files = [f for f in os.listdir(output_dir) if f.endswith('.pdf')]
        if not pdf_files:
            print(f"  ❌ PDF файл не создан")
            return []
        
        pdf_path = os.path.join(output_dir, pdf_files[0])
        
        # Конвертируем PDF в PNG
        print(f"  Конвертирую PDF в изображения...")
        import fitz  # PyMuPDF
        
        pdf_doc = fitz.open(pdf_path)
        
        # Берем первые 2 страницы
        for page_num in range(min(2, len(pdf_doc))):
            page = pdf_doc[page_num]
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom
            
            screenshot_path = os.path.join(output_dir, f'page_{page_num}.png')
            pix.save(screenshot_path)
            screenshots.append(screenshot_path)
            print(f"  ✓ Скриншот страницы {page_num + 1} сохранен")
        
        pdf_doc.close()
        return screenshots
        
    except FileNotFoundError:
        print("  ⚠ LibreOffice не найден в системе")
        return []
    except ImportError:
        print("  ⚠ PyMuPDF не установлен")
        print("  Установите: pip install PyMuPDF")
        return []
    except Exception as e:
        print(f"  ❌ Ошибка при создании скриншотов: {e}")
        return []


def upload_to_s3(image_path: str, work_id: int, page_num: int) -> Optional[str]:
    """Загружает изображение в S3"""
    try:
        s3_client = boto3.client(
            's3',
            endpoint_url='https://storage.yandexcloud.net',
            aws_access_key_id=YANDEX_S3_KEY_ID,
            aws_secret_access_key=YANDEX_S3_SECRET_KEY,
            region_name='ru-central1'
        )
        
        bucket_name = 'kyra'
        object_name = f'previews/work_{work_id}_page_{page_num}.png'
        
        s3_client.upload_file(
            image_path,
            bucket_name,
            object_name,
            ExtraArgs={'ACL': 'public-read', 'ContentType': 'image/png'}
        )
        
        url = f'https://storage.yandexcloud.net/{bucket_name}/{object_name}'
        return url
    except Exception as e:
        print(f"  ❌ Ошибка загрузки в S3: {e}")
        return None


def update_preview_url(work_id: int, preview_url: str):
    """Обновляет preview_image_url в БД"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE t_p63326274_course_download_plat.works SET preview_image_url = %s WHERE id = %s",
        (preview_url, work_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()


def process_work(work_id: int, title: str, file_url: str) -> bool:
    """Обрабатывает одну работу"""
    print(f"\n{'='*80}")
    print(f"Обработка работы #{work_id}: {title}")
    print(f"{'='*80}")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            # Скачиваем и распаковываем
            docx_files = download_and_extract_zip(file_url, temp_dir)
            
            if not docx_files:
                print(f"  ⚠ Word файлы не найдены в архиве")
                return False
            
            docx_path = docx_files[0]
            print(f"  Найден файл: {os.path.basename(docx_path)}")
            
            # Создаем скриншоты
            screenshots = []
            
            # Пробуем Windows способ
            if sys.platform == 'win32':
                screenshots = screenshot_word_pages_windows(docx_path, temp_dir)
            
            # Если не получилось, пробуем LibreOffice
            if not screenshots:
                screenshots = screenshot_word_pages_libreoffice(docx_path, temp_dir)
            
            if not screenshots:
                print(f"  ❌ Не удалось создать скриншоты")
                return False
            
            # Загружаем в S3
            preview_urls = []
            for i, screenshot_path in enumerate(screenshots):
                print(f"  Загружаю скриншот {i+1} в S3...")
                url = upload_to_s3(screenshot_path, work_id, i)
                if url:
                    preview_urls.append(url)
                    print(f"  ✓ Загружено: {url}")
            
            if not preview_urls:
                print(f"  ❌ Не удалось загрузить скриншоты в S3")
                return False
            
            # Обновляем БД
            print(f"  Обновляю БД...")
            update_preview_url(work_id, preview_urls[0])
            print(f"  ✓ Превью сохранено в БД")
            
            print(f"\n✅ Работа #{work_id} обработана успешно!")
            return True
            
        except Exception as e:
            print(f"\n❌ Ошибка при обработке работы #{work_id}: {e}")
            import traceback
            traceback.print_exc()
            return False


def main():
    """Основная функция"""
    print("="*80)
    print("ГЕНЕРАТОР ПРЕВЬЮ ДЛЯ РАБОТ")
    print("="*80)
    
    # Загружаем конфигурацию
    load_config()
    
    # Получаем список работ
    print("\nПолучаю список работ без превью...")
    works = get_works_without_preview()
    
    if not works:
        print("\n✅ Все работы уже имеют превью!")
        return
    
    print(f"\nНайдено работ без превью: {len(works)}")
    
    # Спрашиваем подтверждение
    response = input(f"\nОбработать {len(works)} работ? (да/нет): ").strip().lower()
    if response not in ['да', 'yes', 'y', 'д']:
        print("Отменено.")
        return
    
    # Обрабатываем все работы
    success_count = 0
    fail_count = 0
    
    for i, (work_id, title, file_url) in enumerate(works, 1):
        print(f"\n[{i}/{len(works)}]")
        
        if process_work(work_id, title, file_url):
            success_count += 1
        else:
            fail_count += 1
        
        # Небольшая пауза между работами
        if i < len(works):
            time.sleep(2)
    
    # Итоги
    print("\n" + "="*80)
    print("ИТОГИ")
    print("="*80)
    print(f"✅ Успешно обработано: {success_count}")
    print(f"❌ Ошибок: {fail_count}")
    print(f"📊 Всего: {len(works)}")


if __name__ == '__main__':
    main()
