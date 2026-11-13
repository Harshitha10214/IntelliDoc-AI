from pathlib import Path
from pypdf import PdfReader


def load_txt(file_path):

    path = Path(file_path)

    text = path.read_text(encoding="utf-8")

    return text


def load_pdf(file_path):

    reader = PdfReader(file_path)

    extracted_text = ""

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            extracted_text += page_text + "\n"

    return extracted_text