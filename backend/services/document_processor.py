import os
import pdfplumber
import pytesseract
from PIL import Image
from decouple import config

def process_proforma(file_path):
    """
    Extract key information from proforma invoice
    Returns: dict with vendor_name, items (list of dicts with name, quantity, price)
    """
    try:
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            return process_pdf_proforma(file_path)
        elif file_extension in ['.jpg', '.jpeg', '.png']:
            return process_image_proforma(file_path)
        else:
            return {'vendor_name': '', 'items': []}
    except Exception as e:
        print(f"Error processing proforma: {e}")
        return {'vendor_name': '', 'items': []}

def process_pdf_proforma(file_path):
    """Extract data from PDF proforma"""
    extracted_data = {
        'vendor_name': '',
        'items': []
    }
    
    try:
        with pdfplumber.open(file_path) as pdf:
            text = ''
            for page in pdf.pages:
                text += page.extract_text() or ''
            
            # Use OpenAI for better extraction
            if config('OPENAI_API_KEY', default=''):
                extracted_data = extract_with_openai(text)
            else:
                # Simple text parsing fallback
                extracted_data = simple_text_extraction(text)
                
    except Exception as e:
        print(f"Error processing PDF: {e}")
    
    return extracted_data

def process_image_proforma(file_path):
    """Extract data from image proforma using OCR"""
    extracted_data = {
        'vendor_name': '',
        'items': []
    }
    
    try:
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        
        if config('OPENAI_API_KEY', default=''):
            extracted_data = extract_with_openai(text)
        else:
            extracted_data = simple_text_extraction(text)
            
    except Exception as e:
        print(f"Error processing image: {e}")
    
    return extracted_data

def extract_with_openai(text):
    """Use OpenAI API to extract structured data from text"""
    try:
        import openai
        openai.api_key = config('OPENAI_API_KEY')
        
        prompt = f"""
        Extract the following information from this proforma invoice:
        1. Vendor/Supplier name
        2. List of items with their quantities and prices
        
        Text:
        {text}
        
        Return the data in this JSON format:
        {{
            "vendor_name": "Company Name",
            "items": [
                {{"name": "Item name", "quantity": 1, "price": 100.00}},
            ]
        }}
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a data extraction assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        print(f"OpenAI extraction error: {e}")
        return simple_text_extraction(text)

def simple_text_extraction(text):
    """Simple regex-based extraction as fallback"""
    import re
    
    extracted_data = {
        'vendor_name': '',
        'items': []
    }
    
    # Try to find vendor name (usually near top)
    lines = text.split('\n')
    if lines:
        extracted_data['vendor_name'] = lines[0].strip()[:100]
    
    # Try to find items with prices
    # Look for patterns like: Item name ... $100.00
    price_pattern = r'([A-Za-z\s]+)\s+[\$]?([\d,]+\.?\d*)'
    matches = re.findall(price_pattern, text)
    
    for match in matches[:10]:  # Limit to 10 items
        item_name = match[0].strip()
        try:
            price = float(match[1].replace(',', ''))
            if price > 0:
                extracted_data['items'].append({
                    'name': item_name,
                    'quantity': 1,
                    'price': price
                })
        except:
            continue
    
    return extracted_data