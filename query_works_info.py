#!/usr/bin/env python3
"""
Script to query all works from the database and gather information about:
- All works (IDs and titles)
- Test/demo works
- Specific works (износостойкости экскаватора, льноуборочный комбайн)
- Cover images for those works
"""

import os
import sys
import json

try:
    import psycopg2
except ImportError:
    print("Error: psycopg2 not installed. Please run: pip install psycopg2-binary")
    sys.exit(1)


def get_db_connection():
    """Connect to PostgreSQL database."""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("Error: DATABASE_URL environment variable not set")
        sys.exit(1)
    
    try:
        conn = psycopg2.connect(database_url)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)


def fetch_all_works(conn):
    """Fetch all works with relevant information."""
    query = """
        SELECT id, title, work_type, subject, cover_image, cover_images, 
               preview_url, created_at, author_id, author_name
        FROM t_p63326274_course_download_plat.works
        ORDER BY id;
    """
    
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        
        works = []
        for row in rows:
            works.append({
                'id': row[0],
                'title': row[1],
                'work_type': row[2],
                'subject': row[3],
                'cover_image': row[4],
                'cover_images': row[5],
                'preview_url': row[6],
                'created_at': row[7],
                'author_id': row[8],
                'author_name': row[9]
            })
        
        return works
    except Exception as e:
        print(f"Error fetching works: {e}")
        import traceback
        traceback.print_exc()
        return []


def is_test_or_demo_work(work):
    """Check if a work is a test or demo work."""
    title_lower = work['title'].lower()
    
    # Check for test/demo indicators
    test_keywords = [
        'test', 'тест', 'demo', 'демо', 'образец', 'пример',
        'testing', 'тестовая', 'тестовый', 'sample'
    ]
    
    for keyword in test_keywords:
        if keyword in title_lower:
            return True
    
    return False


def main():
    """Main execution function."""
    print("=" * 80)
    print("DATABASE WORKS INFORMATION REPORT")
    print("=" * 80)
    print()
    
    # Connect to database
    print("Connecting to database...")
    conn = get_db_connection()
    print("Connected successfully!")
    print()
    
    # Fetch all works
    print("Fetching all works from database...")
    works = fetch_all_works(conn)
    conn.close()
    
    print(f"Total works found: {len(works)}")
    print()
    print("=" * 80)
    print()
    
    # Analyze works
    test_works = []
    target_work_1 = None  # износостойкости экскаватора
    target_work_2 = None  # льноуборочный комбайн
    
    print("ANALYZING WORKS...")
    print()
    
    for work in works:
        # Check if test/demo work
        if is_test_or_demo_work(work):
            test_works.append(work)
        
        # Check for specific works
        title_lower = work['title'].lower()
        
        if 'износост' in title_lower:
            target_work_1 = work
        
        if 'льноуборочн' in title_lower:
            target_work_2 = work
    
    # Print results
    print("=" * 80)
    print("1. ALL WORKS LIST")
    print("=" * 80)
    print()
    
    for work in works:
        print(f"ID: {work['id']:<6} | Title: {work['title']}")
    
    print()
    print(f"Total: {len(works)} works")
    print()
    
    print("=" * 80)
    print("2. TEST/DEMO WORKS")
    print("=" * 80)
    print()
    
    if test_works:
        for work in test_works:
            print(f"ID: {work['id']:<6} | Title: {work['title']}")
            print(f"         Work Type: {work['work_type']}")
            print(f"         Subject: {work['subject']}")
            print(f"         Author: {work['author_name'] or work['author_id']}")
            print()
        print(f"Total test/demo works: {len(test_works)}")
    else:
        print("No test/demo works found.")
    
    print()
    print("=" * 80)
    print("3. SPECIFIC WORKS - COVER IMAGES")
    print("=" * 80)
    print()
    
    print("Work 1: 'Износостойкости экскаватора' (or containing 'износост')")
    if target_work_1:
        print(f"  ID: {target_work_1['id']}")
        print(f"  Title: {target_work_1['title']}")
        print(f"  cover_image: {target_work_1['cover_image']}")
        print(f"  cover_images: {target_work_1['cover_images']}")
    else:
        print("  NOT FOUND")
    
    print()
    
    print("Work 2: 'Технологический и конструкторский расчет прицепного льноуборочного комбайна'")
    print("        (or containing 'льноуборочн')")
    if target_work_2:
        print(f"  ID: {target_work_2['id']}")
        print(f"  Title: {target_work_2['title']}")
        print(f"  cover_image: {target_work_2['cover_image']}")
        print(f"  cover_images: {target_work_2['cover_images']}")
    else:
        print("  NOT FOUND")
    
    print()
    print("=" * 80)
    print("4. COMPARISON OF COVER IMAGES")
    print("=" * 80)
    print()
    
    if target_work_1 and target_work_2:
        same_cover_image = target_work_1['cover_image'] == target_work_2['cover_image']
        same_cover_images = target_work_1['cover_images'] == target_work_2['cover_images']
        
        print(f"Same cover_image? {same_cover_image}")
        print(f"Same cover_images? {same_cover_images}")
        
        if not same_cover_image:
            print()
            print("DIFFERENT cover_image values:")
            print(f"  Work 1 (ID {target_work_1['id']}): {target_work_1['cover_image']}")
            print(f"  Work 2 (ID {target_work_2['id']}): {target_work_2['cover_image']}")
        
        if not same_cover_images:
            print()
            print("DIFFERENT cover_images values:")
            print(f"  Work 1 (ID {target_work_1['id']}): {target_work_1['cover_images']}")
            print(f"  Work 2 (ID {target_work_2['id']}): {target_work_2['cover_images']}")
    else:
        print("Cannot compare - one or both works not found")
    
    print()
    print("=" * 80)
    print("REPORT COMPLETE")
    print("=" * 80)


if __name__ == '__main__':
    main()
