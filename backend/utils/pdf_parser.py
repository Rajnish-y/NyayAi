import pdfplumber          
import pytesseract         
from pdf2image import convert_from_path  
from PIL import Image     
import os

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Update this path if Tesseract is installed elsewhere


def is_scanned_pdf(pdf_path: str) -> bool:
    """
    Detects whether a PDF is scanned (image-based) or digital (text-based).
    
    How it works:
    - Opens the PDF and tries to extract text from the first page
    - If less than 50 characters found, it's probably a scanned image
    - This is a heuristic (educated guess) — works 95%+ of the time
    """
    with pdfplumber.open(pdf_path) as pdf:
        first_page = pdf.pages[0]
        text = first_page.extract_text()
        # If barely any text found, it's a scanned doc
        return len(text.strip()) < 50 if text else True


def extract_text_from_digital_pdf(pdf_path: str) -> str:
    """
    Extracts text from a digital PDF using pdfplumber.
    
    pdfplumber reads the actual text objects stored inside the PDF file —
    no AI needed, just direct extraction.
    """
    full_text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                # We label each page so we can cite sources later
                full_text += f"\n[Page {page_number + 1}]\n{text}"
    return full_text.strip()


def extract_text_from_scanned_pdf(pdf_path: str) -> str:
    """
    Extracts text from a scanned PDF using OCR.
    
    How it works:
    1. Convert each PDF page into a high-resolution image (300 DPI)
    2. Feed each image to Tesseract
    3. Tesseract's CNN model recognises characters from pixel patterns
    4. Returns the recognised text
    
    300 DPI = high quality scan → better OCR accuracy
    """
    full_text = ""
    # Convert PDF pages to images at 300 DPI for best OCR accuracy
    images = convert_from_path(pdf_path, dpi=300)
    
    for page_number, image in enumerate(images):
        # pytesseract runs the Tesseract OCR engine on this image
        # lang='eng' = English language model
        text = pytesseract.image_to_string(image, lang='eng')
        full_text += f"\n[Page {page_number + 1}]\n{text}"
    
    return full_text.strip()


def extract_text(pdf_path: str) -> dict:
    """
    Main function — automatically detects PDF type and extracts text.
    Returns a dict with the text and metadata.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")
    
    scanned = is_scanned_pdf(pdf_path)
    
    if scanned:
        print("📸 Scanned PDF detected — running OCR...")
        text = extract_text_from_scanned_pdf(pdf_path)
        method = "OCR (Tesseract)"
    else:
        print("📄 Digital PDF detected — extracting text directly...")
        text = extract_text_from_digital_pdf(pdf_path)
        method = "Direct extraction (pdfplumber)"
    
    return {
        "text": text,
        "method": method,
        "page_count": text.count("[Page "),
        "char_count": len(text)
    }