from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)
    target_field = db.Column(db.String(50), default='it')
    target_role = db.Column(db.String(100), default='Frontend Developer')
    google_id = db.Column(db.String(255), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    resumes = db.relationship('Resume', backref='user', lazy=True)
    sessions = db.relationship('InterviewSession', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'target_field': self.target_field or 'it',
            'target_role': self.target_role or 'Frontend Developer',
            'google_id': self.google_id,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Resume(db.Model):
    __tablename__ = 'resume'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    extracted_text = db.Column(db.Text, nullable=False)
    extracted_skills = db.Column(db.JSON)  # List of strings
    mongo_resume_id = db.Column(db.String(50), nullable=True)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    ats_reports = db.relationship('ATSReport', backref='resume', lazy=True)

class InterviewSession(db.Model):
    __tablename__ = 'interview_session'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    resume_id = db.Column(db.Integer, db.ForeignKey('resume.id'), nullable=True)
    mongo_resume_id = db.Column(db.String(50), nullable=True)
    field = db.Column(db.String(50), default='it')
    role = db.Column(db.String(100), nullable=False)
    mode = db.Column(db.String(20), default='standard')  # 'standard' | 'mock'
    mongo_transcript_id = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    overall_score = db.Column(db.Float, nullable=True)

    # Relationships
    answers = db.relationship('Answer', backref='session', lazy=True)

class Question(db.Model):
    __tablename__ = 'question'
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(100), nullable=False)
    skill_tag = db.Column(db.String(100), nullable=True)
    question_text = db.Column(db.Text, nullable=False)
    expected_keywords = db.Column(db.JSON)  # List of strings

class Answer(db.Model):
    __tablename__ = 'answer'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('interview_session.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=True)
    mongo_question_id = db.Column(db.String(50), nullable=True)
    question_type = db.Column(db.String(20), default='long_answer')  # 'mcq' | 'long_answer'
    answer_text = db.Column(db.Text, nullable=True)
    selected_option = db.Column(db.String(10), nullable=True)
    is_correct = db.Column(db.Boolean, nullable=True)
    relevance_score = db.Column(db.Float, nullable=True)
    clarity_score = db.Column(db.Float, nullable=True)

class ATSReport(db.Model):
    __tablename__ = 'ats_report'
    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey('resume.id'), nullable=True)
    mongo_resume_id = db.Column(db.String(50), nullable=True)
    ats_score = db.Column(db.Float, nullable=False)
    issues_list = db.Column(db.JSON)  # List of {type, message, severity}
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
