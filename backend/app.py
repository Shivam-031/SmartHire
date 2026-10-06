import os
import sys

# Ensure project root is on Python path so imports work from either root or backend/
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import gc
from flask import Flask, jsonify, request
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

# Configure CORS for cross-platform deployments (Vercel, Netlify, Render, Railway)
cors_origins_env = os.environ.get('CORS_ORIGINS', '*').strip()
if cors_origins_env == '*':
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
else:
    allowed_origins = [o.strip() for o in cors_origins_env.split(',') if o.strip()]
    CORS(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=True)

# Configuration
app.config.from_object(Config)

# Initialize Relational Database (SQLAlchemy)
db.init_app(app)

# Ensure database tables and columns exist
with app.app_context():
    db.create_all()
    try:
        from sqlalchemy import text
        with db.engine.connect() as conn:
            existing_cols = [r[1] for r in conn.execute(text("PRAGMA table_info(user)")).fetchall()]
            if 'google_id' not in existing_cols:
                conn.execute(text("ALTER TABLE user ADD COLUMN google_id VARCHAR(255)"))
            if 'avatar_url' not in existing_cols:
                conn.execute(text("ALTER TABLE user ADD COLUMN avatar_url VARCHAR(500)"))
            conn.commit()
    except Exception:
        pass

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

@app.route('/health')
@app.route('/api/health')
def health():
    return jsonify({
        "status": "healthy",
        "service": "SmartHire API",
        "environment": os.environ.get('FLASK_ENV', 'production')
    }), 200

@app.after_request
def cleanup_memory(response):
    """Proactively release buffers after document parsing or PDF exports to stay under 512MB RAM."""
    if request.path.startswith('/api/resume') or request.path.startswith('/api/ats'):
        gc.collect()
    return response

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() in ('true', '1')
    app.run(host=host, port=port, debug=debug)

