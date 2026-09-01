# SmartHire Prep — Frontend Style Guide

This document defines the visual identity and UI conventions for the SmartHire Prep frontend. It exists so the app looks intentional and cohesive rather than like a default component-library demo — and so anyone building screens later (including an AI coding agent) makes consistent choices.

---

## 1. Design Concept

**The metaphor:** a marked-up worksheet, not a dashboard. SmartHire Prep is fundamentally about *preparation and feedback* — practice questions, a resume being reviewed, scores being marked. The visual language borrows from graded paper and index cards: a calm paper background, ink-dark text, and a single confident "marking pen" color used specifically for feedback and scores. This gives the scoring/feedback moments (the actual payoff of the app) real visual weight instead of blending into generic UI chrome.

**Explicitly avoided:** warm cream + terracotta (the current AI-generated default), all-rounded SaaS cards with soft grey shadows, tracked-out ALL-CAPS eyebrow labels, monospace-for-everything, and dot/dash-separated meta strings. None of that is banned outright — it's just not the direction here, so don't reach for it by default.

---

## 2. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--paper` | `#EEF0EA` | Page background — pale, cool, slightly sage-tinted paper. Not the cliché warm cream. |
| `--paper-raised` | `#FFFFFF` | Cards / input surfaces that sit "on top of" the page. |
| `--ink` | `#1A2E22` | Primary text — deep forest-ink, not pure black. |
| `--ink-muted` | `#5C6B60` | Secondary text, captions, helper copy. |
| `--line` | `#D2D5C9` | Hairline dividers, input borders, table rules. |
| `--accent-mark` | `#2F6F4E` | The "marking pen" accent — primary buttons, active states, positive scores, checkmarks, links. |
| `--accent-flag` | `#B23A2E` | Reserved for warnings/errors/low scores/flagged ATS issues only — never decorative. |
| `--accent-gold` | `#B08D2F` | Reserved for mid-range/"needs work" scores (the third point on the score traffic-light, between mark-green and flag-red). |

**Rule:** `--accent-flag` and `--accent-gold` are semantic, not decorative. They only appear attached to a score, a warning, or an error state. If you want visual interest elsewhere, use `--accent-mark` or typographic weight/scale — don't reach for the red or gold as decoration.

**Dark surfaces:** not used in this app. The paper/ink relationship is the whole point — don't add a dark mode toggle unless explicitly requested, and if you do, keep the same warm-paper-vs-ink logic in reverse rather than a generic near-black dashboard theme.

---

## 3. Typography

| Role | Typeface | Notes |
|---|---|---|
| Display / Headings | **Fraunces** (serif, variable) | Has character without being a generic high-contrast Didone. Use at optical size "display" for large headings. |
| Body / UI | **IBM Plex Sans** | Clean, slightly technical grotesque — fits a prep/study tool without feeling corporate-generic. |
| Scores / data values | **IBM Plex Mono** | Used *only* for actual numeric scores and data values (e.g., "78/100", "6/10 keywords") — tabular alignment matters here, so monospace is functional, not decorative. Do not use it for labels or body copy. |

**Type scale** (approx., adjust per breakpoint):

| Level | Size | Weight | Family |
|---|---|---|---|
| H1 | 40–48px | 500 | Fraunces |
| H2 | 28–32px | 500 | Fraunces |
| H3 | 20–22px | 600 | IBM Plex Sans |
| Body | 16px | 400 | IBM Plex Sans |
| Small / caption | 13–14px | 400 | IBM Plex Sans |
| Score display | 32–56px | 500 | IBM Plex Mono |

**Rules:**
- Line length for body text: under 80 characters — keep the Q&A and feedback text columns narrow, not full-width.
- No all-caps labels anywhere. Use sentence case.
- Don't bold or color a single word inside a headline for emphasis — if something needs emphasis, it earns its own line or its own component (e.g., the score badge), not a colored word mid-sentence.

---

## 4. Layout

**Concept: a folder/spine, not a wizard progress bar.** Instead of a generic numbered stepper (1→2→3→4) across the top, use a persistent left-hand "spine" — like tabs on a folder — showing the session's sections: *Role, Resume, Interview, ATS Report, Summary*. The current section is filled with `--accent-mark`; completed sections show a small mark (✓), not a number badge. This is a real sequence (so a stepper-like device is justified here), but rendered as folder tabs rather than the generic circled-number pattern.

**Alignment:** left-aligned throughout. This is a working tool, not a marketing page — center-aligned hero treatment would fight the "worksheet" concept.

**Grid / spacing:**
- Base spacing unit: 8px. Use multiples of it (8, 16, 24, 32, 48) for all margins/padding.
- Max content width: ~760px for the Q&A and report reading columns (matches the "narrow line length" typographic rule); the resume upload and role-select screens can run slightly wider (~960px) since they're form-like, not reading-heavy.

**Cards / surfaces:**
- Small, consistent border-radius (4px) — enough to soften edges, not the fully-rounded "SaaS card" look.
- Use a 1px `--line` border rather than a drop shadow as the primary way to separate a card from the page. Reserve a very subtle shadow (`0 1px 2px rgba(26,46,34,0.06)`) for genuinely elevated elements like modals, not every card.
- Divide sections with a hairline rule (`--line`) rather than whitespace alone where content is naturally sequential (e.g., between questions in a report).

**ASCII layout reference for the main interview screen:**

```
┌────────┬──────────────────────────────────────────┐
│ Role   │  Question 3 of 8                          │
│ Resume │  ───────────────────────────────           │
│ ▶Intvw │  "Explain how you'd design a rate          │
│ ATS    │   limiter for a public API."                │
│ Summary│                                            │
│        │  [ answer textarea                    ]   │
│        │                                            │
│        │              [ Submit answer → mark it ]   │
└────────┴──────────────────────────────────────────┘
```

---

## 5. Components

**Buttons**
- Primary: solid `--accent-mark` background, `--paper-raised` text, 4px radius, medium weight label. Label states the action directly ("Upload resume", "Submit answer") — never "Submit" alone or "Continue."
- Secondary: `--paper-raised` background, 1px `--line` border, `--ink` text.
- Disabled: `--ink-muted` text on `--line` background — no opacity-fade trick, an actual distinct disabled state.

**Score display (the signature element — this is where the design's "boldness" is spent)**
- Rendered as a large IBM Plex Mono numeral, color-coded: `--accent-mark` (≥75), `--accent-gold` (50–74), `--accent-flag` (<50).
- Accompanied by a short plain-language line underneath, not just the number (e.g., "78/100 — strong keyword coverage, a bit long-winded").
- This is the one place in the UI allowed real visual weight — keep every other score/number elsewhere in the interface quiet (small, `--ink-muted`) so this doesn't compete with itself.

**Inputs**
- 1px `--line` border, 4px radius, `--paper-raised` background, `--ink` text.
- Focus state: border becomes `--accent-mark`, 2px, with a visible focus ring for keyboard users (`outline: 2px solid var(--accent-mark); outline-offset: 2px`) — never remove focus outlines.

**ATS issue list**
- Each issue is a single line with a small leading icon: ✓ (`--accent-mark`, passed), ! (`--accent-gold`, warning), ✕ (`--accent-flag`, error) — not a generic bullet list. This reuses the same three-color semantic system as scores, so the whole app has one consistent "traffic light" vocabulary instead of separate color logic per screen.

**Resume upload dropzone**
- Dashed 1px `--line` border, `--paper` background (matches page, so it reads as an inset area of the paper rather than a floating card).
- On drag-over: border becomes solid `--accent-mark`.

---

## 6. Motion

Keep it minimal and purposeful:
- One page-load moment only: when a score is revealed after answer submission, the number can count up briefly (300–400ms) rather than appearing instantly — this is the single "signature" motion moment, tied to the app's core payoff.
- Section transitions in the folder-spine nav: a quick 150ms fade, not a slide.
- No hover-lift or shadow-pop on every card. No staggered fade-up-on-scroll section reveals.
- Respect `prefers-reduced-motion`: disable the score count-up and fades for users who've set that preference; show the end state immediately instead.

---

## 7. Voice & Copy

- Buttons state the action: "Upload resume," "Submit answer," "Download report" — not "Submit" or "Next."
- Errors are specific and instructional, never apologetic: "This file is a scanned image — paste the resume text below instead," not "Oops, something went wrong."
- Feedback/suggestion copy speaks plainly, like a mentor's margin note, not a system message: "Mention a specific caching strategy to strengthen this answer" rather than "Keyword coverage insufficient."
- Empty states are an invitation to act, not a dead end: an empty session-history screen says "No sessions yet — pick a role to start your first practice round," with the button right there.
- The ATS disclaimer line stays plain and upfront every time the score is shown: "Heuristic estimate based on common ATS rules — not a certified score."

---

## 8. Accessibility Floor (non-negotiable)

- All interactive elements keyboard-navigable with a visible focus state.
- Color is never the only signal — the ✓ / ! / ✕ icons and score labels ("strong," "needs work," "weak") always accompany color coding.
- Text contrast: `--ink` on `--paper` and `--paper-raised` must meet WCAG AA (they do at the specified hex values — re-verify if either token is adjusted).
- Respect `prefers-reduced-motion` as noted above.
- Form inputs (resume upload, answer textarea) have real `<label>` elements, not placeholder-only labeling.

---

## 9. Quick Reference: Do / Don't

| Do | Don't |
|---|---|
| Use the folder-spine nav for session progress | Use a generic numbered circle stepper |
| Reserve red/gold for real warnings and scores | Use them as decorative accents |
| Use IBM Plex Mono only for numeric scores | Use monospace for labels or body text |
| Left-align everything | Center-align hero-style content |
| One score count-up animation as the signature motion | Hover-lift/shadow-pop on every card |
| Write buttons as actions ("Upload resume") | Write generic buttons ("Submit," "Next") |
