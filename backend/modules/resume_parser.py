import os
import json
import spacy
from spacy.matcher import PhraseMatcher
import pdfplumber
import docx

# Load NLP model once at module level
try:
    nlp = spacy.load("en_core_web_md")
except OSError:
    # Fallback if md is not installed, though handover says it is
    nlp = spacy.load("en_core_web_sm")

from backend.config import Config

class ResumeParser:
    def __init__(self, skill_dict_path=None):
        if skill_dict_path is None:
            skill_dict_path = os.path.join(Config.BASE_DIR, 'backend', 'data', 'skill_dictionary.json')
        self.skill_dict_path = skill_dict_path
        self.skill_map = self._load_skill_dictionary()
        self.matcher = self._setup_phrase_matcher()

    def _load_skill_dictionary(self):
        """Loads the skill dictionary and creates a mapping for normalization."""
        try:
            with open(self.skill_dict_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Create a map: synonym -> canonical
                skill_map = {}
                for item in data:
                    canonical = item['canonical']
                    # Always include the canonical name as a synonym
                    skill_map[canonical.lower()] = canonical
                    for syn in item['synonyms']:
                        skill_map[syn.lower()] = canonical
                print(f"Successfully loaded {len(skill_map)} skill synonyms from {self.skill_dict_path}")
                return skill_map
        except Exception as e:
            print(f"Error loading skill dictionary from {self.skill_dict_path}: {e}")
            return {}

    def _setup_phrase_matcher(self):
        """Sets up spaCy PhraseMatcher with synonyms."""
        matcher = PhraseMatcher(nlp.vocab, attr="LOWER")

        # Get all unique synonyms across all skills
        all_synonyms = list(self.skill_map.keys())

        # Add patterns to matcher
        # Note: PhraseMatcher takes a list of Docs
        patterns = [nlp.make_doc(syn) for syn in all_synonyms]
        matcher.add("SKILL", patterns)

        return matcher

    def extract_text(self, file_path):
        """Extracts text from PDF or DOCX file, including tables."""
        ext = os.path.splitext(file_path)[1].lower()
        text = ""

        if ext == '.pdf':
            text = self._extract_pdf_text(file_path)
        elif ext == '.docx':
            text = self._extract_docx_text(file_path)
        else:
            raise ValueError(f"Unsupported file extension: {ext}")

        return text.strip()

    def _extract_pdf_text(self, file_path):
        """Extracts text and tables from PDF using pdfplumber."""
        text_parts = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                # Extract plain text
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

                # Extract tables and flatten them into text
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        # Filter out None values and join cell text
                        row_text = " ".join([str(cell) for cell in row if cell])
                        text_parts.append(row_text)

        return "\n".join(text_parts)

    def _extract_docx_text(self, file_path):
        """Extracts text and tables from DOCX using python-docx."""
        doc = docx.Document(file_path)
        text_parts = []

        # Extract text from paragraphs
        for para in doc.paragraphs:
            if para.text.strip():
                text_parts.append(para.text)

        # Extract text from tables
        for table in doc.tables:
            for row in table.rows:
                row_text = " ".join([cell.text.strip() for cell in row.cells])
                if row_text.strip():
                    text_parts.append(row_text)

        return "\n".join(text_parts)

    def extract_skills(self, text):
        """Extracts skills from text and returns a unique list of canonical names."""
        if not text:
            return []

        doc = nlp(text)
        matches = self.matcher(doc)

        found_skills = set()
        for match_id, start, end in matches:
            span = doc[start:end]
            synonym = span.text.lower()
            canonical = self.skill_map.get(synonym)
            if canonical:
                found_skills.add(canonical)

        return list(found_skills)

    def parse_resume(self, file_path):
        """
        Full parsing pipeline.
        Returns: (text, skills, is_scanned)
        """
        text = self.extract_text(file_path)

        # Check for scanned PDF fallback (text too short)
        # Rough heuristic: if less than 50 words, it might be scanned
        word_count = len(text.split())
        print(f"Parsing file: {file_path} | Word count: {word_count}")
        is_scanned = word_count < 50

        skills = self.extract_skills(text)

        return text, skills, is_scanned

# Singleton instance for reuse across requests
parser = ResumeParser()
