from backend.app import app
import json

def run_tests():
    client = app.test_client()
    print("--- 1. Testing Root API ---")
    res = client.get('/')
    assert res.status_code == 200, f"Root API failed: {res.status_code}"
    print("Root API: OK")

    print("--- 2. Testing Auth Endpoints ---")
    # Signup
    signup_data = {
        'name': 'Elena Rostova',
        'email': 'elena.rostova@example.com',
        'password': 'securepassword123',
        'target_field': 'management',
        'target_role': 'Product Manager'
    }
    res = client.post('/api/auth/signup', json=signup_data)
    if res.status_code == 409:
        # Already exists, try login
        print("User already exists, proceeding to login...")
    else:
        assert res.status_code == 201, f"Signup failed: {res.data}"
        print("Signup: OK")

    # Login
    login_data = {
        'email': 'elena.rostova@example.com',
        'password': 'securepassword123'
    }
    res = client.post('/api/auth/login', json=login_data)
    assert res.status_code == 200, f"Login failed: {res.data}"
    login_res = res.get_json()
    token = login_res['token']
    user = login_res['user']
    print(f"Login: OK (User: {user['name']}, Field: {user['target_field']})")

    # Protected /me
    headers = {'Authorization': f'Bearer {token}'}
    res = client.get('/api/auth/me', headers=headers)
    assert res.status_code == 200, f"Auth Me failed: {res.data}"
    print("Auth Me (@require_auth): OK")

    print("--- 3. Testing Fields Endpoint ---")
    res = client.get('/api/fields')
    assert res.status_code == 200
    fields = res.get_json()['fields']
    assert len(fields) == 3, f"Expected 3 fields, got {len(fields)}"
    print(f"Fields: OK ({', '.join(f['title'] for f in fields)})")

    print("--- 4. Testing Profile Endpoint ---")
    res = client.get('/api/profile', headers=headers)
    assert res.status_code == 200
    prof = res.get_json()
    print(f"Profile: OK (Target: {prof['user']['target_role']})")

    print("--- 5. Testing Resume Templates & Editor ---")
    res = client.get('/api/resume/templates')
    assert res.status_code == 200
    templates = res.get_json()['templates']
    assert len(templates) == 3
    print(f"Resume Templates: OK ({len(templates)} templates)")

    # Save Resume
    save_data = {
        'title': 'Executive Product Resume',
        'template_id': 2,
        'contact': {
            'name': user['name'],
            'email': user['email'],
            'phone': '+1 555-0182',
            'location': 'San Francisco, CA'
        },
        'summary': 'Seasoned Product Leader with 8+ years scaling B2B SaaS platforms.',
        'experience': [
            {
                'title': 'Director of Product',
                'company': 'Horizon Cloud',
                'dates': '2022 - Present',
                'bullets': ['Grew ARR by 42% in 18 months.', 'Restructured cross-functional agile sprints.']
            }
        ],
        'education': [{'degree': 'MBA', 'school': 'Stanford GSB', 'year': '2018'}],
        'skills': [{'category': 'Product Strategy', 'items': ['RICE', 'OKRs', 'Roadmapping']}]
    }
    res = client.post('/api/resume/editor', json=save_data, headers=headers)
    assert res.status_code == 200
    resume_id = res.get_json()['id']
    print(f"Resume Save to Mongo: OK (ID: {resume_id})")

    # Export PDF
    res = client.post('/api/resume/export-pdf', json={'resume_id': resume_id, 'template_id': 1})
    assert res.status_code == 200
    assert len(res.data) > 1000
    print(f"Resume PDF Export: OK ({len(res.data)} bytes generated)")

    print("--- 6. Testing Interview System (Standard & Mock) ---")
    # Start Standard Session
    start_payload = {
        'field': 'management',
        'role': 'Product Manager',
        'mode': 'mock',
        'mongo_resume_id': resume_id
    }
    res = client.post('/api/interview/start', json=start_payload, headers=headers)
    assert res.status_code == 201
    session_data = res.get_json()
    session_id = session_data['session_id']
    questions = session_data['questions']
    persona = session_data.get('persona', {})
    print(f"Mock Interview Started: OK (Session ID: {session_id}, Persona: {persona.get('name')})")
    assert len(questions) > 0

    # Answer Questions
    for q in questions[:2]:
        q_id = q['id']
        q_type = q['question_type']
        if q_type == 'mcq':
            mcq_ans = client.post('/api/interview/submit-mcq', json={
                'session_id': session_id,
                'question_id': q_id,
                'selected_option': 'A'
            })
            assert mcq_ans.status_code == 200
            mcq_res = mcq_ans.get_json()
            print(f"  MCQ Answer: Correct={mcq_res['is_correct']}, Score={mcq_res['score']}")
        else:
            long_ans = client.post('/api/interview/answer', json={
                'session_id': session_id,
                'question_id': q_id,
                'answer_text': 'The situation was a cross-functional deadlock. I took action by aligning metrics and driving a compromise. This resulted in an on-time release and a 20% increase in retention.'
            })
            assert long_ans.status_code == 201
            ans_res = long_ans.get_json()
            print(f"  Long Answer: Overall={ans_res['overall_score']}, Relevance={ans_res['relevance_score']}")

            # Test Mock Turn Branching
            turn_res = client.post('/api/interview/mock/turn', json={
                'session_id': session_id,
                'score': ans_res['overall_score'],
                'follow_up_rules': q.get('follow_ups', {})
            })
            assert turn_res.status_code == 200
            turn_data = turn_res.get_json()
            print(f"  Mock Turn: Remark='{turn_data['interviewer_remark'][:40]}...', Branch={turn_data['branch_type']}")

    # Complete Interview
    comp_res = client.post('/api/interview/complete', json={'session_id': session_id})
    assert comp_res.status_code == 200
    comp_data = comp_res.get_json()
    print(f"Interview Completed: OK (Overall Score: {comp_data['overall_score']})")

    # Get Transcript
    trans_res = client.get(f'/api/interview/transcript/{session_id}')
    assert trans_res.status_code == 200
    trans_data = trans_res.get_json()
    print(f"Mock Transcript Log: OK ({len(trans_data.get('turns', []))} turns recorded)")

    print("\n==========================================")
    print("ALL v2 BACKEND TESTS PASSED WITH 100% SUCCESS!")
    print("==========================================")

if __name__ == '__main__':
    run_tests()

