# SmartHire Prep — Build Specification

**Purpose of this file:** This is a build spec intended to be handed to Claude Code (or another AI coding agent) to scaffold and implement the full application. It captures every functional detail, tech choice, data model, and API contract discussed in planning, so the agent can build without needing to ask about scope.

---

## 1. Project Summary

SmartHire Prep is a web app that helps job seekers prepare for technical interviews. A user selects a target job role and uploads their resume. The system:

1. Parses the resume and extracts skills.
2. Generates a personalized set of interview questions (role-based + resume-skill-based).
3. Lets the user answer questions in text form and scores each answer (keyword/semantic relevance + clarity).
4. Runs a heuristic **ATS compatibility check** on the resume and reports a score with specific issues.
5. Produces a combined session report (interview performance + ATS analysis), exportable as PDF.
6. Stores session history so the user can track progress over time.

This is a solo MCA minor project, timeboxed to ~4 weeks. Scope is deliberately rule-based/NLP-lite rather than LLM-dependent, so it works fully offline and free of API cost. LLM integration is listed only as future scope — **do not** implement it in the MVP.

---

## 2. Tech Stack (fixed — do not substitute without reason)

| Layer | Technology |
|---|---|
| Frontend | React (Vite), plain CSS or Tailwind |
| Backend | Flask (Python 3.9+) |
| NLP | spaCy (`en_core_web_md`) |
| PDF text extraction | `pdfplumber` |
| DOCX text extraction | `python-docx` |
| Clarity/readability metrics | `textstat` |
| Database | SQLite (via SQLAlchemy ORM) |
| PDF report export | `reportlab` |
| CORS | `flask-cors` |
| API style | REST, JSON payloads, multipart/form-data for file upload |

Do not introduce a live LLM API (OpenAI, Anthropic, etc.) for question generation or scoring — the design intentionally avoids this for cost, offline-capability, and predictability reasons.

---

## 3. Repository Structure

```
smarthire-prep/
├── backend/
│   ├── app.py                     # Flask app entrypoint
│   ├── config.py                  # App config (DB URI, upload limits)
│   ├── models.py                  # SQLAlchemy models
│   ├── data/
│   │   ├── skill_dictionary.json  # Canonical skills + synonyms
│   │   └── question_bank.json     # Questions tagged by role + skill
│   ├── modules/
│   │   ├── resume_parser.py       # Text extraction + skill/entity extraction
│   │   ├── question_selector.py   # Merge role + skills -> question set
│   │   ├── scoring_engine.py      # Answer relevance + clarity scoring
│   │   ├── ats_checker.py         # Heuristic ATS checks
│   │   └── report_generator.py    # Compile + export PDF report
│   ├── routes/
│   │   ├── roles.py
│   │   ├── resume.py
│   │   ├── interview.py
│   │   ├── ats.py
│   │   └── sessions.py
│   ├── requirements.txt
│   └── instance/app.db            # SQLite file (gitignored)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RoleSelect.jsx
│   │   │   ├── ResumeUpload.jsx
│   │   │   ├── InterviewQA.jsx
│   │   │   ├── FeedbackReport.jsx
│   │   │   ├── ATSReport.jsx
│   │   │   └── SessionHistory.jsx
│   │   ├── api/client.js          # fetch wrapper for backend REST calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 4. Data Model (SQLAlchemy models)

```
User
  id (PK)
  name
  email
  created_at

Resume
  id (PK)
  user_id (FK -> User)
  file_name
  extracted_text
  extracted_skills   # JSON array
  upload_date

InterviewSession
  id (PK)
  user_id (FK -> User)
  resume_id (FK -> Resume, nullable)
  role
  created_at
  overall_score

Question
  id (PK)
  role
  skill_tag          # nullable; null = generic role question
  question_text
  expected_keywords   # JSON array

Answer
  id (PK)
  session_id (FK -> InterviewSession)
  question_id (FK -> Question)
  answer_text
  relevance_score
  clarity_score

ATSReport
  id (PK)
  resume_id (FK -> Resume)
  ats_score
  issues_list         # JSON array of {type, message, severity}
  generated_at
```

For a solo/demo project, a single default `User` row can be created at first run (no auth required for MVP). Leave a clear TODO comment for adding real authentication later.

---

## 5. Feature Details & Logic

### 5.1 Role Selection
- Predefined roles (seed in `question_bank.json`): `Backend Developer`, `Frontend Developer`, `Full Stack Developer`, `Data Analyst`, `QA / Test Engineer`.
- Each role has an "ideal skill set" (used later for ATS keyword matching).

### 5.2 Resume Upload & Parsing (`resume_parser.py`)
- Accept `.pdf` and `.docx`, max 5MB. Reject other types with a clear JSON error.
- PDF: extract text via `pdfplumber`. Also call `page.extract_tables()` on each page — if any table is non-empty, flag `has_tables = True` (used later by ATS checker).
- DOCX: extract via `python-docx`, iterating both `document.paragraphs` AND `document.tables` (skills are sometimes in table cells).
- If extracted text length < 100 words, return an error response prompting the user to paste text manually as a fallback (implement a `POST /api/resume/manual-text` endpoint for this).
- Skill extraction: use spaCy `PhraseMatcher` loaded with the terms in `skill_dictionary.json`. Normalize synonyms first (e.g., `"js" -> "JavaScript"`, `"postgres" -> "PostgreSQL"`) via a lookup dict before matching.
- Entity extraction: use spaCy NER to pull `ORG` and `DATE` entities as a best-effort "experience" signal. Keep this lightweight — do not attempt full resume-section parsing.

### 5.3 Question Selection (`question_selector.py`)
- Input: `role`, `extracted_skills` (may be empty if no resume uploaded).
- Always include all generic (skill_tag = null) questions for the role.
- For each skill in `extracted_skills`, include any questions tagged with that skill.
- Deduplicate by question id.
- Cap the final set at **10 questions** (configurable constant `MAX_QUESTIONS`).
- If the capped set is smaller than desired (e.g., fewer than 5 questions exist for the role), that's fine — do not error.

### 5.4 Answer Scoring (`scoring_engine.py`)
- Input: `answer_text`, `expected_keywords` (list of strings from the `Question` row).
- **Relevance score**: For each expected keyword, check for a lemma match or spaCy vector similarity above a threshold (e.g., 0.6) between the keyword and any token/noun-chunk in the answer. Score = (keywords matched / total keywords) * 100, giving partial credit rather than binary exact-match.
- **Clarity score**: Use `textstat` sentence count + a small curated filler-word list (`"um"`, `"like"`, `"you know"`, `"kind of"`, `"sort of"`) — score inversely proportional to filler-word density and overly long run-on sentences. Do NOT apply standard Flesch-Kincaid prose readability directly (it misbehaves on short technical answers) — document this decision in a code comment.
- Return both scores plus 1–2 auto-generated improvement suggestions (e.g., "Consider mentioning: Docker, CI/CD" for missing keywords).

### 5.5 ATS Compatibility Check (`ats_checker.py`)
Compute a weighted overall score (0–100) from these checks:

| Check | Weight | Logic |
|---|---|---|
| Standard section headers present | 20% | Regex/keyword search for "Experience", "Education", "Skills" (case-insensitive, allow common variants) |
| Contact info present | 15% | Regex for email pattern and phone number pattern |
| No tables detected | 15% | Uses `has_tables` flag from parser; full score if false |
| Keyword match vs. role's ideal skill set | 30% | `(matched skills / ideal skills) * 100` |
| Action-verb bullet quality | 10% | % of bullet lines NOT starting with weak phrases ("responsible for", "worked on", "helped with") vs. a curated strong-verb list ("led", "built", "designed", "optimized", "implemented") |
| Resume length reasonable | 10% | Flag if extracted text is very short (<150 words) or very long (>1200 words) |

- Output: `{ ats_score: number, issues: [{ type, message, severity }] }`.
- Every issue message must be a specific, actionable sentence (see examples below), not a generic label.
- Example issue objects:
  ```json
  { "type": "tables", "message": "Resume contains 2 tables — these may not parse correctly in real ATS systems.", "severity": "warning" }
  { "type": "keywords", "message": "6 of 10 target-role keywords found; missing: Docker, CI/CD, Kubernetes, AWS.", "severity": "warning" }
  { "type": "contact", "message": "No phone number detected — add contact information for recruiter outreach.", "severity": "error" }
  ```
- **Always label this feature in the UI and API response as a heuristic estimate**, not a certified ATS score. Include a `disclaimer` string field in the API response.

### 5.6 Report Generation (`report_generator.py`)
- Compile: role, per-question Q&A with scores, overall interview score (average of relevance+clarity across answers), ATS score + issues.
- Export as PDF via `reportlab`. Endpoint: `GET /api/sessions/<id>/report.pdf`.

### 5.7 Session History
- List past `InterviewSession` rows with date + overall score.
- Endpoint to fetch full session detail (questions, answers, scores, linked ATS report) in read-only view.

---

## 6. REST API Contract

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/roles` | List predefined roles |
| POST | `/api/resume/upload` | Upload resume file (multipart/form-data) → returns `resume_id`, `extracted_skills`, `has_tables` |
| POST | `/api/resume/manual-text` | Fallback: submit pasted resume text if parsing fails |
| POST | `/api/interview/start` | Body: `{ role, resume_id? }` → creates `InterviewSession`, returns selected `questions` |
| POST | `/api/interview/answer` | Body: `{ session_id, question_id, answer_text }` → returns `{ relevance_score, clarity_score, suggestions }` |
| POST | `/api/ats/check` | Body: `{ resume_id, role }` → returns ATS report |
| GET | `/api/sessions` | List session history |
| GET | `/api/sessions/<id>` | Full session detail |
| GET | `/api/sessions/<id>/report.pdf` | Download PDF report |

All error responses: `{ "error": true, "message": "<human readable>" }` with appropriate HTTP status (400 for bad input, 422 for unparseable file, 500 for unexpected).

---

## 7. Non-Functional Requirements (must hold in implementation)

- Resume parsing + skill extraction: complete within ~5 seconds for a 1–2 page resume on standard hardware.
- Load the spaCy model **once** at Flask app startup (module-level global), never inside a route handler.
- Validate file type and size (≤5MB) both client-side (before upload) and server-side (never trust the client alone).
- Wrap all file-processing and NLP logic in try/except; never leak raw stack traces to the client — return the structured error format above.
- Keep `skill_dictionary.json` and `question_bank.json` as external, hand-editable data files, not hardcoded in Python logic.
- No GPU dependency; must run on a typical student laptop.
- CORS must be explicitly configured for the React dev origin (`http://localhost:5173` for Vite) and whatever production origin is used.

---

## 8. Seed Data Requirements

Claude Code should generate realistic starter content for these files (expand over time, but ship enough to demo):

- **`skill_dictionary.json`**: ~150–200 tech skills with synonym mappings, e.g.
  ```json
  { "canonical": "JavaScript", "synonyms": ["js", "javascript", "ecmascript"] }
  ```
- **`question_bank.json`**: ~25–30 questions per role across the 5 roles (mix of generic role-level and skill-tagged), each with `expected_keywords`. Cover at minimum: Python, Java, JavaScript, React, Node.js, Flask, Django, SQL, MongoDB, Docker, AWS, Git, REST API, CI/CD for skill tags.
- Ideal skill sets per role (used for ATS keyword matching), e.g. Backend Developer → `["Python", "SQL", "REST API", "Docker", "Git", "CI/CD", "AWS", "Flask/Django"]`.

---

## 9. Explicit Out-of-Scope Items (do not build these in MVP)

- Live LLM-based question generation or feedback (documented as future scope only).
- OCR for scanned/image-based resumes.
- Speech-to-text answer input.
- Real user authentication/login system (single default user is fine for MVP; leave a TODO).
- Free-text job description upload / dynamic keyword extraction beyond the predefined role skill sets.
- Any claim of certified/official ATS scoring — this must always be presented as a heuristic estimate.

---

## 10. Suggested Build Order (for Claude Code to follow)

1. Scaffold Flask backend with SQLAlchemy models and empty routes; scaffold React app with routing between the 6 views.
2. Implement `resume_parser.py` + `/api/resume/upload` end to end; test with 2–3 sample resumes.
3. Build `skill_dictionary.json` and `question_bank.json` seed data.
4. Implement `question_selector.py` + `/api/interview/start`.
5. Implement `scoring_engine.py` + `/api/interview/answer`.
6. Implement `ats_checker.py` + `/api/ats/check`.
7. Implement `report_generator.py` + PDF export endpoint.
8. Implement session history endpoints + frontend view.
9. Wire up full frontend flow end-to-end with real backend (not mocked data) by the midpoint of the build, not at the end — this is the highest-risk integration point.
10. Polish UI states (loading, error, empty) and write the README with setup instructions.

---

## 11. README Requirements (for the repo's own README.md)

Claude Code should also produce a `README.md` at the repo root with:
- Project description (2–3 sentences)
- Setup instructions (backend venv + `pip install -r requirements.txt`, `python -m spacy download en_core_web_md`, `flask run`; frontend `npm install && npm run dev`)
- Environment variables / config needed
- How to run and demo the app locally
- Known limitations (mirror Section 9 above)
