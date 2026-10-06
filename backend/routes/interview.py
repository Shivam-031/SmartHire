from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from backend.models import db, User, Resume, InterviewSession, Question, Answer
from backend.mongo_db import get_questions_col, get_transcripts_col, get_resumes_col
from backend.modules.scoring_engine import evaluate_answer_by_field, grade_mcq_answer
from backend.modules.question_selector import select_questions
from backend.modules.mock_interview_engine import (
    get_interviewer_persona, get_next_mock_turn,
    record_transcript_turn, get_session_transcript,
    init_mock_transcript, evaluate_ai_mock_turn
)
from backend.modules.auth import require_auth, optional_auth

interview_bp = Blueprint('interview', __name__)

@interview_bp.route('/questions', methods=['GET'])
def get_questions():
    field = (request.args.get('field') or '').strip().lower()
    role = (request.args.get('role') or '').strip()
    q_type = (request.args.get('type') or '').strip().lower()

    query = {}
    if field:
        query['field'] = field
    if role:
        query['role'] = role
    if q_type:
        query['question_type'] = q_type

    q_col = get_questions_col()
    cursor = list(q_col.find(query))

    questions = []
    for doc in cursor:
        questions.append({
            'id': str(doc.get('_id')),
            'field': doc.get('field'),
            'role': doc.get('role'),
            'skill_tag': doc.get('skill_tag'),
            'question_type': doc.get('question_type'),
            'focus_dimension': doc.get('focus_dimension'),
            'question_text': doc.get('question_text'),
            'options': doc.get('options', []),
            'expected_keywords': doc.get('expected_keywords', []),
            'follow_ups': doc.get('follow_ups', {})
        })
    return jsonify({
        'count': len(questions),
        'questions': questions
    }), 200

@interview_bp.route('/start', methods=['POST'])
@require_auth
def start_interview():
    data = request.get_json() or {}
    user = g.current_user
    user_id = user.id
    field = (data.get('field') or user.target_field or 'it').strip().lower()
    role = (data.get('role') or user.target_role or 'Frontend Developer').strip()
    mode = (data.get('mode') or 'standard').strip().lower()
    resume_id = data.get('resume_id')
    mongo_resume_id = data.get('mongo_resume_id')

    try:
        if resume_id:
            resume_id = int(resume_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid resume_id format."}), 400

    # 1. Create Interview Session in SQL
    session = InterviewSession(
        user_id=user_id,
        resume_id=resume_id,
        mongo_resume_id=str(mongo_resume_id) if mongo_resume_id else None,
        field=field,
        role=role,
        mode=mode
    )
    db.session.add(session)
    db.session.commit()

    # 2. Extract skills from linked resume if available
    extracted_skills = []
    if resume_id:
        sql_res = Resume.query.get(resume_id)
        if sql_res and sql_res.extracted_skills:
            extracted_skills = sql_res.extracted_skills
    elif mongo_resume_id:
        col = get_resumes_col()
        try:
            m_res = col.find_one({'_id': ObjectId(mongo_resume_id)})
        except Exception:
            m_res = col.find_one({'_id': mongo_resume_id})
        if m_res:
            for sk_item in m_res.get('skills', []):
                if isinstance(sk_item, str):
                    extracted_skills.append(sk_item)
                elif isinstance(sk_item, dict):
                    items = sk_item.get('items', [])
                    if isinstance(items, list):
                        extracted_skills.extend(items)
                    elif isinstance(items, str):
                        extracted_skills.append(items)

    # 3. Select Questions using field-aware Question Selector
    formatted_questions = select_questions(
        field=field,
        role=role,
        resume_skills=extracted_skills,
        limit=10,
        include_mcq=True
    )

    persona = get_interviewer_persona(field)

    transcript_id = None
    if mode == 'mock':
        transcript_id = init_mock_transcript(session.id, field=field, role=role, persona_name=persona['name'])

    return jsonify({
        'session_id': session.id,
        'field': field,
        'role': role,
        'mode': mode,
        'mongo_transcript_id': transcript_id or session.mongo_transcript_id,
        'persona': persona,
        'interviewer_opening': persona.get('opening', ''),
        'questions': formatted_questions
    }), 201

@interview_bp.route('/submit-mcq', methods=['POST'])
@interview_bp.route('/mcq/answer', methods=['POST'])
@require_auth
def submit_mcq():
    data = request.get_json() or {}
    session_id = data.get('session_id')
    question_id = str(data.get('question_id', ''))
    selected_option = data.get('selected_option', '')

    if not session_id or not question_id or not selected_option:
        return jsonify({"error": "Missing required fields: session_id, question_id, and selected_option"}), 400

    session = InterviewSession.query.get(session_id)
    if not session:
        return jsonify({"error": "Interview session not found."}), 404

    # Lookup question in MongoDB
    q_col = get_questions_col()
    doc = None
    try:
        doc = q_col.find_one({'_id': ObjectId(question_id)})
    except Exception:
        doc = q_col.find_one({'_id': question_id})

    correct_option = 'A'
    explanation = ''
    question_text = ''
    if doc:
        correct_option = doc.get('correct_option', 'A')
        explanation = doc.get('explanation', '')
        question_text = doc.get('question_text', '')

    result = grade_mcq_answer(selected_option, correct_option, explanation)

    # Resolve SQL question_id placeholder for SQLite backward-compatibility
    sql_qid = None
    try:
        cand_id = int(question_id)
        if Question.query.get(cand_id):
            sql_qid = cand_id
    except Exception:
        pass
    if sql_qid is None:
        first_q = Question.query.first()
        sql_qid = first_q.id if first_q else 1

    # Save to SQL Answer table
    answer = Answer(
        session_id=session.id,
        question_id=sql_qid,
        mongo_question_id=str(question_id),
        question_type='mcq',
        answer_text=f"Option {selected_option.upper()}",
        selected_option=selected_option.upper(),
        is_correct=result['is_correct'],
        relevance_score=result['score'],
        clarity_score=1.0 if result['is_correct'] else 0.0
    )
    db.session.add(answer)
    db.session.commit()


    # Log to Mongo transcript if mock mode
    if session.mode == 'mock':
        turn_data = {
            'turn_index': Answer.query.filter_by(session_id=session.id).count(),
            'question_id': question_id,
            'question_text': question_text,
            'question_type': 'mcq',
            'interviewer_remark': f"Option {selected_option.upper()} selected.",
            'selected_option': selected_option.upper(),
            'score': result['score'],
            'suggestions': [explanation] if explanation else [],
            'field': session.field,
            'role': session.role
        }
        record_transcript_turn(session.id, turn_data)

    return jsonify(result), 200

@interview_bp.route('/answer', methods=['POST'])
@require_auth
def submit_answer():
    data = request.get_json() or {}
    if data.get('selected_option'):
        return submit_mcq()
    session_id = data.get('session_id')
    question_id = str(data.get('question_id', ''))
    answer_text = data.get('answer_text', '')
    field_override = data.get('field')

    if not all([session_id, question_id, answer_text]):
        return jsonify({"error": "Missing required fields: session_id, question_id, and answer_text"}), 400

    try:
        session_id = int(session_id)
    except ValueError:
        return jsonify({"error": "Invalid session_id"}), 400

    session = InterviewSession.query.get(session_id)
    if not session:
        return jsonify({"error": "Interview session not found"}), 404

    # Fetch expected keywords & question text
    expected_keywords = []
    question_text = ''
    q_col = get_questions_col()
    doc = None
    try:
        doc = q_col.find_one({'_id': ObjectId(question_id)})
    except Exception:
        doc = q_col.find_one({'_id': question_id})

    if doc:
        expected_keywords = doc.get('expected_keywords', [])
        question_text = doc.get('question_text', '')
    else:
        # Check SQL questions
        try:
            sql_q = Question.query.get(int(question_id))
            if sql_q:
                expected_keywords = sql_q.expected_keywords or []
                question_text = sql_q.question_text
        except Exception:
            pass

    field = field_override or session.field or 'it'
    
    # Check if session is mock interview
    if session.mode == 'mock':
        ai_turn = evaluate_ai_mock_turn(
            field=field,
            role=session.role or 'Software Engineer',
            question_text=question_text,
            candidate_answer=answer_text,
            expected_keywords=expected_keywords
        )
        overall = ai_turn['overall_score']
        relevance = ai_turn['relevance_score']
        clarity = ai_turn['clarity_score']
        interviewer_remark = ai_turn['interviewer_remark']
        branch_type = ai_turn.get('branch_type', 'challenging')
        branch_question = ai_turn.get('branch_question')
        strengths = ai_turn.get('strengths', [])
        improvements = ai_turn.get('improvements', [])
        suggestions = ai_turn.get('suggestions', [])
        matched_kws = ai_turn.get('matched_keywords', [])
        missing_kws = ai_turn.get('missing_keywords', [])
        model_used = ai_turn.get('model_used', 'AI Examiner')
    else:
        scoring_result = evaluate_answer_by_field(field, answer_text, expected_keywords)
        relevance = scoring_result.get('relevance_score', 0.5)
        clarity = scoring_result.get('clarity_score', 0.5)
        overall = scoring_result.get('overall_score', (relevance + clarity) / 2)
        interviewer_remark = ""
        branch_type = None
        branch_question = None
        strengths = []
        improvements = []
        suggestions = scoring_result.get('suggestions', [])
        matched_kws = scoring_result.get('matched_keywords', [])
        missing_kws = scoring_result.get('missing_keywords', [])
        model_used = 'Standard Rubric Engine'

    # Resolve SQL question_id placeholder for SQLite backward-compatibility
    sql_qid = None
    try:
        cand_id = int(question_id)
        if Question.query.get(cand_id):
            sql_qid = cand_id
    except Exception:
        pass
    if sql_qid is None:
        first_q = Question.query.first()
        sql_qid = first_q.id if first_q else 1

    # Save to SQL
    answer = Answer(
        session_id=session.id,
        question_id=sql_qid,
        mongo_question_id=str(question_id),
        question_type='long_answer',
        answer_text=answer_text,
        relevance_score=relevance,
        clarity_score=clarity
    )
    db.session.add(answer)
    db.session.commit()

    # Log to transcript if mock mode
    if session.mode == 'mock':
        turn_data = {
            'turn_index': Answer.query.filter_by(session_id=session.id).count(),
            'question_id': question_id,
            'question_text': question_text,
            'question_type': 'long_answer',
            'interviewer_remark': interviewer_remark,
            'user_answer': answer_text,
            'score': overall,
            'suggestions': suggestions,
            'strengths': strengths,
            'improvements': improvements,
            'field': session.field,
            'role': session.role
        }
        record_transcript_turn(session.id, turn_data)

    return jsonify({
        'field': field,
        'overall_score': overall,
        'score': overall,
        'relevance_score': relevance,
        'clarity_score': clarity,
        'interviewer_remark': interviewer_remark,
        'branch_type': branch_type,
        'branch_question': branch_question,
        'next_question': branch_question,
        'strengths': strengths,
        'improvements': improvements,
        'suggestions': suggestions,
        'matched_keywords': matched_kws,
        'missing_keywords': missing_kws,
        'model_used': model_used
    }), 201

@interview_bp.route('/mock/start', methods=['POST'])
@require_auth
def start_mock_interview():
    """
    Build Spec 3.5 & Section 6: Start a Mock Interview session (mode = 'mock').
    """
    data = request.get_json() or {}
    data['mode'] = 'mock'
    return start_interview()

@interview_bp.route('/mock/answer', methods=['POST'])
@require_auth
def submit_mock_answer():
    """
    Build Spec 3.5 & Section 6: Submit an answer; returns AI score, verbal spoken remark, and adaptive next challenge.
    """
    data = request.get_json() or {}
    session_id = data.get('session_id')
    question_id = str(data.get('question_id', ''))
    answer_text = data.get('answer_text', '')
    field_override = data.get('field')

    if not all([session_id, question_id, answer_text]):
        return jsonify({"error": "Missing required fields: session_id, question_id, and answer_text"}), 400

    try:
        session_id = int(session_id)
    except ValueError:
        return jsonify({"error": "Invalid session_id"}), 400

    session = InterviewSession.query.get(session_id)
    if not session:
        return jsonify({"error": "Interview session not found"}), 404

    # 1. Fetch expected keywords & follow-ups from MongoDB (or SQL)
    expected_keywords = []
    question_text = ''
    follow_up_rules = {}
    q_col = get_questions_col()
    doc = None
    try:
        doc = q_col.find_one({'_id': ObjectId(question_id)})
    except Exception:
        doc = q_col.find_one({'_id': question_id})

    if doc:
        expected_keywords = doc.get('expected_keywords', [])
        question_text = doc.get('question_text', '')
        follow_up_rules = doc.get('follow_ups', {})
    else:
        try:
            sql_q = Question.query.get(int(question_id))
            if sql_q:
                expected_keywords = sql_q.expected_keywords or []
                question_text = sql_q.question_text
        except Exception:
            pass

    field = field_override or session.field or 'it'
    
    # 2. Evaluate with AI Agent (Groq / Gemini / Smart Fallback)
    ai_turn = evaluate_ai_mock_turn(
        field=field,
        role=session.role or 'Software Engineer',
        question_text=question_text,
        candidate_answer=answer_text,
        expected_keywords=expected_keywords,
        follow_up_rules=follow_up_rules
    )
    overall = ai_turn['overall_score']
    relevance = ai_turn['relevance_score']
    clarity = ai_turn['clarity_score']
    interviewer_remark = ai_turn['interviewer_remark']

    # 3. Save to SQL Answer table
    sql_qid = None
    try:
        cand_id = int(question_id)
        if Question.query.get(cand_id):
            sql_qid = cand_id
    except Exception:
        pass
    if sql_qid is None:
        first_q = Question.query.first()
        sql_qid = first_q.id if first_q else 1

    answer = Answer(
        session_id=session.id,
        question_id=sql_qid,
        mongo_question_id=str(question_id),
        question_type='long_answer',
        answer_text=answer_text,
        relevance_score=relevance,
        clarity_score=clarity
    )
    db.session.add(answer)
    db.session.commit()

    # 4. Record turn to MongoDB transcript
    turn_data = {
        'turn_index': Answer.query.filter_by(session_id=session.id).count(),
        'question_id': question_id,
        'question_text': question_text,
        'question_type': 'long_answer',
        'interviewer_remark': interviewer_remark,
        'user_answer': answer_text,
        'score': overall,
        'suggestions': ai_turn.get('suggestions', []),
        'strengths': ai_turn.get('strengths', []),
        'improvements': ai_turn.get('improvements', []),
        'field': field,
        'role': session.role
    }
    record_transcript_turn(session.id, turn_data)

    return jsonify({
        'session_id': session.id,
        'score': overall,
        'overall_score': overall,
        'relevance_score': relevance,
        'clarity_score': clarity,
        'interviewer_remark': interviewer_remark,
        'branch_type': ai_turn.get('branch_type'),
        'branch_question': ai_turn.get('branch_question'),
        'next_question': ai_turn.get('branch_question'),
        'strengths': ai_turn.get('strengths', []),
        'improvements': ai_turn.get('improvements', []),
        'suggestions': ai_turn.get('suggestions', []),
        'matched_keywords': ai_turn.get('matched_keywords', []),
        'missing_keywords': ai_turn.get('missing_keywords', []),
        'model_used': ai_turn.get('model_used', 'AI Examiner')
    }), 200

@interview_bp.route('/mock/turn', methods=['POST'])
def mock_interview_turn():
    """
    Evaluates answer quality and returns canned interviewer remark + branching follow-up.
    """
    data = request.get_json() or {}
    session_id = data.get('session_id')
    current_score = float(data.get('score', 0.5))
    follow_up_rules = data.get('follow_up_rules') or {}

    session = InterviewSession.query.get(session_id)
    field = session.field if session else 'it'

    mock_turn = get_next_mock_turn(field, current_score, follow_up_rules)
    return jsonify(mock_turn), 200

@interview_bp.route('/transcript/<int:session_id>', methods=['GET'])
@interview_bp.route('/transcript/<session_id>', methods=['GET'])
def get_transcript(session_id):
    try:
        sid = int(session_id)
    except Exception:
        sid = session_id
    transcript = get_session_transcript(sid)
    if not transcript:
        return jsonify({'session_id': sid, 'turns': []}), 200
    return jsonify(transcript), 200

@interview_bp.route('/complete', methods=['POST'])
@interview_bp.route('/end', methods=['POST'])
@require_auth
def complete_interview():
    data = request.get_json() or {}
    session_id = data.get('session_id')
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    try:
        session_id = int(session_id)
    except ValueError:
        return jsonify({"error": "Invalid session_id"}), 400

    session = InterviewSession.query.get(session_id)
    if not session:
        return jsonify({"error": "Interview session not found"}), 404

    answers = Answer.query.filter_by(session_id=session_id).all()
    if not answers:
        return jsonify({"error": "No answers recorded for this session"}), 400

    total_sum = 0
    for ans in answers:
        if ans.question_type == 'mcq':
            total_sum += (ans.relevance_score or 0.0)
        else:
            rel = ans.relevance_score or 0.0
            cla = ans.clarity_score or 0.0
            total_sum += (rel + cla) / 2.0

    final_score = total_sum / len(answers)
    session.overall_score = round(final_score, 2)
    db.session.commit()

    return jsonify({
        "session_id": session_id,
        "overall_score": session.overall_score,
        "total_questions_answered": len(answers),
        "mode": session.mode,
        "field": session.field
    }), 200
