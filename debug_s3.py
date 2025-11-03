import os
import sys
import boto3
from urllib.parse import unquote, urlparse
import psycopg2
from botocore.exceptions import ClientError

def main():
    print("=" * 80)
    print("S3 FILE ACCESS DEBUGGING")
    print("=" * 80)
    
    # 1. Get environment variables
    print("\n1. CHECKING ENVIRONMENT VARIABLES...")
    database_url = os.getenv('DATABASE_URL')
    s3_key_id = os.getenv('YANDEX_S3_KEY_ID')
    s3_secret_key = os.getenv('YANDEX_S3_SECRET_KEY')
    
    if not database_url:
        print("❌ DATABASE_URL not found")
        return
    if not s3_key_id:
        print("❌ YANDEX_S3_KEY_ID not found")
        return
    if not s3_secret_key:
        print("❌ YANDEX_S3_SECRET_KEY not found")
        return
    
    print(f"✓ DATABASE_URL: {database_url[:20]}...")
    print(f"✓ YANDEX_S3_KEY_ID: {s3_key_id[:10]}...")
    print(f"✓ YANDEX_S3_SECRET_KEY: {'*' * 20}")
    
    # 2. Connect to database and get work
    print("\n2. CONNECTING TO DATABASE...")
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, title, download_url 
            FROM t_p63326274_course_download_plat.works 
            WHERE id = 4851
        """)
        
        work = cursor.fetchone()
        if not work:
            print("❌ Work with id=4851 not found")
            return
        
        work_id, title, download_url = work
        print(f"✓ Found work:")
        print(f"  ID: {work_id}")
        print(f"  Title: {title}")
        print(f"  Download URL: {download_url}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return
    
    # 3. Initialize S3 client
    print("\n3. INITIALIZING S3 CLIENT...")
    try:
        from botocore.config import Config
        s3_client = boto3.client(
            's3',
            endpoint_url='https://storage.yandexcloud.net',
            aws_access_key_id=s3_key_id,
            aws_secret_access_key=s3_secret_key,
            region_name='ru-central1',
            config=Config(signature_version='s3v4')
        )
        print("✓ S3 client initialized")
    except Exception as e:
        print(f"❌ S3 client initialization error: {e}")
        return
    
    bucket_name = 'kyra'
    
    # 4. List bucket contents
    print(f"\n4. LISTING BUCKET '{bucket_name}' CONTENTS...")
    try:
        print("\nAttempting to list all objects in bucket...")
        paginator = s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket_name, MaxKeys=100)
        
        all_keys = []
        for page in pages:
            if 'Contents' in page:
                for obj in page['Contents']:
                    all_keys.append(obj['Key'])
        
        print(f"✓ Found {len(all_keys)} objects in bucket")
        print("\nFirst 50 objects:")
        for key in all_keys[:50]:
            print(f"  - {key}")
        
        if len(all_keys) > 50:
            print(f"\n  ... and {len(all_keys) - 50} more objects")
        
        # Look for works/ prefix
        works_files = [k for k in all_keys if k.startswith('works/')]
        print(f"\n✓ Found {len(works_files)} objects with 'works/' prefix")
        if works_files:
            print("First 20 'works/' files:")
            for key in works_files[:20]:
                print(f"  - {key}")
        
    except ClientError as e:
        print(f"❌ Error listing bucket: {e}")
        print(f"   Error Code: {e.response['Error']['Code']}")
        print(f"   Error Message: {e.response['Error']['Message']}")
    except Exception as e:
        print(f"❌ Unexpected error listing bucket: {e}")
    
    # 5. Parse download_url
    print(f"\n5. PARSING DOWNLOAD URL...")
    if not download_url:
        print("❌ download_url is NULL or empty")
        return
    
    parsed_url = urlparse(download_url)
    path_from_url = parsed_url.path.lstrip('/')
    
    # Remove bucket name if it's in the path
    if path_from_url.startswith(f'{bucket_name}/'):
        path_from_url = path_from_url[len(f'{bucket_name}/'):]
    
    print(f"  Original URL: {download_url}")
    print(f"  Parsed path: {path_from_url}")
    
    # 6. Try different approaches
    print("\n6. TRYING DIFFERENT DOWNLOAD APPROACHES...")
    
    attempts = []
    
    # Approach 1: Direct path from download_url
    print("\nApproach 1: Direct path from download_url")
    key1 = path_from_url
    print(f"  Trying key: {key1}")
    attempts.append(('Direct path', key1))
    try:
        response = s3_client.head_object(Bucket=bucket_name, Key=key1)
        print(f"  ✓ SUCCESS! File found")
        print(f"    Content-Length: {response.get('ContentLength', 'N/A')}")
        print(f"    Content-Type: {response.get('ContentType', 'N/A')}")
        print(f"    Last-Modified: {response.get('LastModified', 'N/A')}")
    except ClientError as e:
        print(f"  ❌ FAILED: {e.response['Error']['Code']} - {e.response['Error']['Message']}")
    except Exception as e:
        print(f"  ❌ FAILED: {e}")
    
    # Approach 2: URL decoded path
    print("\nApproach 2: URL decoded path (unquote)")
    key2 = unquote(path_from_url)
    print(f"  Trying key: {key2}")
    attempts.append(('URL decoded', key2))
    try:
        response = s3_client.head_object(Bucket=bucket_name, Key=key2)
        print(f"  ✓ SUCCESS! File found")
        print(f"    Content-Length: {response.get('ContentLength', 'N/A')}")
        print(f"    Content-Type: {response.get('ContentType', 'N/A')}")
        print(f"    Last-Modified: {response.get('LastModified', 'N/A')}")
    except ClientError as e:
        print(f"  ❌ FAILED: {e.response['Error']['Code']} - {e.response['Error']['Message']}")
    except Exception as e:
        print(f"  ❌ FAILED: {e}")
    
    # Approach 3: With 'works/' prefix
    print("\nApproach 3: With 'works/' prefix")
    key3 = f"works/{path_from_url}"
    print(f"  Trying key: {key3}")
    attempts.append(('With works/ prefix', key3))
    try:
        response = s3_client.head_object(Bucket=bucket_name, Key=key3)
        print(f"  ✓ SUCCESS! File found")
        print(f"    Content-Length: {response.get('ContentLength', 'N/A')}")
        print(f"    Content-Type: {response.get('ContentType', 'N/A')}")
        print(f"    Last-Modified: {response.get('LastModified', 'N/A')}")
    except ClientError as e:
        print(f"  ❌ FAILED: {e.response['Error']['Code']} - {e.response['Error']['Message']}")
    except Exception as e:
        print(f"  ❌ FAILED: {e}")
    
    # Approach 4: URL decoded with 'works/' prefix
    print("\nApproach 4: URL decoded with 'works/' prefix")
    key4 = f"works/{unquote(path_from_url)}"
    print(f"  Trying key: {key4}")
    attempts.append(('URL decoded with works/ prefix', key4))
    try:
        response = s3_client.head_object(Bucket=bucket_name, Key=key4)
        print(f"  ✓ SUCCESS! File found")
        print(f"    Content-Length: {response.get('ContentLength', 'N/A')}")
        print(f"    Content-Type: {response.get('ContentType', 'N/A')}")
        print(f"    Last-Modified: {response.get('LastModified', 'N/A')}")
    except ClientError as e:
        print(f"  ❌ FAILED: {e.response['Error']['Code']} - {e.response['Error']['Message']}")
    except Exception as e:
        print(f"  ❌ FAILED: {e}")
    
    # Approach 5: Just the filename
    filename = path_from_url.split('/')[-1]
    print("\nApproach 5: Just the filename")
    key5 = filename
    print(f"  Trying key: {key5}")
    attempts.append(('Just filename', key5))
    try:
        response = s3_client.head_object(Bucket=bucket_name, Key=key5)
        print(f"  ✓ SUCCESS! File found")
        print(f"    Content-Length: {response.get('ContentLength', 'N/A')}")
        print(f"    Content-Type: {response.get('ContentType', 'N/A')}")
        print(f"    Last-Modified: {response.get('LastModified', 'N/A')}")
    except ClientError as e:
        print(f"  ❌ FAILED: {e.response['Error']['Code']} - {e.response['Error']['Message']}")
    except Exception as e:
        print(f"  ❌ FAILED: {e}")
    
    # Approach 6: URL decoded filename with works/ prefix
    print("\nApproach 6: URL decoded filename with 'works/' prefix")
    key6 = f"works/{unquote(filename)}"
    print(f"  Trying key: {key6}")
    attempts.append(('URL decoded filename with works/ prefix', key6))
    try:
        response = s3_client.head_object(Bucket=bucket_name, Key=key6)
        print(f"  ✓ SUCCESS! File found")
        print(f"    Content-Length: {response.get('ContentLength', 'N/A')}")
        print(f"    Content-Type: {response.get('ContentType', 'N/A')}")
        print(f"    Last-Modified: {response.get('LastModified', 'N/A')}")
    except ClientError as e:
        print(f"  ❌ FAILED: {e.response['Error']['Code']} - {e.response['Error']['Message']}")
    except Exception as e:
        print(f"  ❌ FAILED: {e}")
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"\nDownload URL from database: {download_url}")
    print(f"\nPaths tried:")
    for i, (approach, key) in enumerate(attempts, 1):
        print(f"  {i}. {approach}: {key}")
    
    print("\nCheck the output above to see which approach(es) succeeded.")

if __name__ == "__main__":
    main()