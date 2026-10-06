import io
from datetime import datetime
from bson import ObjectId
from reportlab.lib.pagesizes import LETTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from backend.models import db, InterviewSession, Answer, ATSReport, User, Question, Resume
from backend.mongo_db import get_resumes_col, get_transcripts_col, get_questions_col

class ReportGenerator:
    def __init__(self):
        self._init_styles()

    def _init_styles(self):
        self.styles = getSampleStyleSheet()

        # Primary palette
        self.color_forest = colors.HexColor('#1A2E22')
        self.color_accent = colors.HexColor('#2F6F4E')
        self.color_sage = colors.HexColor('#5C6B60')
        self.color_light_bg = colors.HexColor('#F7F8F5')
        self.color_badge_bg = colors.HexColor('#EEF0EA')
        self.color_border = colors.HexColor('#D2D5C9')
        self.color_red = colors.HexColor('#B23A2E')
        self.color_amber = colors.HexColor('#B08D2F')

        self.title_style = ParagraphStyle(
            'DocTitleStyle',
            parent=self.styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=self.color_forest,
            spaceAfter=4
        )

        self.meta_style = ParagraphStyle(
            'DocMetaStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=self.color_sage
        )

        self.section_heading = ParagraphStyle(
            'SectionHeadingStyle',
            parent=self.styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=self.color_forest,
            spaceBefore=14,
            spaceAfter=6
        )

        self.body_style = ParagraphStyle(
            'BodyNormalStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#222222')
        )

        self.body_bold = ParagraphStyle(
            'BodyBoldStyle',
            parent=self.body_style,
            fontName='Helvetica-Bold'
        )

        self.italic_style = ParagraphStyle(
            'BodyItalicStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor('#333333')
        )

        self.table_header_style = ParagraphStyle(
            'TableHeaderStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=11,
            textColor=self.color_forest
        )

        self.table_cell_style = ParagraphStyle(
            'TableCellStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#222222')
        )

        self.remark_style = ParagraphStyle(
            'RemarkStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8.5,
            leading=12,
            textColor=self.color_accent
        )

    def _fetch_mongo_resume(self, mongo_resume_id):
        if not mongo_resume_id:
            return None
        resumes_col = get_resumes_col()
        try:
            return resumes_col.find_one({"_id": ObjectId(mongo_resume_id)})
        except Exception:
            try:
                return resumes_col.find_one({"_id": str(mongo_resume_id)})
            except Exception:
                return None

    def _fetch_mongo_transcript(self, session_id, mongo_transcript_id):
        transcripts_col = get_transcripts_col()
        doc = None
        if mongo_transcript_id:
            try:
                doc = transcripts_col.find_one({"_id": ObjectId(mongo_transcript_id)})
            except Exception:
                try:
                    doc = transcripts_col.find_one({"_id": str(mongo_transcript_id)})
                except Exception:
                    pass
        if not doc:
            try:
                doc = transcripts_col.find_one({"session_id": session_id})
            except Exception:
                pass
        return doc

    def _fetch_question_text(self, mongo_question_id, sql_question_id):
        if mongo_question_id:
            questions_col = get_questions_col()
            try:
                doc = questions_col.find_one({"_id": ObjectId(mongo_question_id)})
                if doc and doc.get('question_text'):
                    return doc.get('question_text'), doc.get('question_type', 'long_answer')
            except Exception:
                try:
                    doc = questions_col.find_one({"_id": str(mongo_question_id)})
                    if doc and doc.get('question_text'):
                        return doc.get('question_text'), doc.get('question_type', 'long_answer')
                except Exception:
                    pass

        if sql_question_id:
            try:
                sql_q = Question.query.get(sql_question_id)
                if sql_q and sql_q.question_text:
                    return sql_q.question_text, 'long_answer'
            except Exception:
                pass

        return "Interview Evaluation Prompt", "long_answer"

    def generate_report(self, session_id):
        """
        Generates a comprehensive PDF performance report integrating relational (SQL)
        and document (MongoDB) records.
        """
        session = InterviewSession.query.get(session_id)
        if not session:
            raise ValueError(f"Interview session {session_id} not found.")

        user = User.query.get(session.user_id) if session.user_id else None
        answers = Answer.query.filter_by(session_id=session_id).all()

        # Find ATS report in SQL (checking resume_id or mongo_resume_id)
        ats_report = None
        if session.mongo_resume_id:
            ats_report = ATSReport.query.filter_by(mongo_resume_id=session.mongo_resume_id).first()
        if not ats_report and session.resume_id:
            ats_report = ATSReport.query.filter_by(resume_id=session.resume_id).first()

        # Fetch Cross-DB MongoDB records
        mongo_resume = self._fetch_mongo_resume(session.mongo_resume_id)
        mongo_transcript = self._fetch_mongo_transcript(session.id, session.mongo_transcript_id)

        # Determine Candidate metadata
        candidate_name = "Candidate"
        candidate_email = "Unspecified"
        if user and user.name:
            candidate_name = user.name
            candidate_email = user.email
        elif mongo_resume and mongo_resume.get('contact', {}).get('name'):
            candidate_name = mongo_resume['contact']['name']
            candidate_email = mongo_resume['contact'].get('email', 'Unspecified')

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=LETTER,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        elements = []

        # 1. Header Banner & Reference Block
        track_field = (session.field or 'it').upper()
        mode_label = "Scripted Mock Interview (Interactive)" if session.mode == 'mock' else "Standard Structured Q&A"
        date_str = session.created_at.strftime("%Y-%m-%d %H:%M UTC") if session.created_at else datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

        header_table_data = [
            [
                Paragraph("SMARTHIRE PREP // EVALUATION DOSSIER", self.title_style),
                Paragraph(f"<b>DOCKET REF:</b> #{session.id:04d}<br/><b>DATE:</b> {date_str}", self.meta_style)
            ]
        ]
        header_table = Table(header_table_data, colWidths=[380, 160])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('PADDING', (0, 0), (-1, -1), 0),
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 8))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=self.color_forest, spaceBefore=2, spaceAfter=10))

        # 2. Executive Metadata Summary Card
        overall_score_pct = f"{round(session.overall_score * 100)}%" if session.overall_score is not None else "Pending"
        ats_score_pct = f"{round(ats_report.ats_score)}%" if ats_report and ats_report.ats_score is not None else "N/A"

        rubric_description = (
            "Code Correctness & Keyword Precision"
            if (session.field or '').lower() == 'it'
            else "SAR Framework Structure & Communication Clarity"
            if (session.field or '').lower() == 'management'
            else "IRAC Legal Reasoning & Analysis"
        )

        summary_rows = [
            [
                Paragraph("<b>Candidate Name</b>", self.table_header_style),
                Paragraph(candidate_name, self.table_cell_style),
                Paragraph("<b>Composite Verbal Score</b>", self.table_header_style),
                Paragraph(f"<b>{overall_score_pct}</b>", self.table_cell_style),
            ],
            [
                Paragraph("<b>Institutional Email</b>", self.table_header_style),
                Paragraph(candidate_email, self.table_cell_style),
                Paragraph("<b>ATS Document Audit</b>", self.table_header_style),
                Paragraph(f"<b>{ats_score_pct}</b>", self.table_cell_style),
            ],
            [
                Paragraph("<b>Target Track / Role</b>", self.table_header_style),
                Paragraph(f"{track_field} — {session.role}", self.table_cell_style),
                Paragraph("<b>Examination Mode</b>", self.table_header_style),
                Paragraph(mode_label, self.table_cell_style),
            ],
            [
                Paragraph("<b>Scoring Rubric</b>", self.table_header_style),
                Paragraph(rubric_description, self.table_cell_style),
                Paragraph("<b>Transcript Store</b>", self.table_header_style),
                Paragraph(f"MongoDB ({session.mongo_transcript_id or 'relational'})" if session.mongo_transcript_id else "SQL Answers", self.table_cell_style),
            ],
        ]

        summary_table = Table(summary_rows, colWidths=[120, 160, 130, 130])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), self.color_light_bg),
            ('GRID', (0, 0), (-1, -1), 0.5, self.color_border),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 12))

        # 3. Resume Dossier Context (MongoDB / SQL)
        if mongo_resume or session.resume_id:
            elements.append(Paragraph("Candidate Resume Dossier & Extracted Skills", self.section_heading))
            resume_title = mongo_resume.get('title', 'Untitled Structured Resume') if mongo_resume else "Uploaded Candidate Resume"
            resume_skills = mongo_resume.get('skills', []) if mongo_resume else []
            skills_display = ", ".join(resume_skills) if resume_skills else "General Candidate Profile"

            resume_box_data = [
                [
                    Paragraph("<b>Resume Record:</b>", self.table_header_style),
                    Paragraph(f"{resume_title} (Source: {'MongoDB Document' if mongo_resume else 'SQL Document'})", self.table_cell_style)
                ],
                [
                    Paragraph("<b>Identified Skills:</b>", self.table_header_style),
                    Paragraph(skills_display, self.table_cell_style)
                ]
            ]
            resume_box = Table(resume_box_data, colWidths=[110, 430])
            resume_box.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.white),
                ('BOX', (0, 0), (-1, -1), 0.5, self.color_border),
                ('GRID', (0, 0), (-1, -1), 0.5, self.color_border),
                ('PADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(resume_box)
            elements.append(Spacer(1, 10))

        # 4. ATS Compatibility Audit Section
        elements.append(Paragraph("ATS Compatibility Diagnostic", self.section_heading))
        if ats_report:
            issues = ats_report.issues_list or []
            if issues:
                ats_rows = [
                    [
                        Paragraph("<b>Category</b>", self.table_header_style),
                        Paragraph("<b>Severity</b>", self.table_header_style),
                        Paragraph("<b>Diagnostic Advisory</b>", self.table_header_style)
                    ]
                ]
                for issue in issues[:6]: # top issues
                    cat = issue.get('type', 'General')
                    sev = issue.get('severity', 'info').upper()
                    msg = issue.get('message', '')
                    ats_rows.append([
                        Paragraph(cat, self.table_cell_style),
                        Paragraph(f"<b>{sev}</b>", self.table_cell_style),
                        Paragraph(msg, self.table_cell_style)
                    ])
                ats_table = Table(ats_rows, colWidths=[100, 80, 360])
                ats_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), self.color_badge_bg),
                    ('GRID', (0, 0), (-1, -1), 0.5, self.color_border),
                    ('PADDING', (0, 0), (-1, -1), 4),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ]))
                elements.append(ats_table)
            else:
                elements.append(Paragraph("Document satisfies all standard ATS parser schemas with zero critical flags.", self.body_style))
        else:
            elements.append(Paragraph("No ATS report was indexed for this practice session.", self.body_style))

        elements.append(Spacer(1, 12))

        # 5. Examination Breakdown & Interactive Dialogue Flow
        if session.mode == 'mock' and mongo_transcript and mongo_transcript.get('turns'):
            turns = mongo_transcript.get('turns', [])
            persona = mongo_transcript.get('persona', {})
            persona_name = persona.get('name', 'Interviewer')
            persona_title = persona.get('title', 'Senior Technical Evaluator')

            elements.append(Paragraph("Mock Interview Transcript & Interactive Turn Log", self.section_heading))
            elements.append(Paragraph(
                f"<b>Interviewer Persona:</b> {persona_name} ({persona_title}) · "
                f"<i>Multi-tier score-banded remark sequencing with threshold branching</i>",
                self.body_style
            ))
            elements.append(Spacer(1, 6))

            turn_blocks = []
            for idx, turn in enumerate(turns, 1):
                turn_q = turn.get('question_text', 'Evaluation Prompt')
                turn_remark = turn.get('interviewer_remark')
                turn_ans = turn.get('answer_text', '')
                turn_score = turn.get('score', 0)
                turn_branch = turn.get('branch_direction')

                branch_badge = f" · Branch: {turn_branch}" if turn_branch else ""
                turn_header = f"Turn #{idx} — Score: {turn_score}%{branch_badge}"

                cell_elements = [
                    Paragraph(f"<b>{turn_header}</b>", self.table_header_style),
                    Spacer(1, 3),
                ]
                if turn_remark:
                    cell_elements.extend([
                        Paragraph(f"<b>{persona_name}:</b> \"{turn_remark}\"", self.remark_style),
                        Spacer(1, 3),
                    ])
                cell_elements.extend([
                    Paragraph(f"<b>Question:</b> {turn_q}", self.body_bold),
                    Spacer(1, 3),
                    Paragraph(f"<b>Candidate Response:</b> {turn_ans}", self.italic_style),
                ])

                turn_table = Table([[cell_elements]], colWidths=[540])
                turn_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FCFDFD')),
                    ('BOX', (0, 0), (-1, -1), 0.5, self.color_border),
                    ('PADDING', (0, 0), (-1, -1), 6),
                ]))
                turn_blocks.append(turn_table)
                turn_blocks.append(Spacer(1, 6))

            elements.append(KeepTogether(turn_blocks[:2]))
            if len(turn_blocks) > 2:
                elements.extend(turn_blocks[2:])

        else:
            # Standard Q&A Breakdown
            elements.append(Paragraph("Detailed Question Responses & Scoring Rubrics", self.section_heading))
            if answers:
                for idx, ans in enumerate(answers, 1):
                    q_text, q_type = self._fetch_question_text(ans.mongo_question_id, ans.question_id)

                    if q_type == 'mcq' or ans.question_type == 'mcq':
                        status_str = "CORRECT (100%)" if ans.is_correct else "INCORRECT (0%)"
                        detail_text = f"Selected Option: {ans.selected_option or 'None'} — Outcome: {status_str}"
                    else:
                        rel = f"{round((ans.relevance_score or 0) * 100)}%"
                        cla = f"{round((ans.clarity_score or 0) * 100)}%"
                        detail_text = f"Technical Relevance: {rel} | Communication Clarity: {cla}"

                    item_data = [
                        [
                            Paragraph(f"<b>Question Item #{idx}</b> [{ans.question_type.upper() if ans.question_type else 'LONG_ANSWER'}]", self.table_header_style),
                            Paragraph(f"<b>{detail_text}</b>", self.table_cell_style)
                        ],
                        [
                            Paragraph(f"<b>Prompt:</b> {q_text}", self.body_bold),
                            ""
                        ],
                        [
                            Paragraph(f"<b>Candidate Answer:</b> {ans.answer_text or ans.selected_option or 'No answer recorded'}", self.italic_style),
                            ""
                        ]
                    ]
                    item_table = Table(item_data, colWidths=[360, 180])
                    item_table.setStyle(TableStyle([
                        ('SPAN', (0, 1), (1, 1)),
                        ('SPAN', (0, 2), (1, 2)),
                        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
                        ('BOX', (0, 0), (-1, -1), 0.5, self.color_border),
                        ('LINEBELOW', (0, 0), (-1, 0), 0.5, self.color_border),
                        ('PADDING', (0, 0), (-1, -1), 5),
                    ]))
                    elements.append(item_table)
                    elements.append(Spacer(1, 6))
            else:
                elements.append(Paragraph("No answers logged for this session yet.", self.body_style))

        elements.append(Spacer(1, 10))

        # 6. Instructor Endorsement & Recommendations Box
        elements.append(Paragraph("Instructor's Final Endorsement & Preparation Guidance", self.section_heading))
        endorsement_text = (
            "Candidate demonstrates solid architectural reasoning and keyword alignment. Continue sharpening trade-off justifications and system scalability discussions."
            if (session.field or '').lower() == 'it'
            else "Candidate structured responses effectively. Recommend continuing to emphasize quantifiable outcome metrics within the SAR framework."
            if (session.field or '').lower() == 'management'
            else "Candidate displayed rigorous legal issue-spotting. Prioritize precise statutory citation and systematic IRAC analysis."
        )

        endorsement_table = Table(
            [[
                Paragraph(
                    f"<b>SmartHire Advisory Board:</b><br/>"
                    f"\"{endorsement_text}\"",
                    self.body_style
                )
            ]],
            colWidths=[540]
        )
        endorsement_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), self.color_badge_bg),
            ('BOX', (0, 0), (-1, -1), 0.5, self.color_forest),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(endorsement_table)

        doc.build(elements)
        buffer.seek(0)
        return buffer

# Singleton instance
report_generator = ReportGenerator()
