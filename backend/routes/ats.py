from flask import Blueprint, request, jsonify, g
from bson import ObjectId
import os
from backend.models import db, Resume as SQLResume, ATSReport as SQLATSReport
from backend.modules.ats_checker import ats_checker
from backend.modules.auth import optional_auth
from backend.mongo_db import get_resumes_col, get_db
from backend.config import Config

ats_bp = Blueprint('ats', __name__)

@ats_bp.route('/check', methods=['POST'])
@optional_auth
def check_ats():
    data = request.get_json() or {}

    resume_id = data.get('resume_id')
    mongo_resume_id = data.get('mongo_resume_id')
    resume_data = data.get('resume_data')

    # Case 1: Direct resume document passed in body
    if resume_data and isinstance(resume_data, dict):
        try:
            analysis = ats_checker.analyze_document(resume_data)
            return jsonify({
                "ats_score": analysis['ats_score'],
                "issues": analysis['issues'],
                "disclaimer": "This is a heuristic estimate, not a certified score."
            }), 200
        except Exception as e:
            return jsonify({"error": f"Failed to analyze resume document: {str(e)}"}), 500

    # Case 2: MongoDB Resume ID specified explicitly
    target_mongo_id = mongo_resume_id
    if not target_mongo_id and resume_id and isinstance(resume_id, str):
        # Check if resume_id is a 24-hex string or not purely numeric
        if len(resume_id) == 24 or not resume_id.isdigit():
            target_mongo_id = resume_id

    col = get_resumes_col()

    if target_mongo_id:
        doc = None
        try:
            doc = col.find_one({'_id': ObjectId(target_mongo_id)})
        except Exception:
            pass
        if not doc:
            doc = col.find_one({'_id': target_mongo_id})

        if doc:
            try:
                analysis = ats_checker.analyze_document(doc)
                ats_score = analysis['ats_score']
                issues = analysis['issues']

                # Persist evaluation record into Mongo 'ats_reports' collection
                try:
                    mongo_db = get_db()
                    mongo_db.ats_reports.insert_one({
                        'mongo_resume_id': str(doc.get('_id')),
                        'user_id': doc.get('user_id', g.current_user.id if g.current_user else 1),
                        'ats_score': ats_score,
                        'issues': issues,
                        'analyzed_at': Config.JWT_EXPIRATION_DAYS
                    })
                except Exception:
                    pass

                return jsonify({
                    "ats_score": ats_score,
                    "issues": issues,
                    "disclaimer": "This is a heuristic estimate, not a certified score."
                }), 200
            except Exception as e:
                return jsonify({"error": f"Failed to analyze MongoDB resume: {str(e)}"}), 500

    # Case 3: Fallback to current authenticated user's latest Mongo resume if no id given
    if not resume_id and not mongo_resume_id and g.current_user:
        doc = col.find_one({'user_id': g.current_user.id}, sort=[('last_updated', -1)])
        if doc:
            try:
                analysis = ats_checker.analyze_document(doc)
                return jsonify({
                    "ats_score": analysis['ats_score'],
                    "issues": analysis['issues'],
                    "disclaimer": "This is a heuristic estimate, not a certified score."
                }), 200
            except Exception as e:
                return jsonify({"error": f"Failed to analyze user resume: {str(e)}"}), 500

    # Case 4: SQL Resume Lookup (for uploaded files or legacy SQL rows)
    if resume_id is not None:
        try:
            sql_id = int(resume_id)
            sql_resume = SQLResume.query.get(sql_id)
            if sql_resume:
                file_path = os.path.join(Config.UPLOAD_FOLDER, sql_resume.file_name or '')
                if os.path.exists(file_path):
                    analysis = ats_checker.analyze(file_path)
                elif sql_resume.extracted_text:
                    analysis = ats_checker.analyze_text(sql_resume.extracted_text)
                else:
                    return jsonify({"error": "Resume file or text not available on server."}), 404

                ats_score = analysis['ats_score']
                issues = analysis['issues']

                # Save report to SQL database
                report = SQLATSReport(
                    resume_id=sql_id,
                    ats_score=ats_score,
                    issues_list=issues
                )
                db.session.add(report)
                db.session.commit()

                return jsonify({
                    "ats_score": ats_score,
                    "issues": issues,
                    "disclaimer": "This is a heuristic estimate, not a certified score."
                }), 201
        except ValueError:
            pass

    return jsonify({"error": "Resume not found in MongoDB storage or relational database."}), 404

