from flask import Blueprint, request, jsonify
from backend.models import db, User, Resume, InterviewSession, Question, Answer
from backend.modules.question_selector import select_questions
from backend.modules.scoring_engine import get_scoring_feedback
from sqlalchemy import func

interview_bp = Blueprint('interview', __name__)

@interview_bp.route('/start', methods=['POST'])
def start_interview():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    user_id = data.get('user_id')
    resume_id = data.get('resume_id')
    role = data.get('role')

    if not all([user_id, role]):
        return jsonify({"error": "Missing required fields: user_id and role are required"}), 400

    try:
        user_id = int(user_id)
        if resume_id:
            resume_id = int(resume_id)
    except ValueError:
        return jsonify({"error": "Invalid user_id or resume_id"}), 400

    # 1. Validate User
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Validate Resume if provided
    resume = None
    if resume_id:
        resume = Resume.query.get(resume_id)
        if not resume:
            return jsonify({"error": "Resume not found"}), 404

    # 2. Create Interview Session
    session = InterviewSession(
        user_id=user_id,
        resume_id=resume_id,
        role=role
    )
    db.session.add(session)
    db.session.commit()

    # 3. Select Tailored Questions
    # Use extracted skills from resume if available, otherwise an empty list
    skills = resume.extracted_skills if resume else []
    questions = select_questions(role, skills)

    # 4. Return Session and Questions
    return jsonify({
        "session_id": session.id,
        "role": role,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text
            } for q in questions
        ]
    }), 201

@interview_bp.route('/answer', methods=['POST'])
def submit_answer():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    session_id = data.get('session_id')
    question_id = data.get('question_id')
    answer_text = data.get('answer_text')

    if not all([session_id, question_id, answer_text]):
        return jsonify({"error": "Missing required fields: session_id, question_id, and answer_text"}), 400

    try:
        session_id = int(session_id)
        question_id = int(question_id)
    except ValueError:
        return jsonify({"error": "Invalid session_id or question_id"}), 400

    # 1. Validate Session and Question
    session = InterviewSession.query.get(session_id)
    if not session:
        return jsonify({"error": "Interview session not found"}), 404

    question = Question.query.get(question_id)
    if not question:
        return jsonify({"error": "Question not found"}), 404

    # 2. Score the Answer
    feedback = get_scoring_feedback(answer_text, question.expected_keywords or [])

    # 3. Save Answer to DB
    answer = Answer(
        session_id=session_id,
        question_id=question_id,
        answer_text=answer_text,
        relevance_score=feedback['relevance_score'],
        clarity_score=feedback['clarity_score']
    )
    db.session.add(answer)
    db.session.commit()

    # 4. Return Feedback
    return jsonify({
        "relevance_score": feedback['relevance_score'],
        "clarity_score": feedback['clarity_score'],
        "suggestions": feedback['suggestions']
    }), 201

@interview_bp.route('/complete', methods=['POST'])
def complete_interview():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    session_id = data.get('session_id')
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    try:
        session_id = int(session_id)
    except ValueError:
        return jsonify({"error": "Invalid session_id"}), 400

    # 1. Validate Session
    session = InterviewSession.query.get(session_id)
    if not session:
        return jsonify({"error": "Interview session not found"}), 404

    # 2. Calculate total score
    # Average of (relevance + clarity) / 2 across all answers in the session
    answers = Answer.query.filter_by(session_id=session_id).all()
    if not answers:
        return jsonify({"error": "No answers found for this session"}), 404

    total_sum = 0
    for ans in answers:
        total_sum += (ans.relevance_score + ans.clarity_score) / 2

    final_score = total_sum / len(answers)

    # 3. Update session overall score
    session.overall_score = final_score
    db.session.commit()

    return jsonify({
        "session_id": session_id,
        "overall_score": round(final_score, 2)
    }), 200


