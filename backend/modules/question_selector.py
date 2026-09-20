import random
from bson import ObjectId
from backend.mongo_db import get_questions_col
from backend.models import Question as SQLQuestion

def select_questions(field='it', role=None, resume_skills=None, limit=10, include_mcq=True):
    """
    Selects a tailored, field-aware question set from MongoDB with SQL fallback.
    
    Supports:
    - Field-awareness: IT (code/concept), Management (SAR leadership/clarity), Law (IRAC).
    - Role specification (e.g. 'Frontend Developer', 'Product Manager').
    - Skill tailoring: prioritizes questions matching candidate resume skills.
    - Question type balance: mixes concept check MCQs and situational long answers.
    - Full backward compatibility with v1 signature: select_questions(role, resume_skills).
    """
    # 1. Handle legacy signature: select_questions(role, resume_skills)
    if isinstance(role, list) and isinstance(field, str) and field.lower() not in ('it', 'management', 'law'):
        legacy_role = field
        resume_skills = role
        role = legacy_role
        field = 'management' if any(m in legacy_role.lower() for m in ['product', 'manager', 'lead', 'operations']) else 'it'

    field = (field or 'it').strip().lower()
    norm_skills = {str(s).strip().lower() for s in (resume_skills or []) if s}

    # 2. Query MongoDB 'questions' collection
    q_col = get_questions_col()
    raw_candidates = []

    try:
        # Match field and optionally role
        if role:
            cursor = list(q_col.find({'field': field, 'role': role}))
            if not cursor:
                cursor = list(q_col.find({'field': field}))
        else:
            cursor = list(q_col.find({'field': field}))
        raw_candidates = list(cursor)
    except Exception:
        raw_candidates = []

    # 3. Fallback to relational SQL database if Mongo empty
    if not raw_candidates:
        try:
            sql_qs = []
            if role:
                sql_qs = SQLQuestion.query.filter_by(role=role).all()
            if not sql_qs:
                sql_qs = SQLQuestion.query.all()

            for sq in sql_qs:
                raw_candidates.append({
                    '_id': str(sq.id),
                    'field': field,
                    'role': getattr(sq, 'role', role or 'General'),
                    'skill_tag': getattr(sq, 'skill_tag', ''),
                    'question_type': 'long_answer',
                    'focus_dimension': 'Technical Concepts' if field == 'it' else 'Leadership Scenarios',
                    'question_text': sq.question_text,
                    'expected_keywords': sq.expected_keywords or []
                })
        except Exception:
            pass

    if not raw_candidates:
        return []

    # 4. Partition by question type
    mcq_pool = [q for q in raw_candidates if q.get('question_type') == 'mcq']
    long_pool = [q for q in raw_candidates if q.get('question_type') != 'mcq']

    # Skill matching score helper
    def skill_match_score(q_doc):
        q_skill = str(q_doc.get('skill_tag') or '').strip().lower()
        return 1 if (q_skill and q_skill in norm_skills) else 0

    # Sort each pool with skill-matched questions first
    mcq_pool.sort(key=skill_match_score, reverse=True)
    long_pool.sort(key=skill_match_score, reverse=True)

    # 5. Balance MCQs and Long Answer
    selected = []
    if include_mcq and mcq_pool:
        # Aim for 2-4 MCQs depending on pool availability and limit
        desired_mcqs = min(len(mcq_pool), max(1, limit // 3))
        selected.extend(mcq_pool[:desired_mcqs])

    remaining_slots = limit - len(selected)
    selected.extend(long_pool[:remaining_slots])

    # If still below limit and mcq_pool has extras
    if len(selected) < limit and len(mcq_pool) > len([q for q in selected if q.get('question_type') == 'mcq']):
        extras = [q for q in mcq_pool if q not in selected]
        selected.extend(extras[:limit - len(selected)])

    # Format return structure
    formatted = []
    for doc in selected:
        q_id = str(doc.get('_id'))
        formatted.append({
            'id': q_id,
            'field': doc.get('field', field),
            'role': doc.get('role', role or 'General'),
            'skill_tag': doc.get('skill_tag', ''),
            'question_type': doc.get('question_type', 'long_answer'),
            'focus_dimension': doc.get('focus_dimension', ''),
            'question_text': doc.get('question_text', ''),
            'options': doc.get('options', []),
            'expected_keywords': doc.get('expected_keywords', []),
            'follow_ups': doc.get('follow_ups', {})
        })

    return formatted
