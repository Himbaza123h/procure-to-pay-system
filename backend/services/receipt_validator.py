import os
import pdfplumber
import pytesseract
from PIL import Image
from decouple import config

def validate_receipt(receipt_path, purchase_request):
    """
    Validate receipt against Purchase Order
    Returns: dict with is_valid, errors list
    """
    result = {
        'is_valid': True,
        'errors': []
    }
    
    try:
        # Extract text from receipt
        receipt_text = extract_receipt_text(receipt_path)
        
        # Get expected data from PO
        expected_vendor = purchase_request.vendor_name
        expected_items = purchase_request.extracted_items
        expected_amount = float(purchase_request.amount)
        
        # Validate vendor
        if expected_vendor and expected_vendor.lower() not in receipt_text.lower():
            result['is_valid'] = False
            result['errors'].append(f"Vendor mismatch: Expected '{expected_vendor}'")
        
        # Validate amount (allow 5% variance)
        receipt_amount = extract_amount_from_receipt(receipt_text)
        if receipt_amount:
            variance = abs(receipt_amount - expected_amount) / expected_amount
            if variance > 0.05:  # More than 5% difference
                result['is_valid'] = False
                result['errors'].append(
                    f"Amount mismatch: Expected ${expected_amount:.2f}, Found ${receipt_amount:.2f}"
                )
        
        # Validate items (check if major items are present)
        if expected_items:
            missing_items = []
            for item in expected_items[:3]:  # Check first 3 items
                item_name = item.get('name', '').lower()
                if item_name and item_name not in receipt_text.lower():
                    missing_items.append(item['name'])
            
            if missing_items:
                result['is_valid'] = False
                result['errors'].append(f"Items not found in receipt: {', '.join(missing_items)}")
        
        # If OpenAI is available, use it for more detailed validation
        if config('OPENAI_API_KEY', default=''):
            ai_validation = validate_with_openai(receipt_text, purchase_request)
            if ai_validation:
                result = ai_validation
        
    except Exception as e:
        result['is_valid'] = False
        result['errors'].append(f"Validation error: {str(e)}")
    
    return result

def extract_receipt_text(file_path):
    """Extract text from receipt (PDF or image)"""
    file_extension = os.path.splitext(file_path)[1].lower()
    text = ''
    
    try:
        if file_extension == '.pdf':
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ''
        elif file_extension in ['.jpg', '.jpeg', '.png']:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
    except Exception as e:
        print(f"Error extracting receipt text: {e}")
    
    return text

def extract_amount_from_receipt(text):
    """Extract total amount from receipt text"""
    import re
    
    # Common patterns for total amount
    patterns = [
        r'total[:\s]*\$?\s*([\d,]+\.?\d{0,2})',
        r'amount[:\s]*\$?\s*([\d,]+\.?\d{0,2})',
        r'grand total[:\s]*\$?\s*([\d,]+\.?\d{0,2})',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text.lower())
        if matches:
            try:
                amount = float(matches[-1].replace(',', ''))
                return amount
            except:
                continue
    
    return None

def validate_with_openai(receipt_text, purchase_request):
    """Use OpenAI for detailed receipt validation"""
    try:
        import openai
        import json
        
        openai.api_key = config('OPENAI_API_KEY')
        
        expected_data = {
            'vendor': purchase_request.vendor_name,
            'amount': float(purchase_request.amount),
            'items': purchase_request.extracted_items
        }
        
        prompt = f"""
        Compare this receipt with the expected purchase order data and identify any discrepancies.
        
        Expected PO Data:
        {json.dumps(expected_data, indent=2)}
        
        Receipt Text:
        {receipt_text}
        
        Return your analysis in this JSON format:
        {{
            "is_valid": true/false,
            "errors": ["list of any discrepancies found"]
        }}
        
        Check for:
        1. Vendor name match
        2. Amount match (within 5%)
        3. Items match
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a receipt validation assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        print(f"OpenAI validation error: {e}")
        return None