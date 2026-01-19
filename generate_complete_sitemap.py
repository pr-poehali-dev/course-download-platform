#!/usr/bin/env python3
"""
Generate complete sitemap.xml with all approved works from database
"""
import os
import psycopg2
from datetime import datetime

DATABASE_URL = os.environ.get('DATABASE_URL', '')
BASE_URL = 'https://coursework.poehali.dev'
TODAY = '2025-11-27'

# Static pages configuration
STATIC_PAGES = [
    ('/', '1.0', 'daily'),
    ('/catalog', '0.9', 'daily'),
    ('/catalog?category=курсовая', '0.8', 'daily'),
    ('/catalog?category=диплом', '0.8', 'daily'),
    ('/catalog?category=реферат', '0.8', 'daily'),
    ('/catalog?category=контрольная', '0.7', 'daily'),
    ('/catalog?category=эссе', '0.7', 'daily'),
    ('/catalog?category=отчет', '0.7', 'daily'),
    ('/blog', '0.8', 'weekly'),
    ('/bot-subscription', '0.8', 'weekly'),
    ('/marketplace', '0.8', 'weekly'),
    ('/buy-points', '0.6', 'monthly'),
    ('/register', '0.7', 'monthly'),
    ('/login', '0.6', 'monthly'),
    ('/offer', '0.5', 'monthly'),
    ('/privacy-policy', '0.5', 'monthly'),
    ('/terms-of-service', '0.5', 'monthly'),
    ('/usage-rules', '0.4', 'monthly'),
    ('/requisites', '0.3', 'yearly'),
    ('/roskomnadzor-guide', '0.3', 'yearly'),
]

# Pagination configuration
ITEMS_PER_PAGE = 24  # Количество элементов на странице каталога

def fetch_approved_work_ids():
    """Fetch all approved work IDs from database"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT id FROM t_p63326274_course_download_plat.works 
        WHERE status = 'approved' 
        ORDER BY id
    """)
    
    work_ids = [row[0] for row in cur.fetchall()]
    
    cur.close()
    conn.close()
    
    return work_ids

def generate_sitemap(work_ids):
    """Generate complete sitemap XML"""
    xml_lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Add static pages
    for path, priority, changefreq in STATIC_PAGES:
        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{BASE_URL}{path}</loc>')
        xml_lines.append(f'    <lastmod>{TODAY}</lastmod>')
        xml_lines.append(f'    <changefreq>{changefreq}</changefreq>')
        xml_lines.append(f'    <priority>{priority}</priority>')
        xml_lines.append('  </url>')
    
    # Add pagination pages для каталога
    total_works = len(work_ids)
    total_pages = (total_works + ITEMS_PER_PAGE - 1) // ITEMS_PER_PAGE
    for page in range(2, total_pages + 1):  # Страница 1 уже есть как /catalog
        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{BASE_URL}/catalog?page={page}</loc>')
        xml_lines.append(f'    <lastmod>{TODAY}</lastmod>')
        xml_lines.append('    <changefreq>daily</changefreq>')
        xml_lines.append('    <priority>0.7</priority>')
        xml_lines.append('  </url>')
    
    # Add work pages
    for work_id in work_ids:
        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{BASE_URL}/work/{work_id}</loc>')
        xml_lines.append(f'    <lastmod>{TODAY}</lastmod>')
        xml_lines.append('    <changefreq>weekly</changefreq>')
        xml_lines.append('    <priority>0.8</priority>')
        xml_lines.append('  </url>')
    
    xml_lines.append('</urlset>')
    
    return '\n'.join(xml_lines)

def main():
    print("Fetching approved work IDs from database...")
    work_ids = fetch_approved_work_ids()
    
    print(f"Found {len(work_ids)} approved works")
    print(f"First 5 IDs: {work_ids[:5]}")
    print(f"Last 5 IDs: {work_ids[-5:]}")
    
    print("\nGenerating sitemap.xml...")
    sitemap_content = generate_sitemap(work_ids)
    
    # Write to public/sitemap.xml
    output_path = 'public/sitemap.xml'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(sitemap_content)
    
    total_urls = len(STATIC_PAGES) + len(work_ids)
    
    print(f"\n✅ Sitemap generated successfully!")
    print(f"📄 File: {output_path}")
    print(f"\n📊 Summary:")
    print(f"  - Static pages: {len(STATIC_PAGES)}")
    print(f"  - Work pages: {len(work_ids)}")
    print(f"  - Total URLs: {total_urls}")
    print(f"\n🔍 Work IDs included:")
    print(f"  - First 5: {work_ids[:5]}")
    print(f"  - Last 5: {work_ids[-5:]}")

if __name__ == '__main__':
    main()