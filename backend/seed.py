import json
import os
from flask import Flask
from backend.config import Config
from backend.models import db, User, Question

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    return app

def seed_db():
    app = create_app()
    with app.app_context():
        # Ensure instance folder exists
        if not os.path.exists('backend/instance'):
            os.makedirs('backend/instance')

        print("Initializing database...")
        db.create_all()

        # 1. Seed Questions
        print("Seeding questions...")
        # Clear existing questions to prevent duplicates
        Question.query.delete()

        try:
            with open('backend/data/question_bank.json', 'r') as f:
                questions_data = json.load(f)
                for q in questions_data:
                    question = Question(
                        id=q['id'],
                        role=q['role'],
                        skill_tag=q['skill_tag'],
                        question_text=q['question_text'],
                        expected_keywords=q['expected_keywords']
                    )
                    db.session.add(question)
            db.session.commit()
            print(f"Successfully loaded {len(questions_data)} questions.")
        except Exception as e:
            print(f"Error loading questions: {e}")
            db.session.rollback()

        # 2. Seed Default User
        print("Seeding default user...")
        user_exists = User.query.filter_by(email="demo@smarthire.com").first()
        if not user_exists:
            demo_user = User(name="Demo User", email="demo@smarthire.com")
            db.session.add(demo_user)
            db.session.commit()
            print("Created demo user: demo@smarthire.com")
        else:
            print("Demo user already exists.")

        print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
