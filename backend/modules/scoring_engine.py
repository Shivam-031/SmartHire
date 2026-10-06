import re

# Safe textstat import with pure-Python Flesch Reading Ease fallback
textstat = None
try:
    import textstat
except (ImportError, Exception):
    textstat = None

def _count_syllables(word):
    word = word.lower().strip(".:;?!\"'")
    if not word:
        return 0
    if len(word) <= 3:
        return 1
    count = len(re.findall(r'[aeiouy]+', word))
    if word.endswith('e') and not word.endswith('le') and count > 1:
        count -= 1
    return max(1, count)

def pure_flesch_reading_ease(text):
    words = re.findall(r'\b[a-zA-Z]+\b', text)
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    if not words or not sentences:
        return 60.0
    total_words = len(words)
    total_sentences = max(1, len(sentences))
    total_syllables = sum(_count_syllables(w) for w in words)
    score = 206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
    return max(0.0, min(100.0, score))

FILLER_WORDS = {
    'um', 'uh', 'like', 'basically', 'actually', 'you know',
    'sort of', 'kind of', 'maybe', 'i mean', 'right', 'honestly'
}

# --- Management SAR Markers ---
SITUATION_MARKERS = [
    'situation', 'context', 'when i was', 'we faced', 'the challenge was',
    'at my previous', 'project had', 'background', 'initial problem'
]
ACTION_MARKERS = [
    'i decided to', 'i implemented', 'i led', 'i coordinated', 'my strategy',
    'i initiated', 'we initiated', 'i organized', 'took the initiative', 'action i took',
    'i spoke with', 'i established', 'i developed', 'i created', 'i managed', 'i resolved'
]
RESULT_MARKERS = [
    'resulted in', 'outcome was', 'achieved', 'increased', 'decreased',
    'saved', 'delivered', 'improved by', '%', 'percent', 'on time', 'within budget'
]

# --- Law IRAC Markers ---
ISSUE_MARKERS = [
    'the issue is', 'the question is whether', 'at issue', 'the core controversy',
    'dispute centers on', 'threshold question'
]
RULE_MARKERS = [
    'under the rule', 'governing statute', 'regulation requires', 'pursuant to',
    'according to article', 'established precedent', 'the standard stipulates'
]
APPLICATION_MARKERS = [
    'applying this to', 'in this instance', 'here, the facts demonstrate',
    'under these circumstances', 'analysis shows', 'the evidence indicates'
]
CONCLUSION_MARKERS = [
    'in conclusion', 'therefore', 'accordingly', 'we conclude', 'consequently',
    'the recommended holding', 'the liability falls'
]

def tokenize_words(text):
    return re.findall(r'\b[a-zA-Z0-9_\-\.\%]+\b', text.lower())

def calculate_clarity(answer_text):
    """
    Calculates the clarity score based on readability, filler words, and sentence structure.
    """
    if not answer_text or not answer_text.strip():
        return 0.0, ["Your answer is empty."]

    suggestions = []
    text = answer_text.strip()
    words = tokenize_words(text)
    if not words:
        return 0.0, ["Answer contains no recognizable words."]

    # 1. Readability (Flesch Reading Ease calibrated for professional interviews)
    try:
        if textstat is not None:
            readability = textstat.flesch_reading_ease(text)
        else:
            readability = pure_flesch_reading_ease(text)
        if readability >= 50:
            readability_score = min(1.0, 0.85 + (readability - 50) * 0.003)
        elif readability >= 30:
            readability_score = 0.72 + (readability - 30) * 0.0065
        elif readability >= 10:
            readability_score = 0.55 + (readability - 10) * 0.0085
        else:
            readability_score = max(0.35, 0.45 + readability * 0.01)
    except Exception:
        readability_score = 0.75

    # 2. Filler words penalty
    filler_count = sum(1 for w in words if w in FILLER_WORDS)
    filler_penalty = min(0.35, (filler_count / len(words)) * 2.5) if words else 0

    if filler_count > 2:
        suggestions.append("Minimize conversational filler phrases (e.g. 'basically', 'like') to project authority.")

    # 3. Sentence Structure
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if sentences:
        avg_len = len(words) / len(sentences)
        if avg_len > 30:
            suggestions.append("Sentences are lengthy; break complex points into punchier statements.")
        elif avg_len < 6 and len(words) < 20:
            suggestions.append("Elaborate further with substantive context or metrics.")

    final_score = max(0.0, min(1.0, readability_score - filler_penalty))
    return round(final_score, 2), suggestions

def calculate_it_scoring(answer_text, expected_keywords):
    """
    IT Rubric: Keyword Match (45%), Concept Completeness (35%), Communication Clarity (20%).
    Emphasis: Code correctness, technical terms, system design.
    """
    words_text = answer_text.lower()
    matched_keywords = []
    missing_keywords = []

    for kw in (expected_keywords or []):
        kw_lower = kw.lower()
        if kw_lower in words_text:
            matched_keywords.append(kw)
        else:
            missing_keywords.append(kw)

    total_kw = len(expected_keywords) if expected_keywords else 1
    kw_ratio = len(matched_keywords) / total_kw
    kw_score = min(1.0, kw_ratio)

    # Concept completeness: proportional to length & keyword depth
    word_count = len(tokenize_words(answer_text))
    length_multiplier = min(1.0, word_count / 40)
    concept_score = min(1.0, (kw_score * 0.7 + length_multiplier * 0.3))

    clarity_score, clarity_suggestions = calculate_clarity(answer_text)

    # Weighting: 45% KW Precision, 35% Concept Depth, 20% Clarity
    overall = (kw_score * 0.45) + (concept_score * 0.35) + (clarity_score * 0.20)
    overall = round(max(0.0, min(1.0, overall)), 2)

    suggestions = []
    if missing_keywords:
        suggestions.append(f"Incorporate core technical terms: {', '.join(missing_keywords[:3])}.")
    if kw_score < 0.5:
        suggestions.append("Reference concrete implementation primitives, syntax, or architectural components.")
    suggestions.extend(clarity_suggestions)

    return {
        'field': 'it',
        'rubric_name': 'Code & Concept Precision',
        'overall_score': overall,
        'relevance_score': round(kw_score, 2),
        'clarity_score': clarity_score,
        'concept_score': round(concept_score, 2),
        'rubric_dimensions': {
            'keyword_precision': round(kw_score, 2),
            'concept_depth': round(concept_score, 2),
            'communication_clarity': clarity_score
        },
        'matched_keywords': matched_keywords,
        'missing_keywords': missing_keywords,
        'suggestions': suggestions[:3]
    }

def calculate_management_scoring(answer_text, expected_keywords):
    """
    Management Rubric: SAR Structure (40%), Communication Clarity (35%), Domain Relevance (25%).
    Emphasis: Situation framing, Action taken, Result quantified.
    """
    lower_text = answer_text.lower()

    # 1. SAR Framework Presence (Situation, Action, Result)
    has_situation = any(m in lower_text for m in SITUATION_MARKERS) or len(tokenize_words(lower_text)) > 30
    has_action = any(m in lower_text for m in ACTION_MARKERS)
    has_result = any(m in lower_text for m in RESULT_MARKERS)

    sar_components = [has_situation, has_action, has_result]
    sar_score = sum(1 for c in sar_components if c) / 3.0

    # 2. Clarity
    clarity_score, clarity_suggestions = calculate_clarity(answer_text)

    # 3. Domain Relevance
    matched_keywords = []
    missing_keywords = []
    for kw in (expected_keywords or []):
        if kw.lower() in lower_text:
            matched_keywords.append(kw)
        else:
            missing_keywords.append(kw)
    total_kw = len(expected_keywords) if expected_keywords else 1
    relevance_score = min(1.0, len(matched_keywords) / total_kw) if expected_keywords else 0.8

    # Weighting: 40% SAR, 35% Clarity, 25% Domain
    overall = (sar_score * 0.40) + (clarity_score * 0.35) + (relevance_score * 0.25)
    overall = round(max(0.0, min(1.0, overall)), 2)

    suggestions = []
    if not has_action:
        suggestions.append("Explicitly state your personal leadership action (e.g., 'I initiated...', 'I led...', 'I resolved...').")
    if not has_result:
        suggestions.append("Quantify the tangible business impact or metric achieved (e.g., '% improvement', 'delivered on schedule').")
    if not has_situation and len(tokenize_words(lower_text)) < 25:
        suggestions.append("Frame the context: clearly outline the initial business challenge or operational bottleneck.")
    if missing_keywords:
        suggestions.append(f"Consider addressing leadership themes: {', '.join(missing_keywords[:2])}.")
    suggestions.extend(clarity_suggestions)

    return {
        'field': 'management',
        'rubric_name': 'SAR Leadership & Situational Clarity',
        'overall_score': overall,
        'sar_score': round(sar_score, 2),
        'clarity_score': clarity_score,
        'relevance_score': round(relevance_score, 2),
        'sar_breakdown': {
            'has_situation': has_situation,
            'has_action': has_action,
            'has_result': has_result
        },
        'rubric_dimensions': {
            'sar_framework': round(sar_score, 2),
            'communication_clarity': clarity_score,
            'domain_leadership': round(relevance_score, 2)
        },
        'matched_keywords': matched_keywords,
        'missing_keywords': missing_keywords,
        'suggestions': suggestions[:3]
    }

def calculate_law_scoring(answer_text, expected_keywords):
    """
    Law Rubric: IRAC Structure (45%), Legal Terminology (35%), Precision & Brevity (20%).
    """
    lower_text = answer_text.lower()

    # 1. IRAC Structure
    has_issue = any(m in lower_text for m in ISSUE_MARKERS)
    has_rule = any(m in lower_text for m in RULE_MARKERS)
    has_app = any(m in lower_text for m in APPLICATION_MARKERS)
    has_concl = any(m in lower_text for m in CONCLUSION_MARKERS)

    irac_components = [has_issue, has_rule, has_app, has_concl]
    irac_score = (sum(1 for c in irac_components if c) / 4.0)
    # Give base credit if narrative is well-structured
    if irac_score == 0 and len(tokenize_words(lower_text)) > 40:
        irac_score = 0.5

    # 2. Legal Terminology
    matched_keywords = []
    missing_keywords = []
    for kw in (expected_keywords or []):
        if kw.lower() in lower_text:
            matched_keywords.append(kw)
        else:
            missing_keywords.append(kw)
    total_kw = len(expected_keywords) if expected_keywords else 1
    term_score = min(1.0, len(matched_keywords) / total_kw) if expected_keywords else 0.75

    # 3. Precision & Brevity
    words = tokenize_words(lower_text)
    clarity_score, clarity_suggestions = calculate_clarity(answer_text)
    # Penalize overly verbose (>120 words without structure)
    precision_score = clarity_score if len(words) <= 120 else max(0.4, clarity_score - 0.2)

    # Weighting: 45% IRAC, 35% Terminology, 20% Precision
    overall = (irac_score * 0.45) + (term_score * 0.35) + (precision_score * 0.20)
    overall = round(max(0.0, min(1.0, overall)), 2)

    suggestions = []
    if not has_rule and not has_app:
        suggestions.append("Apply the IRAC framework: explicitly cite the governing rule and apply it directly to facts.")
    if not has_concl:
        suggestions.append("State an explicit, unequivocal conclusion or risk recommendation.")
    if missing_keywords:
        suggestions.append(f"Incorporate statutory / contractual terms: {', '.join(missing_keywords[:2])}.")
    suggestions.extend(clarity_suggestions)

    return {
        'field': 'law',
        'overall_score': overall,
        'irac_score': round(irac_score, 2),
        'legal_terms_score': round(term_score, 2),
        'precision_score': round(precision_score, 2),
        'matched_keywords': matched_keywords,
        'missing_keywords': missing_keywords,
        'suggestions': suggestions[:3]
    }

def grade_mcq_answer(selected_option, correct_option, explanation=""):
    """
    Grades an MCQ question deterministically.
    """
    sel = (selected_option or '').strip().upper()
    corr = (correct_option or '').strip().upper()
    if isinstance(selected_option, dict):
        selected_option = selected_option.get('label') or selected_option.get('text') or ''
    elif isinstance(selected_option, int):
        # 0 -> 'A', 1 -> 'B', etc.
        selected_option = chr(65 + selected_option) if 0 <= selected_option < 26 else str(selected_option)

    if isinstance(correct_option, dict):
        correct_option = correct_option.get('label') or correct_option.get('text') or ''
    elif isinstance(correct_option, int):
        correct_option = chr(65 + correct_option) if 0 <= correct_option < 26 else str(correct_option)

    sel = (str(selected_option) if selected_option is not None else '').strip().upper()
    corr = (str(correct_option) if correct_option is not None else '').strip().upper()
    is_correct = (sel == corr) if (sel and corr) else False
    score = 1.0 if is_correct else 0.0

    return {
        'is_correct': is_correct,
        'score': score,
        'selected_option': sel,
        'correct_option': corr,
        'explanation': explanation or ("Selected answer matches correct option." if is_correct else f"The correct option is {corr}.")
    }

def evaluate_answer_by_field(field_name, answer_text, expected_keywords):
    """
    Evaluates an answer text according to the specific career field's rubric.
    """
    field = (field_name or 'it').strip().lower()
    if field == 'management':
        return calculate_management_scoring(answer_text, expected_keywords)
    elif field == 'law':
        return calculate_law_scoring(answer_text, expected_keywords)
    else:
        return calculate_it_scoring(answer_text, expected_keywords)

def get_scoring_feedback(answer_text, expected_keywords, field='it'):
    """
    Backward-compatible alias for evaluate_answer_by_field.
    """
    return evaluate_answer_by_field(field, answer_text, expected_keywords)

