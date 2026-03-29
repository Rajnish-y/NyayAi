from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
)
from datasets import Dataset
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np
import torch
import re
import os

MODEL_NAME      = "law-ai/InLegalBERT"
MODEL_SAVE_PATH = "backend/models/saved/risk_classifier"
LABELS          = ["SAFE", "CAUTION", "DANGEROUS"]
ID2LABEL        = {0: "SAFE", 1: "CAUTION", 2: "DANGEROUS"}
LABEL2ID        = {"SAFE": 0, "CAUTION": 1, "DANGEROUS": 2}

DANGEROUS_PATTERNS = [
    r'waives?\s+all\s+(?:legal\s+)?rights',
    r'without\s+(?:prior\s+)?notice',
    r'at\s+any\s+time\s+without',
    r'sole\s+discretion',
    r'final\s+and\s+binding',
    r'no\s+recourse',
    r'seize\s+(?:the\s+)?(?:tenant|borrower|party)',
    r'supersedes?\s+all\s+(?:applicable\s+)?laws',
    r'waives?\s+(?:the\s+)?right\s+to\s+(?:approach|file|claim)',
    r'immediately\s+(?:vacate|evict)',
]

CAUTION_PATTERNS = [
    r'at\s+(?:landlord|company|employer)\'?s?\s+discretion',
    r'without\s+(?:written\s+)?consent',
    r'automatically\s+renew',
    r'non.refundable',
    r'regardless\s+of\s+(?:cause|reason|fault)',
    r'bear\s+all\s+(?:legal\s+)?costs',
    r'assign\s+this\s+agreement',
    r'modify\s+(?:the\s+)?terms',
]


def check_rule_risk(text: str) -> str | None:
    """
    Checks text against rule patterns.
    Returns risk level if a rule matches, None if no rule fires.
    Rules take priority over ML predictions.
    """
    text_lower = text.lower()
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, text_lower):
            return "DANGEROUS"
    for pattern in CAUTION_PATTERNS:
        if re.search(pattern, text_lower):
            return "CAUTION"
    return None



def prepare_dataset(risk_data: list) -> Dataset:
    """
    Converts (text, label) pairs into a HuggingFace Dataset.
    """
    texts  = [item[0] for item in risk_data]
    labels = [item[1] for item in risk_data]
    return Dataset.from_dict({"text": texts, "label": labels})


def tokenize_dataset(examples, tokenizer):
    """
    Tokenizes clause text for BERT input.
    
    For sequence classification we don't need word_ids alignment
    (unlike NER) — we just tokenize the full text and BERT handles
    the rest via its [CLS] token.
    
    max_length=256 covers most legal clauses comfortably.
    truncation=True handles edge cases with very long clauses.
    """
    return tokenizer(
        examples["text"],
        truncation=True,
        padding="max_length",
        max_length=256
    )


def compute_metrics(eval_pred):
    """
    Computes accuracy during training evaluation.
    Called by the Trainer after each epoch.
    """
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=1)
    accuracy = (predictions == labels).mean()
    return {"accuracy": accuracy}


def train_risk_classifier(risk_data: list):
    """
    Fine-tunes InLegalBERT for 3-class risk classification.
    
    Key difference from NER training:
    - AutoModelForSequenceClassification vs AutoModelForTokenClassification
    - We use [CLS] token output, not all token outputs
    - Labels are per-sentence, not per-token
    
    Hyperparameters explained:
    - num_train_epochs=15: more epochs OK since dataset is small
    - learning_rate=2e-5: standard for BERT fine-tuning
    - weight_decay=0.01: L2 regularization prevents overfitting
    - warmup_steps=50: gradually increase LR at start of training
      (helps BERT fine-tuning stability)
    """
    print("📚 Loading InLegalBERT for sequence classification...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=3,
        id2label=ID2LABEL,
        label2id=LABEL2ID,
        ignore_mismatched_sizes=True
    )

    print("📊 Preparing dataset...")
    dataset = prepare_dataset(risk_data)
    split   = dataset.train_test_split(test_size=0.2, seed=42)

    tokenized_train = split["train"].map(
        lambda x: tokenize_dataset(x, tokenizer), batched=True)
    tokenized_eval  = split["test"].map(
        lambda x: tokenize_dataset(x, tokenizer), batched=True)

    training_args = TrainingArguments(
        output_dir=MODEL_SAVE_PATH,
        num_train_epochs=15,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        learning_rate=2e-5,
        weight_decay=0.01,
        warmup_steps=50,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        logging_steps=5,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train,
        eval_dataset=tokenized_eval,
        processing_class=tokenizer,
        compute_metrics=compute_metrics,
    )

    print("🏋️ Training risk classifier...")
    trainer.train()

    os.makedirs(MODEL_SAVE_PATH, exist_ok=True)
    model.save_pretrained(MODEL_SAVE_PATH)
    tokenizer.save_pretrained(MODEL_SAVE_PATH)
    print(f"✅ Risk classifier saved to {MODEL_SAVE_PATH}")

    # Print final evaluation
    print("\n📊 Final evaluation on held-out test set:")
    predictions_output = trainer.predict(tokenized_eval)
    preds  = np.argmax(predictions_output.predictions, axis=1)
    labels = predictions_output.label_ids
    print(classification_report(labels, preds,
                                 target_names=LABELS))

    return model, tokenizer


def classify_clause_risk(clause: str, model=None, tokenizer=None) -> dict:
    """
    Classifies a single clause as SAFE / CAUTION / DANGEROUS.
    
    Returns:
        {
            "clause": original text,
            "risk_level": "SAFE" | "CAUTION" | "DANGEROUS",
            "confidence": float (0-1),
            "source": "rule" | "ml",
            "explanation": human-readable reason
        }
    
    Hybrid logic:
    1. Check rules first — if a rule fires, trust it completely
    2. Fall back to ML model for everything else
    """
    # Layer 1: rules
    rule_result = check_rule_risk(clause)
    if rule_result:
        explanations = {
            "DANGEROUS": "Contains high-risk language that strips legal rights or removes protections.",
            "CAUTION":   "Contains language that may be unusually one-sided or restrictive."
        }
        return {
            "clause":      clause,
            "risk_level":  rule_result,
            "confidence":  1.0,
            "source":      "rule",
            "explanation": explanations[rule_result]
        }

    # Layer 2: ML model
    if model is None:
        if not os.path.exists(MODEL_SAVE_PATH):
            return {
                "clause":      clause,
                "risk_level":  "SAFE",
                "confidence":  0.5,
                "source":      "default",
                "explanation": "No risk indicators detected."
            }
        tokenizer = AutoTokenizer.from_pretrained(MODEL_SAVE_PATH)
        model     = AutoModelForSequenceClassification.from_pretrained(
                        MODEL_SAVE_PATH)

    model.eval()
    inputs = tokenizer(
        clause,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=256
    )

    with torch.no_grad():
        outputs = model(**inputs)

    # softmax converts raw logits to probabilities (sum to 1.0)
    # This is why we can report "confidence" — it's the probability
    # assigned to the predicted class
    probs      = torch.softmax(outputs.logits, dim=1)[0]
    pred_id    = torch.argmax(probs).item()
    confidence = probs[pred_id].item()
    risk_level = ID2LABEL[pred_id]

    explanations = {
        "SAFE":      "This clause appears standard and balanced.",
        "CAUTION":   "This clause may be unusually one-sided. Review carefully.",
        "DANGEROUS": "This clause contains language that may be legally risky."
    }

    return {
        "clause":      clause,
        "risk_level":  risk_level,
        "confidence":  round(confidence, 3),
        "source":      "ml",
        "explanation": explanations[risk_level]
    }


def analyze_document_risk(chunks: list[str],
                           model=None,
                           tokenizer=None) -> dict:
    """
    Analyses all chunks from a document and produces a risk report.
    
    This is the function the FastAPI endpoint will call.
    Returns overall risk score + per-clause breakdown.
    """
    results     = []
    risk_counts = {"SAFE": 0, "CAUTION": 0, "DANGEROUS": 0}

    for chunk in chunks:
        # Split chunk into sentences for clause-level analysis
        sentences = [s.strip() for s in chunk.split('.')
                     if len(s.strip()) > 20]
        for sentence in sentences:
            result = classify_clause_risk(sentence, model, tokenizer)
            results.append(result)
            risk_counts[result["risk_level"]] += 1

    # Overall risk score: weighted average
    # DANGEROUS=3, CAUTION=2, SAFE=1
    total = len(results) if results else 1
    risk_score = (
        risk_counts["DANGEROUS"] * 3 +
        risk_counts["CAUTION"]   * 2 +
        risk_counts["SAFE"]      * 1
    ) / total

    # Normalise to 0-100
    risk_score_normalised = min(100, int((risk_score - 1) / 2 * 100))

    return {
        "overall_risk_score": risk_score_normalised,
        "risk_counts":        risk_counts,
        "dangerous_clauses":  [r for r in results
                                if r["risk_level"] == "DANGEROUS"],
        "caution_clauses":    [r for r in results
                                if r["risk_level"] == "CAUTION"],
        "all_results":        results,
    }