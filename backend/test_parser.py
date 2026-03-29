from utils.pdf_parser import extract_text
from utils.chunker import chunk_text

# Change this to your actual PDF filename
result = extract_text("../data/sample_contracts/test.pdf")

print(f"Method used: {result['method']}")
print(f"Pages found: {result['page_count']}")
print(f"Characters extracted: {result['char_count']}")
print(f"\nFirst 500 characters:\n{result['text'][:500]}")

chunks = chunk_text(result['text'])
print(f"\nFirst chunk:\n{chunks[0]}")