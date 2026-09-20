import os
import sys

# Ensure root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask
from backend.config import Config
from backend.models import db, User, Resume, InterviewSession, Question
from backend.mongo_db import init_mongo, get_mongo_db, is_using_mock

def verify_db():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 1. Initialize Relational DB (SQLAlchemy)
    db.init_app(app)

    # 2. Initialize Document DB (PyMongo / resilient mock)
    mongo_db = init_mongo()

    with app.app_context():
        print("==================================================")
        print("  SMARTHIRE DUAL DATABASE (SQL + MONGO) VERIFICATION")
        print("==================================================")

        # --- SQL DATABASE VERIFICATION ---
        print("\n[1] SQLAlchemy (Relational Store - SQLite/PostgreSQL):")
        try:
            user_count = User.query.count()
            resume_count = Resume.query.count()
            session_count = InterviewSession.query.count()
            q_count = Question.query.count()
            first_user = User.query.first()

            print(f"  [OK] Connected: {Config.SQLALCHEMY_DATABASE_URI}")
            print(f"  [OK] Registered Users: {user_count} (Primary: {first_user.email if first_user else 'None'})")
            print(f"  [OK] Saved Resumes: {resume_count}")
            print(f"  [OK] Examination Sessions: {session_count}")
            print(f"  [OK] SQL Questions: {q_count}")
            sql_status = "HEALTHY"
        except Exception as e:
            print(f"  [FAIL] SQL Connection Error: {e}")
            sql_status = "FAILED"

        # --- MONGO DATABASE VERIFICATION ---
        print("\n[2] PyMongo (Document Store - MongoDB):")
        try:
            mode_desc = "Resilient In-Memory Mock" if is_using_mock() else "Live MongoDB Service"
            print(f"  [OK] Mode: {mode_desc} (Database: {Config.MONGO_DB_NAME})")

            q_col = mongo_db['questions']
            skills_col = mongo_db['skills']
            resumes_col = mongo_db['resumes']
            transcripts_col = mongo_db['transcripts']

            print(f"  [OK] 'questions' collection: {q_col.count_documents({})} documents")
            print(f"  [OK] 'skills' collection: {skills_col.count_documents({})} documents")
            print(f"  [OK] 'resumes' collection: {resumes_col.count_documents({})} documents")
            print(f"  [OK] 'transcripts' collection: {transcripts_col.count_documents({})} documents")
            mongo_status = "HEALTHY"
        except Exception as e:
            print(f"  [FAIL] MongoDB Connection Error: {e}")
            mongo_status = "FAILED"

        print("\n--------------------------------------------------")
        print(f"SQL Database Status:   {sql_status}")
        print(f"Mongo Database Status: {mongo_status}")
        print("==================================================")
        return sql_status == "HEALTHY" and mongo_status == "HEALTHY"

if __name__ == "__main__":
    success = verify_db()
    sys.exit(0 if success else 1)
