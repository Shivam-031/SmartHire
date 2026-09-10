from flask import Blueprint, request, jsonify
from backend.models import db, Resume, ATSReport
from backend.modules.ats_checker import ats_checker
import os
from backend.config import Config

ats_bp = Blueprint('ats', __name__)

@ats_bp.route('/check', methods=['POST'])
def check_ats():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    resume_id = data.get('resume_id')
    if not resume_id:
        return jsonify({"error": "resume_id is required"}), 400

    try:
        resume_id = int(resume_id)
    except ValueError:
        return jsonify({"error": "Invalid resume_id"}), 400

    # 1. Validate Resume
    resume = Resume.query.get(resume_id)
    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    # 2. Resolve File Path
    file_path = os.path.join(Config.UPLOAD_FOLDER, resume.file_name)
    if not os.path.exists(file_path):
        return jsonify({"error": "Resume file not found on server"}), 404

    try:
        # 3. Run ATS Analysis
        analysis = ats_checker.analyze(file_path)
        ats_score = analysis['ats_score']
        issues = analysis['issues']

        # 4. Save report to database
        report = ATSReport(
            resume_id=resume_id,
            ats_score=ats_score,
            issues_list=issues
        )
        db.session.add(report)
        db.session.commit()

        # 5. Return result
        return jsonify({
            "ats_score": ats_score,
            "issues": issues,
            "disclaimer": "This is a heuristic estimate, not a certified score."
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
