#!/usr/bin/env python3
"""
Test script to verify environment setup before running the investigation.
"""
import os
import sys

def test_environment():
    """Test if all required environment variables and dependencies are available."""
    print("Testing Environment Setup")
    print("=" * 80)
    
    all_good = True
    
    # Test environment variables
    print("\n1. Checking Environment Variables...")
    env_vars = {
        'DATABASE_URL': os.environ.get('DATABASE_URL'),
        'YANDEX_S3_KEY_ID': os.environ.get('YANDEX_S3_KEY_ID'),
        'YANDEX_S3_SECRET_KEY': os.environ.get('YANDEX_S3_SECRET_KEY')
    }
    
    for var_name, var_value in env_vars.items():
        if var_value:
            masked_value = var_value[:10] + '...' if len(var_value) > 10 else var_value
            print(f"   ✓ {var_name}: {masked_value}")
        else:
            print(f"   ✗ {var_name}: NOT SET")
            all_good = False
    
    # Test Python dependencies
    print("\n2. Checking Python Dependencies...")
    dependencies = ['psycopg2', 'boto3', 'zipfile']
    
    for dep in dependencies:
        try:
            if dep == 'zipfile':
                import zipfile
                print(f"   ✓ {dep}: available (built-in)")
            elif dep == 'psycopg2':
                import psycopg2
                print(f"   ✓ {dep}: version {psycopg2.__version__}")
            elif dep == 'boto3':
                import boto3
                print(f"   ✓ {dep}: version {boto3.__version__}")
        except ImportError:
            print(f"   ✗ {dep}: NOT INSTALLED")
            all_good = False
    
    # Test database connection
    if env_vars['DATABASE_URL']:
        print("\n3. Testing Database Connection...")
        try:
            import psycopg2
            conn = psycopg2.connect(env_vars['DATABASE_URL'])
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            print("   ✓ Database connection: SUCCESS")
        except Exception as e:
            print(f"   ✗ Database connection: FAILED - {e}")
            all_good = False
    
    # Test S3 connection
    if env_vars['YANDEX_S3_KEY_ID'] and env_vars['YANDEX_S3_SECRET_KEY']:
        print("\n4. Testing S3 Connection...")
        try:
            import boto3
            s3_client = boto3.client(
                's3',
                endpoint_url='https://storage.yandexcloud.net',
                aws_access_key_id=env_vars['YANDEX_S3_KEY_ID'],
                aws_secret_access_key=env_vars['YANDEX_S3_SECRET_KEY'],
                region_name='ru-central1'
            )
            # Try to list buckets or check if kyra bucket exists
            response = s3_client.list_objects_v2(Bucket='kyra', MaxKeys=1)
            print("   ✓ S3 connection: SUCCESS")
            print(f"   ✓ Bucket 'kyra': ACCESSIBLE")
        except Exception as e:
            print(f"   ✗ S3 connection: FAILED - {e}")
            all_good = False
    
    # Final result
    print("\n" + "=" * 80)
    if all_good:
        print("✓ All checks passed! You can run the investigation script.")
        print("\nRun: python investigate_zip.py")
        return 0
    else:
        print("✗ Some checks failed. Please fix the issues above.")
        print("\nSetup instructions:")
        print("1. Install dependencies: pip install -r investigate_zip_requirements.txt")
        print("2. Set environment variables:")
        print("   export DATABASE_URL='your_database_url'")
        print("   export YANDEX_S3_KEY_ID='your_key_id'")
        print("   export YANDEX_S3_SECRET_KEY='your_secret_key'")
        return 1

if __name__ == "__main__":
    sys.exit(test_environment())
