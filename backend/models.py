from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    resumes = db.relationship('Resume', backref='user', lazy=True)
    sessions = db.relationship('InterviewSession', backref='user', lazy=True)

class Resume(db.Model):
    __tablename__ = 'resume'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    extracted_text = db.Column(db.Text, nullable=False)
    extracted_skills = db.Column(db.JSON)  # List of strings
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    ats_reports = db.relationship('ATSReport', backref='resume', lazy=True)

class InterviewSession(db.Model):
    __tablename__ = 'interview_session'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    resume_id = db.Column(db.Integer, db.ForeignKey('resume.id'), nullable=True)
    role = db.Column(db.String(100), nullable=False)
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
    expected_keywords = db.Column(db.JSON) # List of strings

class Answer(db.Model):
    __tablename__ = 'answer'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('interview_session.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    answer_text = db.Column(db.Text, nullable=False)
    relevance_score = db.Column(db.Float)
    clarity_score = db.Column(db.Float)

class ATSReport(db.Model):
    __tablename__ = 'ats_report'
    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey('resume.id'), nullable=False)
    ats_score = db.Column(db.Float, nullable=False)
    issues_list = db.Column(db.JSON) # List of {type, message, severity}
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
