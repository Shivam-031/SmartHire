import os
import re
import pdfplumber
import docx
import spacy
from backend.config import Config

# Load spacy for action verb detection
try:
    nlp = spacy.load("en_core_web_md")
except Exception:
    nlp = spacy.load("en_core_web_sm")

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

        # 2. Perform the 6 weighted checks
        results = {
            "headers": self._check_headers(text),
            "contact": self._check_contact(text),
            "tables": self._check_tables(has_tables),
            "keywords": self._check_keywords(text),
            "bullets": self._check_bullets(text),
            "length": self._check_length(text)
        }

        # 3. Calculate final score
        total_score = sum(res['score'] for res in results.values())

        # 4. Collect all issues
        all_issues = []
        for check_name, res in results.items():
            all_issues.extend(res['issues'])

        return {
            "ats_score": round(total_score, 2),
            "issues": all_issues
        }

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
        doc = nlp(text.lower())
        found_verbs = {token.lemma_ for token in doc if token.lemma_ in POWER_VERBS}

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
            first_word = line.split()[0].lower().strip('•*-◦ ')
            if first_word in POWER_VERBS or nlp(first_word).lemma_ in POWER_VERBS:
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
