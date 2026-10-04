from flask import Blueprint, request, jsonify, g
from werkzeug.utils import secure_filename
import os
from backend.models import db, Resume, User
from backend.config import Config
from backend.modules.resume_parser import parser
from backend.modules.auth import optional_auth

resume_bp = Blueprint('resume', __name__)

def get_default_user_id():
    """Helper to get the demo user ID for testing."""
    user = User.query.filter_by(email='demo@smarthire.com').first()
    if user:
        return user.id
    # If demo user doesn't exist, create one quickly
    user = User(name="Demo User", email="demo@smarthire.com")
    db.session.add(user)
    db.session.commit()
    return user.id

@resume_bp.route('/upload', methods=['POST'])
@optional_auth
def upload_resume():
    # 1. Validate User
    user = g.current_user
    if user:
        user_id = user.id
    else:
        user_id = request.form.get('user_id') or (request.get_json(silent=True) or {}).get('user_id')
        if not user_id:
            user_id = get_default_user_id()
        else:
            try:
                user_id = int(user_id)
            except ValueError:
                return jsonify({"error": "Invalid user_id"}), 400

    # 2. Check for JSON / Raw Text Body
    json_data = request.get_json(silent=True) or {}
    raw_text = json_data.get('resume_text') or json_data.get('text')
    if 'file' not in request.files and raw_text:
        try:
            parsed = parser.parse_full(raw_text, is_raw_text=True)
            resume = Resume(
                user_id=user_id,
                file_name="manual_entry.txt",
                extracted_text=parsed["text"],
                extracted_skills=parsed["skills"]
            )
            db.session.add(resume)
            db.session.commit()

            return jsonify({
                "message": "Resume text parsed successfully",
                "resume_id": resume.id,
                "candidate_name": parsed["candidate_name"],
                "contact": parsed["contact"],
                "extracted_skills": parsed["skills"],
                "skills_categorized": parsed.get("skills_categorized", {}),
                "summary": parsed["summary"],
                "experience": parsed["experience"],
                "education": parsed["education"],
                "projects": parsed["projects"],
                "certifications": parsed.get("certifications", []),
                "additional": parsed.get("additional", ""),
                "is_certificate": parsed["is_certificate"],
                "document_type": parsed.get("document_type", "Full Professional Resume"),
                "certificate_info": parsed.get("certificate_info"),
                "is_scanned": parsed["is_scanned"],
                "word_count": parsed["word_count"]
            }), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # 3. Validate File
    if 'file' not in request.files:
        return jsonify({"error": "No file part or text content provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Validate extension
    allowed_extensions = {'.pdf', '.docx', '.txt', '.md'}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        return jsonify({"error": f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"}), 400

    # 4. Save File
    filename = secure_filename(file.filename)
    save_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    file.save(save_path)

    try:
        # 5. Rich Parse Resume
        parsed = parser.parse_full(save_path, is_raw_text=False)
        text = parsed["text"]
        skills = parsed["skills"]

        # 6. Save to Database
        resume = Resume(
            user_id=user_id,
            file_name=filename,
            extracted_text=text,
            extracted_skills=skills
        )
        db.session.add(resume)
        db.session.commit()

        return jsonify({
            "message": "Resume uploaded and parsed successfully",
            "resume_id": resume.id,
            "candidate_name": parsed["candidate_name"],
            "contact": parsed["contact"],
            "extracted_skills": skills,
            "skills_categorized": parsed.get("skills_categorized", {}),
            "summary": parsed["summary"],
            "experience": parsed["experience"],
            "education": parsed["education"],
            "projects": parsed["projects"],
            "certifications": parsed.get("certifications", []),
            "additional": parsed.get("additional", ""),
            "is_certificate": parsed["is_certificate"],
            "document_type": parsed.get("document_type", "Full Professional Resume"),
            "certificate_info": parsed.get("certificate_info"),
            "is_scanned": parsed["is_scanned"],
            "word_count": parsed["word_count"]
        }), 201

    except Exception as e:
        if os.path.exists(save_path):
            os.remove(save_path)
        return jsonify({"error": str(e)}), 500

@resume_bp.route('/manual-text', methods=['POST'])
@optional_auth
def manual_text():
    data = request.get_json() or {}
    text = data.get('text') or data.get('resume_text')
    if not text:
        return jsonify({"error": "No text provided"}), 400

    user = g.current_user
    if user:
        user_id = user.id
    else:
        user_id = data.get('user_id')
        if not user_id:
            user_id = get_default_user_id()
        else:
            try:
                user_id = int(user_id)
            except ValueError:
                return jsonify({"error": "Invalid user_id"}), 400

    try:
        parsed = parser.parse_full(text, is_raw_text=True)
        resume = Resume(
            user_id=user_id,
            file_name="manual_entry.txt",
            extracted_text=parsed["text"],
            extracted_skills=parsed["skills"]
        )
        db.session.add(resume)
        db.session.commit()

        return jsonify({
            "message": "Text processed successfully",
            "resume_id": resume.id,
            "candidate_name": parsed["candidate_name"],
            "contact": parsed["contact"],
            "extracted_skills": parsed["skills"],
            "summary": parsed["summary"],
            "experience": parsed["experience"],
            "education": parsed["education"],
            "projects": parsed["projects"],
            "is_certificate": parsed["is_certificate"],
            "is_scanned": parsed["is_scanned"],
            "word_count": parsed["word_count"]
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
