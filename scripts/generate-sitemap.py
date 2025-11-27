#!/usr/bin/env python3
"""
Генерирует sitemap.xml со всеми одобренными работами
Запуск: python scripts/generate-sitemap.py
"""

import os
import sys
import psycopg2
from datetime import datetime

# Добавь свой DATABASE_URL сюда или через переменную окружения
DATABASE_URL = os.environ.get('DATABASE_URL', '')

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL не найден в переменных окружения")
    print("Установите переменную: export DATABASE_URL='postgresql://...'")
    sys.exit(1)

def escape_xml(text):
    """Экранировать специальные символы для XML"""
    if not text:
        return ''
    return (text
        .replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
        .replace('"', '&quot;')
        .replace("'", '&apos;'))

def main():
    print("🚀 Генерирую sitemap.xml...")
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Получить все одобренные работы
    cur.execute("""
        SELECT id, title, updated_at, created_at
        FROM t_p63326274_course_download_plat.works
        WHERE status = 'approved' AND title NOT LIKE '[УДАЛЕНО]%'
        ORDER BY id ASC
    """)
    
    works = cur.fetchall()
    cur.close()
    conn.close()
    
    print(f"✅ Найдено одобренных работ: {len(works)}")
    
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Генерируем XML sitemap
    sitemap_xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Главная страница -->
  <url>
    <loc>https://techforma.pro/</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Каталог работ -->
  <url>
    <loc>https://techforma.pro/catalog</loc>
    <lastmod>{today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Каталог: Курсовые работы -->
  <url>
    <loc>https://techforma.pro/catalog?category=курсовая</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Каталог: Дипломные работы -->
  <url>
    <loc>https://techforma.pro/catalog?category=диплом</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Каталог: Рефераты -->
  <url>
    <loc>https://techforma.pro/catalog?category=реферат</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Каталог: Контрольные работы -->
  <url>
    <loc>https://techforma.pro/catalog?category=контрольная</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Блог -->
  <url>
    <loc>https://techforma.pro/blog</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Маркетплейс -->
  <url>
    <loc>https://techforma.pro/marketplace</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Покупка баллов -->
  <url>
    <loc>https://techforma.pro/buy-points</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Регистрация -->
  <url>
    <loc>https://techforma.pro/register</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Вход -->
  <url>
    <loc>https://techforma.pro/login</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Оферта -->
  <url>
    <loc>https://techforma.pro/offer</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Политика конфиденциальности -->
  <url>
    <loc>https://techforma.pro/privacy-policy</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Условия использования -->
  <url>
    <loc>https://techforma.pro/terms-of-service</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Правила использования -->
  <url>
    <loc>https://techforma.pro/usage-rules</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  
  <!-- Реквизиты -->
  <url>
    <loc>https://techforma.pro/requisites</loc>
    <lastmod>{today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

'''
    
    # Добавляем все одобренные работы
    print("📝 Добавляю страницы работ...")
    for i, work in enumerate(works):
        work_id = work[0]
        work_title = work[1]
        updated_at = work[2]
        created_at = work[3]
        
        # Используем дату обновления если есть, иначе создания
        lastmod = updated_at if updated_at else created_at
        lastmod_str = lastmod.strftime('%Y-%m-%d') if lastmod else today
        
        # Экранируем заголовок для комментария
        safe_title = escape_xml(work_title[:50] if work_title else "Без названия")
        
        sitemap_xml += f'''  <!-- Работа: {safe_title} -->
  <url>
    <loc>https://techforma.pro/work/{work_id}</loc>
    <lastmod>{lastmod_str}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
'''
        
        if (i + 1) % 500 == 0:
            print(f"   ✓ Обработано {i + 1}/{len(works)} работ...")
    
    sitemap_xml += '''
</urlset>'''
    
    # Сохраняем в файл
    output_path = 'public/sitemap.xml'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(sitemap_xml)
    
    print(f"\n✅ Sitemap успешно сгенерирован: {output_path}")
    print(f"📊 Всего URL в sitemap: {20 + len(works)}")
    print(f"   - Статических страниц: 20")
    print(f"   - Страниц работ: {len(works)}")
    print(f"\n🔗 Отправьте sitemap в Яндекс.Вебмастер:")
    print(f"   https://webmaster.yandex.ru/")
    print(f"   URL sitemap: https://techforma.pro/sitemap.xml")

if __name__ == '__main__':
    main()
