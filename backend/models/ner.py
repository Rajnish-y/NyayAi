from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    TrainingArguments,
    Trainer,
    DataCollatorForTokenClassification
)
from datasets import Dataset
import numpy as np
import torch
import re
import os

LABELS = [
    "O",
    "B-PARTY",      "I-PARTY",
    "B-DATE",       "I-DATE",
    "B-MONEY",      "I-MONEY",
    "B-CLAUSE",     "I-CLAUSE",
    "B-OBLIGATION", "I-OBLIGATION"
]
ID2LABEL = {i: label for i, label in enumerate(LABELS)}
LABEL2ID = {label: i for i, label in enumerate(LABELS)}

MODEL_NAME     = "law-ai/InLegalBERT"
MODEL_SAVE_PATH = "backend/models/saved/ner_model"


RULE_PATTERNS = [
    # MONEY — matches Rs./INR followed by numbers with optional commas
    (r'Rs\.?\s*[\d,]+(?:\.\d+)?', 'MONEY'),
    (r'INR\s*[\d,]+(?:\.\d+)?', 'MONEY'),
    (r'₹\s*[\d,]+(?:\.\d+)?', 'MONEY'),

    # DATE — matches common Indian date formats and duration expressions
    (r'\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|'
     r'Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|'
     r'Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}', 'DATE'),
    (r'\d{1,2}/\d{1,2}/\d{2,4}', 'DATE'),
    (r'\d+\s+(?:days?|months?|years?|weeks?)', 'DATE'),

    # CLAUSE — matches Section/Clause/Schedule/Annexure references
    (r'(?:Clause|Section|Schedule|Annexure|Article)\s+\d+(?:\.\d+)*'
     r'(?:\s*[A-Z])?', 'CLAUSE'),

    # PARTY TITLES — matches common Indian name titles + name
    (r'(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*',
     'PARTY'),

    # COMPANY — matches company name patterns
    (r'[A-Z][A-Za-z\s]+(?:Pvt\.?\s*Ltd\.?|Ltd\.?|LLP|Inc\.?|Corp\.?|'
     r'Limited|Private Limited)', 'PARTY'),
]


def extract_entities_rules(text: str) -> list[dict]:
    """
    Scans text with all rule patterns and returns matched entities.
    
    Uses re.finditer() which finds ALL non-overlapping matches of a pattern.
    We track character positions (start, end) so we can later check
    for overlaps with ML-extracted entities.
    """
    entities = []
    
    for pattern, entity_type in RULE_PATTERNS:
        for match in re.finditer(pattern, text):
            matched_text = match.group().strip()
            # Skip very short matches (likely false positives)
            if len(matched_text) < 3:
                continue
            entities.append({
                "text": matched_text,
                "type": entity_type,
                "start": match.start(),
                "end": match.end(),
                "source": "rule"
            })
    
    # Sort by position in text
    entities.sort(key=lambda x: x["start"])
    return entities



def load_tokenizer():
    return AutoTokenizer.from_pretrained(MODEL_NAME)


def tokenize_and_align_labels(examples, tokenizer):
    """
    Aligns word-level labels with subword tokens.
    BERT splits words into subwords (e.g., "Sharma" → ["Shah", "##rma"])
    We give the first subword the real label, rest get -100 (ignored).
    """
    tokenized = tokenizer(
        examples["tokens"],
        truncation=True,
        is_split_into_words=True,
        padding="max_length",
        max_length=128
    )
    all_labels = []
    for i, label_ids in enumerate(examples["labels"]):
        word_ids = tokenized.word_ids(batch_index=i)
        aligned_labels = []
        previous_word_id = None
        for word_id in word_ids:
            if word_id is None:
                aligned_labels.append(-100)
            elif word_id != previous_word_id:
                aligned_labels.append(label_ids[word_id])
            else:
                aligned_labels.append(-100)
            previous_word_id = word_id
        all_labels.append(aligned_labels)
    tokenized["labels"] = all_labels
    return tokenized


def prepare_dataset_from_seeds(seed_data: list) -> Dataset:
    """
    Converts character-span seed data into BIO-tagged word tokens.
    """
    all_tokens, all_labels = [], []
    for sentence, entities in seed_data:
        words = sentence.split()
        word_labels = []
        char_pos = 0
        for word in words:
            word_start = sentence.find(word, char_pos)
            word_end = word_start + len(word)
            label = "O"
            for ent_start, ent_end, ent_type in entities:
                if word_start >= ent_start and word_end <= ent_end:
                    label = f"B-{ent_type}" if word_start == ent_start else f"I-{ent_type}"
                    break
            word_labels.append(LABEL2ID.get(label, 0))
            char_pos = word_end
        all_tokens.append(words)
        all_labels.append(word_labels)
    return Dataset.from_dict({"tokens": all_tokens, "labels": all_labels})


def train_ner_model(seed_data: list):
    """
    Fine-tunes InLegalBERT on our legal seed dataset.
    Saves the trained model for later inference.
    """
    print("📚 Loading InLegalBERT tokenizer and model...")
    tokenizer = load_tokenizer()
    model = AutoModelForTokenClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(LABELS),
        id2label=ID2LABEL,
        label2id=LABEL2ID,
        ignore_mismatched_sizes=True
    )
    print("📊 Preparing dataset...")
    dataset = prepare_dataset_from_seeds(seed_data)
    split = dataset.train_test_split(test_size=0.2, seed=42)
    tokenized_train = split["train"].map(
        lambda x: tokenize_and_align_labels(x, tokenizer), batched=True)
    tokenized_eval  = split["test"].map(
        lambda x: tokenize_and_align_labels(x, tokenizer), batched=True)
    data_collator = DataCollatorForTokenClassification(tokenizer)
    training_args = TrainingArguments(
        output_dir=MODEL_SAVE_PATH,
        num_train_epochs=20,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        learning_rate=2e-5,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        logging_steps=5,
    )
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train,
        eval_dataset=tokenized_eval,
        processing_class=tokenizer,
        data_collator=data_collator,
    )
    print("🏋️ Training NER model...")
    trainer.train()
    os.makedirs(MODEL_SAVE_PATH, exist_ok=True)
    model.save_pretrained(MODEL_SAVE_PATH)
    tokenizer.save_pretrained(MODEL_SAVE_PATH)
    print(f"✅ Model saved to {MODEL_SAVE_PATH}")
    return model, tokenizer


def extract_entities_ml(text: str, model, tokenizer) -> list[dict]:
    """
    ML-based entity extraction using fine-tuned InLegalBERT.
    Returns entities with character positions for overlap detection.
    """
    model.eval()
    words = text.split()
    if not words:
        return []
    inputs = tokenizer(
        words,
        is_split_into_words=True,
        return_tensors="pt",
        truncation=True,
        max_length=128
    )
    with torch.no_grad():
        outputs = model(**inputs)
    predictions  = torch.argmax(outputs.logits, dim=2)[0].tolist()
    word_ids     = inputs.word_ids()
    word_preds   = {}
    for token_idx, word_id in enumerate(word_ids):
        if word_id is not None and word_id not in word_preds:
            word_preds[word_id] = ID2LABEL[predictions[token_idx]]

    # Rebuild character positions for each word
    entities, current_entity = [], None
    char_pos = 0
    for word_idx, word in enumerate(words):
        word_start = text.find(word, char_pos)
        word_end   = word_start + len(word)
        label      = word_preds.get(word_idx, "O")
        if label.startswith("B-"):
            if current_entity:
                entities.append(current_entity)
            current_entity = {
                "text": word, "type": label[2:],
                "start": word_start, "end": word_end, "source": "ml"
            }
        elif label.startswith("I-") and current_entity:
            current_entity["text"] += f" {word}"
            current_entity["end"]   = word_end
        else:
            if current_entity:
                entities.append(current_entity)
                current_entity = None
        char_pos = word_end
    if current_entity:
        entities.append(current_entity)
    return entities


def merge_entities(rule_entities: list, ml_entities: list) -> list[dict]:
    """
    Merges rule-based and ML-based entities.
    
    Priority: rule-based > ml-based
    If an ML entity overlaps with a rule entity, the rule wins.
    This is because rules have 100% precision for their patterns,
    while the ML model can still make mistakes.
    """
    merged = list(rule_entities)  # start with all rule entities
    rule_spans = [(e["start"], e["end"]) for e in rule_entities]

    for ml_ent in ml_entities:
        # Check if this ML entity overlaps with any rule entity
        overlaps = any(
            ml_ent["start"] < r_end and ml_ent["end"] > r_start
            for r_start, r_end in rule_spans
        )
        if not overlaps and ml_ent["type"] != "O":
            merged.append(ml_ent)

    merged.sort(key=lambda x: x["start"])
    return merged


def extract_entities(text: str, model=None, tokenizer=None) -> list[dict]:
    """
    Full hybrid NER pipeline.
    Combines rule-based and ML-based extraction for best results.
    """
    # Layer 1 — rules (always runs, no model needed)
    rule_entities = extract_entities_rules(text)

    # Layer 2 — ML model (load from disk if not provided)
    if model is None and os.path.exists(MODEL_SAVE_PATH):
        tokenizer = AutoTokenizer.from_pretrained(MODEL_SAVE_PATH)
        model     = AutoModelForTokenClassification.from_pretrained(
                        MODEL_SAVE_PATH)
    
    ml_entities = []
    if model is not None:
        ml_entities = extract_entities_ml(text, model, tokenizer)

    # Layer 3 — merge
    final_entities = merge_entities(rule_entities, ml_entities)
    return final_entities