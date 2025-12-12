import io
from pdfminer.high_level import extract_text as extract_text_pdf
import docx

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes."""
    try:
        # pdfminer.six expects a file-like object or path
        # We can use io.BytesIO
        with io.BytesIO(file_bytes) as f:
            text = extract_text_pdf(f)
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX bytes."""
    try:
        with io.BytesIO(file_bytes) as f:
            doc = docx.Document(f)
            text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
        return ""

def extract_text(filename: str, file_bytes: bytes) -> str:
    """Main entry point for text extraction based on file extension."""
    filename = filename.lower()
    if filename.endswith('.pdf'):
        return extract_text_from_pdf(file_bytes)
    elif filename.endswith('.docx'):
        return extract_text_from_docx(file_bytes)
    elif filename.endswith('.txt'):
        return file_bytes.decode('utf-8', errors='ignore')
    else:
        return ""
