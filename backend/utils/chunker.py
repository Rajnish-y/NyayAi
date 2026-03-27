from langchain_text_splitters import RecursiveCharacterTextSplitter
def chunk_text(text: str) -> list[str]:
    """
    Splits large text into smaller overlapping chunks.
    
    WHY DO WE CHUNK?
    LLMs have a "context window" — a limit on how much text they can 
    process at once (like short-term memory). A legal contract can be 
    50,000 words — way too long for any LLM.
    
    WHY OVERLAP?
    If we split at exactly 1000 chars, an important sentence might be 
    cut in half across two chunks. Overlap of 200 chars ensures no 
    information is lost at boundaries.
    
    RecursiveCharacterTextSplitter is smart — it tries to split at:
    1. Paragraph breaks first (\n\n)
    2. Then line breaks (\n)
    3. Then sentences (. )
    4. Then words ( )
    5. Then characters as last resort
    This keeps legal clauses intact wherever possible.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,      # each chunk = ~1000 characters
        chunk_overlap=200,    # 200 char overlap between chunks
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    
    chunks = splitter.split_text(text)
    print(f"✅ Split into {len(chunks)} chunks")
    return chunks