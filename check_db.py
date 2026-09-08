from backend.app import app
from backend.models import db, Resume

with app.app_context():
    resumes = Resume.query.all()
    print(f"Total resumes in DB: {len(resumes)}")
    for r in resumes:
        print(f"Resume ID: {r.id}, File: {r.file_name}, Skills: {r.extracted_skills}")
