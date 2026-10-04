import io
from datetime import datetime
from flask import Blueprint, request, jsonify, send_file, g
from bson import ObjectId
from backend.mongo_db import get_resumes_col
from backend.modules.auth import optional_auth, require_auth
from backend.modules.resume_templates import create_resume_pdf
from backend.models import Resume as SQLResume
from backend.modules.resume_parser import parser

resume_editor_bp = Blueprint('resume_editor', __name__)

TEMPLATES = [
    {
        'id': 1,
        'name': 'Modern Editorial',
        'code': 'TMPL-MODERN-01',
        'badge': 'Recommended · Editorial Theme',
        'description': 'Balanced hierarchy featuring deep forest green accents, refined hairline borders, and dual-column competency blocks.',
        'best_for': 'Technology & Product Roles'
    },
    {
        'id': 2,
        'name': 'Classic Executive',
        'code': 'TMPL-EXEC-02',
        'badge': 'Formal Presentation',
        'description': 'Traditional centered docket header, elegant formal serif headings, and high-density timeline presentation.',
        'best_for': 'Management, Legal & Corporate Tracks'
    },
    {
        'id': 3,
        'name': 'Minimal Compact',
        'code': 'TMPL-MINIMAL-03',
        'badge': 'Maximum ATS Density',
        'description': 'Ultra-clean monochromatic layout optimized for automated ATS parsers with monospace accents and zero decorative clutter.',
        'best_for': 'High-volume ATS submissions & Senior Technical Leads'
    }
]

DEFAULT_RESUME_SEED = {
    'title': 'Primary Professional Resume',
    'template_id': 1,
    'contact': {
        'name': 'Alex Morgan',
        'email': 'alex.morgan@example.com',
        'phone': '+1 (555) 234-5678',
        'location': 'Seattle, WA',
        'linkedin': 'linkedin.com/in/alexmorgan',
        'portfolio': 'alexmorgan.dev'
    },
    'summary': 'Senior Software Engineer with 6+ years of engineering scalable distributed systems, modern React frontends, and REST/GraphQL APIs. Proven leadership delivering fault-tolerant microservices under tight deadlines.',
    'experience': [
        {
            'title': 'Senior Frontend Engineer',
            'company': 'Vanguard Tech Solutions',
            'location': 'Seattle, WA',
            'dates': '2023 - Present',
            'bullets': [
                'Spearheaded redesign of mission-critical customer portal using React 18 and Tailwind CSS, improving PageSpeed metrics by 38%.',
                'Architected state management layer and reduced bundle payload by 45% through aggressive code-splitting and tree-shaking.',
                'Mentored 4 junior engineers and led bi-weekly architectural RFC sessions.'
            ]
        },
        {
            'title': 'Full Stack Developer',
            'company': 'Apex Cloud Systems',
            'location': 'Austin, TX',
            'dates': '2020 - 2023',
            'bullets': [
                'Engineered asynchronous data processing pipelines in Python/Flask, processing 2M+ records daily.',
                'Implemented automated end-to-end testing suite increasing regression test coverage from 42% to 91%.'
            ]
        }
    ],
    'education': [
        {
            'degree': 'B.S. in Computer Science',
            'school': 'University of Washington',
            'year': '2020',
            'gpa': '3.82 / 4.0'
        }
    ],
    'skills': [
        {
            'category': 'Frontend & Architecture',
            'items': ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Next.js', 'Web Performance']
        },
        {
            'category': 'Backend & Systems',
            'items': ['Python', 'Flask', 'Node.js', 'PostgreSQL', 'MongoDB', 'Docker', 'REST APIs']
        }
    ],
    'projects': [
        {
            'title': 'SmartHire Prep Platform',
            'technologies': 'Python, Flask, React, Tailwind CSS',
            'description': 'Real-time candidate evaluation workbench integrating heuristic ATS auditing and oral examination rubrics.',
            'link': 'github.com/smarthire/prep'
        }
    ]
}

@resume_editor_bp.route('/templates', methods=['GET'])
def get_templates():
    return jsonify({'templates': TEMPLATES}), 200

@resume_editor_bp.route('/editor/current', methods=['GET'])
@optional_auth
def get_current_resume():
    user = g.current_user
    user_id = user.id if user else 1
    col = get_resumes_col()

    doc = col.find_one({'user_id': user_id}, sort=[('last_updated', -1)])
    if doc:
        doc['id'] = str(doc.pop('_id'))
        return jsonify({'resume': doc}), 200

    seed = dict(DEFAULT_RESUME_SEED)
    seed['user_id'] = user_id
    if user:
        seed['contact']['name'] = user.name
        seed['contact']['email'] = user.email

    return jsonify({'resume': seed, 'is_seed': True}), 200

@resume_editor_bp.route('/editor/<resume_id>', methods=['GET'])
def get_resume_by_id(resume_id):
    col = get_resumes_col()
    try:
        doc = col.find_one({'_id': ObjectId(resume_id)})
    except Exception:
        doc = col.find_one({'_id': resume_id})

    if not doc:
        return jsonify({'error': 'Resume record not found.'}), 404

    doc['id'] = str(doc.pop('_id'))
    return jsonify({'resume': doc}), 200

@resume_editor_bp.route('/editor', methods=['POST'])
@optional_auth
def save_resume():
    data = request.get_json() or {}
    user = g.current_user
    user_id = user.id if user else 1

    resume_id = data.get('id')
    doc_data = {
        'user_id': user_id,
        'title': data.get('title') or (data.get('contact', {}).get('name', 'Candidate') + ' Resume'),
        'template_id': int(data.get('template_id', 1)),
        'contact': data.get('contact', {}),
        'summary': data.get('summary', ''),
        'experience': data.get('experience', []),
        'education': data.get('education', []),
        'skills': data.get('skills', []),
        'projects': data.get('projects', []),
        'last_updated': datetime.utcnow().isoformat()
    }

    col = get_resumes_col()
    if resume_id and resume_id != 'seed':
        try:
            col.update_one({'_id': ObjectId(resume_id)}, {'$set': doc_data})
            saved_id = resume_id
        except Exception:
            res = col.insert_one(doc_data)
            saved_id = str(res.inserted_id)
    else:
        res = col.insert_one(doc_data)
        saved_id = str(res.inserted_id)

    return jsonify({
        'message': 'Resume document saved successfully to MongoDB storage.',
        'id': saved_id,
        'last_updated': doc_data['last_updated']
    }), 200

@resume_editor_bp.route('/editor/prefill', methods=['GET', 'POST'])
@optional_auth
def prefill_from_upload():
    data = request.get_json(silent=True) or {}
    sql_resume_id = (
        data.get('sql_resume_id') or
        data.get('resume_id') or
        request.args.get('sql_resume_id') or
        request.args.get('resume_id')
    )

    sql_resume = None
    if sql_resume_id:
        try:
            sql_resume = SQLResume.query.get(int(sql_resume_id))
        except (ValueError, TypeError):
            pass

    if not sql_resume:
        candidates = []
        if g.current_user:
            candidates = SQLResume.query.filter_by(user_id=g.current_user.id).order_by(SQLResume.id.desc()).all()
        if not candidates:
            candidates = SQLResume.query.order_by(SQLResume.id.desc()).all()

        # Prioritize full multi-section resumes (>100 words) so a single-page certificate doesn't wipe candidate profile
        for c in candidates:
            if len((c.extracted_text or '').split()) >= 80:
                sql_resume = c
                break
        if not sql_resume and candidates:
            sql_resume = candidates[0]

    if not sql_resume:
        return jsonify({'error': 'No uploaded resume found to prefill from.'}), 404

    extracted_text = sql_resume.extracted_text or ''
    parsed = parser.parse_full(extracted_text, is_raw_text=True)

    candidate_name = parsed["candidate_name"] or 'Candidate'
    contact = parsed.get("contact", {})
    email = contact.get('email') or (g.current_user.email if g.current_user else '')
    phone = contact.get('phone') or ''
    linkedin = contact.get('linkedin') or ''
    github = contact.get('github') or ''

    # Build categorized skills
    all_skills = parsed["skills"] or sql_resume.extracted_skills or []
    skill_blocks = []
    if parsed.get("skills_categorized"):
        for cat, items in parsed["skills_categorized"].items():
            skill_blocks.append({'category': cat, 'items': items})
    elif all_skills:
        skill_blocks.append({
            'category': 'Technical Competencies & Tools',
            'items': all_skills
        })

    # Map parsed education to editor schema
    parsed_edu = parsed.get("education") or []
    education_blocks = []
    for ed in parsed_edu:
        education_blocks.append({
            'degree': ed.get('degree', 'Degree Program'),
            'school': ed.get('institution') or 'University / Institution',
            'year': ed.get('dates') or '2024'
        })
    if not education_blocks:
        education_blocks = [
            {
                'degree': 'Technical Degree / Course Program',
                'school': 'University / Verified Institution',
                'year': '2024'
            }
        ]

    # Map parsed projects to editor schema
    parsed_proj = parsed.get("projects") or []
    project_blocks = []
    for pr in parsed_proj:
        project_blocks.append({
            'title': pr.get('name', 'Project'),
            'technologies': pr.get('tag', ''),
            'description': ' '.join(pr.get('bullets', [])) or 'Technical project implementation.',
            'link': (pr.get('live_url') or pr.get('github_url') or '').replace('Live:', '').replace('GitHub:', '').strip()
        })

    prefilled = {
        'title': f"{candidate_name} Resume (Imported)",
        'template_id': 1,
        'contact': {
            'name': candidate_name,
            'email': email,
            'phone': phone,
            'location': contact.get('location') or 'Candidate Location',
            'linkedin': linkedin or github
        },
        'summary': parsed.get("summary") or f"Dedicated candidate with verified competencies in {', '.join(all_skills[:4])}.",
        'experience': parsed.get("experience") or [
            {
                'title': contact.get('headline') or 'Software Engineer / Technical Specialist',
                'company': 'Industry Organization',
                'dates': '2024 - Present',
                'bullets': [
                    f"Applied technical domain expertise in {all_skills[0]} to design robust solutions." if all_skills else "Designed and delivered production-grade features.",
                    "Collaborated with cross-functional stakeholders on architectural implementation and code reviews."
                ]
            }
        ],
        'education': education_blocks,
        'skills': skill_blocks,
        'projects': project_blocks
    }

    return jsonify({'resume': prefilled}), 200

@resume_editor_bp.route('/export-pdf', methods=['POST'])
@resume_editor_bp.route('/export', methods=['GET', 'POST'])
@resume_editor_bp.route('/export-pdf', methods=['GET', 'POST'])
@resume_editor_bp.route('/export/pdf', methods=['GET', 'POST'])
@resume_editor_bp.route('/editor/export/pdf', methods=['GET', 'POST'])
@resume_editor_bp.route('/editor/export', methods=['GET', 'POST'])
@optional_auth
def export_pdf():
    data = request.get_json(silent=True) or {}
    resume_data = data.get('resume_data')
    template_id = int(request.args.get('template_id') or data.get('template_id', 1))

    col = get_resumes_col()
    if not resume_data:
        resume_id = request.args.get('id') or request.args.get('resume_id') or data.get('resume_id') or data.get('id')
        if resume_id:
            try:
                resume_data = col.find_one({'_id': ObjectId(resume_id)})
            except Exception:
                resume_data = col.find_one({'_id': resume_id})

        if not resume_data and g.current_user:
            resume_data = col.find_one({'user_id': g.current_user.id}, sort=[('last_updated', -1)])

        if not resume_data:
            resume_data = DEFAULT_RESUME_SEED

    try:
        pdf_bytes = create_resume_pdf(resume_data, template_id=template_id)
        name_clean = (resume_data.get('contact', {}).get('name') or 'Candidate').replace(' ', '_')
        filename = f"SmartHire_Resume_{name_clean}.pdf"

        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({'error': f'Failed to generate PDF dossier: {str(e)}'}), 500

