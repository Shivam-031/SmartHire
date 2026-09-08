import os
from backend.modules.resume_parser import parser
from backend.config import Config

def test_file(filename):
    path = os.path.join(Config.UPLOAD_FOLDER, filename)
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    
    print(f"\n--- Testing: {filename} ---")
    try:
        text = parser.extract_text(path)
        print(f"Extracted text length: {len(text)} chars")
        print(f"Word count: {len(text.split())}")
        
        skills = parser.extract_skills(text)
        print(f"Extracted skills: {skills}")
        
        if not skills:
            print("No skills found!")
            print("First 500 chars of text:")
            print(text[:500])
    except Exception as e:
        print(f"Error: {e}")

files = [
    "Shivam_Negi_Resume_2026_Software_Development.pdf",
    "Shivam_Negi_Resume_FullStack_Developer.pdf"
]

for f in files:
    test_file(f)
