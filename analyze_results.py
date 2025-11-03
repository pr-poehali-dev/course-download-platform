"""
Quick analyzer to extract key information from debug_s3.py output
Run this after running debug_s3.py to get a clean summary
"""

def analyze_debug_output(output_file='debug_output.txt'):
    """
    This is a template for analyzing the debug output.
    
    After running debug_s3.py, save the output to a file:
        python3 debug_s3.py > debug_output.txt
    
    Then analyze it with:
        python3 analyze_results.py
    """
    
    print("=" * 80)
    print("S3 DEBUG ANALYSIS SUMMARY")
    print("=" * 80)
    
    try:
        with open(output_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract download URL
        if 'Download URL:' in content:
            start = content.find('Download URL:') + len('Download URL:')
            end = content.find('\n', start)
            download_url = content[start:end].strip()
            print(f"\n1. DOWNLOAD URL FROM DATABASE:")
            print(f"   {download_url}")
        
        # Extract successful approach
        success_count = content.count('SUCCESS! File found')
        print(f"\n2. SUCCESSFUL APPROACHES: {success_count}")
        
        if 'SUCCESS!' in content:
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if 'SUCCESS!' in line:
                    # Get the approach name (a few lines above)
                    for j in range(max(0, i-5), i):
                        if 'Approach' in lines[j]:
                            print(f"\n   ✓ {lines[j].strip()}")
                            # Get the key that was tried
                            for k in range(j, i):
                                if 'Trying key:' in lines[k]:
                                    print(f"     Key: {lines[k].split('Trying key:')[1].strip()}")
                            break
        
        # Extract bucket structure info
        if 'Found' in content and 'objects in bucket' in content:
            start = content.find('Found') + 6
            end = content.find('objects', start)
            count = content[start:end].strip()
            print(f"\n3. BUCKET STRUCTURE:")
            print(f"   Total objects in bucket: {count}")
            
            if 'works/' in content:
                start = content.find('Found', content.find('works/')) + 6
                end = content.find('objects with', start)
                works_count = content[start:end].strip()
                print(f"   Objects with 'works/' prefix: {works_count}")
        
        # Extract error messages
        print(f"\n4. ERRORS ENCOUNTERED:")
        error_count = content.count('FAILED:')
        if error_count > 0:
            print(f"   Total failed attempts: {error_count}")
            lines = content.split('\n')
            errors = set()
            for line in lines:
                if 'FAILED:' in line:
                    error_msg = line.split('FAILED:')[1].strip()
                    errors.add(error_msg)
            print(f"\n   Unique error types:")
            for error in sorted(errors):
                print(f"   - {error}")
        
        # Recommendations
        print(f"\n5. RECOMMENDATIONS:")
        if success_count > 0:
            print("   ✓ At least one approach worked!")
            print("   → Use the successful path format in your application")
            print("   → Consider updating database if paths are inconsistent")
        else:
            print("   ❌ No approach worked")
            print("   → Check if file actually exists in S3 bucket")
            print("   → Verify S3 credentials have read permissions")
            print("   → Review bucket listing to find actual file location")
        
        print("\n" + "=" * 80)
        
    except FileNotFoundError:
        print(f"\n❌ Output file '{output_file}' not found!")
        print("\nTo use this analyzer:")
        print("1. Run: python3 debug_s3.py > debug_output.txt")
        print("2. Run: python3 analyze_results.py")
        print("\nOr manually review the debug_s3.py output above.")

if __name__ == "__main__":
    import sys
    
    output_file = sys.argv[1] if len(sys.argv) > 1 else 'debug_output.txt'
    analyze_debug_output(output_file)
