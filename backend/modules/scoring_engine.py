import spacy
import textstat
import random

# Load spacy model
try:
    nlp = spacy.load("en_core_web_md")
except Exception:
    # Fallback to small model if medium is not available
    nlp = spacy.load("en_core_web_sm")

FILLER_WORDS = {
    'um', 'uh', 'like', 'basically', 'actually', 'you know',
    'sort of', 'kind of', 'maybe', 'i mean', 'right'
}

def calculate_relevance(answer_text, expected_keywords):
    """
    Calculates the relevance score based on keyword overlap and semantic similarity.
    """
    if not expected_keywords:
        return 1.0, []

    doc = nlp(answer_text.lower())
    # Create a set of lemmas for fast lookup and a string for phrase matching
    answer_lemmas = {token.lemma_ for token in doc if not token.is_stop and not token.is_punct}
    answer_lemmatized_text = " ".join([token.lemma_ for token in doc])

    matched_keywords = []
    similarity_sum = 0

    for kw in expected_keywords:
        kw_doc = nlp(kw.lower())
        kw_lemma = " ".join([token.lemma_ for token in kw_doc])

        # Check for exact lemma match (works for single words and phrases)
        if kw_lemma in answer_lemmatized_text:
            matched_keywords.append(kw)
            similarity_sum += 1.0
        else:
            # Check for semantic similarity if no exact match
            sim = kw_doc.similarity(doc)
            if sim > 0.7:
                similarity_sum += sim

    # Score = (Actual Matches + Similarity Boost) / Total Expected
    score = similarity_sum / len(expected_keywords)
    score = min(1.0, max(0.0, score))

    # Find which keywords are still missing for suggestions
    missing = [kw for kw in expected_keywords if kw not in matched_keywords]

    return round(score, 2), missing

def calculate_clarity(answer_text):
    """
    Calculates the clarity score based on readability, filler words, and structure.
    """
    if not answer_text.strip():
        return 0.0, []

    suggestions = []

    # 1. Readability (Flesch Reading Ease)
    # scale: 0-100. Higher is easier.
    readability = textstat.flesch_reading_ease(answer_text)
    # Normalize to 0-1: 30-100 is generally acceptable/clear
    readability_score = min(1.0, max(0.0, (readability - 30) / 70))

    # 2. Filler Words
    doc = nlp(answer_text.lower())
    tokens = [token.text for token in doc]
    filler_count = sum(1 for t in tokens if t in FILLER_WORDS)
    filler_penalty = (filler_count / len(tokens)) * 2 if len(tokens) > 0 else 0

    if filler_count > 2:
        suggestions.append("Avoid using filler words like 'basically' or 'like' to sound more confident.")

    # 3. Structure (Sentence Length)
    sentences = list(doc.sents)
    if not sentences:
        return 0.0, ["Your answer is empty."]

    avg_len = len(doc) / len(sentences)
    if avg_len > 25:
        suggestions.append("Some of your sentences are quite long; try to be more concise.")
    elif avg_len < 5:
        suggestions.append("Your answers are very short; try to provide more detailed explanations.")

    # Final Clarity Score
    # Base it on readability, then subtract filler penalty
    score = readability_score - filler_penalty
    score = min(1.0, max(0.0, score))

    return round(score, 2), suggestions

def get_scoring_feedback(answer_text, expected_keywords):
    """
    Returns a complete scoring report for a given answer.
    """
    relevance_score, missing_keywords = calculate_relevance(answer_text, expected_keywords)
    clarity_score, clarity_suggestions = calculate_clarity(answer_text)

    all_suggestions = []

    # Relevance suggestions
    if relevance_score < 0.6 and missing_keywords:
        top_missing = missing_keywords[0]
        all_suggestions.append(f"Try to incorporate technical terms like '{top_missing}' to strengthen your answer.")

    # Add clarity suggestions
    all_suggestions.extend(clarity_suggestions)

    if relevance_score > 0.8 and clarity_score > 0.8:
        all_suggestions.append("Excellent answer! Clear, concise, and technically accurate.")
    elif not all_suggestions:
        all_suggestions.append("Good effort. Try to be slightly more specific with your technical examples.")

    return {
        "relevance_score": relevance_score,
        "clarity_score": clarity_score,
        "suggestions": all_suggestions[:3] # Cap at 3 suggestions
    }
