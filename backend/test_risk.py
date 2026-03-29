import sys
sys.path.append('.')

from data.risk_clauses import RISK_DATA
from models.risk_classifier import (
    train_risk_classifier,
    classify_clause_risk,
    analyze_document_risk
)

print("🏋️ Training risk classifier...\n")
model, tokenizer = train_risk_classifier(RISK_DATA)

print("\n🔍 Testing individual clauses:\n")
test_clauses = [
    "The rent shall be paid on the 1st of every month.",
    "The landlord may terminate this agreement without prior notice.",
    "The tenant waives all legal rights and remedies.",
    "The security deposit shall be refunded within 15 days of vacating.",
    "The landlord may enter the premises at any time without consent.",
    "Either party may terminate with 60 days written notice.",
    "The tenant shall bear all legal costs in case of any dispute.",
]

for clause in test_clauses:
    result = classify_clause_risk(clause, model, tokenizer)
    emoji  = {"SAFE": "🟢", "CAUTION": "🟡", "DANGEROUS": "🔴"}
    print(f"{emoji[result['risk_level']]} [{result['risk_level']}]"
          f" ({result['confidence']:.0%} via {result['source']})")
    print(f"   {clause}")
    print(f"   → {result['explanation']}\n")

print("\n📄 Full document risk analysis:\n")
sample_chunks = [
    "The monthly rent of Rs. 25000 shall be paid by 5th of every month. "
    "The landlord may terminate this agreement at any time without prior notice. "
    "The security deposit shall be refunded within 30 days.",

    "The tenant waives all legal rights and remedies available under law. "
    "Either party may terminate with 30 days written notice. "
    "The tenant shall maintain the premises in good condition.",
]

report = analyze_document_risk(sample_chunks, model, tokenizer)
print(f"Overall Risk Score: {report['overall_risk_score']}/100")
print(f"Risk Breakdown: {report['risk_counts']}")
print(f"\n🔴 Dangerous clauses found: {len(report['dangerous_clauses'])}")
for c in report['dangerous_clauses']:
    print(f"   → {c['clause']}")
print(f"\n🟡 Caution clauses found: {len(report['caution_clauses'])}")
for c in report['caution_clauses']:
    print(f"   → {c['clause']}")