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
        user_id = request.form.get('user_id')
        if not user_id:
            user_id = get_default_user_id()
        else:
            try:
                user_id = int(user_id)
            except ValueError:
                return jsonify({"error": "Invalid user_id"}), 400

    # 2. Validate File
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Validate extension
    allowed_extensions = {'.pdf', '.docx'}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        return jsonify({"error": f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"}), 400

    # 3. Save File
    filename = secure_filename(file.filename)
    save_path = os.path.join(Config.UPLOAD_FOLDER, filename)

    # Ensure upload folder exists
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    file.save(save_path)

    try:
        # 4. Parse Resume
        text, skills, is_scanned = parser.parse_resume(save_path)

        # 5. Save to Database
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
            "extracted_skills": skills
        }), 201

    except Exception as e:
        # Clean up file on failure
        if os.path.exists(save_path):
            os.remove(save_path)
        return jsonify({"error": str(e)}), 500

@resume_bp.route('/manual-text', methods=['POST'])
@optional_auth
def manual_text():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data['text']
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
        # Extract skills from manual text
        skills = parser.extract_skills(text)

        # Save to database (use 'manual_entry' as filename)
        resume = Resume(
            user_id=user_id,
            file_name="manual_entry",
            extracted_text=text,
            extracted_skills=skills
        )
        db.session.add(resume)
        db.session.commit()

        return jsonify({
            "message": "Text processed successfully",
            "resume_id": resume.id,
            "extracted_skills": skills
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
