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
    'bcrypt': 'Bcrypt',
    'responsive design': 'Responsive Design',

    # MERN Stack & Node ecosystem
    'mern': 'MERN Stack',
    'mern stack': 'MERN Stack',
    'react': 'React',
    'react.js': 'React',
    'reactjs': 'React',
    'node': 'Node.js',
    'node.js': 'Node.js',
    'nodejs': 'Node.js',
    'express': 'Express.js',
    'express.js': 'Express.js',
    'expressjs': 'Express.js',
    'mongodb': 'MongoDB',
    'mongo': 'MongoDB',
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'redux': 'Redux',
    'redux toolkit': 'Redux',
    'next.js': 'Next.js',
    'nextjs': 'Next.js',
    'vite': 'Vite',
    'tailwind': 'Tailwind CSS',
    'tailwind css': 'Tailwind CSS',
    'bootstrap': 'Bootstrap',
    'html': 'HTML5',
    'html5': 'HTML5',
    'css': 'CSS3',
    'css3': 'CSS3',
    'sass': 'SASS',
    'scss': 'SASS',

    # Programming Languages
    'python': 'Python',
    'python3': 'Python',
    'java': 'Java',
    'c': 'C',
    'c++': 'C++',
    'cpp': 'C++',
    'c#': 'C#',
    'csharp': 'C#',
    '.net': '.NET',
    'dotnet': '.NET',
    'golang': 'Go',
    'go': 'Go',
    'rust': 'Rust',
    'php': 'PHP',
    'ruby': 'Ruby',
    'rails': 'Ruby on Rails',
    'ruby on rails': 'Ruby on Rails',
    'scala': 'Scala',
    'kotlin': 'Kotlin',
    'swift': 'Swift',

    # Databases & Caching
    'sql': 'SQL',
    'mysql': 'MySQL',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'sqlite': 'SQLite',
    'redis': 'Redis',
    'elasticsearch': 'Elasticsearch',
    'cassandra': 'Cassandra',
    'dynamodb': 'DynamoDB',
    'firebase': 'Firebase',
    'firestore': 'Firebase',
    'prisma': 'Prisma',
    'mongoose': 'Mongoose',
    'sequelize': 'Sequelize',

    # DevOps, Cloud & Tools
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'k8s': 'Kubernetes',
    'aws': 'AWS',
    'amazon web services': 'AWS',
    'azure': 'Azure',
    'gcp': 'GCP',
    'google cloud': 'GCP',
    'git': 'Git',
    'github': 'GitHub',
    'gitlab': 'GitLab',
    'bitbucket': 'Bitbucket',
    'ci/cd': 'CI/CD',
    'cicd': 'CI/CD',
    'jenkins': 'Jenkins',
    'github actions': 'GitHub Actions',
    'terraform': 'Terraform',
    'linux': 'Linux',
    'nginx': 'NGINX',
    'apache': 'Apache',
    'netlify': 'Netlify',
    'render': 'Render',
    'vercel': 'Vercel',
    'heroku': 'Heroku',
    'cloudinary': 'Cloudinary',

    # Testing & Quality
    'jest': 'Jest',
    'mocha': 'Mocha',
    'cypress': 'Cypress',
    'selenium': 'Selenium',
    'unit testing': 'Unit Testing',
    'integration testing': 'Integration Testing',
    'tdd': 'TDD',

    # AI & Data
    'machine learning': 'Machine Learning',
    'deep learning': 'Deep Learning',
    'nlp': 'NLP',
    'artificial intelligence': 'Artificial Intelligence',
    'ai': 'Artificial Intelligence',
    'pandas': 'Pandas',
    'numpy': 'NumPy',
    'pytorch': 'PyTorch',
    'tensorflow': 'TensorFlow',
    'scikit-learn': 'Scikit-Learn',
    'power bi': 'Power BI',
    'powerbi': 'Power BI',
    'tableau': 'Tableau',
    'excel': 'Microsoft Excel',

    # Management & Soft Skills
    'agile': 'Agile',
    'scrum': 'Scrum',
    'jira': 'Jira',
    'leadership': 'Leadership',
    'project management': 'Project Management',
    'communication': 'Communication',
    'problem solving': 'Problem Solving',
    'teamwork': 'Team Collaboration'
}

SECTION_PATTERNS = [
    ('summary', re.compile(r'^(?:professional\s+summary|summary|profile|about\s+me|career\s+objective|objective)\s*$', re.I)),
    ('skills', re.compile(r'^(?:technical\s+skills|skills|core\s+competencies|key\s+skills|skills\s*&\s*abilities|technologies)\s*$', re.I)),
    ('experience', re.compile(r'^(?:professional\s+experience|work\s+experience|experience|employment\s+history|internships|work\s+history)\s*$', re.I)),
    ('projects', re.compile(r'^(?:projects|academic\s+projects|personal\s+projects|key\s+projects|selected\s+projects)\s*$', re.I)),
    ('education', re.compile(r'^(?:education|academic\s+background|educational\s+qualifications|academics|qualifications)\s*$', re.I)),
    ('certifications', re.compile(r'^(?:certifications|licenses\s*&\s*certifications|certificates|credentials|courses\s*&\s*certifications)\s*$', re.I)),
    ('additional', re.compile(r'^(?:additional\s+information|achievements|awards|publications|activities|extracurricular)\s*$', re.I)),
]

DATE_PAT = re.compile(
    r'(?:\((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.,]*\d{4}|\b\d{4}\b)\s*(?:[-–—to\s]+)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.,]*\d{4}|\b\d{4}\b|Present|Current)\)|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.,]*\d{4}|\b\d{4}\b)\s*(?:[-–—to\s]+)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.,]*\d{4}|\b\d{4}\b|Present|Current))',
    re.I
)

DEGREE_PAT = re.compile(
    r'\b(?:master|bachelor|b\.s|m\.s|b\.tech|m\.tech|bca|mca|bba|mba|phd|associate|diploma|secondary|higher\s+secondary)\b',
    re.I
)

class ResumeParser:
    def __init__(self, skill_dict_path=None):
        if skill_dict_path is None:
            skill_dict_path = os.path.join(Config.BASE_DIR, 'backend', 'data', 'skill_dictionary.json')
        self.skill_dict_path = skill_dict_path
        self.skill_map = self._load_skill_dictionary()
        self.matcher = self._setup_phrase_matcher()

    def _load_skill_dictionary(self):
        """Loads canonical skills and merges them with extended industry mappings."""
        skill_map = dict(EXTENDED_SKILLS)
        try:
            if os.path.exists(self.skill_dict_path):
                with open(self.skill_dict_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for item in data:
                        canonical = item.get('canonical')
                        if canonical:
                            skill_map[canonical.lower()] = canonical
                            for syn in item.get('synonyms', []):
                                skill_map[syn.lower()] = canonical
        except Exception as e:
            print(f"[ResumeParser] Error loading skill dictionary: {e}")

        print(f"[ResumeParser] Successfully initialized {len(skill_map)} skill mappings.")
        return skill_map

    def _setup_phrase_matcher(self):
        """Sets up spaCy PhraseMatcher if spaCy is functional."""
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

    def sanitize_text(self, text):
        """Normalizes unicode characters, line endings, and bullet points."""
        if not text:
            return ""
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        text = text.replace('\t', '   ')
        # Em-dash, en-dash, figure dash, horizontal bar to standard clean dash with spaces
        text = re.sub(r'[\u2012\u2013\u2014\u2015]', ' - ', text)
        # Normalize various bullet glyphs
        text = re.sub(r'[\u2022\u25cf\u25cb\u25aa\u25b6\uf0b7]', '•', text)
        # Handle replacement character at start of line as bullet
        text = re.sub(r'(?m)^[\s\ufffd\*\-]\s*', '• ', text)
        # Inside lines, replacement character becomes a dash
        text = text.replace('\ufffd', ' - ')
        # Normalize whitespace without collapsing hyphens in usernames or titles
        text = re.sub(r'[ \t]+', ' ', text)
        return text.strip()

    def extract_text(self, file_path):
        """Extracts text from PDF or DOCX file, including tables."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            text = self._extract_pdf_text(file_path)
        elif ext == '.docx':
            text = self._extract_docx_text(file_path)
        elif ext in ('.txt', '.md'):
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
        else:
            raise ValueError(f"Unsupported file extension: {ext}")

        return self.sanitize_text(text)

    def _extract_pdf_text(self, file_path):
        """Extracts text and tables from PDF using pdfplumber."""
        text_parts = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        row_text = " ".join([str(cell) for cell in row if cell])
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

    def segment_sections(self, text):
        """Segments resume into structured logical blocks."""
        lines = text.split('\n')
        current_sec = 'header'
        sections = {'header': []}

        for line in lines:
            s = line.strip()
            if not s:
                continue
            matched_sec = None
            for sec_name, pattern in SECTION_PATTERNS:
                if pattern.match(s):
                    matched_sec = sec_name
                    break
            if matched_sec:
                current_sec = matched_sec
                if current_sec not in sections:
                    sections[current_sec] = []
            else:
                if current_sec not in sections:
                    sections[current_sec] = []
                sections[current_sec].append(s)

        return sections

    def extract_candidate_name(self, text, is_cert=False):
        """Extracts candidate full name with high precision for both certificates and resumes."""
        if is_cert:
            cert_m = re.search(
                r'(?:is awarded to|awarded to|certifies that|presented to|conferred upon)[^\n]*\n+([^\n\r]+)',
                text, re.I
            )
            if cert_m:
                raw_match = cert_m.group(1).strip()
                lines = [l.strip() for l in raw_match.split('\n') if l.strip()]
                if lines:
                    name = lines[0]
                    if 2 <= len(name.split()) <= 4 and not any(kw in name.lower() for kw in ['certificate', 'course', 'successful']):
                        return name.title()

        clean_lines = [l.strip() for l in text.split('\n') if l.strip()]
        for line in clean_lines[:5]:
            lower = line.lower()
            if any(skip in lower for skip in ['curriculum', 'resume', 'cv', 'page', 'email', 'phone', '@', 'http', 'github', 'linkedin', 'portfolio']):
                continue
            first_token = re.split(r'[\s]*[|•\-\–][\s]*', line)[0].strip()
            words = first_token.split()
            if 2 <= len(words) <= 4 and all(re.match(r'^[A-Za-z\.\'\-]+$', w) for w in words):
                if not any(fp in first_token.lower() for fp in [
                    'engineer', 'developer', 'manager', 'architect', 'skills', 'experience',
                    'summary', 'profile', 'education', 'candidate', 'trainee'
                ]):
                    return first_token.title()

        return 'Candidate'

    def extract_contact(self, text, header_lines=None):
        """Extracts candidate contact details (email, phone, linkedin, github, location, headline)."""
        email_m = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        phone_m = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)

        linkedin_m = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)|LinkedIn:\s*([^\n|•]+)', text, re.I)
        linkedin = ''
        if linkedin_m:
            val = linkedin_m.group(1) or linkedin_m.group(2)
            if val:
                val = val.strip()
                linkedin = f"https://linkedin.com/in/{val}" if not val.startswith('http') else val

        github_m = re.search(r'(?:https?://)?(?:www\.)?github\.com/([^\s|•,\n]+)|GitHub:\s*([^\s|•,\n]+)', text, re.I)
        github = ''
        if github_m:
            val = (github_m.group(1) or github_m.group(2)).strip().rstrip('.,;')
            if val:
                github = f"https://github.com/{val}" if not val.startswith('http') else val

        location = ''
        loc_m = re.search(
            r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}\b|[A-Z][a-zA-Z\s]+,\s*(?:India|USA|United States|UK|Canada|California|Texas|Washington|WA|NY|Uttar Pradesh|Rajasthan|Delhi|Maharashtra|Karnataka|Tamil Nadu))',
            text
        )
        if loc_m:
            location = loc_m.group(0).strip()

        headline = ''
        if header_lines and len(header_lines) > 1:
            line2 = header_lines[1]
            if not any(kw in line2.lower() for kw in ['@', 'http', '+91', 'phone', 'summary', 'experience']):
                clean_hd = line2.split(' | ')[0] if ' | ' in line2 else line2.split('|')[0]
                if clean_hd.count('(') > clean_hd.count(')'):
                    close_idx = line2.find(')')
                    if close_idx != -1:
                        clean_hd = line2[:close_idx + 1].strip()
                headline = clean_hd.strip()

        return {
            'email': email_m.group(0) if email_m else '',
            'phone': phone_m.group(0) if phone_m else '',
            'linkedin': linkedin,
            'github': github,
            'location': location,
            'headline': headline
        }

    def parse_skills_section(self, skills_lines, full_text):
        """Extracts both categorized skill groupings and canonical skill matches."""
        categorized = {}
        for line in skills_lines:
            s = line.strip()
            if ':' in s:
                cat_name, raw_skills = s.split(':', 1)
                cat_name = cat_name.strip('• -–—*')
                clean_str = re.sub(r'\(basic.*?\)', '', raw_skills)
                clean_str = clean_str.replace('(', ', ').replace(')', ', ')
                tokens = [t.strip(' ,;') for t in clean_str.split(',') if t.strip(' ,;')]
                if tokens:
                    categorized[cat_name] = tokens

        found_skills = set()
        text_lower = f" {full_text.lower()} "
        for synonym, canonical in self.skill_map.items():
            if not synonym:
                continue
            escaped = re.escape(synonym)
            pattern = rf"(?<![a-zA-Z0-9]){escaped}(?![a-zA-Z0-9])"
            if re.search(pattern, text_lower):
                found_skills.add(canonical)

        return sorted(list(found_skills)), categorized

    def parse_experience_section(self, exp_lines):
        """Parses experience into structured job records with real company, title, dates, and bullets."""
        entries = []
        curr = None
        for line in exp_lines:
            s = line.strip()
            if not s:
                continue
            date_m = DATE_PAT.search(s)
            if date_m and not s.startswith(('•', '-', '*')):
                if curr:
                    entries.append(curr)
                dates = date_m.group(0).strip('() ')
                rest = s[:date_m.start()] + s[date_m.end():]
                rest = rest.strip(' -–—|,\t()')
                parts = re.split(r'\s*[-–—|]\s*|\s+at\s+', rest)
                title = parts[0].strip() if len(parts) > 0 else rest
                company = parts[1].strip() if len(parts) > 1 else 'Company'
                curr = {
                    'title': title,
                    'company': company,
                    'dates': dates,
                    'location': '',
                    'bullets': []
                }
            elif curr is not None:
                if not curr['location'] and not s.startswith(('•', '-', '*')) and len(s) < 60 and (',' in s or any(st in s for st in ['Noida', 'Delhi', 'Pradesh', 'Rajasthan', 'Bangalore', 'USA', 'India', 'WA', 'CA'])):
                    curr['location'] = s
                else:
                    clean_bullet = re.sub(r'^[•\-\*]\s*', '', s).strip()
                    if clean_bullet:
                        if s.startswith(('•', '-', '*')) or not curr['bullets']:
                            curr['bullets'].append(clean_bullet)
                        else:
                            curr['bullets'][-1] += ' ' + clean_bullet
        if curr:
            entries.append(curr)
        return entries

    def parse_projects_section(self, proj_lines):
        """Parses project records with project name, live links, github links, and bullets."""
        projects = []
        curr = None
        for line in proj_lines:
            s = line.strip()
            if not s:
                continue
            if re.search(r'^(?:Live|Demo|Link|Website)\s*[:\-]\s*', s, re.I):
                if curr:
                    curr['live_url'] = s
                continue
            if re.search(r'^(?:GitHub|Repo)\s*[:\-]\s*', s, re.I):
                if curr:
                    curr['github_url'] = s
                continue
            if s.startswith(('•', '-', '*', '▹', '●')):
                if curr:
                    clean_bullet = re.sub(r'^[•\-\*▹●]\s*', '', s).strip()
                    curr['bullets'].append(clean_bullet)
                continue

            first_word = s.split()[0].lower().rstrip(':,;.') if s.split() else ''
            is_action_bullet = (
                first_word in {
                    'built', 'developed', 'architected', 'contributed', 'designed', 'engineered',
                    'created', 'implemented', 'spearheaded', 'optimized', 'led', 'mentored',
                    'utilized', 'constructed', 'programmed', 'authored', 'managed', 'deployed',
                    'configured', 'conducted', 'integrated', 'achieved', 'enabled', 'collaborated',
                    'building', 'developing', 'architecting', 'designing', 'implementing'
                } or
                (len(s) > 65 and s.endswith('.')) or
                first_word.endswith('ing') or
                first_word.endswith('ed')
            )

            if curr and is_action_bullet:
                clean_bullet = re.sub(r'^[•\-\*▹●]\s*', '', s).strip()
                curr['bullets'].append(clean_bullet)
                continue

            is_continuation = curr and len(curr['bullets']) > 0 and (not curr['bullets'][-1].rstrip().endswith(('.', '!', '?')) or s[0].islower())

            if is_continuation:
                curr['bullets'][-1] += ' ' + s
            else:
                if curr:
                    projects.append(curr)
                tag_m = re.search(r'\((.*?)\)|(?:Team Project.*)', s)
                tag = tag_m.group(0).strip() if tag_m else ''
                name = s
                if tag:
                    name = s.replace(tag, '').strip(' -–—|,\t')
                curr = {
                    'name': name,
                    'tag': tag,
                    'live_url': '',
                    'github_url': '',
                    'bullets': []
                }
        if curr:
            projects.append(curr)
        return projects

    def parse_education_section(self, edu_lines):
        """Parses educational qualifications with degree, institution, location, and dates."""
        entries = []
        curr = None
        for line in edu_lines:
            s = line.strip()
            if not s:
                continue
            is_degree_line = bool(DEGREE_PAT.search(s))
            if is_degree_line:
                if curr:
                    entries.append(curr)
                date_m = DATE_PAT.search(s)
                dates = date_m.group(0).strip() if date_m else ''
                rest = s
                if date_m:
                    rest = (s[:date_m.start()] + s[date_m.end():]).strip(' -–—|,\t')
                degree_part = rest
                school_part = ''
                parts = re.split(r'\s*[-–—|]\s*', rest)
                if len(parts) > 1 and DEGREE_PAT.search(parts[0]):
                    degree_part = parts[0].strip()
                    school_part = parts[1].strip()
                curr = {
                    'degree': degree_part,
                    'institution': school_part,
                    'dates': dates,
                    'location': ''
                }
            elif curr is not None:
                if not curr['institution']:
                    parts = [p.strip() for p in s.split(',')]
                    curr['institution'] = parts[0]
                    if len(parts) > 1:
                        curr['location'] = ', '.join(parts[1:])
                elif not curr['location']:
                    curr['location'] = s
        if curr:
            entries.append(curr)
        return entries

    def parse_certifications_section(self, cert_lines):
        """Parses certifications list and any trailing additional accomplishments."""
        full_str = ' '.join(cert_lines)
        additional_note = ''
        add_m = re.search(r'Additional\s*:\s*(.*)', full_str, re.I)
        if add_m:
            additional_note = add_m.group(1).strip()
            full_str = full_str[:add_m.start()].strip()

        raw_certs = re.split(r'\s+(?:[—–•|]|\s-\s)\s*', full_str)
        certs = []
        for c in raw_certs:
            c_clean = c.strip(' -–—|•\t\n')
            if not c_clean or len(c_clean) < 4:
                continue
            issuer_m = re.search(r'\(([^)]+)\)\s*$', c_clean)
            issuer = issuer_m.group(1).strip() if issuer_m else ''
            name = c_clean
            if issuer_m:
                name = c_clean[:issuer_m.start()].strip()
            certs.append({
                'name': name,
                'issuer': issuer
            })
        return certs, additional_note

    def parse_full(self, file_or_text, is_raw_text=False):
        """Comprehensive parsing pipeline returning detailed candidate profile and resume sections."""
        if is_raw_text:
            raw_text = file_or_text
        else:
            raw_text = self.extract_text(file_or_text)

        text = self.sanitize_text(raw_text)
        word_count = len(text.split())

        # Check if single-page completion certificate
        cert_kw_matches = sum(1 for kw in ['certificate', 'awarded to', 'certifies that', 'course', 'wingspan'] if kw in text.lower())
        is_certificate = cert_kw_matches >= 2 and word_count < 120

        # Segment sections
        sections = self.segment_sections(text)
        header_lines = sections.get('header', [])

        candidate_name = self.extract_candidate_name(text, is_cert=is_certificate)
        contact = self.extract_contact(text, header_lines)
        contact['name'] = candidate_name

        skills, skills_categorized = self.parse_skills_section(sections.get('skills', []), text)
        summary = " ".join(sections.get('summary', [])).strip()
        experience = self.parse_experience_section(sections.get('experience', []))
        projects = self.parse_projects_section(sections.get('projects', []))
        education = self.parse_education_section(sections.get('education', []))
        certifications, additional = self.parse_certifications_section(sections.get('certifications', []))

        # Certificate fallback: if document is a certificate, extract credential course as skill/cert
        if is_certificate:
            course_m = re.search(r'(?:course|completing the course|program in)\s*\n+([^\n\r]+)', text, re.I)
            if course_m:
                course_title = course_m.group(1).strip()
                if course_title and course_title not in skills:
                    skills.append(course_title)
                certifications.append({
                    'name': course_title,
                    'issuer': 'Credential Provider',
                    'date': 'Completed'
                })

        is_scanned = (word_count < 50) and not is_certificate

        return {
            'text': text,
            'candidate_name': candidate_name,
            'contact': contact,
            'skills': skills,
            'skills_categorized': skills_categorized,
            'summary': summary,
            'experience': experience,
            'projects': projects,
            'education': education,
            'certifications': certifications,
            'additional': additional,
            'is_certificate': is_certificate,
            'is_scanned': is_scanned,
            'word_count': word_count
        }

    def parse_resume(self, file_path):
        """Backward compatible tuple return (text, skills, is_scanned)."""
        res = self.parse_full(file_path, is_raw_text=False)
        return res['text'], res['skills'], res['is_scanned']

# Module-level singleton instance for route handlers
parser = ResumeParser()

