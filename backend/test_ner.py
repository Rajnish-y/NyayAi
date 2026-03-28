import sys
sys.path.append('.')

from data.legal_ner_seeds import SEED_DATA
from models.ner import train_ner_model, extract_entities

print("🏋️ Step 1: Training NER model on legal seed data...")
model, tokenizer = train_ner_model(SEED_DATA)

print("\n🔍 Step 2: Testing entity extraction...\n")

test_sentences = [
    "Mr. Anil Kumar agrees to pay Rs. 30000 per month as rent.",
    "The contract begins on 1st May 2026 and ends on 30th April 2027.",
    "As per Clause 3.1, the tenant shall maintain the property.",
    "XYZ Corporation shall pay ABC Ltd a sum of Rs. 5,00,000.",
]

for sentence in test_sentences:
    print(f"📝 Text: {sentence}")
    entities = extract_entities(sentence, model, tokenizer)
    if entities:
        for ent in entities:
            print(f"   → [{ent['type']}] {ent['text']}")
    else:
        print("   → No entities found")
    print()