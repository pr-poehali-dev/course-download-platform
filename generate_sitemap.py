#!/usr/bin/env python3
"""
Generate sitemap.xml with all approved works from database
"""

import os
import psycopg2
from datetime import datetime

DATABASE_URL = os.environ.get('DATABASE_URL', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def fetch_approved_works():
    """Fetch all approved works from database with max_rows=5000"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT id, updated_at 
        FROM t_p63326274_course_download_plat.works 
        WHERE status = 'approved' 
        AND title NOT LIKE '[УДАЛЕНО]%%' 
        ORDER BY id
    """
    
    print(f"Executing query...")
    cursor.execute(query)
    
    # Fetch all rows with max limit of 5000
    works = cursor.fetchmany(5000)
    
    cursor.close()
    conn.close()
    
    print(f"Fetched {len(works)} works from database")
    return works

def generate_sitemap(works):
    """Generate sitemap.xml file"""
    
    sitemap_content = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Главная страница -->
  <url>
    <loc>https://techforma.pro/</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Каталог -->
  <url>
    <loc>https://techforma.pro/catalog</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Основные категории -->
  <url>
    <loc>https://techforma.pro/catalog?category=coursework</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://techforma.pro/catalog?category=thesis</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://techforma.pro/catalog?category=essay</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://techforma.pro/catalog?category=report</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Блог и другие страницы -->
  <url>
    <loc>https://techforma.pro/blog</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://techforma.pro/upload</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://techforma.pro/faq</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
'''.format(today=datetime.now().strftime('%Y-%m-%d'))
    
    # Add all approved works
    for work in works:
        work_id = work[0]
        updated_at = work[1]
        
        # Format date as YYYY-MM-DD
        if isinstance(updated_at, datetime):
            lastmod = updated_at.strftime('%Y-%m-%d')
        else:
            lastmod = datetime.now().strftime('%Y-%m-%d')
        
        sitemap_content += f'''  <url>
    <loc>https://techforma.pro/work/{work_id}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
'''
    
    sitemap_content += '</urlset>\n'
    
    return sitemap_content

def main():
    print("Fetching approved works from database...")
    works = fetch_approved_works()
    print(f"Found {len(works)} approved works")
    
    print("Generating sitemap.xml...")
    sitemap_content = generate_sitemap(works)
    
    # Write to public/sitemap.xml
    output_path = 'public/sitemap.xml'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(sitemap_content)
    
    file_size = os.path.getsize(output_path)
    print(f"\n✅ Sitemap generated successfully!")
    print(f"📊 Total works added: {len(works)}")
    print(f"📁 File size: {file_size:,} bytes ({file_size / 1024:.2f} KB)")
    
    # Show first 3 and last 3 works
    print(f"\n🔍 First 3 works:")
    for i in range(min(3, len(works))):
        work_id, updated_at = works[i]
        print(f"   - https://techforma.pro/work/{work_id} (updated: {updated_at})")
    
    print(f"\n🔍 Last 3 works:")
    for i in range(max(0, len(works) - 3), len(works)):
        work_id, updated_at = works[i]
        print(f"   - https://techforma.pro/work/{work_id} (updated: {updated_at})")

if __name__ == '__main__':
    main()