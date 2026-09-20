# SmartHire Prep v2 — Frontend Style Addendum

This extends `SmartHire_Prep_FRONTEND_STYLE.md` (the "marked-up worksheet" visual language — paper background, ink text, one marking-pen green accent, gold/red reserved for warnings/scores). Everything in the original guide still applies. This covers only the new screens introduced by v2.

---

## New Screens

**Login / Signup**
- Kept deliberately plain — a centered, narrow card (~400px) on the paper background, not a split-screen marketing layout. This is a utility screen, not a landing page.
- Fields use the same input style as the rest of the app (1px hairline border, 4px radius). Primary button: "Log in" / "Create account" — not "Submit."
- Error states (wrong password, email taken) appear inline below the relevant field in `--accent-flag`, not as a toast/banner.

**Field Selector** (new step before Role Selection)
- Sits *before* Role Selection in the folder-tab spine: tabs become Field → Role → Resume → Interview → ATS Report → Summary.
- Three large cards (IT, Management, Law once shipped), each with a one-line description of its focus (e.g., "Code, concepts, and system design" / "Communication, judgment, and leadership scenarios"). Same card-select pattern as Role Selection (green left-border accent on selection).

**Profile Screen**
- Accessible from a persistent icon in the top corner (outside the folder-tab flow, since it's not part of a session).
- Shows editable target field/role, and two quiet lists below: saved resumes and past sessions — same "quiet list" treatment as the Session History component in the original guide (hairline dividers, no card shadows).

**Resume Editor**
- Structured form, not a rich-text canvas — this matches the "worksheet" concept better than a WYSIWYG editor would. Each section (Contact, Summary, Experience, Education, Skills, Projects) is a distinct block separated by a hairline rule, with repeatable entries (Experience, Education, Projects) using a small "+ Add another" text-link in `--accent-mark`, not a filled button (keeps repeated-entry actions visually secondary to the main save action).
- A persistent "Save resume" primary button, not autosave-only — the user should always know their edits are captured.

**Resume Template Picker**
- A row of template thumbnails (start with 1–3), each a small preview image with the template name beneath it. Selected template gets the same green-border selection treatment used everywhere else in the app — reuse the pattern, don't invent a new one.
- "Export as PDF" primary button below the picker.

**Interview Mode Selector**
- Presented as two options before entering the Interview tab: "Standard practice" and "Mock interview" — styled as two side-by-side cards, each with a one-line description, not a toggle switch (a toggle implies a settings change; this is a meaningful choice with a different experience).

**Mock Interview Screen**
- Visually similar to the standard Interview Q&A screen, with two additions: a small italic line above the question showing the "interviewer remark" (e.g., *"Good — let's go a bit deeper."*) in `--ink-muted`, and a subtle timer element (a thin countdown line, not a numeric countdown clock — keeps it calm rather than exam-like) in the corner.
- Do not use a chat-bubble UI for this screen. It should still read as a worksheet question, not a messaging app — the interviewer remark is a caption above the question, not a speech bubble.

**MCQ Question Screen**
- Options rendered as a vertical list of selectable rows (radio-style, but styled as full-width rows with a 1px hairline border, not native radio buttons) — consistent with the card-select pattern used for Role/Field selection.
- On submission, the selected row turns `--accent-mark` if correct or `--accent-flag` if incorrect, with the correct answer also highlighted in green if the user got it wrong — immediate, unambiguous feedback, no separate "Show answer" step.

---

## Updated Folder-Tab Spine

The left-hand navigation now reflects the longer flow:

```
Field
Role
Resume (Upload / Editor / Template)
Interview (Standard / Mock)
ATS Report
Summary
```

Keep the same visual treatment as before (filled green for current, checkmark for completed, muted for locked) — the spine grows, but the pattern doesn't change. Resist the urge to redesign the navigation just because it's longer; a taller list of the same tab style is preferable to a new navigation paradigm.

---

## Do / Don't (additions)

| Do | Don't |
|---|---|
| Treat Login/Signup as a plain utility screen | Give it a marketing hero treatment |
| Style MCQ options as the same card-select pattern used elsewhere | Use native browser radio buttons |
| Show the mock-interview timer as a thin line | Use a big numeric countdown (feels like an exam, not practice) |
| Keep the interviewer remark as a caption above the question | Render it as a chat bubble |
| Reuse the green-border selection pattern for templates | Invent a new selection visual per screen |
