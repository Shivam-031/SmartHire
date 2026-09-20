import os
import sys

# Ensure project root is on Python path so imports work from either root or backend/
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask, jsonify
from flask_cors import CORS
from backend.models import db
from backend.mongo_db import init_mongo
from backend.routes.resume import resume_bp
from backend.routes.resume_editor import resume_editor_bp
from backend.routes.interview import interview_bp
from backend.routes.ats import ats_bp
from backend.routes.sessions import sessions_bp
from backend.routes.auth import auth_bp
from backend.routes.profile import profile_bp
from backend.routes.fields import fields_bp
from backend.config import Config


app = Flask(__name__)
CORS(app)

# Configuration
app.config.from_object(Config)

# Initialize Relational Database (SQLAlchemy)
db.init_app(app)

# Initialize Document Database (PyMongo / resilient mongomock)
init_mongo()

# Ensure upload folder exists
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(profile_bp, url_prefix='/api/profile')
app.register_blueprint(fields_bp, url_prefix='/api/fields')
app.register_blueprint(resume_bp, url_prefix='/api/resume')
app.register_blueprint(resume_editor_bp, url_prefix='/api/resume')
app.register_blueprint(interview_bp, url_prefix='/api/interview')
app.register_blueprint(ats_bp, url_prefix='/api/ats')
app.register_blueprint(sessions_bp, url_prefix='/api/sessions')

@app.route('/')
def index():
    return jsonify({
        "system": "SmartHire Prep API",
        "version": "v2.4.1",
        "status": "online",
        "architecture": "Dual SQL + MongoDB",
        "capabilities": [
            "Candidate Auth & Profiles",
            "Multi-Field Tracks (IT, Management, Law)",
            "Structured Resume Editor & PDF Export",
            "Heuristic ATS Compatibility Audit",
            "Oral Examination & Rule-based Mock Interview (MCQ + Long Answer)"
        ]
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, use_reloader=False, port=5000)

