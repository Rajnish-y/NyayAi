from utils.pdf_parser import extract_text
from utils.chunker import chunk_text
from models.rag import build_vector_store, run_rag_pipeline

print("📄 Step 1: Extracting text...")
result = extract_text("../data/sample_contracts/test.pdf")
chunks = chunk_text(result['text'])

print("\n🔢 Step 2: Building vector store...")
index, chunks = build_vector_store(chunks)

print("\n💬 Step 3: Asking questions...\n")

questions = [
    "What is this document about?",
    "What are the main parties involved?",
    "Are there any penalties or consequences mentioned?",
]

for question in questions:
    print(f"❓ Question: {question}")
    result = run_rag_pipeline(question, index, chunks)
    print(f"💡 Answer: {result['answer']}")
    print(f"📎 Based on {result['chunks_used']} chunks")
    print("-" * 60)