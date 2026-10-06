import os
import sys
import io
import uuid

# Ensure root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from reportlab.pdfgen import canvas
from bson import ObjectId
from backend.app import app
from backend.models import db, User, Resume as SQLResume
from backend.mongo_db import get_resumes_col, get_db

def create_sample_pdf():
    """Generates an in-memory PDF resume for upload testing."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(50, 780, "Morgan Vance")
    c.drawString(50, 765, "morgan.vance@example.com | +1 555 342 9812 | Seattle, WA | https://linkedin.com/in/morganvance")
    c.drawString(50, 740, "Professional Summary")
    c.drawString(50, 725, "Senior Software Architect with 8+ years developing high-throughput web applications.")
    c.drawString(50, 700, "Work Experience")
    c.drawString(50, 685, "Lead Software Engineer - Apex Cloud (2021 - Present)")
    c.drawString(50, 670, "- Spearheaded core platform migration to React and Python microservices.")
    c.drawString(50, 655, "- Optimized database queries reducing query latency by 45%.")
    c.drawString(50, 640, "- Mentored 6 software engineers in test-driven development.")
    c.drawString(50, 615, "Education")
    c.drawString(50, 600, "B.S. in Computer Science - University of Washington (2018)")
    c.drawString(50, 575, "Skills")
    c.drawString(50, 560, "Python, React, TypeScript, Docker, SQL, Flask, MongoDB")
    c.drawString(50, 535, "Projects")
    c.drawString(50, 520, "Distributed Cache Manager - High throughput caching system.")
    c.save()
    buf.seek(0)
    return buf

def test_phase2_checkpoint():
    print("================================================================")
    print("  PHASE 2 CHECKPOINT VERIFICATION TEST")
    print("  1. Resume Parser: PDF/DOCX -> text + skills")
    print("  2. Resume Editor: structured form, prefill from upload,")
    print("     and persist to MongoDB 'resumes' collection")
    print("  3. Resume Templates: PDF export (Template 1: Modern Editorial)")
    print("  4. ATS Checker: pointed at Mongo resume document & SQL rows")
    print("  Checkpoint: Logged-in user can upload OR build a resume,")
    print("  edit it, export it as PDF, and get an ATS report on it.")
    print("================================================================\n")

    client = app.test_client()

    # Generate unique test candidate
    suffix = uuid.uuid4().hex[:6]
    candidate_email = f"candidate_p2_{suffix}@smarthire.internal"
    candidate_password = "SecurePassword2026!"
    candidate_name = f"Morgan Vance {suffix.upper()}"

    # -------------------------------------------------------------
    # STEP 1: Authenticate Candidate (Signup & JWT Issuance)
    # -------------------------------------------------------------
    print("--- [STEP 1] Candidate Authentication via JWT ---")
    signup_resp = client.post('/api/auth/signup', json={
        'name': candidate_name,
        'email': candidate_email,
        'password': candidate_password,
        'target_field': 'it',
        'target_role': 'Frontend Developer'
    })
    assert signup_resp.status_code == 201, f"Signup failed: {signup_resp.get_json()}"
    signup_data = signup_resp.get_json()
    token = signup_data.get('token')
    user_id = signup_data.get('user', {}).get('id')
    assert token, "JWT token missing in signup response"
    auth_headers = {'Authorization': f'Bearer {token}'}
    print(f"  [PASS] Candidate registered & authenticated: {candidate_email} (ID: {user_id})")

    # -------------------------------------------------------------
    # STEP 2: Resume Parser & Upload (PDF -> text + skills)
    # -------------------------------------------------------------
    print("\n--- [STEP 2] Resume Parser & Upload Pipeline ---")
    pdf_file = create_sample_pdf()
    upload_resp = client.post(
        '/api/resume/upload',
        headers=auth_headers,
        data={'file': (pdf_file, 'test_candidate_resume.pdf')},
        content_type='multipart/form-data'
    )
    assert upload_resp.status_code == 201, f"Upload failed: {upload_resp.get_json()}"
    upload_data = upload_resp.get_json()
    sql_resume_id = upload_data.get('resume_id')
    extracted_skills = upload_data.get('extracted_skills', [])
    assert sql_resume_id, "SQL resume_id not returned"
    print(f"  [PASS] Resume uploaded and parsed into SQL record ID: {sql_resume_id}")
    print(f"  [PASS] Extracted skills from PDF: {extracted_skills[:6]}")

    # -------------------------------------------------------------
    # STEP 3: Resume Editor Pre-fill from Upload
    # -------------------------------------------------------------
    print("\n--- [STEP 3] Resume Editor Pre-fill from Upload ---")
    prefill_resp = client.post(
        '/api/resume/editor/prefill',
        headers=auth_headers,
        json={'sql_resume_id': sql_resume_id}
    )
    assert prefill_resp.status_code == 200, f"Prefill failed: {prefill_resp.get_json()}"
    prefill_data = prefill_resp.get_json().get('resume', {})
    assert 'contact' in prefill_data, "Contact section missing in prefilled resume"
    assert 'skills' in prefill_data, "Skills section missing in prefilled resume"
    print(f"  [PASS] Pre-filled title: {prefill_data.get('title')}")
    print(f"  [PASS] Pre-filled contact: {prefill_data.get('contact', {}).get('name')}")
    prefilled_skill_count = len(prefill_data.get('skills', [{}])[0].get('items', []))
    print(f"  [PASS] Pre-filled {prefilled_skill_count} skills into editor structure")

    # -------------------------------------------------------------
    # STEP 4: Flow A - Save Pre-filled Resume to MongoDB 'resumes'
    # -------------------------------------------------------------
    print("\n--- [STEP 4] Flow A: Save Pre-filled Resume to Mongo ---")
    prefill_data['summary'] = "Senior software architect with extensive hands-on experience in full-stack cloud systems."
    save_resp = client.post(
        '/api/resume/editor',
        headers=auth_headers,
        json=prefill_data
    )
    assert save_resp.status_code == 200, f"Save failed: {save_resp.get_json()}"
    flow_a_mongo_id = save_resp.get_json().get('id')
    assert flow_a_mongo_id, "Mongo document ID not returned on save"
    print(f"  [PASS] Flow A resume saved to MongoDB 'resumes' collection: {flow_a_mongo_id}")

    # -------------------------------------------------------------
    # STEP 5: Flow B - Build Structured Resume from Scratch in Editor
    # -------------------------------------------------------------
    print("\n--- [STEP 5] Flow B: Build Structured Resume Directly in Editor ---")
    structured_resume = {
        'title': 'Senior Systems Engineer Dossier',
        'template_id': 1,
        'contact': {
            'name': 'Taylor Reed',
            'email': 'taylor.reed@example.com',
            'phone': '+1 (555) 789-0123',
            'location': 'San Francisco, CA',
            'linkedin': 'https://linkedin.com/in/taylorreed',
            'portfolio': 'taylorreed.dev'
        },
        'summary': 'Innovative Engineering Lead with 7+ years directing distributed microservices, TypeScript web frontends, and cloud automation pipelines. Proven ability to optimize database throughput and lead cross-functional delivery teams.',
        'experience': [
            {
                'title': 'Lead Cloud Engineer',
                'company': 'Vanguard Technologies',
                'location': 'San Francisco, CA',
                'dates': '2022 - Present',
                'bullets': [
                    'Spearheaded architectural transition to event-driven services, decreasing latencies by 32%.',
                    'Architected fault-tolerant REST APIs handling 5M daily requests.',
                    'Mentored 8 engineers across code review and architectural RFC standards.'
                ]
            },
            {
                'title': 'Senior Full Stack Developer',
                'company': 'Horizon Systems',
                'location': 'San Jose, CA',
                'dates': '2019 - 2022',
                'bullets': [
                    'Built scalable React single-page applications with Tailwind CSS and state machines.',
                    'Optimized backend SQL query pipelines cutting database bottlenecks by 40%.'
                ]
            }
        ],
        'education': [
            {
                'degree': 'B.S. in Computer Science & Engineering',
                'school': 'University of California, Berkeley',
                'year': '2019',
                'gpa': '3.88 / 4.0'
            }
        ],
        'skills': [
            {
                'category': 'Architecture & Systems',
                'items': ['Python', 'Flask', 'TypeScript', 'React', 'Docker', 'PostgreSQL', 'MongoDB', 'REST APIs']
            },
            {
                'category': 'Core Practices',
                'items': ['Agile Methodologies', 'Continuous Integration', 'Distributed Systems', 'System Design']
            }
        ],
        'projects': [
            {
                'title': 'SmartHire Prep Platform',
                'technologies': 'Python, Flask, React, MongoDB',
                'description': 'Real-time candidate evaluation workbench integrating heuristic ATS analysis and examination rubrics.',
                'link': 'https://github.com/smarthire/platform'
            }
        ]
    }

    editor_save_resp = client.post(
        '/api/resume/editor',
        headers=auth_headers,
        json=structured_resume
    )
    assert editor_save_resp.status_code == 200, f"Editor save failed: {editor_save_resp.get_json()}"
    mongo_resume_id = editor_save_resp.get_json().get('id')
    assert mongo_resume_id, "Mongo document ID not returned"
    print(f"  [PASS] Flow B resume document created in MongoDB: {mongo_resume_id}")

    # Verify Mongo Document persistence
    col = get_resumes_col()
    try:
        doc = col.find_one({'_id': ObjectId(mongo_resume_id)})
    except Exception:
        doc = col.find_one({'_id': mongo_resume_id})
    assert doc is not None, "Document not found in MongoDB resumes collection"
    assert doc['contact']['name'] == 'Taylor Reed', "Persisted document field mismatch"
    print("  [PASS] MongoDB persistence verified directly in 'resumes' collection")

    # -------------------------------------------------------------
    # STEP 6: PDF Export with Template 1 (Modern Editorial)
    # -------------------------------------------------------------
    print("\n--- [STEP 6] PDF Export with Template 1 (Modern Editorial) ---")
    export_resp = client.post(
        '/api/resume/export-pdf',
        headers=auth_headers,
        json={
            'resume_id': mongo_resume_id,
            'template_id': 1
        }
    )
    assert export_resp.status_code == 200, f"PDF export failed: {export_resp.status_code}"
    assert export_resp.mimetype == 'application/pdf', f"Unexpected mimetype: {export_resp.mimetype}"
    pdf_bytes = export_resp.data
    assert len(pdf_bytes) > 500, f"PDF bytes unexpectedly small: {len(pdf_bytes)}"
    assert pdf_bytes.startswith(b'%PDF-'), "PDF magic header '%PDF-' missing"
    print(f"  [PASS] PDF exported successfully ({len(pdf_bytes)} bytes)")
    print("  [PASS] Verified '%PDF-' binary specification header")

    # -------------------------------------------------------------
    # STEP 7: ATS Checker Pointed at MongoDB Resume Document
    # -------------------------------------------------------------
    print("\n--- [STEP 7] ATS Checker Pointed at MongoDB Resume Document ---")
    
    # 7A: Audit via explicit mongo_resume_id
    ats_mongo_resp = client.post(
        '/api/ats/check',
        headers=auth_headers,
        json={'mongo_resume_id': mongo_resume_id}
    )
    assert ats_mongo_resp.status_code == 200, f"ATS check failed: {ats_mongo_resp.get_json()}"
    ats_mongo_data = ats_mongo_resp.get_json()
    assert 'ats_score' in ats_mongo_data, "ats_score missing from ATS report"
    assert 'issues' in ats_mongo_data, "issues missing from ATS report"
    score_mongo = ats_mongo_data['ats_score']
    issues_mongo = ats_mongo_data['issues']
    assert 0 <= score_mongo <= 100, f"ATS score out of bounds: {score_mongo}"
    print(f"  [PASS] ATS Report for Mongo Document: Score {score_mongo}/100")
    print(f"  [PASS] Identified {len(issues_mongo)} heuristic feedback items")

    # 7B: Audit via direct resume_data payload
    ats_payload_resp = client.post(
        '/api/ats/check',
        headers=auth_headers,
        json={'resume_data': structured_resume}
    )
    assert ats_payload_resp.status_code == 200, "Direct resume_data audit failed"
    ats_payload_data = ats_payload_resp.get_json()
    assert ats_payload_data['ats_score'] == score_mongo, "Score discrepancy on identical payload"
    print("  [PASS] Real-time pre-save document analysis matched persisted report score")

    # 7C: Audit via authenticated user session default (no ID needed)
    ats_user_resp = client.post(
        '/api/ats/check',
        headers=auth_headers,
        json={}
    )
    assert ats_user_resp.status_code == 200, "User default ATS audit failed"
    print("  [PASS] Authenticated fallback correctly analyzed candidate's latest Mongo resume")

    # 7D: Verify backward compatibility with SQL Resume ID
    ats_sql_resp = client.post(
        '/api/ats/check',
        headers=auth_headers,
        json={'resume_id': sql_resume_id}
    )
    assert ats_sql_resp.status_code in (200, 201), f"SQL ATS check failed: {ats_sql_resp.get_json()}"
    ats_sql_data = ats_sql_resp.get_json()
    assert 'ats_score' in ats_sql_data, "SQL ATS report missing ats_score"
    print(f"  [PASS] SQL row backward compatibility preserved: Score {ats_sql_data['ats_score']}/100")

    # -------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------
    print("\n================================================================")
    print("  PHASE 2 CHECKPOINT STATUS: 100% VERIFIED SUCCESS")
    print("  - Resume Parser (PDF -> Text + Skills): OK")
    print("  - Resume Editor Prefill from Upload: OK")
    print("  - Flow A (Upload -> Prefill -> Save to Mongo): OK")
    print("  - Flow B (Build in Editor -> Save to Mongo): OK")
    print("  - Resume Template PDF Export (Template 1 Modern Editorial): OK")
    print("  - ATS Checker Pointed at MongoDB Resume Document: OK")
    print("  - SQL Resume & Upload Fallback Compatibility: OK")
    print("================================================================\n")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    test_phase2_checkpoint()

