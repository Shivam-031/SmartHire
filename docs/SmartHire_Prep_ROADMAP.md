# SmartHire Prep — Project Roadmap

A step-by-step, phase-based roadmap for building the project within a ~4-week (28-day) timeline. Each phase lists goals, tasks, deliverables, and an exit checkpoint — don't move to the next phase until the checkpoint passes.

---

## Phase 0: Setup & Planning (Day 1–2)

**Goal:** Environment ready, scope frozen, no ambiguity left before coding starts.

**Tasks:**
- [X] Install Python 3.9+, Node.js, and set up a virtual environment for the backend.
- [X] `pip install flask flask-cors flask-sqlalchemy pdfplumber python-docx spacy textstat reportlab`
- [X] `python -m spacy download en_core_web_md`
- [X] Scaffold React app with Vite (`npm create vite@latest frontend -- --template react`)
- [X] Initialize Git repo, create `.gitignore` (node_modules, venv, instance/*.db, __pycache__)
- [X] Create the folder structure from the build spec (backend/modules, backend/routes, frontend/src/components, etc.)
- [X] Read through the SRS and build spec once fully — freeze scope, write down anything you're explicitly NOT building (keep this list visible, e.g., pinned in a notes file)

**Deliverable:** Empty-but-running Flask server (`/` returns "OK") and empty-but-running React app, both in Git.

**Checkpoint:** Can you run `flask run` and `npm run dev` at the same time with no errors? ✅ Move on.

---

## Phase 1: Data Foundations (Day 3–5)

**Goal:** All the "content" the app needs exists before any logic is built on top of it.

**Tasks:**
- [X] Write `skill_dictionary.json` — at least 150 skills with synonym mappings.
- [X] Write `question_bank.json` — 25–30 questions per role, across 5 roles, tagged by role + optional skill, each with `expected_keywords`.
- [X] Define "ideal skill set" per role (used later for ATS keyword matching).
- [X] Define SQLAlchemy models in `models.py` (User, Resume, InterviewSession, Question, Answer, ATSReport).
- [X] Run initial migration / `db.create_all()` and seed the Question table from `question_bank.json` via a one-off seed script.

**Deliverable:** SQLite DB file with all tables created and Question table populated; JSON data files committed to repo.

**Checkpoint:** Query the DB directly (e.g., via a quick Python shell) and confirm questions load correctly for at least 2 roles. ✅ Move on.

---

## Phase 2: Resume Upload & Parsing (Day 6–9)

**Goal:** A user can upload a resume and get back extracted skills — the riskiest technical piece, so it's tackled early.

**Tasks:**
- [ ] Build `POST /api/resume/upload` route — file type/size validation, save to a temp path.
- [ ] Implement `resume_parser.py`: PDF via `pdfplumber`, DOCX via `python-docx` (including tables).
- [ ] Implement `has_tables` detection during PDF parsing.
- [ ] Implement skill extraction via spaCy `PhraseMatcher` + synonym normalization.
- [ ] Implement fallback: if extracted text < 100 words, return an error prompting manual text entry; build `POST /api/resume/manual-text`.
- [ ] Build minimal React `ResumeUpload` component to test the full round trip (upload → see extracted skills on screen).
- [ ] **Test on 8–10 real, varied resumes** (different formats, one with tables, one image-based/scanned) to see where extraction breaks.

**Deliverable:** Working upload flow, tested against real resume variety, with known failure modes documented.

**Checkpoint:** Upload 3 different resumes and get sensible skill lists back for all of them, with graceful handling of the scanned one. ✅ Move on.

---

## Phase 3: Question Selection & Interview Flow (Day 10–13)

**Goal:** A user can pick a role, get personalized questions, and answer them.

**Tasks:**
- [ ] Implement `question_selector.py` — merge role + resume skills, dedupe, cap at 10 questions.
- [ ] Build `POST /api/interview/start` — creates `InterviewSession`, returns selected questions.
- [ ] Build `RoleSelect` and `InterviewQA` React components — role dropdown, then question-by-question answer flow.
- [ ] Wire frontend state so resume upload → role selection → interview questions flows without page reloads (React state or Context, not Redux).
- [ ] Add loading and error states for each step.

**Deliverable:** End-to-end flow: select role → (optionally) upload resume → get a tailored question list on screen.

**Checkpoint:** Change the uploaded resume's skills and confirm the question set actually changes accordingly. ✅ Move on.

---

## Phase 4: Answer Scoring (Day 14–16)

**Goal:** Submitted answers get real, useful feedback.

**Tasks:**
- [ ] Implement `scoring_engine.py` — relevance score (keyword/lemma/similarity matching against `expected_keywords`) and clarity score (filler words + sentence structure via `textstat`).
- [ ] Calibrate thresholds: test on ~20 sample answers (mix of strong/weak) and tune scoring cutoffs until they roughly match your own judgment.
- [ ] Build `POST /api/interview/answer` — stores the `Answer` row, returns scores + 1–2 improvement suggestions.
- [ ] Build `FeedbackReport` component — shows per-question score and suggestions immediately after each answer.

**Deliverable:** Full interview loop works: answer a question → see a score and suggestion within ~2 seconds.

**Checkpoint:** Submit one deliberately strong answer and one deliberately weak answer to the same question — do the scores clearly differ in the expected direction? ✅ Move on.

---

## Phase 5: ATS Compatibility Checker (Day 17–20)

**Goal:** Resume gets a heuristic ATS score with specific, actionable issues.

**Tasks:**
- [ ] Implement `ats_checker.py` with all six weighted checks (section headers, contact info, tables, keyword match, action-verb bullets, length).
- [ ] Build `POST /api/ats/check` — returns `{ ats_score, issues[], disclaimer }`.
- [ ] Build `ATSReport` React component — score display + list of specific issues (not vague labels).
- [ ] Add the "heuristic estimate, not a certified score" disclaimer visibly in the UI.
- [ ] Test against the same 8–10 resumes from Phase 2 and sanity-check the scores feel proportionate (a clean, well-formatted resume should score noticeably higher than a messy one).

**Deliverable:** Working ATS report, tested against real resume variety.

**Checkpoint:** Does a resume with tables and weak bullet phrasing score visibly lower than a clean one? ✅ Move on.

---

## Phase 6: Reports & Session History (Day 21–23)

**Goal:** Everything ties together into a single exportable report, and past sessions are browsable.

**Tasks:**
- [ ] Implement `report_generator.py` — compile interview scores + ATS results into one structured report.
- [ ] Build `GET /api/sessions/<id>/report.pdf` using `reportlab`.
- [ ] Build `GET /api/sessions` and `GET /api/sessions/<id>` endpoints.
- [ ] Build `SessionHistory` React component — list past sessions, click through to a read-only detail view.

**Deliverable:** Full report downloadable as PDF; session history browsable.

**Checkpoint:** Complete one full session start-to-finish, download the PDF, and confirm it contains everything (Q&A scores + ATS issues) correctly. ✅ Move on.

---

## Phase 7: Integration, Polish & Testing (Day 24–26)

**Goal:** The whole app feels solid, not just individually-working pieces.

**Tasks:**
- [ ] Full click-through test of the entire user journey at least 5 times with different inputs.
- [ ] Add proper loading spinners, empty states, and human-readable error messages everywhere (no raw stack traces reaching the UI).
- [ ] Cross-check CORS config works against the actual frontend origin being used.
- [ ] Handle edge cases: no resume uploaded (generic questions only), corrupt file upload, empty answer submitted.
- [ ] Basic responsive check — does it look reasonable on a laptop screen and a phone-width browser window?
- [ ] Clean up console warnings/errors in both frontend and backend logs.

**Deliverable:** A demo-ready app with no obvious rough edges.

**Checkpoint:** Have someone else (friend/classmate) use it once without your guidance — where do they get confused or stuck? Fix those spots.

---

## Phase 8: Documentation & Viva Prep (Day 27–28)

**Goal:** You can explain and defend every decision confidently.

**Tasks:**
- [ ] Finalize `README.md` with setup instructions, screenshots, and known limitations.
- [ ] Fill in remaining placeholders in the SRS (name, college, guide) and insert an actual architecture/ER diagram image.
- [ ] Write a one-paragraph justification for each major tech choice (spaCy vs. transformers, rule-based vs. LLM, SQLite vs. Postgres) — expect to be asked "why this and not X."
- [ ] Prepare a 5–7 minute demo script: role select → resume upload → interview Q&A → ATS report → session history.
- [ ] List 3–5 "future scope" items you can mention if asked about limitations (LLM integration, OCR, speech-to-text, live job-description matching).

**Deliverable:** Polished repo, filled SRS, rehearsed demo.

**Checkpoint:** Can you do the full demo in under 7 minutes without hitting a bug? If not, simplify the demo path, don't just hope it works live.

---

## Timeline Summary

| Phase | Days | Focus |
|---|---|---|
| 0 | 1–2 | Setup & environment |
| 1 | 3–5 | Data foundations (skills, questions, DB) |
| 2 | 6–9 | Resume upload & parsing |
| 3 | 10–13 | Question selection & interview flow |
| 4 | 14–16 | Answer scoring |
| 5 | 17–20 | ATS compatibility checker |
| 6 | 21–23 | Reports & session history |
| 7 | 24–26 | Integration, polish, testing |
| 8 | 27–28 | Documentation & viva prep |

**Buffer note:** This adds up to 28 days with no slack. If any phase runs long (Phase 2 and Phase 5 are the highest-risk for surprises), pull time from Phase 7 polish rather than skipping Phase 8 documentation — an examiner will always ask questions the SRS/README should answer.

---

## Risk Flags to Watch

- **Day 9 checkpoint (resume parsing) is the most important early gate.** If parsing is unreliable by then, simplify: restrict supported formats further, or lean more on the manual-text fallback, rather than over-engineering the parser.
- **Day 20 checkpoint (ATS scoring) is where scope creep is most tempting** (wanting to add job-description matching, more checks, etc.) — resist it; the six checks already defined are enough for a strong demo.
- **Don't let integration (Phase 7) become a last-minute scramble.** The build spec already recommends wiring frontend-to-real-backend by the midpoint (~Day 13), not the end — stick to that.
