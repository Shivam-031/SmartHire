# Implementation Plan: Resume Upload and Parsing (Phase 2)

## Overview
This plan implements the flow for uploading resumes (PDF/DOCX) or providing raw text, parsing the content, extracting skills using spaCy, and saving the results to the database.

## 1. Backend Implementation

### A. Resume Parser (backend/modules/resume_parser.py)
**Dependencies**: pdfplumber, python-docx, spacy, json.

**Logic**:
- **Initialization**:
    - Load en_core_web_sm spaCy model.
    - Load backend/data/skill_dictionary.json.
    - Build a synonym_to_canonical map.
    - Initialize spacy.PhraseMatcher with all synonyms from the dictionary.
- **parse_resume(file_path: str) -> dict**:
    - Detect extension.
    - **PDF**:
        - Use pdfplumber.open(file_path).
        - Extract all page text.
        - Extract all tables using extract_tables() and append their flattened text to the main text.
        - **Scanned PDF Check**: If total text length < 100 characters, raise ValueError("Scanned PDF detected") or return a fallback flag.
    - **DOCX**:
        - Use docx.Document(file_path).
        - Iterate through paragraphs and extract text.
    - Call extract_skills(text).
    - Return {"text": extracted_text, "skills": extracted_skills}.
- **extract_skills(text: str) -> list[str]**:
    - Process text with spaCy.
    - Use PhraseMatcher to find matches.
    - Map each match back to its canonical name.
    - Return a unique, sorted list of canonical skills.

### B. Resume Routes (backend/routes/resume.py)
**Blueprint**: resume_bp = Blueprint('resume', __name__)

**Endpoints**:
1. POST /api/resume/upload:
    - **Validation**:
        - Check if file exists in request.files.
        - Validate extension is in ['.pdf', '.docx'].
        - Check size against config.MAX_CONTENT_LENGTH.
    - **File Handling**:
        - Save file to config.UPLOAD_FOLDER using secure_filename.
    - **Parsing**:
        - Call resume_parser.parse_resume(file_path).
    - **User Identification**:
        - Use user_id from request.form or request.json.
        - Fallback: Query User.query.filter_by(email="demo@smarthire.com").first().
    - **Database**:
        - Create Resume entry with user_id, file_name, extracted_text, and extracted_skills.
        - db.session.add() and db.session.commit().
    - **Response**: 201 Created with resume_id and extracted_skills.

2. POST /api/resume/manual-text:
    - **Input**: text from JSON body.
    - **Parsing**: Call resume_parser.extract_skills(text).
    - **User Identification**: Same logic as above.
    - **Database**: Create Resume entry with file_name="Manual Text".
    - **Response**: 201 Created.

### C. App Integration (backend/app.py)
- Initialize db.init_app(app).
- Register resume_bp at /api/resume.
- Ensure UPLOAD_FOLDER is created on startup.

## 2. Frontend Implementation

### A. ResumeUpload Component (frontend/src/components/ResumeUpload.tsx)
**Features**:
- **State Management**:
    - uploadMode: 'file' | 'text'.
    - file: File | null.
    - manualText: string.
    - status: 'idle' | 'uploading' | 'success' | 'error'.
    - message: string.
- **UI Components**:
    - Toggle switch between "File Upload" and "Manual Text".
    - File input with .pdf, .docx filter.
    - Textarea for raw text.
    - Submit button with loading state.
    - Alert for success/error.
- **API Integration**:
    - handleFileUpload: Use FormData to send file to /api/resume/upload.
    - handleTextUpload: Send JSON to /api/resume/manual-text.

### B. App Integration (frontend/src/App.tsx)
- Import ResumeUpload and place it in the main layout.

## 3. Step-by-Step Execution Order
1. **Parser**: Implement backend/modules/resume_parser.py and verify skill extraction with a script.
2. **Routes**: Implement backend/routes/resume.py.
3. **App**: Update backend/app.py for route and DB registration.
4. **Frontend Component**: Create frontend/src/components/ResumeUpload.tsx.
5. **Frontend Integration**: Update frontend/src/App.tsx.
6. **Testing**: 
    - Test PDF upload with skills.
    - Test DOCX upload.
    - Test Manual text entry.
    - Test file size limit.
    - Test scanned PDF fallback.

## 4. Critical Files
- backend/modules/resume_parser.py
- backend/routes/resume.py
- backend/app.py
- frontend/src/components/ResumeUpload.tsx
- frontend/src/App.tsx
