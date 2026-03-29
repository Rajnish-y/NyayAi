from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
import uvicorn
import tempfile
import os
import sys

sys.path.append(os.path.dirname(__file__))

from utils.pdf_parser import extract_text
from utils.chunker import chunk_text
from models.rag import build_vector_store, run_rag_pipeline
from models.ner import extract_entities, train_ner_model
from models.risk_classifier import (
    analyze_document_risk,
    train_risk_classifier
)
from data.legal_ner_seeds import SEED_DATA
from data.risk_clauses import RISK_DATA

document_store = {}

models = {
    "ner_model": None,
    "ner_tokenizer": None,
    "risk_model": None,
    "risk_tokenizer": None,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager — runs setup before server starts,
    cleanup after server stops.

    This is FastAPI's modern replacement for @app.on_event("startup").
    We use it to load all ML models into memory once at startup.
    """
    print("🚀 NyayAI starting up...")
    print("📚 Loading ML models into memory...")

    # Load NER model
    ner_model_path = "backend/models/saved/ner_model"
    if os.path.exists(ner_model_path):
        from transformers import (
            AutoTokenizer,
            AutoModelForTokenClassification
        )
        models["ner_tokenizer"] = AutoTokenizer.from_pretrained(
            ner_model_path)
        models["ner_model"] = AutoModelForTokenClassification.from_pretrained(
            ner_model_path)
        print("✅ NER model loaded")
    else:
        print("⚠️ NER model not found — training now...")
        models["ner_model"], models["ner_tokenizer"] = train_ner_model(
            SEED_DATA)

    # Load risk classifier
    risk_model_path = "backend/models/saved/risk_classifier"
    if os.path.exists(risk_model_path):
        from transformers import (
            AutoTokenizer,
            AutoModelForSequenceClassification
        )
        models["risk_tokenizer"] = AutoTokenizer.from_pretrained(
            risk_model_path)
        models["risk_model"] = AutoModelForSequenceClassification.from_pretrained(
            risk_model_path)
        print("✅ Risk classifier loaded")
    else:
        print("⚠️ Risk classifier not found — training now...")
        models["risk_model"], models["risk_tokenizer"] = train_risk_classifier(
            RISK_DATA)

    print("✅ All models loaded — NyayAI is ready!")
    yield  # server runs here
    print("👋 NyayAI shutting down...")


app = FastAPI(
    title="NyayAI",
    description="AI-powered legal document intelligence for Indian legal text",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    document_id: str
    question: str


class AnalysisResponse(BaseModel):
    answer: str
    entities: list
    risk_report: dict
    document_id: str


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "NyayAI is running",
        "version": "1.0.0",
        "models_loaded": models["ner_model"] is not None
    }


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Accepts a PDF upload, extracts text, builds vector store.

    WHY TEMPFILE?
    FastAPI gives us the file as bytes in memory.
    pdfplumber needs a file path on disk.
    We write to a temporary file, process it, then delete it.
    This is standard practice for file handling in APIs.

    Returns a document_id — the frontend uses this for all
    subsequent requests about this document.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )

    # Write uploaded file to temp location
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
    
        print(f"📄 Processing: {file.filename}")
        result    = extract_text(tmp_path)
        chunks    = chunk_text(result['text'])
        index, chunks = build_vector_store(chunks)

        # Store in memory with a simple ID
        document_id = file.filename.replace('.pdf', '').replace(' ', '_')
        document_store[document_id] = {
            "filename": file.filename,
            "chunks":   chunks,
            "index":    index,
            "text":     result['text'],
            "method":   result['method'],
            "pages":    result['page_count'],
        }

        print(f"✅ Document processed: {document_id}")
        return {
            "document_id": document_id,
            "filename":    file.filename,
            "pages":       result['page_count'],
            "chunks":      len(chunks),
            "method":      result['method'],
            "message":     "Document processed successfully"
        }

    finally:
        # Always clean up temp file
        os.unlink(tmp_path)


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_document(request: QuestionRequest):
    """
    Accepts a document_id + question, returns full AI analysis.

    Runs the complete pipeline:
    1. RAG → answer the question with citations
    2. NER → extract entities from relevant chunks
    3. Risk → analyze document for dangerous clauses

    This is the core endpoint — everything the frontend needs
    in a single call.
    """
    if request.document_id not in document_store:
        raise HTTPException(
            status_code=404,
            detail=f"Document '{request.document_id}' not found. "
                   f"Please upload the document first."
        )

    doc = document_store[request.document_id]

    # Step 1: RAG — answer the question
    print(f"💬 Question: {request.question}")
    rag_result = run_rag_pipeline(
        request.question,
        doc["index"],
        doc["chunks"]
    )

    # Step 2: NER — extract entities from relevant chunks
    relevant_text = " ".join(rag_result["source_chunks"])
    entities = extract_entities(
        relevant_text,
        models["ner_model"],
        models["ner_tokenizer"]
    )

    # Step 3: Risk analysis on full document
    risk_report = analyze_document_risk(
        doc["chunks"][:10],  # analyse first 10 chunks for speed
        models["risk_model"],
        models["risk_tokenizer"]
    )

    return AnalysisResponse(
        answer=rag_result["answer"],
        entities=entities,
        risk_report=risk_report,
        document_id=request.document_id
    )


@app.get("/document/{document_id}")
async def get_document_info(document_id: str):
    """Returns metadata about a stored document."""
    if document_id not in document_store:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = document_store[document_id]
    return {
        "document_id": document_id,
        "filename":    doc["filename"],
        "pages":       doc["pages"],
        "chunks":      len(doc["chunks"]),
        "method":      doc["method"],
    }


@app.get("/health")
async def health_check():
    """Detailed health check — useful for monitoring."""
    return {
        "status":           "healthy",
        "ner_model":        models["ner_model"] is not None,
        "risk_model":       models["risk_model"] is not None,
        "documents_loaded": len(document_store),
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False 
    )