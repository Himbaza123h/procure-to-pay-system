import os
import sys

# Add project to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_dependencies():
    """Test if all required packages are installed"""
    print("=" * 50)
    print("TESTING DEPENDENCIES")
    print("=" * 50)
    
    packages = {
        'pdfplumber': 'PDF text extraction',
        'pytesseract': 'OCR for images',
        'PIL': 'Image processing (Pillow)',
        'reportlab': 'PDF generation',
        'openai': 'OpenAI API',
        'decouple': 'Environment variables',
    }
    
    all_good = True
    for package, purpose in packages.items():
        try:
            if package == 'PIL':
                from PIL import Image
            elif package == 'decouple':
                from decouple import config
            else:
                __import__(package)
            print(f"✅ {package}: {purpose}")
        except ImportError as e:
            print(f"❌ {package}: {purpose} - MISSING!")
            all_good = False
    
    return all_good

def test_tesseract():
    """Test if Tesseract OCR is installed on system"""
    print("\n" + "=" * 50)
    print("TESTING TESSERACT OCR")
    print("=" * 50)
    
    import shutil
    tesseract_path = shutil.which('tesseract')
    
    if tesseract_path:
        print(f"✅ Tesseract found at: {tesseract_path}")
        
        # Test OCR
        try:
            import pytesseract
            version = pytesseract.get_tesseract_version()
            print(f"✅ Tesseract version: {version}")
            return True
        except Exception as e:
            print(f"❌ Tesseract error: {e}")
            return False
    else:
        print("❌ Tesseract NOT found!")
        print("   Install with:")
        print("   - Ubuntu/Debian: sudo apt-get install tesseract-ocr")
        print("   - macOS: brew install tesseract")
        print("   - Windows: Download from GitHub")
        return False

def test_openai():
    """Test OpenAI API configuration"""
    print("\n" + "=" * 50)
    print("TESTING OPENAI API")
    print("=" * 50)
    
    try:
        from decouple import config
        api_key = config('OPENAI_API_KEY', default='')
        
        if api_key:
            print(f"✅ OpenAI API key found (starts with: {api_key[:10]}...)")
            
            # Test API connection
            try:
                from openai import OpenAI
                client = OpenAI(api_key=api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": "Say 'test ok'"}],
                    max_tokens=10
                )
                print(f"✅ OpenAI API working: {response.choices[0].message.content}")
                return True
            except Exception as e:
                print(f"❌ OpenAI API error: {e}")
                return False
        else:
            print("⚠️  No OpenAI API key found (will use fallback extraction)")
            print("   Add OPENAI_API_KEY to your .env file for better results")
            return True  # Not critical
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_pdf_processing():
    """Test PDF processing capability"""
    print("\n" + "=" * 50)
    print("TESTING PDF PROCESSING")
    print("=" * 50)
    
    try:
        import pdfplumber
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph
        from reportlab.lib.styles import getSampleStyleSheet
        import io
        
        # Create a test PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = [Paragraph("Test Invoice from ABC Company. Item: Widget $100.00", styles['Normal'])]
        doc.build(story)
        
        # Save test PDF
        buffer.seek(0)
        test_pdf_path = '/tmp/test_invoice.pdf'
        with open(test_pdf_path, 'wb') as f:
            f.write(buffer.getvalue())
        
        print(f"✅ Test PDF created: {test_pdf_path}")
        
        # Read it back
        with pdfplumber.open(test_pdf_path) as pdf:
            text = pdf.pages[0].extract_text()
            print(f"✅ PDF text extracted: '{text[:50]}...'")
        
        # Cleanup
        os.remove(test_pdf_path)
        return True
        
    except Exception as e:
        print(f"❌ PDF processing error: {e}")
        return False

def test_image_ocr():
    """Test image OCR capability"""
    print("\n" + "=" * 50)
    print("TESTING IMAGE OCR")
    print("=" * 50)
    
    try:
        from PIL import Image, ImageDraw, ImageFont
        import pytesseract
        
        # Create a test image with text
        img = Image.new('RGB', (400, 100), color='white')
        draw = ImageDraw.Draw(img)
        draw.text((10, 40), "Invoice: $500.00 from Test Vendor", fill='black')
        
        test_img_path = '/tmp/test_receipt.png'
        img.save(test_img_path)
        print(f"✅ Test image created: {test_img_path}")
        
        # OCR the image
        text = pytesseract.image_to_string(img)
        print(f"✅ OCR extracted: '{text.strip()}'")
        
        # Cleanup
        os.remove(test_img_path)
        return True
        
    except Exception as e:
        print(f"❌ Image OCR error: {e}")
        return False

def test_document_processor():
    """Test the actual document processor service"""
    print("\n" + "=" * 50)
    print("TESTING DOCUMENT PROCESSOR SERVICE")
    print("=" * 50)
    
    try:
        # This imports your actual service
        from services.document_processor import simple_text_extraction
        
        test_text = """
        ABC Supplies Ltd
        123 Main Street
        
        Invoice #12345
        
        Items:
        Widget A    2    $50.00
        Widget B    1    $100.00
        
        Total: $200.00
        """
        
        result = simple_text_extraction(test_text)
        print(f"✅ Vendor extracted: {result.get('vendor_name', 'N/A')}")
        print(f"✅ Items extracted: {len(result.get('items', []))} items")
        
        for item in result.get('items', []):
            print(f"   - {item}")
        
        return True
        
    except ImportError:
        print("⚠️  Could not import services.document_processor")
        print("   Make sure you're running from the project root")
        return False
    except Exception as e:
        print(f"❌ Document processor error: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("\n🔍 AI SERVICES TEST SUITE\n")
    
    results = {
        'Dependencies': test_dependencies(),
        'Tesseract OCR': test_tesseract(),
        'OpenAI API': test_openai(),
        'PDF Processing': test_pdf_processing(),
        'Image OCR': test_image_ocr(),
        'Document Processor': test_document_processor(),
    }
    
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    
    for test, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test}")
    
    all_passed = all(results.values())
    print("\n" + ("🎉 All tests passed!" if all_passed else "⚠️  Some tests failed"))
    
    return all_passed

if __name__ == '__main__':
    run_all_tests()