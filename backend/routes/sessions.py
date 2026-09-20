from flask import Blueprint, request, jsonify, send_file, g
from bson import ObjectId
from backend.models import db, User, Resume, InterviewSession, Answer, ATSReport, Question
from backend.modules.auth import optional_auth
from backend.modules.report_generator import report_generator
from backend.mongo_db import get_resumes_col, get_transcripts_col, get_questions_col

sessions_bp = Blueprint('sessions', __name__)

@sessions_bp.route('/', methods=['GET'])
@sessions_bp.route('', methods=['GET'])
@optional_auth
def list_sessions():
    """
    List past interview sessions.
    If authenticated via token, returns sessions for the candidate;
    otherwise returns the global archive of recent sessions.
    """
    auth_header = request.headers.get('Authorization')
    user = getattr(g, 'current_user', None)
    if auth_header and user:
        sessions = (
            InterviewSession.query.filter_by(user_id=user.id)
            .order_by(InterviewSession.created_at.desc())
            .all()
        )
    else:
        sessions = InterviewSession.query.order_by(InterviewSession.created_at.desc()).all()

    results = []
    for s in sessions:
        results.append({
            "id": s.id,
            "date": s.created_at.isoformat() if s.created_at else None,
            "field": s.field or 'it',
            "role": s.role,
            "mode": s.mode or 'standard',
            "overall_score": s.overall_score,
            "mongo_transcript_id": s.mongo_transcript_id,
            "mongo_resume_id": s.mongo_resume_id,
            "has_transcript": bool(s.mongo_transcript_id)
        })

    return jsonify(results), 200

@sessions_bp.route('/<int:session_id>', methods=['GET'])
@optional_auth
def get_session_detail(session_id):
    """
    Fetch comprehensive details for an interview session, hydrating question text
    and transcripts across SQL and MongoDB collections.
    """
    session = InterviewSession.query.get(session_id)
    if not session:
        return jsonify({"error": f"Session {session_id} not found."}), 404

    # 1. Fetch and hydrate answers
    answers = Answer.query.filter_by(session_id=session_id).all()
    questions_col = get_questions_col()
    formatted_answers = []

    for a in answers:
        q_text = "Interview Evaluation Prompt"
        if a.mongo_question_id:
            try:
                q_doc = questions_col.find_one({"_id": ObjectId(a.mongo_question_id)})
                if not q_doc:
                    q_doc = questions_col.find_one({"_id": str(a.mongo_question_id)})
                if q_doc and q_doc.get('question_text'):
                    q_text = q_doc.get('question_text')
            except Exception:
                try:
                    q_doc = questions_col.find_one({"_id": str(a.mongo_question_id)})
                    if q_doc and q_doc.get('question_text'):
                        q_text = q_doc.get('question_text')
                except Exception:
                    pass
        elif a.question_id:
            sql_q = Question.query.get(a.question_id)
            if sql_q and sql_q.question_text:
                q_text = sql_q.question_text

        formatted_answers.append({
            "id": a.id,
            "question_id": a.question_id,
            "mongo_question_id": a.mongo_question_id,
            "question_type": a.question_type or 'long_answer',
            "question_text": q_text,
            "answer_text": a.answer_text,
            "selected_option": a.selected_option,
            "is_correct": a.is_correct,
            "relevance_score": a.relevance_score,
            "clarity_score": a.clarity_score
        })

    # 2. Fetch ATS report from SQL (checking mongo_resume_id or resume_id)
    ats_report = None
    if session.mongo_resume_id:
        ats_report = ATSReport.query.filter_by(mongo_resume_id=session.mongo_resume_id).first()
    if not ats_report and session.resume_id:
        ats_report = ATSReport.query.filter_by(resume_id=session.resume_id).first()

    # 3. Cross-DB fetch MongoDB Transcript (if mock interview)
    transcript = None
    if session.mode == 'mock':
        transcripts_col = get_transcripts_col()
        t_doc = None
        if session.mongo_transcript_id:
            try:
                t_doc = transcripts_col.find_one({"_id": ObjectId(session.mongo_transcript_id)})
            except Exception:
                try:
                    t_doc = transcripts_col.find_one({"_id": str(session.mongo_transcript_id)})
                except Exception:
                    pass
        if not t_doc:
            try:
                t_doc = transcripts_col.find_one({"session_id": session.id})
            except Exception:
                pass

        if t_doc:
            persona_obj = t_doc.get('persona')
            if not persona_obj or not isinstance(persona_obj, dict):
                from backend.modules.mock_interview_engine import get_interviewer_persona
                persona_obj = get_interviewer_persona(session.field or 'it')
            transcript = {
                "id": str(t_doc.get('_id')),
                "session_id": t_doc.get('session_id'),
                "persona": persona_obj,
                "turns": t_doc.get('turns', [])
            }

    # 4. Cross-DB fetch MongoDB Resume details (if linked)
    resume_info = None
    if session.mongo_resume_id:
        resumes_col = get_resumes_col()
        try:
            r_doc = resumes_col.find_one({"_id": ObjectId(session.mongo_resume_id)})
            if not r_doc:
                r_doc = resumes_col.find_one({"_id": str(session.mongo_resume_id)})
            if r_doc:
                resume_info = {
                    "id": str(r_doc.get('_id')),
                    "title": r_doc.get('title') or r_doc.get('contact', {}).get('name', 'Structured Resume'),
                    "skills": r_doc.get('skills', []),
                    "last_updated": r_doc.get('last_updated')
                }
        except Exception:
            pass

    results = {
        "id": session.id,
        "date": session.created_at.isoformat() if session.created_at else None,
        "field": session.field or 'it',
        "role": session.role,
        "mode": session.mode or 'standard',
        "overall_score": session.overall_score,
        "mongo_transcript_id": session.mongo_transcript_id,
        "mongo_resume_id": session.mongo_resume_id,
        "answers": formatted_answers,
        "transcript": transcript,
        "resume": resume_info,
        "ats_report": {
            "ats_score": ats_report.ats_score if ats_report else None,
            "issues": ats_report.issues_list if ats_report else []
        } if ats_report else None
    }

    return jsonify(results), 200

@sessions_bp.route('/<int:session_id>/report', methods=['GET'])
@sessions_bp.route('/<int:session_id>/report/pdf', methods=['GET'])
@optional_auth
def download_report(session_id):
    """
    Generates and streams an official PDF performance report dossier
    integrating SQL and MongoDB data.
    """
    try:
        pdf_buffer = report_generator.generate_report(session_id)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"SmartHire_Performance_Dossier_Session_{session_id}.pdf"
        )
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except Exception as e:
        return jsonify({"error": f"Report compilation failed: {str(e)}"}), 500
