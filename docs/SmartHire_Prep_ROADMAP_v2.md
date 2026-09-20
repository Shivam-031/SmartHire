# SmartHire Prep v2 — Roadmap (MVP vs Phase 2)

The new feature set (auth, profiles, resume editor + templates, 3 fields, mock interview mode, MCQ + long answer, mixed DB) does not fit safely in 4 weeks for one developer alongside the quality bar you've held so far. This roadmap draws an explicit line: **what ships in the 4-week MVP**, and **what is real, planned Phase 2 work** — not abandoned, just sequenced.

If you truly need all of it in 4 weeks, the honest move is to cut depth, not scope: fewer fields, fewer templates, thinner mock-interview branching. That cut line is marked below.

---

## MVP Scope (Weeks 1–4) — what actually ships

- **Auth**: signup/login with JWT, no password reset.
- **Profile**: view/edit target field + role, list of saved resumes and session history.
- **Fields**: **IT and Management only** at launch (Law added in Phase 2 — see cut-line note). Each with its own scoring rubric emphasis as defined in the build spec.
- **Resume**: upload/parse (v1 behavior) **+** a basic Resume Editor (structured fields, no live preview) **+** exactly **1 template** for PDF export (add 2 more in Phase 2).
- **Interview modes**: standard static Q&A (v1 behavior, now field-aware) **+** a **simplified Mock Interview mode** — branching limited to one follow-up per question, not a deep tree.
- **Question types**: both MCQ and long answer, but the MCQ bank only needs to be reasonably sized (15–20 per field), not exhaustive.
- **Database**: SQL + MongoDB both stood up from day one (this is now a hard requirement of the MVP, not optional, since retrofitting a second database later is expensive).
- **ATS Checker, Report Generator, Session History**: carried over from v1 largely unchanged.

## Phase 2 Backlog (post-MVP) — real, sequenced, not scope creep

- Add the **Law** field (question bank + rubric).
- Expand Resume Templates from 1 to 3+, add a live preview in the editor.
- Deepen Mock Interview branching (multiple follow-up levels, richer interviewer persona lines).
- Expand MCQ banks to full depth across all fields.
- Password reset / email verification.
- Admin interface for managing the Mongo-backed question bank without direct DB access.
- (Existing v1 Phase 2 items still stand too: LLM integration, OCR, speech-to-text, live job-description matching.)

---

## Phase-by-Phase Plan (4 weeks, MVP scope only)

### Phase 0 — Setup & Architecture (Days 1–3)
- Set up Flask + SQLAlchemy (SQL) **and** PyMongo (MongoDB) connections, both loaded once at startup.
- Set up React app, routing for the new screens: Login/Signup, Profile, Field Selector, Resume Editor, Template Picker, Interview (standard + mock), ATS Report, Summary.
- Scaffold JWT auth middleware on the backend.
- **Checkpoint:** a protected API route only responds with a valid token; both databases are reachable from a test script.

### Phase 1 — Auth, Profile & Data Foundations (Days 4–7)
- Build signup/login endpoints and JWT issuance; hash passwords with bcrypt.
- Build Profile get/update endpoints.
- Seed the Mongo `questions` collection for **IT and Management only**, tagged with `question_type` and `focus_dimension`.
- Seed the Mongo `skills` collection.
- **Checkpoint:** a new user can sign up, log in, set a target field/role, and the question bank returns field-appropriate questions for both fields.

### Phase 2 — Resume Upload, Editor & ATS (Days 8–13)
- Carry over v1's Resume Parser (PDF/DOCX → text + skills).
- Build the Resume Editor: structured form, save to Mongo `resumes` collection, pre-fill from parsed upload where possible.
- Build 1 resume template's PDF export.
- Carry over the ATS Checker largely unchanged, pointed at the Mongo resume document instead of a SQL row.
- **Checkpoint:** a logged-in user can upload OR build a resume, edit it, export it as a PDF with the one available template, and get an ATS report on it.

### Phase 3 — Standard Interview + MCQ (Days 14–17)
- Extend the v1 Question Selector to be field-aware (IT vs Management rubric).
- Implement MCQ submission/auto-grading endpoint.
- Implement the field-specific long-answer scoring rubric split described in the build spec (code/concept vs communication/situational weighting).
- **Checkpoint:** a session in each field produces sensibly different-feeling feedback — an IT answer scored on keyword precision, a Management answer scored more on structure/clarity.

### Phase 4 — Mock Interview Mode (Days 18–21)
- Implement the simplified branching logic (one follow-up per question, score-threshold triggered).
- Implement the canned interviewer-remark selection logic.
- Log each mock session as a transcript document in Mongo.
- **Checkpoint:** a mock session visibly changes its next question based on whether the previous answer was strong or weak.

### Phase 5 — Reports, History & Cross-DB Integration (Days 22–25)
- Update the Report Generator to pull from both SQL (scores) and Mongo (resume content, transcript) when compiling the PDF.
- Update Session History to list both standard and mock sessions, across both fields.
- **Checkpoint:** a full end-to-end session (either field, either mode) produces one coherent downloadable report.

### Phase 6 — Integration, Polish & Testing (Days 26–28)
- Full click-through testing across both fields and both interview modes.
- Edge cases: expired token, empty MCQ bank for a skill, resume with no editor content yet.
- Tighten loading/error states across the new screens (Login, Profile, Editor, Template Picker).
- **Checkpoint:** an outside tester can sign up, complete one full session in each field, and export a resume, without guidance.

---

## Risk Flags (updated for v2)

- **Two databases from day one is the biggest new risk.** If Phase 0's dual-DB setup slips, everything downstream slips with it — do not proceed to Phase 1 until both connections are proven solid.
- **Field-specific scoring rubrics are new, unproven logic** — budget real time in Phase 3 to calibrate the Management rubric (structure-based scoring is harder to tune than IT's keyword-based approach) against sample answers, the same way v1 calibrated its single rubric.
- **Mock Interview branching can balloon in scope** if you start adding more follow-up levels mid-build — the MVP explicitly caps it at one follow-up per question. Resist expanding this until Phase 2.
- **Law field is deliberately deferred**, not because it's harder technically, but because adding a third rubric + question bank on top of everything else above is the most defensible thing to cut if the timeline gets tight partway through.

---

## If Even the MVP Feels Tight

Cut in this order (each cut meaningfully reduces risk without gutting the demo):
1. Drop Management field at launch too — ship IT-only, add Management in Phase 2 alongside Law.
2. Drop the Resume Editor's "pre-fill from upload" behavior — let upload and editor be two separate, simpler paths instead of one connected pipeline.
3. Drop Mock Interview branching entirely for the demo — ship it as static back-to-back questions with just the canned interviewer remarks (no real branching logic), and add branching in Phase 2.
