#!/usr/bin/env python3
"""
Investigate ZIP file structure for a specific work.
"""
import os
import sys
import psycopg2
import boto3
import zipfile
import io
from typing import Optional, Tuple, List

def connect_db() -> psycopg2.extensions.connection:
    """Connect to the database using DATABASE_URL from environment."""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")
    
    print(f"Connecting to database...")
    conn = psycopg2.connect(database_url)
    print("Connected successfully!")
    return conn

def find_work(conn: psycopg2.extensions.connection) -> Optional[Tuple[int, str, str]]:
    """Find work with title containing 'износостойкост' or 'экскаватор'."""
    cursor = conn.cursor()
    
    query = """
        SELECT id, title, download_url 
        FROM works 
        WHERE title ILIKE %s OR title ILIKE %s
        LIMIT 1
    """
    
    print("\nSearching for work...")
    cursor.execute(query, ('%износостойкост%', '%экскаватор%'))
    result = cursor.fetchone()
    cursor.close()
    
    if result:
        print(f"Found work: ID={result[0]}, Title={result[1]}")
        return result
    else:
        print("No work found matching the criteria")
        return None

def download_from_s3(download_url: str) -> bytes:
    """Download file from Yandex S3."""
    # Extract bucket and key from download_url 
    # Format: https://storage.yandexcloud.net/bucket/path/to/file.zip
    if not download_url.startswith('https://storage.yandexcloud.net/'):
        raise ValueError(f"Invalid download_url format: {download_url}")
    
    # Remove the base URL to get bucket/path
    path_part = download_url.replace('https://storage.yandexcloud.net/', '')
    parts = path_part.split('/', 1)
    
    if len(parts) != 2:
        raise ValueError(f"Invalid path format: {path_part}")
    
    bucket_name = parts[0]
    object_key = parts[1]
    
    print(f"\nS3 Details:")
    print(f"  Bucket: {bucket_name}")
    print(f"  Key: {object_key}")
    
    # Get credentials from environment
    access_key = os.environ.get('YANDEX_S3_KEY_ID')
    secret_key = os.environ.get('YANDEX_S3_SECRET_KEY')
    
    if not access_key or not secret_key:
        raise ValueError("YANDEX_S3_KEY_ID and YANDEX_S3_SECRET_KEY must be set")
    
    # Create S3 client for Yandex Cloud
    s3_client = boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name='ru-central1'
    )
    
    print(f"\nDownloading from S3...")
    try:
        response = s3_client.get_object(Bucket=bucket_name, Key=object_key)
        file_data = response['Body'].read()
        print(f"Downloaded {len(file_data)} bytes")
        return file_data
    except Exception as e:
        print(f"Error downloading from S3: {e}")
        raise

def list_zip_contents(zip_data: bytes) -> List[str]:
    """Extract and list all files in the ZIP archive."""
    print("\n" + "="*80)
    print("ZIP FILE CONTENTS:")
    print("="*80)
    
    files = []
    png_files = []
    
    with zipfile.ZipFile(io.BytesIO(zip_data), 'r') as zip_ref:
        for info in zip_ref.filelist:
            filename = info.filename
            files.append(filename)
            
            # Check if it's a PNG file
            if filename.lower().endswith('.png'):
                png_files.append(filename)
            
            # Display file info
            is_dir = filename.endswith('/')
            file_type = "[DIR]" if is_dir else "[FILE]"
            size = info.file_size if not is_dir else 0
            
            print(f"{file_type:8} {size:>12} bytes  {filename}")
    
    print("="*80)
    print(f"Total entries: {len(files)}")
    
    if png_files:
        print("\n" + "="*80)
        print("PNG FILES FOUND:")
        print("="*80)
        for png_file in png_files:
            print(f"  - {png_file}")
        print("="*80)
    else:
        print("\nNo PNG files found in the archive.")
    
    return files

def main():
    """Main execution function."""
    try:
        # Connect to database
        conn = connect_db()
        
        # Find the work
        work_info = find_work(conn)
        if not work_info:
            print("\nERROR: No work found matching the criteria.")
            conn.close()
            return 1
        
        work_id, title, download_url = work_info
        
        # Close database connection
        conn.close()
        
        print("\n" + "="*80)
        print("WORK INFORMATION:")
        print("="*80)
        print(f"Work ID: {work_id}")
        print(f"Title: {title}")
        print(f"Download URL: {download_url}")
        print("="*80)
        
        # Download from S3
        zip_data = download_from_s3(download_url)
        
        # List ZIP contents
        files = list_zip_contents(zip_data)
        
        print("\n" + "="*80)
        print("INVESTIGATION COMPLETE")
        print("="*80)
        
        return 0
        
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())