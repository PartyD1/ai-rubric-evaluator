"""PDF upload, validation, and text extraction."""

import logging
import os
from typing import Optional

import fitz  # PyMuPDF
from fastapi import UploadFile

logger = logging.getLogger(__name__)

MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "15"))
MAX_PAGES = int(os.getenv("MAX_PAGES", "25"))
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


def validate_upload(file: UploadFile) -> Optional[str]:
    """Validate uploaded file. Returns error message or None if valid."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        return "Only PDF files are accepted"
    if file.content_type and file.content_type != "application/pdf":
        return "Only PDF files are accepted"
    return None


async def save_file(file: UploadFile, job_id: str) -> str:
    """Save uploaded file to disk. Returns the file path."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}.pdf")
    content = await file.read()

    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise ValueError(f"File exceeds {MAX_FILE_SIZE_MB}MB limit")

    with open(file_path, "wb") as f:
        f.write(content)

    return file_path


def validate_page_count(file_path: str) -> Optional[str]:
    """Check page count after saving. Returns error message or None."""
    try:
        doc = fitz.open(file_path)
        page_count = len(doc)
        doc.close()
        if page_count > MAX_PAGES:
            return f"PDF exceeds {MAX_PAGES} page limit"
        return None
    except Exception:
        return "Unable to extract text from PDF. Ensure it's a typed document."


def _classify_page(index: int, text: str) -> dict:
    """Classify a single page's text as title page / TOC / Statement of Assurances.

    Shared by extract_all (whole-document structure detection) and
    extract_body_text (per-page boilerplate exclusion) so the detection
    rules only live in one place.
    """
    stripped = text.strip()
    text_lower = stripped.lower()
    return {
        "is_title_page": index == 0 and len(stripped.split()) < 80,
        "is_toc": "table of contents" in text_lower or text_lower.startswith("contents"),
        "is_soa": "statement of assurances" in text_lower or "academic integrity" in text_lower,
    }


def extract_all(file_path: str) -> tuple[int, dict, str, list[str]]:
    """Open the PDF once and return (page_count, doc_structure, text, page_texts).

    Single file open avoids redundant I/O on large PDFs. page_texts is the
    per-page breakdown, kept around so callers can select a subset of pages
    (e.g. excluding boilerplate) without re-opening the file.
    """
    doc = fitz.open(file_path)
    page_count = len(doc)

    has_title_page = False
    has_toc = False
    has_soa = False
    text_parts = []

    for i, page in enumerate(doc):
        text = page.get_text()
        text_parts.append(text)
        classification = _classify_page(i, text)
        has_title_page = has_title_page or classification["is_title_page"]
        has_toc = has_toc or classification["is_toc"]
        has_soa = has_soa or classification["is_soa"]

    doc.close()

    full_text = "\n".join(text_parts)
    if not full_text.strip():
        raise ValueError("Unable to extract text from PDF. Ensure it's a typed document.")

    doc_structure = {"has_title_page": has_title_page, "has_toc": has_toc, "has_soa": has_soa}
    return page_count, doc_structure, full_text, text_parts


def extract_body_text(page_texts: list[str]) -> str:
    """Join page text, excluding the title page and Statement of Assurances page(s).

    Those pages are boilerplate/signature blocks with no original writing —
    stripping them keeps AI-detection focused on actual report content and
    avoids spending API quota scoring form text.
    """
    body_pages = [
        text for i, text in enumerate(page_texts)
        if not (_classify_page(i, text)["is_title_page"] or _classify_page(i, text)["is_soa"])
    ]

    body_text = "\n".join(body_pages)
    return body_text if body_text.strip() else "\n".join(page_texts)


def render_pages_as_images(file_path: str, page_indices: list[int]) -> list[bytes]:
    """Render specific PDF pages as PNG images at 72 DPI.

    Returns a list of PNG bytes, one per requested page index.
    Skips indices that are out of range.
    """
    doc = fitz.open(file_path)
    images = []
    for i in page_indices:
        if 0 <= i < len(doc):
            pixmap = doc[i].get_pixmap(dpi=72)
            images.append(pixmap.tobytes("png"))
    doc.close()
    return images

