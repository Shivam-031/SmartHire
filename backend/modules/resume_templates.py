import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def create_resume_pdf(resume_data, template_id=1):
    """
    Generates a PDF resume based on structured resume JSON.
    template_id:
      1 - Modern Editorial (App theme: Forest Green accents, hairline dividers)
      2 - Classic Executive (Centered header, traditional serif layout)
      3 - Minimal Compact (High density, ATS-optimized layout)
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    story = []

    contact = resume_data.get('contact', {})
    name = contact.get('name') or 'Candidate Name'
    email = contact.get('email') or ''
    phone = contact.get('phone') or ''
    location = contact.get('location') or ''
    linkedin = contact.get('linkedin') or ''
    summary = resume_data.get('summary') or ''
    experience = resume_data.get('experience') or []
    education = resume_data.get('education') or []
    skills = resume_data.get('skills') or []
    projects = resume_data.get('projects') or []

    # Palette selection based on template
    if template_id == 1:
        primary_color = colors.HexColor('#2F6F4E')  # Forest Green
        header_color = colors.HexColor('#1A2E22')   # Forest Black
        muted_color = colors.HexColor('#5C6B60')
        line_color = colors.HexColor('#D2D5C9')
    elif template_id == 2:
        primary_color = colors.HexColor('#1E3A8A')  # Classic Navy
        header_color = colors.HexColor('#111827')
        muted_color = colors.HexColor('#4B5563')
        line_color = colors.HexColor('#9CA3AF')
    else:  # Template 3: Minimal
        primary_color = colors.HexColor('#262626')  # Neutral Charcoal
        header_color = colors.HexColor('#000000')
        muted_color = colors.HexColor('#525252')
        line_color = colors.HexColor('#D4D4D4')

    # Styles
    title_style = ParagraphStyle(
        'ResumeTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20 if template_id != 2 else 22,
        leading=24,
        textColor=header_color,
        alignment=TA_CENTER if template_id == 2 else TA_LEFT
    )

    contact_style = ParagraphStyle(
        'ContactStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=muted_color,
        alignment=TA_CENTER if template_id == 2 else TA_LEFT
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=primary_color,
        spaceAfter=3,
        textTransform='uppercase'
    )

    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#1A2E22')
    )

    item_title = ParagraphStyle(
        'ItemTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=header_color
    )

    item_subtitle = ParagraphStyle(
        'ItemSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        textColor=muted_color
    )

    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#262626'),
        leftIndent=12
    )

    # 1. Header (Name & Contact)
    story.append(Paragraph(name, title_style))
    contact_parts = [p for p in [email, phone, location, linkedin] if p]
    if contact_parts:
        sep = '  |  ' if template_id != 3 else '  ·  '
        story.append(Paragraph(sep.join(contact_parts), contact_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=line_color, spaceAfter=8))

    # 2. Summary
    if summary.strip():
        story.append(Paragraph("Professional Summary", section_heading))
        story.append(Paragraph(summary, body_style))
        story.append(Spacer(1, 8))

    # 3. Experience
    if experience:
        story.append(Paragraph("Work Experience", section_heading))
        for exp in experience:
            job_title = exp.get('title') or 'Position'
            company = exp.get('company') or 'Company'
            dates = exp.get('dates') or ''
            exp_loc = exp.get('location') or ''

            left_meta = f"<b>{job_title}</b> — {company}"
            right_meta = f"{dates}{(' | ' + exp_loc) if exp_loc else ''}"

            header_table = Table(
                [[Paragraph(left_meta, item_title), Paragraph(right_meta, ParagraphStyle('Date', parent=item_subtitle, alignment=TA_RIGHT))]],
                colWidths=[380, 160]
            )
            header_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                ('TOPPADDING', (0,0), (-1,-1), 2),
            ]))
            story.append(header_table)

            bullets = exp.get('bullets') or []
            if isinstance(bullets, str):
                bullets = [b.strip() for b in bullets.split('\n') if b.strip()]
            for b in bullets:
                story.append(Paragraph(f"• {b}", bullet_style))
            story.append(Spacer(1, 6))
        story.append(Spacer(1, 4))

    # 4. Education
    if education:
        story.append(Paragraph("Education", section_heading))
        for edu in education:
            degree = edu.get('degree') or 'Degree'
            school = edu.get('school') or 'Institution'
            year = edu.get('year') or ''
            gpa = edu.get('gpa') or ''

            left_meta = f"<b>{degree}</b> — {school}"
            right_meta = f"{year}{(' (GPA: ' + gpa + ')') if gpa else ''}"

            edu_table = Table(
                [[Paragraph(left_meta, item_title), Paragraph(right_meta, ParagraphStyle('Date', parent=item_subtitle, alignment=TA_RIGHT))]],
                colWidths=[400, 140]
            )
            edu_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                ('TOPPADDING', (0,0), (-1,-1), 2),
            ]))
            story.append(edu_table)
        story.append(Spacer(1, 8))

    # 5. Skills
    if skills:
        story.append(Paragraph("Competencies & Skills", section_heading))
        for sk in skills:
            cat = sk.get('category') or 'Core'
            items = sk.get('items') or []
            if isinstance(items, list):
                items_str = ", ".join(items)
            else:
                items_str = str(items)
            skill_text = f"<b>{cat}:</b> {items_str}"
            story.append(Paragraph(skill_text, body_style))
            story.append(Spacer(1, 2))
        story.append(Spacer(1, 6))

    # 6. Projects
    if projects:
        story.append(Paragraph("Notable Projects", section_heading))
        for prj in projects:
            p_title = prj.get('title') or 'Project'
            p_tech = prj.get('technologies') or ''
            p_desc = prj.get('description') or ''
            p_link = prj.get('link') or ''

            left_meta = f"<b>{p_title}</b>" + (f" ({p_tech})" if p_tech else "")
            right_meta = p_link

            prj_table = Table(
                [[Paragraph(left_meta, item_title), Paragraph(right_meta, ParagraphStyle('Link', parent=item_subtitle, alignment=TA_RIGHT))]],
                colWidths=[380, 160]
            )
            prj_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 1),
                ('TOPPADDING', (0,0), (-1,-1), 1),
            ]))
            story.append(prj_table)
            if p_desc:
                story.append(Paragraph(f"• {p_desc}", bullet_style))
            story.append(Spacer(1, 4))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

