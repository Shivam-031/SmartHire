# SmartHire Prep v2 — Build Specification (Updated Scope)

This supersedes the original build spec. It reflects the expanded feature set: authentication, user profiles, a resume editor with templates, multi-field question support (IT / Management / Law), a rule-based mock-interview mode, mixed question types (MCQ + long answer), and a mixed SQL + MongoDB data architecture.

**Read this alongside `SmartHire_Prep_ROADMAP_v2.md`, which splits this scope into a 4-week MVP and a Phase 2 backlog — not everything below ships in month one.**

---

## 1. What Changed From v1

| Area | v1 | v2 |
|---|---|---|
| Auth | None (single default user) | Email/password login + signup, JWT sessions |
| Users | Implicit | Full Profile (name, target field/role, saved resumes) |
| Fields | IT roles only | IT, Management, Law (each with its own focus + question logic) |
| Resume | Upload/parse only | Upload/parse **+** in-app Resume Editor **+** Resume Templates (export) |
| Interview mode | Static one-shot Q&A | Static Q&A **+** scripted Mock Interview mode (branching follow-ups) |
| Question types | Long answer only | Long answer **+** MCQ |
| Database | SQLite only | SQL (SQLite/Postgres) **+** MongoDB (mixed) |
| AI approach | Rule-based | Still rule-based — explicitly no live LLM (per decision) |

---

## 2. Field & Focus Model

Each **Field** represents a career domain. Each Field has its own Roles and its own "focus dimensions" that shape what its questions emphasize:

| Field | Example Roles | Focus Dimensions |
|---|---|---|
| IT | Backend Developer, Frontend Developer, Data Analyst, QA Engineer | Code correctness, technical concepts, system design |
| Management | Product Manager, Team Lead, Operations Manager | Communication clarity, situational judgment, senior/leadership scenarios |
| Law | Corporate Associate, Legal Analyst | Legal reasoning, case application, statute/precedent recall |

This means the Question Bank's schema needs a `focus_dimension` tag alongside `field`, `role`, and `skill_tag`, and the Scoring Engine needs a different scoring emphasis per focus dimension:

- **Code/Concept (IT):** keyword/semantic relevance scoring as in v1, plus MCQ auto-grading for concept checks.
- **Communication/Situational (Management):** clarity score weighted higher than keyword match; scoring emphasizes structure (e.g., did the answer address the situation, the action taken, and the outcome — an SAR-style rubric) over exact terminology.
- **Legal Reasoning (Law):** keyword match against expected legal concepts/terms, plus a structure check for whether the answer references a rule and applies it to the facts (a simplified IRAC-style rubric: Issue, Rule, Application, Conclusion keyword presence).

Each field therefore needs its own **scoring rubric config**, not just a different question bank. This is the single biggest new piece of scoring logic in v2.

---

## 3. New Feature Specs

### 3.1 Authentication
- Signup: name, email, password (hashed with bcrypt).
- Login: email + password → JWT access token (short-lived) stored client-side.
- All session/profile/resume endpoints require a valid token (replacing v1's "single default user" placeholder).
- Password reset is out of scope for MVP — flag as Phase 2.

### 3.2 Profile
- View/edit: name, email, target field, target role.
- List of saved resumes (from the Resume Editor and/or uploads).
- Session history (carried over from v1).

### 3.3 Resume Editor
- A structured, section-based editor (not freeform rich text) with fields for: Contact Info, Summary, Experience (repeatable entries), Education (repeatable), Skills, Projects (repeatable).
- User can start from a blank editor, or from a parsed upload (v1's Resume Parser pre-fills the editor's fields where it can detect them).
- Saved as a structured document (see Section 4 — this lives in MongoDB, not SQL, because its shape is nested and varies per user).

### 3.4 Resume Templates
- A small set of pre-built visual templates (start with 3: Modern, Classic, Minimal) that render the structured resume document into a downloadable PDF.
- Template rendering uses the same `reportlab`-based approach as the v1 session report, with template-specific layout functions rather than a single fixed layout.
- Template preview: a static thumbnail image per template shown in a picker UI (Design note: this belongs in the Frontend Style Guide addendum).

### 3.5 Mock Interview Mode (rule-based)
This is the "AI mock interview" feature, kept rule-based per your decision — no live LLM call. It differs from v1's static Q&A by adding:
- A **scripted interviewer persona**: canned transition lines between questions (e.g., "Good — let's go a bit deeper.", "Let's move to a different area.") selected based on the previous answer's score band, not generated dynamically.
- **Branching follow-ups**: each question can have 1–2 pre-written follow-up questions tagged by trigger condition (`if_score_below: 50` → simpler follow-up; `if_score_above: 80` → harder follow-up). This is a decision tree, not free generation.
- **Per-question timer** (visual only in MVP; no hard cutoff required).
- Mock Interview sessions are logged as a **transcript** (ordered list of turns: question, canned interviewer remark, user answer, score) — this is naturally document-shaped and lives in MongoDB (see Section 4).

### 3.6 Question Types — MCQ + Long Answer
- **MCQ**: question text, 4 options, 1 correct option index. Auto-graded exactly (no NLP) — either right or wrong, contributing to a simple percentage-correct score. Used for concept-checking across all three fields (e.g., IT: "What does ACID stand for?"; Management: "Which conflict-resolution style prioritizes relationship over outcome?"; Law: "Which source of law is binding precedent?").
- **Long Answer**: unchanged from v1 — scored via the field-specific rubric described in Section 2.
- Each Question record now has a `question_type` field (`"mcq"` or `"long_answer"`), and MCQ questions carry an `options` array and `correct_option` index instead of `expected_keywords`.

---

## 4. Mixed Database Architecture

**Why two databases:** SQL is kept for data with clear relationships and integrity requirements (accounts, sessions, scores). MongoDB is introduced for data that is naturally document-shaped, variable in structure, or high in read/write volume without needing joins — this avoids forcing awkward relational schemas onto content that doesn't fit one.

| Data | Store | Why |
|---|---|---|
| User accounts, auth credentials | **SQL** (SQLAlchemy) | Needs integrity, uniqueness constraints on email, relational link to sessions |
| InterviewSession, Answer, ATSReport records (scores, timestamps) | **SQL** | Structured, relational, queried with joins for history/reporting |
| Question Bank (all fields, all types) | **MongoDB** | Schema varies by question_type (MCQ vs long answer) and by field (different rubric tags); flexible schema avoids many nullable SQL columns |
| Skill Dictionary | **MongoDB** | Simple document list, no relational need |
| Resume documents (from the Resume Editor) | **MongoDB** | Deeply nested, variable-length (repeatable experience/education/project entries) — a natural document fit, awkward as normalized SQL tables |
| Mock Interview transcripts | **MongoDB** | Ordered, variable-length turn logs — document-shaped by nature |

**Implementation approach:**
- SQL side: SQLAlchemy ORM, same models as v1 (User now holds real auth fields; InterviewSession, Answer, ATSReport unchanged in shape) — plus a `mongo_resume_id` / `mongo_transcript_id` reference field where a SQL record needs to point at a Mongo document.
- Mongo side: PyMongo (or an ODM such as `mongoengine`/`beanie` if the team prefers schema validation) with three collections: `questions`, `skills`, `resumes`, `transcripts`.
- The backend therefore has **two connection setups**: SQLAlchemy for SQL, PyMongo client for Mongo, both initialized once at Flask app startup (same pattern as spaCy's model loading in v1 — load once, not per-request).

---

## 5. Updated Data Model

**SQL (unchanged core, extended User):**
```
User
  id (PK), name, email (unique), password_hash, target_field, target_role, created_at

InterviewSession
  id (PK), user_id (FK), mongo_resume_id (nullable), field, role, mode ("standard" | "mock"),
  mongo_transcript_id (nullable, set only when mode = "mock"),
  created_at, overall_score

Answer
  id (PK), session_id (FK), mongo_question_id, question_type, answer_text (nullable for MCQ),
  selected_option (nullable, for MCQ), relevance_score, clarity_score, is_correct (nullable, for MCQ)

ATSReport
  id (PK), mongo_resume_id, ats_score, issues_list (JSON), generated_at
```

**MongoDB collections:**
```
questions: {
  _id, field, role, skill_tag, question_type, focus_dimension,
  question_text, expected_keywords (long_answer only),
  options (mcq only), correct_option (mcq only),
  follow_ups: [{ trigger: "if_score_below" | "if_score_above", threshold, question_text }]
}

skills: { _id, canonical, synonyms: [...] }

resumes: {
  _id, user_id, contact: {...}, summary, experience: [...],
  education: [...], skills: [...], projects: [...],
  template_id, last_updated
}

transcripts: {
  _id, session_id, turns: [
    { question_text, interviewer_remark, answer_text, score, timestamp }
  ]
}
```

---

## 6. Updated REST API Contract (new/changed endpoints only)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Return JWT token |
| GET | `/api/profile` | Get current user's profile |
| PUT | `/api/profile` | Update target field/role |
| GET | `/api/fields` | List fields and their roles |
| GET/PUT | `/api/resume/editor` | Load/save the structured resume document (Mongo) |
| GET | `/api/resume/templates` | List available templates with thumbnails |
| POST | `/api/resume/export` | Render resume + chosen template → PDF |
| POST | `/api/interview/mock/start` | Start a Mock Interview session (mode = "mock") |
| POST | `/api/interview/mock/answer` | Submit an answer; returns score, canned interviewer remark, and next question (branching) |
| POST | `/api/interview/mcq/answer` | Submit an MCQ selection; returns is_correct |

All previously defined v1 endpoints (`/api/interview/start`, `/api/interview/answer`, `/api/ats/check`, `/api/sessions`, etc.) remain, now scoped to the authenticated user via the JWT token instead of a default user.

---

## 7. Explicit Out-of-Scope (still, even in v2)

- Live LLM APIs for question generation or conversational mock interviews — the mock interview stays a scripted decision tree.
- Password reset / email verification flows.
- Real-time collaborative resume editing.
- OCR, speech-to-text (unchanged from v1's exclusions).
- More than 3 resume templates at MVP (add more post-launch).
- More than 3 fields at MVP if time is tight — see the roadmap for the exact cut line.
