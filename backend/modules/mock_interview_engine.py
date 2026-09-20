from datetime import datetime
from bson import ObjectId
from backend.mongo_db import get_transcripts_col, get_questions_col

PERSONAS = {
    'it': {
        'title': 'Senior Technical Lead',
        'name': 'Marcus Vance',
        'affiliation': 'Principal Systems Architect · Core Platform',
        'opening': "Welcome. We'll be walking through a sequence of technical examinations and architecture trade-offs. Be explicit about system constraints and your rationale.",
        'praise_remark': "A well-formulated technical explanation. Let's push further on how this behaves under adverse production conditions.",
        'nudge_remark': "You touched upon the baseline concept, but let's break down the underlying mechanics more rigorously.",
        'wrap_up': "Thank you. That concludes the technical oral examination. Your responses have been archived into the evaluation docket."
    },
    'management': {
        'title': 'Hiring Partner & VP',
        'name': 'Eleanor Hayes',
        'affiliation': 'Vice President of Product & Operations',
        'opening': "Good day. Today we will evaluate your decision-making framework, stakeholder alignment, and how you drive measurable business impact. Structure your examples with clear context and quantitative outcomes.",
        'praise_remark': "Clear ownership and tangible impact demonstrated. Let's explore how you navigate friction when organizational constraints tighten.",
        'nudge_remark': "I see the direction, but let's focus on your personal leadership interventions and the verifiable metrics achieved.",
        'wrap_up': "Thank you. Your leadership examples have been recorded in the executive evaluation dossier."
    },
    'law': {
        'title': 'Managing Partner',
        'name': 'Julian Sterling',
        'affiliation': 'Senior Regulatory & Corporate Counsel',
        'opening': "Welcome to the legal competency audit. We will review statutory interpretations, contractual liabilities, and risk governance protocols. Adhere strictly to analytical precision.",
        'praise_remark': "Sound legal synthesis. Let's test the enforceability of that principle when jurisdictional conflict arises.",
        'nudge_remark': "The threshold premise is noted, but ensure your analysis clearly connects the governing legal rule to the factual record.",
        'wrap_up': "Thank you. The regulatory audit examination is concluded and documented."
    }
}

def get_interviewer_persona(field='it'):
    field_key = (field or 'it').strip().lower()
    return PERSONAS.get(field_key, PERSONAS['it'])

def get_next_mock_turn(field, current_score, follow_up_rules=None):
    """
    Determines interviewer remark and whether a branching follow-up question is triggered.
    """
    persona = get_interviewer_persona(field)

    if current_score >= 0.60:
        remark = persona['praise_remark']
        branch_type = 'challenging'
        branch_q = (follow_up_rules or {}).get('if_score_above_60')
    else:
        remark = persona['nudge_remark']
        branch_type = 'clarifying'
        branch_q = (follow_up_rules or {}).get('if_score_below_60')

    return {
        'persona': persona,
        'interviewer_remark': remark,
        'branch_type': branch_type,
        'branch_question': branch_q
    }

def record_transcript_turn(session_id, turn_data):
    """
    Appends a turn to the session transcript in MongoDB.
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
        'score': turn_data.get('score', 0.0),
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
        return str(doc['_id'])
    else:
        res = col.insert_one({
            'session_id': session_id,
            'field': turn_data.get('field', 'it'),
            'role': turn_data.get('role', ''),
            'turns': [turn_record],
            'created_at': datetime.utcnow().isoformat(),
            'last_updated': datetime.utcnow().isoformat()
        })
        return str(res.inserted_id)

def get_session_transcript(session_id):
    col = get_transcripts_col()
    doc = col.find_one({'session_id': session_id})
    if not doc:
        return None
    doc['id'] = str(doc.pop('_id'))
    return doc

