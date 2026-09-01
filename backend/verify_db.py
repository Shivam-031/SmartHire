import os
from flask import Flask
from backend.config import Config
from backend.models import db, User, Question

def verify_db():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    with app.app_context():
        print("--- Database Verification ---")

        # 1. Check User
        user = User.query.first()
        if user:
            print(f"User found: {user.name} ({user.email})")
        else:
            print("User NOT found!")

        # 2. Check Total Questions
        q_count = Question.query.count()
        print(f"Total questions: {q_count}")

        # 3. Check Role Distribution
        roles = ["Backend Developer", "Frontend Developer", "Full Stack Developer", "Data Analyst", "QA / Test Engineer"]
        for role in roles:
            count = Question.query.filter_by(role=role).count()
            print(f"Questions for {role}: {count}")

        # 4. Check a specific question
        sample_q = Question.query.first()
        if sample_q:
            print(f"Sample question: {sample_q.question_text[:50]}... (Role: {sample_q.role})")

if __name__ == "__main__":
    verify_db()
