import io
from reportlab.lib.pagesizes import LETTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from backend.models import db, InterviewSession, Answer, ATSReport, User
from backend.routes.interview import interview_bp # For session ID access if needed

class ReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.title_style = ParagraphStyle(
            'TitleStyle',
            parent=self.styles['Heading1'],
            alignment=1, # Center
            fontSize=24,
            spaceAfter=20
        )
        self.header_style = ParagraphStyle(
            'HeaderStyle',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceBefore=15,
            spaceAfter=10
        )
        self.body_style = self.styles['Normal']
        self.italic_style = ParagraphStyle(
            'ItalicStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=10
        )

    def generate_report(self, session_id):
        """
        Generates a professional PDF report for a given interview session.
        """
        session = InterviewSession.query.get(session_id)
        if not session:
            raise ValueError("Interview session not found")

        # Get related data
        user = User.query.get(session.user_id)
        answers = Answer.query.filter_by(session_id=session_id).all()
        ats_report = ATSReport.query.filter_by(resume_id=session.resume_id).first()

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=LETTER)
        elements = []

        # 1. Header
        elements.append(Paragraph("SmartHire Interview Performance Report", self.title_style))
        elements.append(Spacer(1, 12))

        # 2. Summary Section
        summary_data = [
            ["Candidate Name", user.name if user else "Demo User"],
            ["Target Role", session.role],
            ["Date", session.created_at.strftime("%Y-%m-%d %H:%M")],
            ["Overall Score", f"{round(session.overall_score or 0, 2) * 100:.0f}%"]
        ]
        summary_table = Table(summary_data, colWidths=[150, 300])
        summary_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (0, -1), colors.whitesmoke),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 20))

        # 3. ATS Compatibility Analysis
        elements.append(Paragraph("ATS Compatibility Analysis", self.header_style))
        if ats_report:
            ats_score = f"{round(ats_report.ats_score or 0, 2) * 100:.0f}%"
            elements.append(Paragraph(f"Overall ATS Score: {ats_score}", self.body_style))
            elements.append(Spacer(1, 10))

            # Issues Table
            issues_data = [["Type", "Message", "Severity"]]
            for issue in ats_report.issues_list:
                issues_data.append([issue['type'], issue['message'], issue['severity']])

            if issues_data[1:]:
                issues_table = Table(issues_data, colWidths=[100, 300, 80])
                issues_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('PADDING', (0, 0), (-1, -1), 6),
                ]))
                elements.append(issues_table)
            else:
                elements.append(Paragraph("No ATS issues detected. Perfect compatibility!", self.body_style))
        else:
            elements.append(Paragraph("No ATS report available for this session.", self.body_style))

        elements.append(Spacer(1, 20))

        # 4. Detailed Question Breakdown
        elements.append(Paragraph("Detailed Interview Breakdown", self.header_style))
        for idx, ans in enumerate(answers, 1):
            # Find the question text
            question_text = "Unknown Question"
            if ans.question_id:
                # We don't have the Question model imported here, but we can assume it exists
                # To be safe, we'll query it locally or pass it in.
                # However, we can't easily query inside this class without DB context.
                # We'll handle this by returning a report that can be updated.
                pass

            # We'll need the question text, so we'll pass it in or fetch it.
            # For now, we'll use a placeholder and we will fix this in the route.
            elements.append(Paragraph(f"Question {idx}:", self.styles['Heading3']))
            elements.append(Paragraph(ans.answer_text, self.italic_style))
            elements.append(Paragraph(
                f"Relevance: {round(ans.relevance_score or 0, 2)*100:.0f}% | "
                f"Clarity: {round(ans.clarity_score or 0, 2)*100:.0f}%",
                self.body_style
            ))
            elements.append(Spacer(1, 10))

        doc.build(elements)
        buffer.seek(0)
        return buffer

# Singleton instance
report_generator = ReportGenerator()
