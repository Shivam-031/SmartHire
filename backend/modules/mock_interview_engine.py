from datetime import datetime
from bson import ObjectId
from backend.mongo_db import get_transcripts_col, get_questions_col
from backend.models import db, InterviewSession

PERSONAS = {
    'it': {
        'title': 'Senior Technical Lead',
        'name': 'Marcus Vance',
        'affiliation': 'Principal Systems Architect · Core Platform',
        'opening': "Welcome. We'll be walking through a sequence of technical examinations and architecture trade-offs. Be explicit about system constraints and your rationale.",
        'remarks': {
            'high': "Outstanding architectural precision. Let's see how this design behaves under high concurrency, fault isolation, and extreme load.",
            'mid': "Solid foundational explanation. Let's dig deeper into the concrete implementation trade-offs and underlying mechanics.",
            'low': "You touched upon the baseline concept, but let's break down the core mechanics and implementation primitives more rigorously."
        },
        'praise_remark': "Outstanding architectural precision. Let's explore how this scales under adverse production constraints.",
        'nudge_remark': "You touched upon the baseline concept, but let's break down the underlying mechanics more rigorously.",
        'wrap_up': "Thank you. That concludes the technical oral examination. Your responses have been archived into the evaluation docket."
    },
    'management': {
        'title': 'Hiring Partner & VP',
        'name': 'Eleanor Hayes',
        'affiliation': 'Vice President of Product & Operations',
        'opening': "Good day. Today we will evaluate your decision-making framework, stakeholder alignment, and how you drive measurable business impact. Structure your examples with clear context and quantitative outcomes.",
        'remarks': {
            'high': "Compelling executive clarity and verifiable ownership. Let's test how you navigate friction when organizational and budgetary constraints tighten.",
            'mid': "Good situational framing. Let's focus specifically on your personal leadership interventions and measurable trade-offs.",
            'low': "I see the general direction, but let's sharpen your answer around your personal actions and verifiable business metrics."
        },
        'praise_remark': "Compelling executive clarity and verifiable ownership. Let's test how you navigate friction when organizational constraints tighten.",
        'nudge_remark': "I see the general direction, but let's focus on your personal leadership interventions and verifiable metrics.",
        'wrap_up': "Thank you. Your leadership examples have been recorded in the executive evaluation dossier."
    },
    'law': {
        'title': 'Managing Partner',
        'name': 'Julian Sterling',
        'affiliation': 'Senior Regulatory & Corporate Counsel',
        'opening': "Welcome to the legal competency audit. We will review statutory interpretations, contractual liabilities, and risk governance protocols. Adhere strictly to analytical precision.",
        'remarks': {
            'high': "Impeccable statutory synthesis. Let's test the enforceability of that principle when jurisdictional conflicts and regulatory counterclaims arise.",
            'mid': "Sound legal premise. Let's examine how this principle applies to more ambiguous or contentious factual records.",
            'low': "The threshold premise is noted, but ensure your analysis explicitly links the governing rule to the factual record."
        },
        'praise_remark': "Impeccable statutory synthesis. Let's test the enforceability of that principle when jurisdictional conflict arises.",
        'nudge_remark': "The threshold premise is noted, but ensure your analysis clearly connects the governing legal rule to the factual record.",
        'wrap_up': "Thank you. The regulatory audit examination is concluded and documented."
    }
}

def get_interviewer_persona(field='it'):
    field_key = (field or 'it').strip().lower()
    return PERSONAS.get(field_key, PERSONAS['it'])

def get_canned_remark(field, score):
    """
    Selects a score-banded canned interviewer remark based on response quality.
    Score bands:
      - High: score >= 0.80
      - Mid:  0.50 <= score < 0.80
      - Low:  score < 0.50
    """
    persona = get_interviewer_persona(field)
    remarks = persona.get('remarks', {})
    
    if score >= 0.80:
        return remarks.get('high', persona.get('praise_remark', ''))
    elif score >= 0.50:
        return remarks.get('mid', persona.get('praise_remark', ''))
    else:
        return remarks.get('low', persona.get('nudge_remark', ''))

def get_next_mock_turn(field, current_score, follow_up_rules=None):
    """
    Determines canned interviewer remark and whether a score-threshold branching
    follow-up question is triggered.
    
    Threshold:
      - score >= 0.60: routes to 'challenging' branch (if_score_above_60 / if_score_above)
      - score <  0.60: routes to 'clarifying' branch (if_score_below_60 / if_score_below)
    """
    persona = get_interviewer_persona(field)
    remark = get_canned_remark(field, current_score)

    branch_type = 'challenging' if current_score >= 0.60 else 'clarifying'
    branch_q = None

    if isinstance(follow_up_rules, dict):
        if branch_type == 'challenging':
            branch_q = (
                follow_up_rules.get('if_score_above_60') or
                follow_up_rules.get('if_score_above') or
                follow_up_rules.get('challenging')
            )
        else:
            branch_q = (
                follow_up_rules.get('if_score_below_60') or
                follow_up_rules.get('if_score_below') or
                follow_up_rules.get('clarifying')
            )
    elif isinstance(follow_up_rules, list):
        for rule in follow_up_rules:
            trigger = rule.get('trigger', '')
            threshold = float(rule.get('threshold', 60))
            score_pct = current_score * 100.0
            if branch_type == 'challenging' and trigger == 'if_score_above' and score_pct >= threshold:
                branch_q = rule
                break
            elif branch_type == 'clarifying' and trigger == 'if_score_below' and score_pct < threshold:
                branch_q = rule
                break

    # Format branch question into standard format if found
    formatted_branch = None
    if branch_q:
        formatted_branch = {
            'question_text': branch_q.get('question_text', ''),
            'expected_keywords': branch_q.get('expected_keywords', []),
            'focus_dimension': 'Advanced Architectural Trade-offs' if branch_type == 'challenging' else 'Clarifying Core Fundamentals',
            'branch_type': branch_type
        }

    return {
        'persona': persona,
        'interviewer_remark': remark,
        'branch_type': branch_type,
        'branch_question': formatted_branch
    }

def evaluate_ai_mock_turn(field, role, question_text, candidate_answer, expected_keywords=None, follow_up_rules=None):
    """
    Evaluates candidate's verbal/written answer using the AI agent (Groq/Gemini/Fallback)
    and produces an oral spoken remark, structured rubric score, and adaptive follow-up.
    """
    from backend.modules.ai_agent import evaluate_candidate_answer
    persona = get_interviewer_persona(field)
    ai_result = evaluate_candidate_answer(
        field=field,
        role=role,
        question_text=question_text,
        candidate_answer=candidate_answer,
        expected_keywords=expected_keywords
    )

    branch_type = ai_result.get('branch_type', 'challenging' if ai_result.get('overall_score', 0.5) >= 0.60 else 'clarifying')

    # Construct dynamic follow-up probe
    branch_q = None
    if ai_result.get('follow_up_question'):
        branch_q = {
            'question_text': ai_result['follow_up_question'],
            'expected_keywords': ai_result.get('matched_keywords', []),
            'focus_dimension': 'AI Adaptive Follow-Up Probe' if branch_type == 'challenging' else 'Clarifying Core Fundamentals',
            'branch_type': branch_type
        }
    else:
        canned_turn = get_next_mock_turn(field, ai_result.get('overall_score', 0.5), follow_up_rules)
        branch_q = canned_turn.get('branch_question')

    return {
        'persona': persona,
        'interviewer_remark': ai_result.get('interviewer_remark', ''),
        'score': ai_result.get('overall_score', 0.5),
        'overall_score': ai_result.get('overall_score', 0.5),
        'relevance_score': ai_result.get('relevance_score', 0.5),
        'clarity_score': ai_result.get('clarity_score', 0.5),
        'technical_depth': ai_result.get('technical_depth', 0.5),
        'strengths': ai_result.get('strengths', []),
        'improvements': ai_result.get('improvements', []),
        'suggestions': ai_result.get('suggestions', []),
        'matched_keywords': ai_result.get('matched_keywords', []),
        'missing_keywords': ai_result.get('missing_keywords', []),
        'branch_type': branch_type,
        'branch_question': branch_q,
        'model_used': ai_result.get('model_used', 'AI Examiner')
    }

def init_mock_transcript(session_id, field='it', role='', persona_name=''):
    """
    Initializes a new transcript document in MongoDB and links it to SQLite InterviewSession.
    """
    col = get_transcripts_col()
    existing = col.find_one({'session_id': session_id})
    if existing:
        t_id = str(existing['_id'])
    else:
        persona_obj = get_interviewer_persona(field)
        res = col.insert_one({
            'session_id': session_id,
            'field': field,
            'role': role,
            'persona_name': persona_name,
            'persona_name': persona_name or persona_obj.get('name'),
            'persona': persona_obj,
            'turns': [],
            'created_at': datetime.utcnow().isoformat(),
            'last_updated': datetime.utcnow().isoformat()
        })
        t_id = str(res.inserted_id)

    # Cross-DB link: update SQLite session.mongo_transcript_id
    try:
        session = InterviewSession.query.get(session_id)
        if session and not session.mongo_transcript_id:
            session.mongo_transcript_id = t_id
            db.session.commit()
    except Exception:
        pass

    return t_id

def record_transcript_turn(session_id, turn_data):
    """
    Appends an ordered turn to the session transcript in MongoDB.
    Also ensures the SQL InterviewSession references the transcript ID.
    """
    col = get_transcripts_col()
    turn_record = {
        'turn_index': turn_data.get('turn_index', 1),
        'question_id': str(turn_data.get('question_id', '')),
        'question_text': turn_data.get('question_text', ''),
        'question_type': turn_data.get('question_type', 'long_answer'),
        'interviewer_remark': turn_data.get('interviewer_remark', ''),
        'user_answer': turn_data.get('user_answer', ''),
        'selected_option': turn_data.get('selected_option'),
        'score': round(float(turn_data.get('score', 0.0)), 2),
        'suggestions': turn_data.get('suggestions', []),
        'timestamp': datetime.utcnow().isoformat()
    }

    doc = col.find_one({'session_id': session_id})
    if doc:
        col.update_one(
            {'session_id': session_id},
            {
                '$push': {'turns': turn_record},
                '$set': {'last_updated': datetime.utcnow().isoformat()}
            }
        )
        t_id = str(doc['_id'])
    else:
        res = col.insert_one({
            'session_id': session_id,
            'field': turn_data.get('field', 'it'),
            'role': turn_data.get('role', ''),
            'turns': [turn_record],
            'created_at': datetime.utcnow().isoformat(),
            'last_updated': datetime.utcnow().isoformat()
        })
        t_id = str(res.inserted_id)

    # Ensure SQL session has cross-DB reference
    try:
        session = InterviewSession.query.get(session_id)
        if session and not session.mongo_transcript_id:
            session.mongo_transcript_id = t_id
            db.session.commit()
    except Exception:
        pass

    return t_id

def get_session_transcript(session_id):
    """
    Retrieves full transcript document from MongoDB.
    """
    col = get_transcripts_col()
    doc = col.find_one({'session_id': session_id})
    if not doc:
        return None
    doc['id'] = str(doc.pop('_id'))
    return doc
