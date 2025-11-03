#!/usr/bin/env python3
"""
Script to check image files in work archives stored in S3.
This script:
1. Connects to PostgreSQL
2. Finds 10 works without preview_url but with archives
3. Downloads ZIPs from Yandex S3
4. Lists all image files in each ZIP
"""

import os
import sys
import zipfile
import tempfile
from typing import List, Dict, Any
from io import BytesIO

try:
    import psycopg2
    import boto3
    from botocore.client import Config
except ImportError as e:
    print(f"Error: Missing required Python package: {e}")
    print("\nPlease install required packages:")
    print("pip install psycopg2-binary boto3")
    sys.exit(1)


# Image file extensions to look for
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'}


def get_env_variable(name: str) -> str:
    """Get environment variable or exit if not found."""
    value = os.environ.get(name)
    if not value:
        print(f"Error: Environment variable {name} is not set")
        sys.exit(1)
    return value


def connect_to_database(database_url: str):
    """Connect to PostgreSQL database."""
    try:
        conn = psycopg2.connect(database_url)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)


def fetch_works_without_preview(conn) -> List[Dict[str, Any]]:
    """Fetch 10 works that don't have preview_url but have a file/archive."""
    query = """
        SELECT id, title, file_url, archive_url
        FROM works
        WHERE preview_url IS NULL
          AND (file_url IS NOT NULL OR archive_url IS NOT NULL)
        ORDER BY id
        LIMIT 10;
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
                'file_url': row[2],
                'archive_url': row[3]
            })
        
        return works
    except Exception as e:
        print(f"Error fetching works: {e}")
        return []


def create_s3_client(key_id: str, secret_key: str):
    """Create boto3 S3 client for Yandex Cloud."""
    try:
        session = boto3.session.Session()
        s3_client = session.client(
            service_name='s3',
            endpoint_url='https://storage.yandexcloud.net',
            aws_access_key_id=key_id,
            aws_secret_access_key=secret_key,
            config=Config(signature_version='s3v4')
        )
        return s3_client
    except Exception as e:
        print(f"Error creating S3 client: {e}")
        sys.exit(1)


def extract_bucket_and_key(url: str) -> tuple:
    """Extract bucket name and object key from S3 URL."""
    if not url:
        return None, None
    
    # Handle various URL formats
    # https://storage.yandexcloud.net/bucket/key
    # https://bucket.storage.yandexcloud.net/key
    
    if 'storage.yandexcloud.net' in url:
        parts = url.replace('https://', '').replace('http://', '').split('/')
        if len(parts) >= 2:
            if parts[0] == 'storage.yandexcloud.net':
                # Format: storage.yandexcloud.net/bucket/key
                bucket = parts[1]
                key = '/'.join(parts[2:])
            else:
                # Format: bucket.storage.yandexcloud.net/key
                bucket = parts[0].replace('.storage.yandexcloud.net', '')
                key = '/'.join(parts[1:])
            return bucket, key
    
    return None, None


def download_and_analyze_zip(s3_client, url: str) -> List[str]:
    """Download ZIP from S3 and list all image files."""
    bucket, key = extract_bucket_and_key(url)
    
    if not bucket or not key:
        print(f"  Could not parse S3 URL: {url}")
        return []
    
    try:
        print(f"  Downloading from bucket '{bucket}', key '{key}'...")
        
        # Download file from S3
        response = s3_client.get_object(Bucket=bucket, Key=key)
        file_content = response['Body'].read()
        
        # Check if it's a ZIP file
        if not zipfile.is_zipfile(BytesIO(file_content)):
            print(f"  Warning: File is not a valid ZIP archive")
            return []
        
        # Analyze ZIP contents
        image_files = []
        with zipfile.ZipFile(BytesIO(file_content)) as zf:
            for file_info in zf.namelist():
                # Skip directories
                if file_info.endswith('/'):
                    continue
                
                # Check file extension
                file_lower = file_info.lower()
                for ext in IMAGE_EXTENSIONS:
                    if file_lower.endswith(ext):
                        image_files.append(file_info)
                        break
        
        return image_files
    
    except Exception as e:
        print(f"  Error downloading/analyzing file: {e}")
        return []


def main():
    """Main execution function."""
    print("=" * 80)
    print("WORK ARCHIVE IMAGE CHECKER")
    print("=" * 80)
    print()
    
    # Get environment variables
    print("1. Loading configuration...")
    database_url = get_env_variable('DATABASE_URL')
    s3_key_id = get_env_variable('YANDEX_S3_KEY_ID')
    s3_secret_key = get_env_variable('YANDEX_S3_SECRET_KEY')
    print("   Configuration loaded successfully")
    print()
    
    # Connect to database
    print("2. Connecting to PostgreSQL...")
    conn = connect_to_database(database_url)
    print("   Connected successfully")
    print()
    
    # Fetch works
    print("3. Fetching works without preview_url...")
    works = fetch_works_without_preview(conn)
    print(f"   Found {len(works)} works")
    print()
    
    if not works:
        print("No works found. Exiting.")
        conn.close()
        return
    
    # Create S3 client
    print("4. Creating S3 client...")
    s3_client = create_s3_client(s3_key_id, s3_secret_key)
    print("   S3 client created successfully")
    print()
    
    # Process each work
    print("5. Analyzing work archives...")
    print()
    
    results = []
    jpeg_found_count = 0
    
    for idx, work in enumerate(works, 1):
        print(f"Work {idx}/{len(works)}: ID={work['id']}")
        print(f"  Title: {work['title']}")
        
        # Determine which URL to use
        url_to_check = work['archive_url'] or work['file_url']
        
        if not url_to_check:
            print(f"  No file/archive URL available")
            results.append({
                'id': work['id'],
                'title': work['title'],
                'images': [],
                'count': 0
            })
            print()
            continue
        
        print(f"  URL: {url_to_check}")
        
        # Download and analyze
        image_files = download_and_analyze_zip(s3_client, url_to_check)
        
        # Check for JPEG/JPG files
        has_jpeg = any(f.lower().endswith(('.jpg', '.jpeg')) for f in image_files)
        if has_jpeg:
            jpeg_found_count += 1
            print(f"  *** JPEG/JPG FILES FOUND! ***")
        
        print(f"  Found {len(image_files)} image file(s)")
        
        results.append({
            'id': work['id'],
            'title': work['title'],
            'images': image_files,
            'count': len(image_files),
            'has_jpeg': has_jpeg
        })
        print()
    
    # Close database connection
    conn.close()
    
    # Print summary table
    print("=" * 80)
    print("SUMMARY TABLE")
    print("=" * 80)
    print()
    
    # Print header
    print(f"{'Work ID':<10} | {'Title':<30} | {'Image Count':<12} | JPEG?")
    print("-" * 80)
    
    for result in results:
        title_truncated = result['title'][:27] + '...' if len(result['title']) > 30 else result['title']
        jpeg_marker = "YES" if result.get('has_jpeg', False) else "No"
        print(f"{result['id']:<10} | {title_truncated:<30} | {result['count']:<12} | {jpeg_marker}")
    
    print()
    print("-" * 80)
    print()
    
    # Detailed results
    print("=" * 80)
    print("DETAILED IMAGE LISTINGS")
    print("=" * 80)
    print()
    
    for result in results:
        print(f"Work ID: {result['id']}")
        print(f"Title: {result['title']}")
        print(f"Image Count: {result['count']}")
        
        if result['images']:
            print("Image files found:")
            for img in result['images']:
                # Highlight JPEG/JPG files
                if img.lower().endswith(('.jpg', '.jpeg')):
                    print(f"  [JPEG] {img}")
                else:
                    print(f"  {img}")
        else:
            print("No image files found")
        
        print()
    
    # Summary statistics
    print("=" * 80)
    print("STATISTICS")
    print("=" * 80)
    print(f"Total works analyzed: {len(results)}")
    print(f"Works with images: {sum(1 for r in results if r['count'] > 0)}")
    print(f"Works with JPEG/JPG files: {jpeg_found_count}")
    print(f"Total images found: {sum(r['count'] for r in results)}")
    print()


if __name__ == "__main__":
    main()
