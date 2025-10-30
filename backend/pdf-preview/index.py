'''
Business: Generate PDF preview (first 2-3 pages) from work folder
Args: event with queryStringParameters (folder_name, public_key, page_count)
Returns: Base64-encoded PDF preview or error
'''

import json
import requests
from typing import Dict, Any
import base64
from io import BytesIO

try:
    from PyPDF2 import PdfReader, PdfWriter
except ImportError:
    PdfReader = None
    PdfWriter = None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters', {})
    folder_name = params.get('folder_name')
    public_key = params.get('public_key')
    page_count = int(params.get('page_count', 3))
    
    if not folder_name or not public_key:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing folder_name or public_key'})
        }
    
    if not PdfReader or not PdfWriter:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'PyPDF2 not available'})
        }
    
    api_base = 'https://cloud-api.yandex.net/v1/disk/public/resources'
    
    folder_path = f'/{folder_name}'
    folder_url = f'{api_base}?public_key={public_key}&path={folder_path}&limit=50'
    
    try:
        folder_response = requests.get(folder_url, timeout=10)
        folder_response.raise_for_status()
        folder_data = folder_response.json()
        
        if not folder_data.get('_embedded') or not folder_data['_embedded'].get('items'):
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'No files in folder'})
            }
        
        pdf_files = [
            item for item in folder_data['_embedded']['items']
            if item.get('type') == 'file' and item.get('name', '').lower().endswith('.pdf')
        ]
        
        if not pdf_files:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'No PDF files found'})
            }
        
        main_pdf = None
        for pdf in pdf_files:
            name = pdf.get('name', '').lower()
            if 'пз' in name or 'записка' in name or 'диплом' in name or 'курсовая' in name:
                main_pdf = pdf
                break
        
        if not main_pdf:
            main_pdf = pdf_files[0]
        
        download_url = main_pdf.get('file')
        if not download_url:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'PDF download URL not found'})
            }
        
        pdf_response = requests.get(download_url, timeout=30)
        pdf_response.raise_for_status()
        
        pdf_reader = PdfReader(BytesIO(pdf_response.content))
        total_pages = len(pdf_reader.pages)
        
        pages_to_extract = min(page_count, total_pages)
        
        pdf_writer = PdfWriter()
        for i in range(pages_to_extract):
            pdf_writer.add_page(pdf_reader.pages[i])
        
        output_buffer = BytesIO()
        pdf_writer.write(output_buffer)
        output_buffer.seek(0)
        
        preview_base64 = base64.b64encode(output_buffer.read()).decode('utf-8')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'preview': preview_base64,
                'fileName': main_pdf.get('name'),
                'totalPages': total_pages,
                'previewPages': pages_to_extract
            })
        }
        
    except requests.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Request error: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Processing error: {str(e)}'})
        }
