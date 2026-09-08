# Project Handover: SmartHire Prep

## Current Status
**Phase 1: Data Foundations** is complete. The project environment is set up, and the core data layer (JSON knowledge bases and SQLite database) is fully initialized.

## 🚀 Completed Milestones
### Phase 0: Setup & Planning
- [x] **Environment**: Python 3.13 and Node.js installed. Virtual environment (`venv`) configured.
- [x] **Dependencies**: All backend packages installed (`flask`, `flask-sqlalchemy`, `pdfplumber`, `python-docx`, `spacy`, `textstat`, `reportlab`).
- [x] **NLP Model**: `en_core_web_md` downloaded.
- [x] **Frontend**: Vite + React scaffolded and verified running.
- [x] **Infrastructure**: Folder structure created; `.gitignore` configured.

### Phase 1: Data Foundations
- [x] **Knowledge Base**: 
    - `backend/data/skill_dictionary.json`: ~150 skills with synonyms.
    - `backend/data/question_bank.json`: 125 role-based questions (25 per role) with expected keywords.
    - `backend/data/roles.json`: Ideal skill sets for ATS heuristic scoring.
- [x] **Database Layer**:
    - SQLAlchemy models implemented in `backend/models.py` (User, Resume, InterviewSession, Question, Answer, ATSReport).
    - SQLite database initialized at `backend/instance/app.db`.
- [x] **Seeding**: `backend/seed.py` used to populate the `Question` table and create a default demo user.

## 🛠 Technical Context
### Backend
- **Framework**: Flask
- **Database**: SQLite (via SQLAlchemy)
- **Entry Point**: `backend/app.py`
- **Config**: `backend/config.py` (uses absolute paths for DB stability)
- **Seed Script**: `python -m backend.seed` (Use this to reset the DB)

### Frontend
- **Framework**: React (Vite)
- **Location**: `/frontend`
- **Launch**: `npm run dev`

## 📅 Next Steps: Phase 2 (Resume Parsing & Skill Extraction)
The next phase focuses on turning uploaded files into structured data.

**Immediate Tasks:**
1. Implement `backend/modules/resume_parser.py`:
    - Integrate `pdfplumber` for PDFs.
    - Integrate `python-docx` for DOCX.
    - Implement `PhraseMatcher` using `skill_dictionary.json`.
2. Create `/api/resume/upload` endpoint:
    - Handle multipart file uploads.
    - Trigger the parser.
    - Save extracted text and skills to the `Resume` table.
3. Implement `/api/resume/manual-text` as a fallback.
4. Verify the end-to-end flow: File Upload $\rightarrow$ Parsing $\rightarrow$ DB Storage.

## ⚠️ Critical Notes
- **NLP Loading**: Ensure the spaCy model is loaded once at startup, not inside route handlers.
- **DB Path**: Always use the absolute path provided in `backend/config.py` to avoid `sqlite3.OperationalError`.
- **MVP Scope**: Remember that this is a rule-based system. **Do not** introduce LLM APIs unless specifically requested in a future phase.
