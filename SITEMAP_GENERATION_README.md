# Генерация Sitemap.xml для TechForma.pro

## Описание

Скрипт `generate_sitemap.py` автоматически генерирует файл `public/sitemap.xml` со всеми одобренными работами из базы данных.

## Что включено в Sitemap

1. **Главная страница** (priority 1.0)
2. **Каталог** (priority 0.9)
3. **4 основные категории** (priority 0.8):
   - Курсовые работы
   - Дипломные работы
   - Рефераты
   - Отчеты
4. **Блог и другие страницы** (priority 0.7)
5. **ВСЕ одобренные работы** (priority 0.6) в формате:
   ```xml
   <url>
     <loc>https://techforma.pro/work/{ID}</loc>
     <lastmod>{ДАТА из updated_at в формате YYYY-MM-DD}</lastmod>
     <changefreq>weekly</changefreq>
     <priority>0.6</priority>
   </url>
   ```

## SQL Запрос

Скрипт выполняет следующий SQL запрос:

```sql
SELECT id, updated_at 
FROM t_p63326274_course_download_plat.works 
WHERE status = 'approved' 
AND title NOT LIKE '[УДАЛЕНО]%' 
ORDER BY id
```

С параметром **max_rows=5000** для получения всех работ.

## Требования

1. Python 3.x
2. Библиотека `psycopg2-binary` (уже в requirements.txt)
3. Переменная окружения `DATABASE_URL` с подключением к PostgreSQL

## Установка зависимостей

```bash
pip install -r requirements.txt
```

или

```bash
pip install psycopg2-binary
```

## Запуск

### Способ 1: Прямой запуск Python скрипта

```bash
export DATABASE_URL="your_database_url_here"
python3 generate_sitemap.py
```

### Способ 2: Через bash скрипт

```bash
chmod +x run_generate_sitemap.sh
./run_generate_sitemap.sh
```

## Вывод скрипта

После успешного выполнения вы увидите:

```
Fetching approved works from database...
Executing query...
Fetched 4850 works from database
Found 4850 approved works
Generating sitemap.xml...

✅ Sitemap generated successfully!
📊 Total works added: 4850
📁 File size: XXX,XXX bytes (XXX.XX KB)

🔍 First 3 works:
   - https://techforma.pro/work/1 (updated: 2025-11-27 12:00:00)
   - https://techforma.pro/work/2 (updated: 2025-11-27 11:30:00)
   - https://techforma.pro/work/3 (updated: 2025-11-27 11:00:00)

🔍 Last 3 works:
   - https://techforma.pro/work/4848 (updated: 2025-11-20 10:00:00)
   - https://techforma.pro/work/4849 (updated: 2025-11-19 15:30:00)
   - https://techforma.pro/work/4850 (updated: 2025-11-18 14:00:00)
```

## Результат

После выполнения скрипта:

1. Файл `public/sitemap.xml` будет создан/перезаписан
2. Sitemap будет содержать все одобренные работы
3. Файл будет готов для загрузки в Google Search Console

## Проверка Sitemap

После генерации вы можете проверить sitemap:

1. Локально: `cat public/sitemap.xml | head -n 50`
2. Онлайн валидатор: https://www.xml-sitemaps.com/validate-xml-sitemap.html
3. Google Search Console: https://search.google.com/search-console

## Автоматическое обновление

Для регулярного обновления sitemap можно добавить cron задачу:

```bash
# Обновлять sitemap каждый день в 3:00 утра
0 3 * * * cd /path/to/project && python3 generate_sitemap.py >> /var/log/sitemap_generation.log 2>&1
```

## Формат даты

Все даты в sitemap используют формат ISO 8601: `YYYY-MM-DD`

Например: `2025-11-27`

## Размер файла

Ожидаемый размер файла для ~4850 работ: примерно 800-900 KB

Google поддерживает sitemap до 50 MB и 50,000 URL, так что наш sitemap в пределах лимита.

## Troubleshooting

### Ошибка подключения к БД

```
Убедитесь что DATABASE_URL правильно установлен:
echo $DATABASE_URL
```

### Ошибка импорта psycopg2

```bash
pip install --upgrade psycopg2-binary
```

### Недостаточно прав для записи

```bash
chmod 755 public/
```

## Файлы

- `generate_sitemap.py` - Основной скрипт генерации
- `run_generate_sitemap.sh` - Bash обертка для запуска
- `public/sitemap.xml` - Результирующий sitemap файл
- `SITEMAP_GENERATION_README.md` - Эта инструкция
