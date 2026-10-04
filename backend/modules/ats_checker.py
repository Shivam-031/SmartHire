import os
import re
import pdfplumber
import docx

# Resilient spacy loading with regex fallback
nlp = None
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_md")
    except Exception:
        try:
            nlp = spacy.load("en_core_web_sm")
        except Exception:
            nlp = None
except (ImportError, Exception):
    nlp = None

from backend.config import Config

# Constants for ATS analysis
SECTION_HEADERS = {
    "Education", "Experience", "Work History",
    "Skills", "Projects", "Summary", "Objective", "Certifications"
}

CONTACT_REGEX = {
    "email": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
    "phone": r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
    "url": r"https?://(www\.)?(linkedin\.com|github\.com)/[a-zA-Z0-9_-]+"
}

POWER_VERBS = {
    "developed", "managed", "led", "implemented", "optimized",
    "created", "designed", "increased", "reduced", "delivered",
    "coordinated", "spearheaded", "authored", "executed", "built"
}

class ATSChecker:
    def __init__(self):
        pass

    def analyze(self, file_path):
        """
        Analyzes a resume file and returns a score and list of issues.
        """
        ext = os.path.splitext(file_path)[1].lower()
        text = ""
        has_tables = False

        # 1. Extract text and check for tables
        if ext == '.pdf':
            text, has_tables = self._analyze_pdf(file_path)
        elif ext == '.docx':
            text, has_tables = self._analyze_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

        return self.analyze_text(text, has_tables=has_tables)

    def analyze_text(self, text, has_tables=False):
        """
        Performs the 6 weighted heuristic checks on text.
        """
        results = {
            "headers": self._check_headers(text),
            "contact": self._check_contact(text),
            "tables": self._check_tables(has_tables),
            "keywords": self._check_keywords(text),
            "bullets": self._check_bullets(text),
            "length": self._check_length(text)
        }

        total_score = sum(res['score'] for res in results.values())

        all_issues = []
        for check_name, res in results.items():
            all_issues.extend(res['issues'])

        return {
            "ats_score": round(total_score, 2),
            "issues": all_issues
        }

    def resume_doc_to_text(self, doc):
        """
        Converts a MongoDB structured resume document into formatted text
        suitable for ATS heuristic evaluation.
        """
        if not doc:
            return ""
        parts = []
        contact = doc.get('contact', {})
        contact = doc.get('contact') or {}
        name = contact.get('name') or doc.get('title') or 'Candidate'
        parts.append(name)

        contact_line = []
        if contact.get('email'):
            contact_line.append(contact.get('email'))
        if contact.get('phone'):
            contact_line.append(contact.get('phone'))
        if contact.get('location'):
            contact_line.append(contact.get('location'))
        if contact.get('linkedin'):
            lk = contact.get('linkedin')
            contact_line.append(f"https://{lk}" if not lk.startswith('http') else lk)
        if contact.get('portfolio'):
            contact_line.append(contact.get('portfolio'))
        if contact_line:
            parts.append(" | ".join(contact_line))

        summary = doc.get('summary', '')
        if summary:
            parts.append("\nSummary")
            parts.append(summary)

        experience = doc.get('experience', [])
        if experience:
            parts.append("\nExperience")
            for exp in experience:
                title = exp.get('title', '')
                company = exp.get('company', '')
                dates = exp.get('dates', '')
                parts.append(f"{title} at {company} ({dates})")
                bullets = exp.get('bullets', [])
                if isinstance(bullets, str):
                    bullets = [b.strip() for b in bullets.split('\n') if b.strip()]
                for b in bullets:
                    bullet_text = b if b.startswith(('•', '*', '-')) else f"• {b}"
                    parts.append(bullet_text)

        education = doc.get('education', [])
        if education:
            parts.append("\nEducation")
            for edu in education:
                degree = edu.get('degree', '')
                school = edu.get('school', '')
                year = edu.get('year', '')
                gpa = edu.get('gpa', '')
                parts.append(f"{degree}, {school} ({year}) {('GPA: ' + gpa) if gpa else ''}")

        skills = doc.get('skills', [])
        if skills:
            parts.append("\nSkills")
            for sk in skills:
                cat = sk.get('category', 'Technical Skills')
                items = sk.get('items', [])
                if isinstance(items, list):
                    items_str = ", ".join(items)
                else:
                    items_str = str(items)
                parts.append(f"{cat}: {items_str}")
            if all(isinstance(sk, str) for sk in skills):
                parts.append(", ".join(skills))
            else:
                for sk in skills:
                    if isinstance(sk, str):
                        parts.append(f"• {sk}")
                    elif isinstance(sk, dict):
                        cat = sk.get('category', 'Technical Skills')
                        items = sk.get('items', [])
                        if isinstance(items, list):
                            items_str = ", ".join(items)
                        else:
                            items_str = str(items)
                        parts.append(f"{cat}: {items_str}")

        projects = doc.get('projects', [])
        if projects:
            parts.append("\nProjects")
            for prj in projects:
                p_title = prj.get('title', '')
                p_tech = prj.get('technologies', '')
                p_desc = prj.get('description', '')
                p_link = prj.get('link', '')
                parts.append(f"{p_title} ({p_tech}) {p_link}")
                if p_desc:
                    parts.append(f"• {p_desc}")

        return "\n".join(parts)

    def analyze_document(self, doc):
        """
        Analyzes a structured MongoDB resume document directly.
        """
        text = self.resume_doc_to_text(doc)
        return self.analyze_text(text, has_tables=False)

    def _analyze_pdf(self, file_path):
        text_parts = []
        has_tables = False
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                # Check for tables
                if page.extract_tables():
                    has_tables = True

                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

        return "\n".join(text_parts), has_tables

    def _analyze_docx(self, file_path):
        doc = docx.Document(file_path)
        text_parts = []
        has_tables = len(doc.tables) > 0

        for para in doc.paragraphs:
            if para.text.strip():
                text_parts.append(para.text)

        return "\n".join(text_parts), has_tables

    def _check_headers(self, text):
        found = [h for h in SECTION_HEADERS if h.lower() in text.lower()]
        score = (len(found) / len(SECTION_HEADERS)) * 15
        issues = []
        if len(found) < 3:
            issues.append({
                "type": "headers",
                "message": f"Missing key section headers. Found {len(found)}/5. Try adding Education, Experience, and Skills.",
                "severity": "Medium"
            })
        return {"score": score, "issues": issues}

    def _check_contact(self, text):
        found_email = re.search(CONTACT_REGEX["email"], text)
        found_phone = re.search(CONTACT_REGEX["phone"], text)
        found_url = re.search(CONTACT_REGEX["url"], text)

        count = sum([bool(found_email), bool(found_phone), bool(found_url)])
        score = (count / 3) * 15

        issues = []
        if not found_email:
            issues.append({"type": "contact", "message": "Email address not found.", "severity": "High"})
        if not found_phone:
            issues.append({"type": "contact", "message": "Phone number not found.", "severity": "Medium"})
        if not found_url:
            issues.append({"type": "contact", "message": "Professional links (LinkedIn/GitHub) missing.", "severity": "Low"})

        return {"score": score, "issues": issues}

    def _check_tables(self, has_tables):
        score = 0 if has_tables else 15
        issues = []
        if has_tables:
            issues.append({
                "type": "tables",
                "message": "Resume contains tables. ATS often fail to parse tables; use simple text formatting instead.",
                "severity": "High"
            })
        return {"score": score, "issues": issues}

    def _check_keywords(self, text):
        found_verbs = set()
        if nlp is not None:
            try:
                doc = nlp(text.lower())
                found_verbs = {token.lemma_ for token in doc if token.lemma_ in POWER_VERBS}
            except Exception:
                words = set(re.findall(r'\b[a-z]+\b', text.lower()))
                found_verbs = words.intersection(POWER_VERBS)
        else:
            words = set(re.findall(r'\b[a-z]+\b', text.lower()))
            found_verbs = words.intersection(POWER_VERBS)

        score = (len(found_verbs) / 10) * 20
        score = min(20, score)

        issues = []
        if len(found_verbs) < 5:
            issues.append({
                "type": "keywords",
                "message": "Use more strong action verbs (e.g., 'Optimized', 'Spearheaded') to describe your achievements.",
                "severity": "Low"
            })
        return {"score": score, "issues": issues}

    def _check_bullets(self, text):
        lines = text.split('\n')
        bullet_lines = [l.strip() for l in lines if l.strip().startswith(('•', '*', '-', '◦'))]

        if not bullet_lines:
            return {"score": 0, "issues": [{"type": "bullets", "message": "No bullet points found. Use bullets for experience items.", "severity": "Medium"}]}

        verb_count = 0
        for line in bullet_lines:
            # Extract first word
            words = line.split()
            if not words:
                continue
            first_word = words[0].lower().strip('•*-◦ ')
            if not first_word:
                continue

            token_lemma = first_word
            if nlp is not None:
                try:
                    parsed = nlp(first_word)
                    if len(parsed) > 0:
                        token_lemma = parsed[0].lemma_
                except Exception:
                    token_lemma = first_word

            if first_word in POWER_VERBS or token_lemma in POWER_VERBS:
                verb_count += 1

        score = (verb_count / len(bullet_lines)) * 20
        issues = []
        if verb_count / len(bullet_lines) < 0.7:
            issues.append({
                "type": "bullets",
                "message": "Some bullet points do not start with strong action verbs.",
                "severity": "Medium"
            })
        return {"score": score, "issues": issues}

    def _check_length(self, text):
        word_count = len(text.split())
        if 400 <= word_count <= 2000:
            score = 15
            issues = []
        elif 200 <= word_count < 400 or 2000 < word_count <= 3000:
            score = 7.5
            issues = [{"type": "length", "message": "Resume length is marginal. Aim for 1-2 pages (400-2000 words).", "severity": "Low"}]
        else:
            score = 0
            issues = [{"type": "length", "message": "Resume length is poorly optimized. Aim for 400-2000 words.", "severity": "Medium"}]

        return {"score": score, "issues": issues}

# Singleton instance
ats_checker = ATSChecker()
