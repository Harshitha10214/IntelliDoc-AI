
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.rag_pipeline import ask_question
from backend.document_loader import load_pdf, load_txt
from backend.chunking import split_text
from backend.embeddings import generate_embeddings
from backend.vector_store import store_chunks, delete_document


# Project directory
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Directory where uploaded documents will be stored
UPLOAD_DIR = PROJECT_ROOT / "data" / "documents"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


app = FastAPI(
    title="IntelliDoc AI",
    description="AI-powered document question-answering system",
    version="1.0.0"
)


# Allow requests from our Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str
    source: str | None = None
    mode: str = "documents"


@app.get("/")
def home():
    return {
        "message": "Welcome to IntelliDoc AI API",
        "status": "running"
    }

@app.get("/documents")
def get_documents():
    documents = [
        file.name
        for file in UPLOAD_DIR.iterdir()
        if file.is_file() and file.suffix.lower() in [".pdf", ".txt"]
    ]

    return {
        "documents": sorted(documents)
    }

@app.delete("/documents/{filename}")
def delete_uploaded_document(filename: str):
    safe_filename = Path(filename).name
    file_path = UPLOAD_DIR / safe_filename

    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    try:
        # Delete document chunks from ChromaDB
        delete_document(safe_filename)

        # Delete the physical file
        file_path.unlink()

        return {
            "message": "Document deleted successfully.",
            "filename": safe_filename
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document: {str(error)}"
        )


@app.post("/ask")
def ask(request: QuestionRequest):
    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty"
        )

    try:
        result = ask_question(
    request.question,
    source=request.source,
    mode=request.mode
)
        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate answer: {str(error)}"
        )


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    # Check file extension
    filename = Path(file.filename or "").name
    extension = Path(filename).suffix.lower()

    if extension not in [".pdf", ".txt"]:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and TXT files are supported."
        )

    if not filename:
        raise HTTPException(
            status_code=400,
            detail="Please provide a valid filename."
        )

    try:
        # Save uploaded file
        file_path = UPLOAD_DIR / filename

        file_content = await file.read()

        if not file_content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        file_path.write_bytes(file_content)

        # Extract text from the document
        if extension == ".pdf":
            extracted_text = load_pdf(file_path)
        else:
            extracted_text = load_txt(file_path)

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text found in the document."
            )

        # Divide extracted text into smaller chunks
        chunks = split_text(extracted_text)

        # Convert chunks into numerical embeddings
        embeddings = generate_embeddings(chunks)

        # Store chunks and embeddings in ChromaDB
        store_chunks(
            chunks=chunks,
            embeddings=embeddings,
            source=filename
        )

        return {
            "message": "Document uploaded and processed successfully!",
            "filename": filename,
            "chunks_processed": len(chunks)
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {str(error)}"
        )

    finally:
        await file.close()
