# backend/models/rag.py

from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from groq import Groq
import os
import time
from dotenv import load_dotenv

load_dotenv()

# ── Embedding Model ──────────────────────────────────────────────────────────
# SentenceTransformer converts text → vectors (embeddings)
# 'all-MiniLM-L6-v2' is small (80MB), fast, and surprisingly powerful
# It was trained on 1 billion sentence pairs to understand semantic meaning
# 384 = the size of each vector it produces (384 numbers per chunk)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')


def build_vector_store(chunks: list[str]) -> tuple:
    """
    Converts all text chunks into vectors and stores them in FAISS.

    FAISS (Facebook AI Similarity Search) is a library that does one thing
    extremely well: given millions of vectors, find the most similar ones
    to a query vector in milliseconds.

    Think of it as a phonebook — but instead of looking up names,
    you look up meaning.

    IndexFlatL2 uses L2 distance (Euclidean distance) to measure
    how far apart two vectors are. Closer = more similar meaning.
    """
    print("🔢 Converting chunks to embeddings...")

    # Convert all chunks to vectors at once (batch processing = faster)
    embeddings = embedding_model.encode(chunks, show_progress_bar=True)

    # embeddings shape: (33, 384) — 33 chunks, each a 384-dim vector
    embeddings = np.array(embeddings).astype('float32')

    # 384 = dimension of our vectors (must match embedding model output)
    dimension = embeddings.shape[1]

    # Create FAISS index — this is our vector database
    index = faiss.IndexFlatL2(dimension)

    # Add all chunk vectors to the index
    index.add(embeddings)

    print(f"✅ Vector store built: {index.ntotal} chunks indexed")
    return index, chunks


def retrieve_relevant_chunks(query: str, index, chunks: list[str], top_k: int = 3) -> list[str]:
    """
    Finds the top_k most relevant chunks for a given question.

    How it works:
    1. Convert the question to a vector using the same embedding model
    2. Search FAISS for the 3 nearest vectors (most similar meaning)
    3. Return those chunks — these are the most relevant parts of the document

    top_k=3 is a sweet spot:
    - Too few (1): might miss context
    - Too many (10): LLM gets confused with irrelevant info
    """
    # Convert question to vector
    query_vector = embedding_model.encode([query]).astype('float32')

    # Search for top_k nearest neighbours in vector space
    # D = distances, I = indices of nearest chunks
    D, I = index.search(query_vector, top_k)

    # Retrieve the actual text of the most relevant chunks
    relevant_chunks = [chunks[i] for i in I[0]]

    return relevant_chunks


def answer_question(query: str, relevant_chunks: list[str]) -> dict:
    """
    Sends the question + relevant chunks to Groq (Llama 3.3) and gets an answer.

    Why Groq?
    - Groq runs on custom LPU chips — extremely fast inference
    - Free tier is generous enough for development
    - Llama 3.3 70B is Meta's open source model, excellent for legal text

    Why temperature=0.1?
    - Temperature controls how "creative" the model is
    - 0.0 = fully deterministic (same answer every time)
    - 1.0 = very creative/random
    - For legal documents we want LOW temperature — factual, consistent answers
    - 0.1 allows slight flexibility while keeping answers grounded
    """
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    context = "\n\n---\n\n".join(relevant_chunks)

    # Retry up to 3 times if rate limited
    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": """You are NyayAI, a legal document assistant that helps people 
understand legal documents in plain, simple language.

IMPORTANT RULES:
1. Only use information from the provided context — never make up facts
2. If the answer is not in the context, say "This information is not found in the document"
3. Always cite which page or section your answer comes from
4. Explain in simple language — assume the user has no legal background
5. If a clause seems risky or unfair, flag it clearly"""
                    },
                    {
                        "role": "user",
                        "content": f"""DOCUMENT SECTIONS:
{context}

USER QUESTION: {query}

Provide a clear, cited answer in plain language:"""
                    }
                ],
                temperature=0.1
            )
            
            return {
                "answer": response.choices[0].message.content,
                "source_chunks": relevant_chunks,
                "chunks_used": len(relevant_chunks)
            }

        except Exception as e:
            if "429" in str(e) and attempt < 2:
                wait = (attempt + 1) * 10
                print(f"⏳ Rate limited — waiting {wait}s before retry...")
                time.sleep(wait)
            else:
                raise e


def run_rag_pipeline(query: str, index, chunks: list[str]) -> dict:
    """
    Master function — combines retrieval + generation into one call.
    This is the function your FastAPI endpoint will call later.
    
    Flow:
    1. retrieve_relevant_chunks → find 3 most relevant chunks via FAISS
    2. answer_question → send chunks + question to Llama 3.3 via Groq
    3. Return answer + metadata
    """
    relevant_chunks = retrieve_relevant_chunks(query, index, chunks)
    result = answer_question(query, relevant_chunks)
    return result