import os
import re
import json
import pdfplumber
import docx

# Load NLP model once at module level with resilient fallback
nlp = None
PhraseMatcher = None
try:
    import spacy
    from spacy.matcher import PhraseMatcher
    try:
        nlp = spacy.load("en_core_web_md")
    except Exception:
        try:
            nlp = spacy.load("en_core_web_sm")
        except Exception:
            nlp = None
except (ImportError, Exception) as e:
    print(f"[ResumeParser] spaCy unavailable ({e}). Using pure-Python keyword matcher fallback.")
    nlp = None
    PhraseMatcher = None

from backend.config import Config

# Extended dictionary of high-demand industry skills, engineering disciplines, and tracks
EXTENDED_SKILLS = {
    # Engineering Disciplines & Architecture
    'software engineering': 'Software Engineering',
    'software engineer': 'Software Engineering',
    'software development': 'Software Engineering',
    'full stack': 'Full Stack Development',
    'fullstack': 'Full Stack Development',
    'full stack developer': 'Full Stack Development',
    'full stack development': 'Full Stack Development',
    'frontend': 'Frontend Development',
    'front-end': 'Frontend Development',
    'frontend developer': 'Frontend Development',
    'backend': 'Backend Development',
    'back-end': 'Backend Development',
    'backend developer': 'Backend Development',
    'web development': 'Web Development',
    'web developer': 'Web Development',
    'system design': 'System Design',
    'distributed systems': 'Distributed Systems',
    'microservices': 'Microservices',
    'data structures': 'Data Structures & Algorithms',
    'algorithms': 'Data Structures & Algorithms',
    'dsa': 'Data Structures & Algorithms',
    'object-oriented': 'OOP',
    'object oriented programming': 'OOP',
    'oop': 'OOP',
    'dbms': 'DBMS',
    'database management': 'DBMS',
    'rest api': 'RESTful APIs',
    'rest apis': 'RESTful APIs',
    'restful': 'RESTful APIs',
    'graphql': 'GraphQL',
    'jwt': 'JWT Authentication',
    'jwt authentication': 'JWT Authentication',
    'mern': 'MERN Stack',
    'mern stack': 'MERN Stack',
    'ci/cd': 'CI/CD',
    'devops': 'DevOps',
    'cloud computing': 'Cloud Computing',
    'responsive design': 'Responsive Design',
    'ui/ux': 'UI/UX Design',
    'vite': 'Vite',
    'tailwind': 'Tailwind CSS',
    'tailwind css': 'Tailwind CSS',
    'bootstrap': 'Bootstrap',
    'express': 'Express.js',
    'express.js': 'Express.js',
    'node': 'Node.js',
    'node.js': 'Node.js',
    'react': 'React',
    'react.js': 'React',
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'python': 'Python',
    'java': 'Java',
    'c++': 'C++',
    'c#': 'C#',
    'sql': 'SQL',
    'nosql': 'NoSQL',
    'mongodb': 'MongoDB',
    'postgresql': 'PostgreSQL',
    'mysql': 'MySQL',
    'redis': 'Redis',
    'git': 'Git',
    'github': 'GitHub',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'aws': 'AWS',
    'azure': 'Azure',
    'gcp': 'GCP',
    'linux': 'Linux',
    'next.js': 'Next.js',
    'redux': 'Redux',
    'html': 'HTML5',
    'html5': 'HTML5',
    'css': 'CSS3',
    'css3': 'CSS3',

    # Management & Strategy Track
    'product management': 'Product Management',
    'product manager': 'Product Management',
    'project management': 'Project Management',
    'scrum': 'Scrum / Agile',
    'agile': 'Scrum / Agile',
    'okrs': 'OKRs & KPIs',
    'kpi': 'OKRs & KPIs',
    'p&l': 'P&L Management',
    'stakeholder management': 'Stakeholder Management',
    'strategic planning': 'Strategic Planning',
    'roadmapping': 'Roadmapping',
    'operations management': 'Operations Management',

    # Law & Governance Track
    'corporate law': 'Corporate Law',
    'contract drafting': 'Contract Drafting',
    'contract negotiation': 'Contract Negotiation',
    'regulatory compliance': 'Regulatory Compliance',
    'compliance': 'Regulatory Compliance',
    'gdpr': 'Data Privacy & GDPR',
    'data privacy': 'Data Privacy & GDPR',
    'due diligence': 'Due Diligence',
    'intellectual property': 'Intellectual Property',
    'm&a': 'M&A Due Diligence',
    'litigation': 'Litigation & Dispute Resolution',
    'legal research': 'Legal Research',
}

class ResumeParser:
    def __init__(self, skill_dict_path=None):
        if skill_dict_path is None:
            skill_dict_path = os.path.join(Config.BASE_DIR, 'backend', 'data', 'skill_dictionary.json')
        self.skill_dict_path = skill_dict_path
        self.skill_map = self._load_skill_dictionary()
        self.matcher = self._setup_phrase_matcher()

    def _load_skill_dictionary(self):
        """Loads the skill dictionary and merges with extended industry skill sets."""
        skill_map = {}
        try:
            if os.path.exists(self.skill_dict_path):
                with open(self.skill_dict_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for item in data:
                        canonical = item['canonical']
                        skill_map[canonical.lower()] = canonical
                        for syn in item.get('synonyms', []):
                            skill_map[syn.lower()] = canonical
        except Exception as e:
            print(f"[ResumeParser] Error loading skill dictionary: {e}")

        # Merge with extended skills
        for syn, canonical in EXTENDED_SKILLS.items():
            skill_map[syn.lower()] = canonical

        print(f"[ResumeParser] Successfully initialized {len(skill_map)} skill mappings.")
        return skill_map

    def _setup_phrase_matcher(self):
        """Sets up spaCy PhraseMatcher with synonyms if available."""
        if nlp is not None and PhraseMatcher is not None:
            try:
                matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
                all_synonyms = list(self.skill_map.keys())
                patterns = [nlp.make_doc(syn) for syn in all_synonyms]
                matcher.add("SKILL", patterns)
                return matcher
            except Exception as e:
                print(f"[ResumeParser] PhraseMatcher setup failed: {e}. Using regex fallback.")
                return None
        return None

    def extract_text(self, file_path):
        """Extracts text from PDF, DOCX, or TXT file, including tables."""
        ext = os.path.splitext(file_path)[1].lower()
        text = ""

        if ext == '.pdf':
            text = self._extract_pdf_text(file_path)
        elif ext == '.docx':
            text = self._extract_docx_text(file_path)
        elif ext in ('.txt', '.md'):
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
        else:
            raise ValueError(f"Unsupported file extension: {ext}")

        return text.strip()

    def _extract_pdf_text(self, file_path):
        """Extracts text and tables from PDF using pdfplumber."""
        text_parts = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

                tables = page.extract_tables()
                if tables:
                    for table in tables:
                        for row in table:
                            row_text = " ".join([str(cell) for cell in row if cell])
                            if row_text.strip():
                                text_parts.append(row_text)

        return "\n".join(text_parts)

    def _extract_docx_text(self, file_path):
        """Extracts text and tables from DOCX using python-docx."""
        doc = docx.Document(file_path)
        text_parts = []

        for para in doc.paragraphs:
            if para.text.strip():
                text_parts.append(para.text)

        for table in doc.tables:
            for row in table.rows:
                row_text = " ".join([cell.text.strip() for cell in row.cells])
                if row_text.strip():
                    text_parts.append(row_text)

        return "\n".join(text_parts)

    def extract_candidate_name(self, text, cert_m=None):
        """Extracts candidate full name with certificate and standard resume heuristics."""
        # 1. Certificate Pattern
        if not cert_m:
            cert_m = re.search(
                r'(?:is awarded to|awarded to|certifies that|presented to|conferred upon)[^\n]*\n+([^\n\r]+)',
                text, re.I
            )
        if cert_m:
            raw_match = cert_m.group(1).strip()
            # In case multiple lines matched, take first non-empty line
            lines = [l.strip() for l in raw_match.split('\n') if l.strip()]
            if lines:
                name = lines[0]
                if 2 <= len(name.split()) <= 5 and not any(kw in name.lower() for kw in ['certificate', 'completion', 'course', 'successful']):
                    return name.title()

        # 2. Resume Header Pattern (Top 5 lines)
        clean_lines = [l.strip() for l in text.split('\n') if l.strip()]
        for line in clean_lines[:5]:
            lower = line.lower()
            if any(skip in lower for skip in ['curriculum', 'resume', 'cv', 'page', 'email', 'phone', '@', 'http', 'github', 'linkedin', 'portfolio']):
                continue
            # Isolate first segment before delimiters |, -, bullet
            first_token = re.split(r'[\s]*[|•\-\–][\s]*', line)[0].strip()
            words = first_token.split()
            if 2 <= len(words) <= 4 and all(re.match(r'^[A-Za-z\.\'\-]+$', w) for w in words):
                return first_token.title()

        return 'Candidate'

    def extract_contact(self, text):
        """Extracts candidate contact details."""
        email_m = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        phone_m = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        
        # LinkedIn
        linkedin_m = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)', text, re.I)
        linkedin = f"linkedin.com/in/{linkedin_m.group(1)}" if linkedin_m else ''

        # GitHub
        github_m = re.search(r'(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_-]+)|github:\s*([a-zA-Z0-9_-]+)', text, re.I)
        github = ''
        if github_m:
            gh_user = github_m.group(1) or github_m.group(2)
            if gh_user:
                github = f"github.com/{gh_user.strip()}"

        # Target Headline / Role on line 1 or 2
        headline = ''
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        if len(lines) > 1:
            line2 = lines[1]
            if not any(kw in line2.lower() for kw in ['@', 'http', '+91', 'phone', 'summary', 'experience']):
                clean_hd = line2.split(' | ')[0] if ' | ' in line2 else line2.split('|')[0]
                if clean_hd.count('(') > clean_hd.count(')'):
                    close_idx = line2.find(')')
                    if close_idx != -1:
                        clean_hd = line2[:close_idx+1].strip()
                headline = clean_hd.strip()

        return {
            'email': email_m.group(0) if email_m else '',
            'phone': phone_m.group(0) if phone_m else '',
            'linkedin': linkedin,
            'github': github,
            'headline': headline
        }

    def extract_skills(self, text):
        """Extracts skills from text and returns a unique list of canonical names."""
        if not text:
            return []

        found_skills = set()

        if self.matcher is not None and nlp is not None:
            try:
                doc = nlp(text)
                matches = self.matcher(doc)
                for match_id, start, end in matches:
                    span = doc[start:end]
                    synonym = span.text.lower()
                    canonical = self.skill_map.get(synonym)
                    if canonical:
                        found_skills.add(canonical)
                if found_skills:
                    return sorted(list(found_skills))
            except Exception as e:
                print(f"[ResumeParser] spaCy matching failed: {e}. Falling back to regex.")

        # Robust pure-Python regex keyword matching fallback
        text_lower = f" {text.lower()} "
        for synonym, canonical in self.skill_map.items():
            if not synonym:
                continue
            escaped = re.escape(synonym)
            pattern = rf"(?<![a-zA-Z0-9]){escaped}(?![a-zA-Z0-9])"
            if re.search(pattern, text_lower):
                found_skills.add(canonical)

        return sorted(list(found_skills))

    def extract_sections(self, text):
        """Extracts structured sections from text."""
        sections = {
            'summary': '',
            'experience': [],
            'education': [],
            'projects': []
        }

        # Summary extraction
        sum_m = re.search(r'(?:PROFESSIONAL SUMMARY|SUMMARY|OBJECTIVE)\s*\n+(.*?)(?=\n+[A-Z\s]{4,}|\Z)', text, re.S | re.I)
        if sum_m:
            sections['summary'] = " ".join(sum_m.group(1).split())

        # Experience extraction
        exp_m = re.search(r'(?:PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|EXPERIENCE)\s*\n+(.*?)(?=\n+(?:PROJECTS|EDUCATION|SKILLS|CERTIFICATIONS)|\Z)', text, re.S | re.I)
        if exp_m:
            exp_text = exp_m.group(1)
            # Find bullet points
            bullets = [b.strip('•*-◦ \t') for b in exp_text.split('\n') if b.strip().startswith(('•', '*', '-', '◦'))]
            lines = [l.strip() for l in exp_text.split('\n') if l.strip() and not l.strip().startswith(('•', '*', '-', '◦'))]
            title = lines[0] if lines else 'Developer Role'
            sections['experience'].append({
                'title': title,
                'company': 'Organization',
                'dates': 'Present',
                'bullets': bullets[:4] if bullets else [title]
            })

        # Education extraction
        edu_m = re.search(r'(?:EDUCATION|ACADEMIC BACKGROUND)\s*\n+(.*?)(?=\n+[A-Z\s]{4,}|\Z)', text, re.S | re.I)
        if edu_m:
            edu_lines = [l.strip() for l in edu_m.group(1).split('\n') if l.strip()]
            for l in edu_lines[:2]:
                sections['education'].append({
                    'degree': l,
                    'school': 'University / Institution',
                    'year': '2024'
                })

        return sections

    def parse_full(self, file_path_or_text, is_raw_text=False):
        """
        Comprehensive parsing pipeline returning candidate info, contact, skills, and sections.
        """
        if is_raw_text:
            text = file_path_or_text.strip()
        else:
            text = self.extract_text(file_path_or_text)

        word_count = len(text.split())

        # 1. Certificate / Credential detection
        cert_m = re.search(
            r'(?:is awarded to|awarded to|certifies that|presented to|conferred upon|completion of)[^\n]*\n+([^\n\r]+)',
            text, re.I
        )
        is_certificate = bool(cert_m)

        # 2. Candidate Name
        candidate_name = self.extract_candidate_name(text, cert_m=cert_m)

        # 3. Contact Info
        contact = self.extract_contact(text)
        if not contact.get('name') or contact.get('name') == 'Candidate':
            contact['name'] = candidate_name

        # 4. Skills extraction
        skills = self.extract_skills(text)

        # If certificate, also capture course title as a skill
        if is_certificate:
            course_m = re.search(
                r'(?:completing the course|course of|completion of the course|completion of|program in)[^\n]*\n+([^\n\r]+)',
                text, re.I
            )
            if course_m:
                course_title = course_m.group(1).strip().title()
                if course_title and len(course_title) < 50:
                    if course_title not in skills:
                        skills.insert(0, course_title)

        # 5. Extract structured sections
        sections = self.extract_sections(text)

        is_scanned = word_count < 15 and not bool(skills)

        return {
            "text": text,
            "skills": skills,
            "candidate_name": candidate_name,
            "contact": contact,
            "summary": sections.get("summary", ""),
            "experience": sections.get("experience", []),
            "education": sections.get("education", []),
            "projects": sections.get("projects", []),
            "is_certificate": is_certificate,
            "is_scanned": is_scanned,
            "word_count": word_count
        }

    def parse_resume(self, file_path):
        """
        Backward-compatible parsing pipeline.
        Returns: (text, skills, is_scanned)
        """
        data = self.parse_full(file_path, is_raw_text=False)
        return data["text"], data["skills"], data["is_scanned"]

# Singleton instance for reuse across requests
parser = ResumeParser()
