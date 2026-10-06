import os
import sys
import json
import io

# Set root on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import app
from backend.models import db, User, InterviewSession, Answer, ATSReport, Question, Resume
from backend.mongo_db import get_resumes_col, get_transcripts_col, get_questions_col, get_skills_col
from backend.modules.report_generator import report_generator

def run_phase5_checkpoint():
    print("=" * 70)
    print("SMARTHIRE PREP v2 - PHASE 5 CHECKPOINT VERIFICATION")
    print("Reports, History & Cross-DB Integration (SQL + MongoDB)")
    print("=" * 70)

    client = app.test_client()

    with app.app_context():
        # Ensure tables exist
        db.create_all()

        # -------------------------------------------------------------
        # STEP 1: Standard IT Candidate & Session
        # -------------------------------------------------------------
        print("\n[TEST 1] Setting up Standard IT Candidate & Mongo Resume...")
        it_email = "it_phase5_candidate@smarthire.org"
        existing_it = User.query.filter_by(email=it_email).first()
        if existing_it:
            # Clean up old sessions for this user
            old_sessions = InterviewSession.query.filter_by(user_id=existing_it.id).all()
            for os_sess in old_sessions:
                Answer.query.filter_by(session_id=os_sess.id).delete()
                db.session.delete(os_sess)
            db.session.delete(existing_it)
            db.session.commit()

        # Sign up IT Candidate
        signup_res = client.post('/api/auth/signup', json={
            "name": "Sarah Connor",
            "email": it_email,
            "password": "Password123!",
            "target_field": "it",
            "target_role": "Frontend Developer"
        })
        assert signup_res.status_code == 201, f"IT Signup failed: {signup_res.get_json()}"
        it_token = signup_res.get_json()['token']
        it_user_id = signup_res.get_json()['user']['id']
        it_headers = {"Authorization": f"Bearer {it_token}"}
        print(f"[PASS] Candidate provisioned: ID={it_user_id}, Name='Sarah Connor'")

        # Create structured resume in Mongo
        resumes_col = get_resumes_col()
        it_resume_doc = {
            "user_id": it_user_id,
            "title": "Senior Frontend Engineer Resume",
            "contact": {
                "name": "Sarah Connor",
                "email": it_email,
                "phone": "+1-555-0199",
                "location": "San Francisco, CA"
            },
            "summary": "Full-stack engineer with 6+ years specializing in React, TypeScript, and micro-frontends.",
            "skills": ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Git", "REST APIs"],
            "experience": [
                {
                    "title": "Senior Frontend Developer",
                    "company": "Cyberdyne Systems",
                    "duration": "2021 - Present",
                    "description": "Architected component libraries and optimized Web Vitals by 35%."
                }
            ],
            "education": [
                {
                    "degree": "B.S. in Computer Science",
                    "institution": "Stanford University",
                    "year": "2020"
                }
            ],
            "template_id": 1,
            "last_updated": "2026-09-20T10:00:00Z"
        }
        res_insert = resumes_col.insert_one(it_resume_doc)
        mongo_resume_id = str(res_insert.inserted_id)
        print(f"[PASS] MongoDB Resume Document saved: {mongo_resume_id}")

        # Add ATS Report in SQL for this Mongo resume
        ats_rep = ATSReport(
            mongo_resume_id=mongo_resume_id,
            ats_score=88.5,
            issues_list=[
                {"type": "Keywords", "message": "Strong alignment with Frontend Developer track.", "severity": "info"},
                {"type": "Format", "message": "Chronological experience parsed cleanly.", "severity": "info"}
            ]
        )
        db.session.add(ats_rep)
        db.session.commit()
        print(f"[PASS] SQL ATSReport linked: Score=88.5%")

        # Start Standard IT Interview
        start_it_res = client.post('/api/interview/start', headers=it_headers, json={
            "user_id": it_user_id,
            "field": "it",
            "role": "Frontend Developer",
            "mode": "standard",
            "mongo_resume_id": mongo_resume_id
        })
        assert start_it_res.status_code in (200, 201), f"Start IT session failed: {start_it_res.get_json()}"
        it_sess_data = start_it_res.get_json()
        it_session_id = it_sess_data['session_id']
        it_questions = it_sess_data['questions']
        assert len(it_questions) > 0, "No questions returned for IT session"
        print(f"[PASS] Standard IT Session initialized: Session ID={it_session_id}, Questions Count={len(it_questions)}")

        # Answer questions (MCQ + Long Answer)
        for q in it_questions:
            q_id = q.get('id')
            q_type = q.get('question_type', 'long_answer')
            if q_type == 'mcq':
                opt = q.get('options', [{'label': 'A'}])[0]
                sel_lbl = opt.get('label') if isinstance(opt, dict) else str(opt)
                ans_res = client.post('/api/interview/mcq/answer', headers=it_headers, json={
                    "session_id": it_session_id,
                    "question_id": q_id,
                    "selected_option": sel_lbl
                })
                assert ans_res.status_code == 200
            else:
                ans_res = client.post('/api/interview/answer', headers=it_headers, json={
                    "session_id": it_session_id,
                    "question_id": q_id,
                    "answer_text": "We optimize React rendering using virtual DOM reconciliation, React.memo for pure components, useCallback hooks, and code splitting with dynamic imports."
                })
                assert ans_res.status_code in (200, 201), f"Answer failed ({ans_res.status_code}): {ans_res.get_json()}"

        # Update overall score
        it_session = InterviewSession.query.get(it_session_id)
        it_session.overall_score = 0.85
        db.session.commit()
        print(f"[PASS] Standard IT Session answers submitted and scored (Overall: 85%)")

        # Verify Session History for IT
        history_res = client.get('/api/sessions', headers=it_headers)
        assert history_res.status_code == 200, f"Get sessions failed: {history_res.get_json()}"
        sessions_list = history_res.get_json()
        assert len(sessions_list) >= 1, "Session history is empty"
        found_it = next((s for s in sessions_list if s['id'] == it_session_id), None)
        assert found_it is not None, f"Session {it_session_id} not found in history"
        assert found_it['field'] == 'it', f"Expected field 'it', got {found_it['field']}"
        assert found_it['mode'] == 'standard', f"Expected mode 'standard', got {found_it['mode']}"
        print(f"[PASS] Session History confirmed: ID={found_it['id']}, Field={found_it['field']}, Mode={found_it['mode']}")

        # Verify Session Detail hydration (Cross-DB)
        detail_res = client.get(f'/api/sessions/{it_session_id}', headers=it_headers)
        assert detail_res.status_code == 200, f"Get session detail failed: {detail_res.get_json()}"
        detail_data = detail_res.get_json()
        assert detail_data['field'] == 'it'
        assert detail_data['mode'] == 'standard'
        assert detail_data['resume'] is not None, "MongoDB Resume was not hydrated in session detail"
        assert detail_data['resume']['title'] == "Senior Frontend Engineer Resume"
        assert len(detail_data['answers']) > 0, "Hydrated answers array is empty"
        assert detail_data['answers'][0]['question_text'] != "Unknown Question", "Question text was not hydrated from MongoDB"
        print(f"[PASS] Session Detail Cross-DB Hydration validated: Resume title='{detail_data['resume']['title']}', Prompt='{detail_data['answers'][0]['question_text'][:40]}...'")

        # Generate & Download PDF Report for Standard IT Session
        print("\n[TEST 2] Compiling Cross-DB PDF Dossier for Standard IT Session...")
        report_res = client.get(f'/api/sessions/{it_session_id}/report', headers=it_headers)
        assert report_res.status_code == 200, f"Report download failed: {report_res.get_json()}"
        assert report_res.content_type == 'application/pdf', f"Unexpected content-type: {report_res.content_type}"
        pdf_bytes = report_res.data
        assert pdf_bytes.startswith(b'%PDF'), "Downloaded file does not have valid PDF header"
        assert len(pdf_bytes) > 3000, f"Generated PDF is suspiciously small: {len(pdf_bytes)} bytes"
        print(f"[PASS] Standard IT PDF Dossier compiled successfully: {len(pdf_bytes)} bytes (Valid %PDF)")

        # -------------------------------------------------------------
        # STEP 2: Mock Management Candidate & Interactive Session
        # -------------------------------------------------------------
        print("\n[TEST 3] Setting up Mock Management Candidate & Session...")
        mgmt_email = "mgmt_phase5_candidate@smarthire.org"
        existing_mgmt = User.query.filter_by(email=mgmt_email).first()
        if existing_mgmt:
            old_sessions = InterviewSession.query.filter_by(user_id=existing_mgmt.id).all()
            for os_sess in old_sessions:
                Answer.query.filter_by(session_id=os_sess.id).delete()
                db.session.delete(os_sess)
            db.session.delete(existing_mgmt)
            db.session.commit()

        # Sign up Management Candidate
        mgmt_signup = client.post('/api/auth/signup', json={
            "name": "Marcus Aurelius",
            "email": mgmt_email,
            "password": "Password123!",
            "target_field": "management",
            "target_role": "Product Manager"
        })
        assert mgmt_signup.status_code == 201
        mgmt_token = mgmt_signup.get_json()['token']
        mgmt_user_id = mgmt_signup.get_json()['user']['id']
        mgmt_headers = {"Authorization": f"Bearer {mgmt_token}"}
        print(f"[PASS] Management Candidate provisioned: ID={mgmt_user_id}, Name='Marcus Aurelius'")

        # Create structured resume in Mongo
        mgmt_resume_doc = {
            "user_id": mgmt_user_id,
            "title": "Principal Product Lead Resume",
            "contact": {
                "name": "Marcus Aurelius",
                "email": mgmt_email,
                "phone": "+1-555-0144",
                "location": "New York, NY"
            },
            "summary": "Product executive with 8+ years scaling enterprise SaaS platforms using Agile, OKRs, and customer discovery.",
            "skills": ["Product Strategy", "Roadmapping", "Agile", "User Research", "Stakeholder Management", "OKRs"],
            "experience": [
                {
                    "title": "Group Product Manager",
                    "company": "Imperial Solutions",
                    "duration": "2020 - Present",
                    "description": "Led cross-functional teams of 24 across design, engineering, and GTM."
                }
            ],
            "template_id": 1,
            "last_updated": "2026-09-20T11:00:00Z"
        }
        res_mgmt = resumes_col.insert_one(mgmt_resume_doc)
        mgmt_resume_id = str(res_mgmt.inserted_id)
        print(f"[PASS] Management MongoDB Resume saved: {mgmt_resume_id}")

        # Start Mock Interview Session (mode = 'mock')
        start_mock_res = client.post('/api/interview/mock/start', headers=mgmt_headers, json={
            "user_id": mgmt_user_id,
            "field": "management",
            "role": "Product Manager",
            "mongo_resume_id": mgmt_resume_id
        })
        assert start_mock_res.status_code in (200, 201), f"Start mock failed: {start_mock_res.get_json()}"
        mock_data = start_mock_res.get_json()
        mock_session_id = mock_data['session_id']
        first_q = mock_data.get('first_question') or (mock_data.get('questions') and mock_data['questions'][0])
        persona = mock_data['persona']
        print(f"[PASS] Mock Session initialized: Session ID={mock_session_id}, Persona='{persona['name']}' ({persona['title']})")

        # Submit Turn 1 with strong SAR answer (triggering threshold branch)
        sar_answer = (
            "In my previous product role, the situation was declining user retention by 14%. "
            "My action was initiating targeted customer discovery interviews and establishing an actionable telemetry dashboard. "
            "I negotiated stakeholder alignment across sales and engineering. "
            "As a result, we resolved the core UX bottlenecks and increased 90-day retention by 22%."
        )
        ans_turn1_res = client.post('/api/interview/mock/answer', headers=mgmt_headers, json={
            "session_id": mock_session_id,
            "question_id": first_q.get('id') or first_q.get('_id'),
            "answer_text": sar_answer
        })
        assert ans_turn1_res.status_code == 200, f"Turn 1 answer failed: {ans_turn1_res.get_json()}"
        turn1_data = ans_turn1_res.get_json()
        turn1_score = turn1_data['score']
        turn1_remark = turn1_data['interviewer_remark']
        next_q = turn1_data.get('next_question') or turn1_data.get('branch_question')

        # Submit Turn 2 (answering the follow-up / next question)
        if next_q:
            qid = next_q.get('id') if isinstance(next_q, dict) else str(next_q)
            ans_turn2_res = client.post('/api/interview/mock/answer', headers=mgmt_headers, json={
                "session_id": mock_session_id,
                "question_id": qid or "follow_up_1",
                "answer_text": "We aligned quarterly OKRs with executive leadership and maintained transparent weekly sprint retrospectives."
            })
            assert ans_turn2_res.status_code in (200, 201)

        # Update overall score for mock session
        mock_session = InterviewSession.query.get(mock_session_id)
        mock_session.overall_score = 0.88
        db.session.commit()

        # Verify Session History includes Mock Management Session
        mgmt_hist_res = client.get('/api/sessions', headers=mgmt_headers)
        assert mgmt_hist_res.status_code == 200
        mgmt_sessions = mgmt_hist_res.get_json()
        found_mock = next((s for s in mgmt_sessions if s['id'] == mock_session_id), None)
        assert found_mock is not None, f"Mock session {mock_session_id} not in history"
        assert found_mock['field'] == 'management', f"Expected field 'management', got {found_mock['field']}"
        assert found_mock['mode'] == 'mock', f"Expected mode 'mock', got {found_mock['mode']}"
        assert found_mock['has_transcript'] is True, "Expected has_transcript to be True"
        print(f"[PASS] Mock Management Session confirmed in History: Field={found_mock['field']}, Mode={found_mock['mode']}, TranscriptLinked={found_mock['has_transcript']}")

        # Verify Session Detail includes MongoDB Transcript Turns
        mock_detail_res = client.get(f'/api/sessions/{mock_session_id}', headers=mgmt_headers)
        assert mock_detail_res.status_code == 200
        mock_detail = mock_detail_res.get_json()
        assert mock_detail['mode'] == 'mock'
        assert mock_detail['transcript'] is not None, "MongoDB Transcript was not hydrated in session detail"
        assert len(mock_detail['transcript']['turns']) >= 1, "Transcript turns array is empty"
        turn_sample = mock_detail['transcript']['turns'][0]
        assert turn_sample.get('interviewer_remark') is not None, "Interviewer remark missing from turn"
        print(f"[PASS] Session Detail hydrated Mock Transcript with {len(mock_detail['transcript']['turns'])} dialogue turns and persona '{mock_detail['transcript']['persona'].get('name')}'")

        # Generate & Download PDF Report for Mock Management Session
        print("\n[TEST 4] Compiling Cross-DB PDF Dossier for Mock Management Session...")
        mock_report_res = client.get(f'/api/sessions/{mock_session_id}/report', headers=mgmt_headers)
        assert mock_report_res.status_code == 200, f"Mock report download failed: {mock_report_res.get_json()}"
        assert mock_report_res.content_type == 'application/pdf'
        mock_pdf_bytes = mock_report_res.data
        assert mock_pdf_bytes.startswith(b'%PDF'), "Mock report does not have valid PDF header"
        assert len(mock_pdf_bytes) > 3000, f"Generated Mock PDF is suspiciously small: {len(mock_pdf_bytes)} bytes"
        print(f"[PASS] Mock Management PDF Dossier compiled successfully: {len(mock_pdf_bytes)} bytes (Valid %PDF)")

        # -------------------------------------------------------------
        # STEP 3: Unauthenticated / Multi-Field Listing Verification
        # -------------------------------------------------------------
        print("\n[TEST 5] Verifying multi-field archive index across all candidates...")
        all_sessions_res = client.get('/api/sessions')
        assert all_sessions_res.status_code == 200
        all_list = all_sessions_res.get_json()
        fields_present = {s.get('field') for s in all_list}
        modes_present = {s.get('mode') for s in all_list}
        assert 'it' in fields_present, "IT field not present in total session history"
        assert 'management' in fields_present, "Management field not present in total session history"
        assert 'standard' in modes_present, "Standard mode not present in total session history"
        assert 'mock' in modes_present, "Mock mode not present in total session history"
        print(f"[PASS] Archive Index includes multi-field ({fields_present}) and multi-mode ({modes_present}) sessions.")

    print("\n" + "=" * 70)
    print("PHASE 5 CHECKPOINT: ALL TESTS PASSED [100% OK]")
    print("Cross-DB Report Generator & Multi-Field Session History Verified")
    print("=" * 70)

if __name__ == '__main__':
    run_phase5_checkpoint()

