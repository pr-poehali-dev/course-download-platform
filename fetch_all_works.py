#!/usr/bin/env python3
"""
Script to fetch all 486 works from Yandex Disk and generate SQL INSERT statements
"""

import requests
import re
import json

API_BASE = "https://cloud-api.yandex.net/v1/disk/public/resources"
PUBLIC_KEY = "https://disk.yandex.ru/d/usjmeUqnkY9IfQ"
BASE_URL = "https://yadi.sk/d/usjmeUqnkY9IfQ"

def fetch_folders(offset=0, limit=100):
    """Fetch folders from Yandex Disk API"""
    params = {
        'public_key': PUBLIC_KEY,
        'limit': limit,
        'offset': offset
    }
    response = requests.get(API_BASE, params=params)
    return response.json()

def extract_work_info(folder_name):
    """Extract title and work type from folder name"""
    # Pattern: "Title (work type)"
    match = re.match(r'^(.+?)\s*\((.+?)\)\s*$', folder_name.strip())
    if match:
        title = match.group(1).strip()
        work_type = match.group(2).strip()
        return title, work_type
    return folder_name, "неизвестный тип"

def determine_subject(title):
    """Determine subject area from title keywords"""
    title_lower = title.lower()
    
    if any(word in title_lower for word in ['электро', 'электри', 'энергет', 'эу', 'ру']):
        return 'электроэнергетика'
    elif any(word in title_lower for word in ['автоматиз', 'управлен', 'асу', 'контрол', 'регулир']):
        return 'автоматизация'
    elif any(word in title_lower for word in ['строител', 'бетон', 'конструк', 'здание', 'сооружен']):
        return 'строительство'
    elif any(word in title_lower for word in ['механ', 'привод', 'станок', 'оборудован']):
        return 'механика'
    elif any(word in title_lower for word in ['газ', 'газопровод', 'нефт']):
        return 'газоснабжение'
    elif any(word in title_lower for word in ['програм', 'по', 'software', 'алгоритм', 'дискрет']):
        return 'программирование'
    elif any(word in title_lower for word in ['безопасн', 'охран', 'труд', 'защит']):
        return 'безопасность'
    elif any(word in title_lower for word in ['тепло', 'водоснабжен', 'вентиляц', 'отоплен']):
        return 'теплоснабжение'
    elif any(word in title_lower for word in ['транспорт', 'дорог', 'судов', 'автомобил']):
        return 'транспорт'
    elif any(word in title_lower for word in ['гидравлик', 'гидро']):
        return 'гидравлика'
    else:
        return 'общая инженерия'

def determine_price(work_type, title):
    """Determine price based on work type and complexity"""
    work_type_lower = work_type.lower()
    
    if 'практическая' in work_type_lower or 'практика' in work_type_lower:
        return 1000
    elif 'отчет' in work_type_lower and 'практ' in work_type_lower:
        return 1500
    elif 'курсовая' in work_type_lower or 'курсовой' in work_type_lower:
        # Check complexity
        if any(word in title.lower() for word in ['проектирование', 'расчет', 'модернизация', 'разработка']):
            return 2200
        else:
            return 1800
    elif 'дипломная' in work_type_lower or 'диплом' in work_type_lower:
        # Diploma works are most expensive
        if any(word in title.lower() for word in ['модернизация', 'проектирование системы', 'разработка', 'автоматизация']):
            return 6000
        else:
            return 5000
    elif 'реферат' in work_type_lower:
        return 1200
    else:
        return 1500

def extract_university(title):
    """Extract university or organization name from title"""
    # Look for patterns like ООО "Name", ПАО "Name", etc.
    org_match = re.search(r'(ООО|ПАО|ОАО|АО|ЗАО)\s+[«"]?([^»"()]+)[»"]?', title)
    if org_match:
        return f"{org_match.group(1)} {org_match.group(2).strip()}"
    return None

def determine_composition(work_type, title):
    """Determine composition based on work type"""
    work_type_lower = work_type.lower()
    
    if 'дипломная' in work_type_lower:
        if any(word in title.lower() for word in ['газопровод', 'электро', 'система', 'модернизация']):
            return 'Пояснительная записка, графика, чертежи'
        else:
            return 'Пояснительная записка, графика'
    elif 'курсовая' in work_type_lower:
        if any(word in title.lower() for word in ['проектирование', 'расчет', 'схема']):
            return 'Пояснительная записка, чертежи'
        else:
            return 'Пояснительная записка'
    elif 'отчет' in work_type_lower:
        return 'Отчёт, дневник практики'
    else:
        return 'Пояснительная записка'

def create_description(title, work_type):
    """Create brief description"""
    return f"Работа по теме: {title}"

def escape_sql_string(s):
    """Escape SQL string for safe insertion"""
    if s is None:
        return 'NULL'
    return "'" + s.replace("'", "''").replace("\\", "\\\\") + "'"

def generate_sql_insert(folder_name, base_url):
    """Generate SQL INSERT statement for a folder"""
    title, work_type = extract_work_info(folder_name)
    subject = determine_subject(title)
    price = determine_price(work_type, title)
    university = extract_university(title)
    composition = determine_composition(work_type, title)
    description = create_description(title, work_type)
    
    # Format SQL
    sql = f"""INSERT INTO t_p63326274_course_download_plat.works 
(title, work_type, subject, description, composition, universities, price_points, yandex_disk_link)
VALUES 
({escape_sql_string(title)}, {escape_sql_string(work_type)}, {escape_sql_string(subject)}, {escape_sql_string(description)}, {escape_sql_string(composition)}, {escape_sql_string(university)}, {price}, {escape_sql_string(base_url)});
"""
    return sql

def main():
    """Main function to fetch all works and generate SQL"""
    all_sql = []
    all_sql.append("-- SQL INSERT statements for all 486 works from Yandex Disk")
    all_sql.append("-- Generated automatically from API data")
    all_sql.append("-- Source: https://disk.yandex.ru/d/usjmeUqnkY9IfQ\n")
    
    total_count = 0
    for offset in [0, 100, 200, 300, 400]:
        print(f"Fetching offset {offset}...")
        data = fetch_folders(offset=offset, limit=100)
        
        if '_embedded' in data and 'items' in data['_embedded']:
            items = data['_embedded']['items']
            for item in items:
                if item['type'] == 'dir':
                    folder_name = item['name']
                    sql = generate_sql_insert(folder_name, BASE_URL)
                    all_sql.append(sql)
                    total_count += 1
        
        print(f"Processed {total_count} items so far...")
    
    # Write to file
    output_file = 'db_migrations_draft/insert_all_486_works.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(all_sql))
    
    print(f"\nTotal works processed: {total_count}")
    print(f"SQL file generated: {output_file}")

if __name__ == '__main__':
    main()
