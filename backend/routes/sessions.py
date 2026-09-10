from flask import Blueprint, request, jsonify, send_file
from backend.models import db, User, Resume, InterviewSession, Answer, ATSReport
from backend.modules.report_generator import report_generator
import io

sessions_bp = Blueprint('sessions', __name__)

@sessions_bp.route('/', methods=['GET'])
def list_sessions():
    # In demo mode, we fetch all sessions for the demo user
    # For a real app, this would be filtered by current_user.id
    sessions = InterviewSession.query.all()

    results = []
    for s in sessions:
        results.append({
            "id": s.id,
            "date": s.created_at.isoformat(),
            "role": s.role,
            "overall_score": s.overall_score
        })

    return jsonify(results), 200

@sessions_bp.route('/<int:session_id>', methods=['GET'])
def get_session_detail(session_id):
    session = InterviewSession.query.get(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404

    # Fetch all answers for this session
    answers = Answer.query.filter_by(session_id=session_id).all()

    # Fetch ATS report for the resume used in this session
    ats_report = ATSReport.query.filter_by(resume_id=session.resume_id).first()

    results = {
        "id": session.id,
        "date": session.created_at.isoformat(),
        "role": session.role,
        "overall_score": session.overall_score,
        "answers": [
            {
                "question_id": a.question_id,
                "answer_text": a.answer_text,
                "relevance_score": a.relevance_score,
                "clarity_score": a.clarity_score
            } for a in answers
        ],
        "ats_report": {
            "ats_score": ats_report.ats_score if ats_report else None,
            "issues": ats_report.issues_list if ats_report else []
        } if ats_report else None
    }

    return jsonify(results), 200

@sessions_bp.route('/<int:session_id>/report', methods=['GET'])
def download_report(session_id):
    try:
        pdf_buffer = report_generator.generate_report(session_id)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"SmartHire_Report_Session_{session_id}.pdf"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
