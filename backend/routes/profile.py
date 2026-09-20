from flask import Blueprint, request, jsonify, g
from backend.models import db, User, InterviewSession, Resume
from backend.modules.auth import require_auth, optional_auth
from backend.mongo_db import get_resumes_col

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('', methods=['GET'])
@require_auth
def get_profile():
    user = g.current_user

    # 1. Fetch past sessions from SQL
    sessions = (
        InterviewSession.query.filter_by(user_id=user.id)
        .order_by(InterviewSession.created_at.desc())
        .limit(10)
        .all()
    )
    session_list = [
        {
            'id': s.id,
            'field': s.field or 'it',
            'role': s.role,
            'mode': s.mode or 'standard',
            'overall_score': round(s.overall_score * 100) if s.overall_score is not None else None,
            'created_at': s.created_at.isoformat() if s.created_at else None
        }
        for s in sessions
    ]

    # 2. Fetch saved structured resumes from MongoDB
    resumes_col = get_resumes_col()
    saved_resumes = []
    try:
        cursor = resumes_col.find({'user_id': user.id}).sort('last_updated', -1).limit(5)
        for r in cursor:
            saved_resumes.append({
                'id': str(r.get('_id')),
                'title': r.get('title') or (r.get('contact', {}).get('name', 'Untitled Resume')),
                'template_id': r.get('template_id', 1),
                'last_updated': r.get('last_updated')
            })
    except Exception:
        pass

    # Also include SQL-uploaded resumes if any
    sql_resumes = Resume.query.filter_by(user_id=user.id).order_by(Resume.upload_date.desc()).limit(5).all()
    for sr in sql_resumes:
        saved_resumes.append({
            'id': f"sql_{sr.id}",
            'title': sr.file_name,
            'type': 'uploaded',
            'last_updated': sr.upload_date.isoformat() if sr.upload_date else None
        })

    return jsonify({
        'user': user.to_dict(),
        'sessions': session_list,
        'resumes': saved_resumes
    }), 200

@profile_bp.route('', methods=['PUT'])
@require_auth
def update_profile():
    user = g.current_user
    data = request.get_json() or {}

    if 'name' in data and data['name'].strip():
        user.name = data['name'].strip()
    if 'target_field' in data and data['target_field'].strip():
        user.target_field = data['target_field'].strip().lower()
    if 'target_role' in data and data['target_role'].strip():
        user.target_role = data['target_role'].strip()

    db.session.commit()

    return jsonify({
        'message': 'Profile preferences updated successfully.',
        'user': user.to_dict()
    }), 200

