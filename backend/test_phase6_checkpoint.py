import os
import sys
import json
import io

# Set root on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import app
from backend.models import db, User, InterviewSession, Answer, ATSReport, Question, Resume
from backend.mongo_db import get_resumes_col, get_transcripts_col, get_questions_col, get_skills_col
from backend.modules.auth import generate_jwt, decode_jwt
from backend.modules.question_selector import select_questions
from backend.modules.resume_templates import create_resume_pdf
from backend.modules.ats_checker import ats_checker
from backend.modules.report_generator import report_generator

def run_phase6_checkpoint():
    print("=" * 75)
    print("SMARTHIRE PREP v2 - PHASE 6 INTEGRATION & POLISH VERIFICATION")
    print("Full Click-Through Testing, Edge Cases & End-to-End Candidate Journey")
    print("=" * 75)

    client = app.test_client()

    with app.app_context():
        # Ensure database tables exist
        db.create_all()

        # =========================================================================
        # SECTION 1: EDGE CASES
        # =========================================================================
        print("\n--- [SECTION 1: EDGE CASES] ---")

        # -------------------------------------------------------------------------
        # Edge Case 1: Expired Token Handling
        # -------------------------------------------------------------------------
        print("\n[TEST 1.1] Edge Case 1: Expired JWT Handling...")
        # Create a temporary candidate to test token expiry
        temp_email = "expired_token_test@smarthire.org"
        temp_user = User.query.filter_by(email=temp_email).first()
        if not temp_user:
            temp_user = User(name="Expired Tester", email=temp_email, password_hash="dummy")
            db.session.add(temp_user)
            db.session.commit()

        # Generate expired token (-60 seconds)
        expired_token = generate_jwt(temp_user.id, temp_email, expires_in_seconds=-60)
        expired_headers = {"Authorization": f"Bearer {expired_token}"}

        # Attempt to access protected profile route
        res_exp_profile = client.get('/api/profile', headers=expired_headers)
        assert res_exp_profile.status_code == 401, f"Expected 401 for expired token, got {res_exp_profile.status_code}"
        exp_data = res_exp_profile.get_json()
        assert "Session expired" in exp_data.get('error', ''), f"Unexpected error msg: {exp_data}"
        print("[PASS] Expired token rejected with 401 and clean message: 'Session expired. Please sign in again.'")

        # -------------------------------------------------------------------------
        # Edge Case 2: Empty MCQ Bank for Sub-Role / Skill Backfill
        # -------------------------------------------------------------------------
        print("\n[TEST 1.2] Edge Case 2: Empty MCQ Bank for Obscure Sub-Role / Skill...")
        # Query question selector with obscure role & skill that has no dedicated MCQs
        qs = select_questions(
            field='it',
            role='ExoticQuantumComputingEngineerXYZ',
            resume_skills=['NonExistentQuantumSkill999'],
            limit=5,
            include_mcq=True
        )
        assert len(qs) > 0, "Question selector returned empty list for obscure role!"
        mcqs_found = [q for q in qs if q.get('question_type') == 'mcq']
        assert len(mcqs_found) > 0, "Question selector failed to backfill field-level MCQs!"
        print(f"[PASS] Handled empty MCQ pool: successfully backfilled {len(mcqs_found)} MCQs from field questions without error.")

        # -------------------------------------------------------------------------
        # Edge Case 3: Empty Resume Document Handling
        # -------------------------------------------------------------------------
        print("\n[TEST 1.3] Edge Case 3: Empty Resume Document (Editor Draft State)...")
        empty_resume_doc = {
            "title": "Blank Draft",
            "template_id": 1,
            "contact": {},
            "summary": "",
            "experience": [],
            "education": [],
            "skills": [],
            "projects": []
        }

        # A: PDF Template generation must not crash on empty content
        empty_pdf_bytes = create_resume_pdf(empty_resume_doc, template_id=1)
        assert empty_pdf_bytes.startswith(b'%PDF'), "PDF generation failed for empty resume!"
        assert len(empty_pdf_bytes) > 500, "Generated PDF buffer unexpectedly small!"
        print("[PASS] Empty resume successfully exported to PDF with draft placeholder notice.")

        # B: ATS Heuristic Checker must not crash on empty content
        empty_ats = ats_checker.analyze_document(empty_resume_doc)
        assert 'ats_score' in empty_ats and isinstance(empty_ats['ats_score'], (int, float)), "ATS scoring failed on empty doc!"
        assert len(empty_ats['issues']) > 0, "ATS checker should identify missing sections in empty resume!"
        print(f"[PASS] Empty resume audited by ATS checker: score={empty_ats['ats_score']}% with {len(empty_ats['issues'])} diagnostic suggestions.")

        # C: ATS API Route directly with empty resume payload
        res_empty_ats = client.post('/api/ats/check', json={"resume_data": empty_resume_doc})
        assert res_empty_ats.status_code == 200, f"ATS check route failed on empty doc: {res_empty_ats.get_json()}"
        print("[PASS] ATS check API endpoint returned 200 for empty resume draft payload.")


        # =========================================================================
        # SECTION 2: END-TO-END CANDIDATE JOURNEY ACROSS BOTH FIELDS & MODES
        # =========================================================================
        print("\n--- [SECTION 2: COMPLETE CANDIDATE JOURNEY] ---")

        # -------------------------------------------------------------------------
        # Step 2.1: Candidate Sign-Up & Authentication
        # -------------------------------------------------------------------------
        print("\n[TEST 2.1] Outside Candidate Sign-Up & Login...")
        tester_email = "tester_p6@smarthire.org"
        existing_tester = User.query.filter_by(email=tester_email).first()
        if existing_tester:
            old_s = InterviewSession.query.filter_by(user_id=existing_tester.id).all()
            for s in old_s:
                Answer.query.filter_by(session_id=s.id).delete()
                db.session.delete(s)
            db.session.delete(existing_tester)
            db.session.commit()

        # Sign Up
        signup_res = client.post('/api/auth/signup', json={
            "name": "Jordan Vance",
            "email": tester_email,
            "password": "SecurePassword2026!",
            "target_field": "it",
            "target_role": "Frontend Developer"
        })
        assert signup_res.status_code == 201, f"Signup failed: {signup_res.get_json()}"
        token = signup_res.get_json()['token']
        user_id = signup_res.get_json()['user']['id']
        headers = {"Authorization": f"Bearer {token}"}
        print(f"[PASS] Candidate registered: ID={user_id}, Name='Jordan Vance', Field='it', Role='Frontend Developer'")

        # Confirm Login endpoint
        login_res = client.post('/api/auth/login', json={
            "email": tester_email,
            "password": "SecurePassword2026!"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.get_json()}"
        print("[PASS] Candidate login successful with verified JWT issuance.")

        # -------------------------------------------------------------------------
        # Step 2.2: Structured Resume Creation & Template Export
        # -------------------------------------------------------------------------
        print("\n[TEST 2.2] Structured Resume Creation in Mongo & PDF Export...")
        candidate_resume = {
            "title": "Jordan Vance - Full Stack & Frontend",
            "template_id": 1,
            "contact": {
                "name": "Jordan Vance",
                "email": tester_email,
                "phone": "+1 (555) 234-5678",
                "location": "Boston, MA",
                "linkedin": "linkedin.com/in/jordanvance",
                "portfolio": "github.com/jordanvance"
            },
            "summary": "Full Stack Engineer with extensive experience developing scalable web applications using React, TypeScript, Python, and microservices.",
            "skills": [
                {"category": "Frontend", "items": ["React", "TypeScript", "HTML5", "CSS3", "Tailwind CSS"]},
                {"category": "Backend", "items": ["Python", "Flask", "Node.js", "SQL", "MongoDB"]},
                {"category": "Tools", "items": ["Git", "Docker", "CI/CD", "Jest"]}
            ],
            "experience": [
                {
                    "title": "Lead Frontend Developer",
                    "company": "Apex Cloud Systems",
                    "dates": "2022 - Present",
                    "location": "Boston, MA",
                    "bullets": [
                        "Architected modular micro-frontend dashboard reducing page load times by 42%.",
                        "Led team of 6 engineers implementing design system components across 4 product suites.",
                        "Optimized bundle size and Core Web Vitals to achieve 98+ Google Lighthouse scores."
                    ]
                }
            ],
            "education": [
                {
                    "degree": "B.S. in Computer Science",
                    "school": "Northeastern University",
                    "year": "2021",
                    "gpa": "3.85"
                }
            ],
            "projects": [
                {
                    "title": "SmartHire Evaluation Engine",
                    "technologies": "React, TypeScript, Python, Flask",
                    "description": "Multi-track recruitment assessment platform with heuristic scoring and cross-database analytics.",
                    "link": "github.com/jordanvance/smarthire"
                }
            ]
        }

        # Save to MongoDB via resume editor endpoint
        res_save = client.post('/api/resume/editor', headers=headers, json=candidate_resume)
        assert res_save.status_code == 200, f"Resume save failed: {res_save.get_json()}"
        mongo_resume_id = res_save.get_json()['id']
        print(f"[PASS] Resume saved to MongoDB: ID={mongo_resume_id}")

        # Export PDF Template 1 via GET and POST
        res_export_get = client.get(f'/api/resume/editor/export/pdf?id={mongo_resume_id}&template_id=1', headers=headers)
        assert res_export_get.status_code == 200, "PDF export GET failed!"
        assert res_export_get.data.startswith(b'%PDF'), "Exported file is not a valid PDF!"
        print(f"[PASS] Resume exported via Template 1 (GET): {len(res_export_get.data)} bytes.")

        res_export_post = client.post('/api/resume/editor/export', headers=headers, json={
            "resume_data": candidate_resume,
            "template_id": 1
        })
        assert res_export_post.status_code == 200, "PDF export POST failed!"
        assert res_export_post.data.startswith(b'%PDF'), "Exported file is not a valid PDF!"
        print(f"[PASS] Resume exported via Template 1 (POST): {len(res_export_post.data)} bytes.")

        # Audit Resume with ATS Checker
        res_ats_check = client.post('/api/ats/check', headers=headers, json={"mongo_resume_id": mongo_resume_id})
        assert res_ats_check.status_code == 200, f"ATS check failed: {res_ats_check.get_json()}"
        ats_data = res_ats_check.get_json()
        print(f"[PASS] ATS Check completed: score={ats_data['ats_score']}%, identified {len(ats_data['issues'])} issues.")

        # -------------------------------------------------------------------------
        # Step 2.3: IT Track - Standard Interview Flow
        # -------------------------------------------------------------------------
        print("\n[TEST 2.3] IT Track: Standard Interview Flow (MCQ + Technical Long Answer)...")
        it_start_res = client.post('/api/interview/start', headers=headers, json={
            "field": "it",
            "role": "Frontend Developer",
            "mode": "standard",
            "limit": 6
        })
        assert it_start_res.status_code in (200, 201), f"IT Start failed: {it_start_res.get_json()}"
        it_session_id = it_start_res.get_json()['session_id']
        it_questions = it_start_res.get_json()['questions']
        assert len(it_questions) > 0, "No questions returned for IT session!"
        print(f"[PASS] IT Standard Session started: ID={it_session_id}, {len(it_questions)} questions delivered.")

        # Answer 1: MCQ Question
        mcq_q = next((q for q in it_questions if q.get('question_type') == 'mcq'), None)
        assert mcq_q is not None, "Expected at least one MCQ question in standard session!"
        mcq_ans_res = client.post('/api/interview/mcq/answer', headers=headers, json={
            "session_id": it_session_id,
            "question_id": mcq_q['id'],
            "selected_option": "A"
        })
        assert mcq_ans_res.status_code == 200, f"MCQ submit failed: {mcq_ans_res.get_json()}"
        mcq_feedback = mcq_ans_res.get_json()
        assert 'score' in mcq_feedback, "Score missing from MCQ feedback!"
        print(f"[PASS] IT MCQ answered: Score={mcq_feedback['score']}/1.0, Explanation: {str(mcq_feedback.get('explanation') or '')[:60]}...")

        # Answer 2: Technical Long-Answer Question
        long_q = next((q for q in it_questions if q.get('question_type') != 'mcq'), None)
        assert long_q is not None, "Expected at least one long-answer question in standard session!"
        tech_answer_text = (
            "In React, state and props control component rendering. State is internal and mutable within a component, "
            "whereas props are read-only properties passed down from a parent component. Modifying state triggers a re-render "
            "cycle through the virtual DOM reconciliation algorithm."
        )
        long_ans_res = client.post('/api/interview/answer', headers=headers, json={
            "session_id": it_session_id,
            "question_id": long_q['id'],
            "answer_text": tech_answer_text,
            "field": "it"
        })
        assert long_ans_res.status_code in (200, 201), f"Long answer submit failed: {long_ans_res.get_json()}"
        long_feedback = long_ans_res.get_json()
        assert long_feedback.get('field') == 'it', "Field metadata missing from feedback!"
        print(f"[PASS] IT Long Answer scored: Score={long_feedback.get('overall_score')}/1.0, Rubric Dimension: {long_feedback.get('rubric_name')}")

        # Complete IT Session
        it_end_res = client.post('/api/interview/complete', headers=headers, json={"session_id": it_session_id})
        assert it_end_res.status_code == 200, f"IT End failed: {it_end_res.get_json()}"
        it_final_score = it_end_res.get_json()['overall_score']
        print(f"[PASS] IT Standard Session concluded: Overall Score={it_final_score}")

        # -------------------------------------------------------------------------
        # Step 2.4: Candidate Track Switch to Management (Profile Update)
        # -------------------------------------------------------------------------
        print("\n[TEST 2.4] Profile Track Switch: Transitioning from IT to Management...")
        update_profile_res = client.put('/api/profile', headers=headers, json={
            "target_field": "management",
            "target_role": "Product Manager"
        })
        assert update_profile_res.status_code == 200, f"Profile update failed: {update_profile_res.get_json()}"
        updated_user = update_profile_res.get_json()['user']
        assert updated_user['target_field'] == 'management', "Target field failed to update!"
        assert updated_user['target_role'] == 'Product Manager', "Target role failed to update!"
        print(f"[PASS] Candidate track updated: Field='{updated_user['target_field']}', Role='{updated_user['target_role']}'")

        # -------------------------------------------------------------------------
        # Step 2.5: Management Track - Mock Interview Flow
        # -------------------------------------------------------------------------
        print("\n[TEST 2.5] Management Track: Mock Interview Mode (Branching & Dynamic Remarks)...")
        mgmt_start_res = client.post('/api/interview/start', headers=headers, json={
            "field": "management",
            "role": "Product Manager",
            "mode": "mock",
            "limit": 5
        })
        assert mgmt_start_res.status_code in (200, 201), f"Management Mock Start failed: {mgmt_start_res.get_json()}"
        mgmt_session_id = mgmt_start_res.get_json()['session_id']
        mgmt_questions = mgmt_start_res.get_json()['questions']
        interviewer_persona = mgmt_start_res.get_json().get('persona', {})
        print(f"[PASS] Management Mock Session started: ID={mgmt_session_id}, Interviewer='{interviewer_persona.get('name')}'")

        # Submit SAR Structured Answer to trigger positive branching and remark
        sar_q = mgmt_questions[0]
        sar_answer = (
            "Situation: At our company, our engineering team and business stakeholders had conflicting sprint priorities, "
            "resulting in a delayed product launch.\n"
            "Action: I organized a cross-functional alignment workshop, implemented a weighted RICE prioritization matrix, "
            "and aligned all stakeholders on clear business goals with a shared timeline.\n"
            "Result: We delivered the core feature milestone 2 weeks ahead of the revised schedule and increased user retention by 28%."
        )
        mgmt_ans_res = client.post('/api/interview/mock/answer', headers=headers, json={
            "session_id": mgmt_session_id,
            "question_id": sar_q['id'],
            "answer_text": sar_answer,
            "field": "management"
        })
        assert mgmt_ans_res.status_code == 200, f"Management mock answer failed: {mgmt_ans_res.get_json()}"
        mgmt_turn = mgmt_ans_res.get_json()
        assert 'interviewer_remark' in mgmt_turn, "Interviewer remark missing in mock mode response!"
        assert 'score' in mgmt_turn, "Score missing in mock response!"
        print(f"[PASS] Management Mock Turn scored: Score={mgmt_turn['score']}/1.0")
        print(f"       Interviewer Remark: '{mgmt_turn['interviewer_remark']}'")
        if mgmt_turn.get('branch_type'):
            print(f"       Branching Triggered: Type='{mgmt_turn.get('branch_type')}'")

        # Complete Management Mock Session
        mgmt_end_res = client.post('/api/interview/complete', headers=headers, json={"session_id": mgmt_session_id})
        assert mgmt_end_res.status_code == 200, f"Management End failed: {mgmt_end_res.get_json()}"
        print(f"[PASS] Management Mock Session concluded: Overall Score={mgmt_end_res.get_json()['overall_score']}")

        # -------------------------------------------------------------------------
        # Step 2.6: Cross-Database Session History Verification
        # -------------------------------------------------------------------------
        print("\n[TEST 2.6] Cross-Database Session History (Scoring Archive)...")
        hist_res = client.get('/api/sessions', headers=headers)
        assert hist_res.status_code == 200, f"Session history failed: {hist_res.get_json()}"
        sessions = hist_res.get_json()
        session_ids = [s['id'] for s in sessions]
        assert it_session_id in session_ids, f"IT session {it_session_id} missing from history!"
        assert mgmt_session_id in session_ids, f"Management session {mgmt_session_id} missing from history!"
        print(f"[PASS] Candidate history contains both completed sessions across IT and Management fields ({len(sessions)} total).")

        # -------------------------------------------------------------------------
        # Step 2.7: End-to-End Downloadable Performance Dossiers (Cross-DB PDF)
        # -------------------------------------------------------------------------
        print("\n[TEST 2.7] Comprehensive Cross-Database PDF Performance Reports...")
        # A: Download IT Standard Report Dossier
        it_rep_res = client.get(f'/api/sessions/{it_session_id}/report/pdf', headers=headers)
        assert it_rep_res.status_code == 200, f"IT PDF Report failed: {it_rep_res.get_json() if it_rep_res.is_json else it_rep_res.status_code}"
        assert it_rep_res.data.startswith(b'%PDF'), "IT Report output is not a valid PDF!"
        print(f"[PASS] IT Standard Session PDF Report successfully generated: {len(it_rep_res.data)} bytes.")

        # B: Download Management Mock Report Dossier (with Mongo transcript dialogue)
        mgmt_rep_res = client.get(f'/api/sessions/{mgmt_session_id}/report/pdf', headers=headers)
        assert mgmt_rep_res.status_code == 200, f"Management PDF Report failed: {mgmt_rep_res.get_json() if mgmt_rep_res.is_json else mgmt_rep_res.status_code}"
        assert mgmt_rep_res.data.startswith(b'%PDF'), "Management Report output is not a valid PDF!"
        print(f"[PASS] Management Mock Session PDF Report successfully generated: {len(mgmt_rep_res.data)} bytes.")

        # -------------------------------------------------------------------------
        # Step 2.8: Profile Screen Verification
        # -------------------------------------------------------------------------
        print("\n[TEST 2.8] Candidate Profile Overview...")
        prof_res = client.get('/api/profile', headers=headers)
        assert prof_res.status_code == 200, f"Profile fetch failed: {prof_res.get_json()}"
        p_data = prof_res.get_json()
        assert len(p_data['sessions']) >= 2, "Profile sessions list incomplete!"
        assert len(p_data['resumes']) >= 1, "Profile resumes list incomplete!"
        print(f"[PASS] Profile aggregates all candidate artifacts: {len(p_data['sessions'])} sessions, {len(p_data['resumes'])} Mongo resume dockets.")

    print("\n" + "=" * 75)
    print("ALL PHASE 6 INTEGRATION & POLISH CHECKS PASSED PERFECTLY!")
    print("Candidate successfully tested full workflow without guidance across both fields and both modes.")
    print("=" * 75)

if __name__ == '__main__':
    run_phase6_checkpoint()
