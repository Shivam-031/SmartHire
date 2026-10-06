# SmartHire Prep v2 — Update Notes for the SRS / 50-Page Report

Regenerating the full 50-page `SmartHire_Prep_REPORT.docx` from scratch for v2 is a large job on its own — this note tells you exactly which sections need to change and gives replacement text for the ones that changed most, so you (or I, in a follow-up) can update the existing document efficiently rather than rebuilding it blind. **Say the word and I'll regenerate the full docx with these changes applied** — this is the prep work for that.

---

## Sections That Need Replacing

### 1.5 Scope
Replace with: the MVP now includes authentication, user profiles, a resume editor with export templates, two career fields (IT and Management) each with field-specific scoring rubrics, a rule-based mock interview mode, and MCQ alongside long-answer questions, backed by a mixed SQL + MongoDB architecture. The Law field and additional templates are explicitly Phase 2, not part of this submission's scope.

### 1.6 Tools & Technology Used
Add: **PyMongo** (MongoDB driver), **MongoDB** (document database for questions, resumes, and transcripts), **PyJWT** (JWT token issuance/validation), **bcrypt** (password hashing).

### 3.1 Hardware & Software Requirements
Add MongoDB (local install or a free-tier Atlas cluster) as a software requirement alongside SQLite.

### 4.3 Module Description
Add three new modules:
- **Auth Module** — signup/login, password hashing, JWT issuance/validation.
- **Resume Editor Module** — structured resume document CRUD against MongoDB.
- **Mock Interview Module** — branching question selection based on score thresholds, canned interviewer-remark selection, transcript logging.

Update the existing **Question Selector Module** and **Scoring Engine Module** descriptions to note they are now field-aware (different rubric weighting for IT vs Management, as detailed in the build spec's Section 2).

### 5.1 Table Structure
This needs the biggest rework — it currently shows six SQL tables only. Replace with two subsections:
- **5.1.1 SQL Tables** — updated `User` table (add `password_hash`, `target_field`, `target_role`), updated `InterviewSession` (add `field`, `mode`, `mongo_transcript_id`), updated `Answer` (add `question_type`, `selected_option`, `is_correct`). `ATSReport` gains `mongo_resume_id` in place of a SQL foreign key.
- **5.1.2 MongoDB Collections** — new subsection documenting `questions`, `skills`, `resumes`, and `transcripts` collections (see the build spec's Section 5 for the exact document shapes).

### 5.2 Diagrams
The ER diagram description needs updating to show the SQL-Mongo split (some relationships are now cross-database references via an ID field rather than a foreign key, which is worth calling out explicitly since it's a deliberate architectural choice, not an oversight). The Class Diagram description should add `AuthService`, `ResumeEditorService`, and `MockInterviewService`.

### 6.1 Technology
Add entries for PyMongo, MongoDB, PyJWT, and bcrypt, following the same three-paragraph format (description, key features used, role in SmartHire Prep) as the existing entries.

### 6.2 Snapshots
Add these screens to the list: Login/Signup, Field Selector, Profile, Resume Editor, Resume Template Picker, Interview Mode Selector, Mock Interview Screen, MCQ Question Screen. (Full descriptions for each are in the Frontend Style Addendum.)

### 6.3 Code
Add representative snippets for:
- JWT auth decorator (`@require_auth`) wrapping a protected route.
- A PyMongo query example (fetching field-tagged questions from the `questions` collection).
- The mock-interview branching logic (selecting a follow-up question based on score threshold).

### 7.1 Test Cases
Add test cases for: signup/login (valid + invalid credentials), MCQ auto-grading (correct/incorrect), field-specific rubric scoring (an IT answer vs a Management answer to confirm different scoring emphasis actually produces different results), and mock-interview branching (confirming a low score triggers the easier follow-up).

### 8. Future Scope
Move "Law field," "additional templates," and "deeper mock-interview branching" here explicitly (they're now Phase 2, not blue-sky ideas — word them as near-term planned work, distinct from the more speculative items like LLM integration and OCR).

---

## Sections That Do NOT Need to Change

Chapters 2 (Objective & Outcome), 3 (Project Profile, aside from the Mongo addition above), and the overall Feasibility Study logic in 4.2 remain valid as-is — the economic/technical/operational feasibility arguments still hold with the expanded scope, since everything new is still free and open-source.

---

## Recommended Next Step

If you want this turned into an actual updated docx (rather than these notes), tell me and I'll regenerate `SmartHire_Prep_REPORT.docx` end-to-end with all of the above folded in — it'll take a similar amount of back-and-forth as the original 50-page build, since a document this size is best assembled and page-count-checked iteratively.
