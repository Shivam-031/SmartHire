import os
import sys
import uuid

# Ensure root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import app
from backend.models import db, User
from backend.mongo_db import get_questions_col, get_skills_col
import bcrypt

def test_phase1_checkpoint():
    print("================================================================")
    print("  PHASE 1 CHECKPOINT VERIFICATION TEST")
    print("  1. Signup/login endpoints & JWT issuance with bcrypt")
    print("  2. Profile get/update endpoints (target field & role)")
    print("  3. Question bank returns field-appropriate questions for")
    print("     both IT & Management (tagged with question_type & focus_dimension)")
    print("  4. Skills collection verified for IT and Management")
    print("================================================================\n")

    client = app.test_client()

    # Generate a unique candidate email for testing
    unique_suffix = uuid.uuid4().hex[:6]
    candidate_email = f"candidate_{unique_suffix}@smarthire.internal"
    candidate_password = "SecurePassword2026!"
    candidate_name = f"Candidate {unique_suffix.upper()}"

    # -------------------------------------------------------------
    # STEP 1: Signup & Bcrypt Password Hashing
    # -------------------------------------------------------------
    print("--- [STEP 1] Testing Signup & Bcrypt Password Hashing ---")
    signup_payload = {
        'name': candidate_name,
        'email': candidate_email,
        'password': candidate_password,
        'target_field': 'it',
        'target_role': 'Frontend Developer'
    }
    signup_res = client.post('/api/auth/signup', json=signup_payload)
    assert signup_res.status_code == 201, f"Signup failed: {signup_res.data}"
    signup_data = signup_res.get_json()
    assert 'token' in signup_data, "Token missing from signup response"
    assert 'user' in signup_data, "User object missing from signup response"
    signup_token = signup_data['token']
    created_user_id = signup_data['user']['id']
    print(f"  [PASS] Candidate account provisioned: {candidate_email} (ID: {created_user_id})")
    print(f"  [PASS] JWT Token issued successfully.")

    # Verify password was hashed with bcrypt in the SQL database
    with app.app_context():
        user_in_db = db.session.get(User, created_user_id)
        assert user_in_db is not None
        assert user_in_db.password_hash != candidate_password, "Password was not hashed!"
        assert user_in_db.password_hash.startswith('$2'), f"Password hash is not bcrypt: {user_in_db.password_hash[:10]}"
        assert bcrypt.checkpw(candidate_password.encode('utf-8'), user_in_db.password_hash.encode('utf-8')), "Bcrypt check failed"
        print(f"  [PASS] SQL database verified: Password securely hashed with Bcrypt ({user_in_db.password_hash[:20]}...).")

    # -------------------------------------------------------------
    # STEP 2: Authentication (Login) & Credential Verification
    # -------------------------------------------------------------
    print("\n--- [STEP 2] Testing Login & Authentication ---")
    # Test invalid password rejection
    bad_login_res = client.post('/api/auth/login', json={'email': candidate_email, 'password': 'wrongpassword'})
    assert bad_login_res.status_code == 401
    print("  [PASS] Invalid password correctly rejected with 401 Unauthorized.")

    # Test valid login
    login_res = client.post('/api/auth/login', json={'email': candidate_email, 'password': candidate_password})
    assert login_res.status_code == 200, f"Login failed: {login_res.data}"
    login_data = login_res.get_json()
    assert 'token' in login_data
    auth_token = login_data['token']
    headers = {'Authorization': f'Bearer {auth_token}'}
    print(f"  [PASS] Valid credential authentication succeeded: JWT issued.")

    # -------------------------------------------------------------
    # STEP 3: Profile Get & Update (Target Field & Role)
    # -------------------------------------------------------------
    print("\n--- [STEP 3] Testing Profile Get/Update Endpoints ---")
    # Initial Profile Get
    prof_res = client.get('/api/profile', headers=headers)
    assert prof_res.status_code == 200, f"Get profile failed: {prof_res.data}"
    prof_data = prof_res.get_json()
    assert prof_data['user']['target_field'] == 'it'
    print(f"  [PASS] GET /api/profile returned active track: {prof_data['user']['target_field']} / {prof_data['user']['target_role']}")

    # Calibrate to IT Backend Developer
    update_it = client.put('/api/profile', json={'target_field': 'it', 'target_role': 'Backend Developer'}, headers=headers)
    assert update_it.status_code == 200
    assert update_it.get_json()['user']['target_role'] == 'Backend Developer'
    print("  [PASS] PUT /api/profile updated target track to IT: Backend Developer.")

    # Calibrate to Management Product Manager
    update_mgt = client.put('/api/profile', json={'target_field': 'management', 'target_role': 'Product Manager'}, headers=headers)
    assert update_mgt.status_code == 200
    mgt_data = update_mgt.get_json()
    assert mgt_data['user']['target_field'] == 'management'
    assert mgt_data['user']['target_role'] == 'Product Manager'
    print("  [PASS] PUT /api/profile updated target track to Management: Product Manager.")

    # Confirm persistence with a fresh GET /api/profile
    prof_verify = client.get('/api/profile', headers=headers)
    assert prof_verify.status_code == 200
    assert prof_verify.get_json()['user']['target_field'] == 'management'
    assert prof_verify.get_json()['user']['target_role'] == 'Product Manager'
    print("  [PASS] GET /api/profile confirmed persisted track changes in database.")

    # -------------------------------------------------------------
    # STEP 4: Question Bank Verification for IT
    # -------------------------------------------------------------
    print("\n--- [STEP 4] Verifying Question Bank (IT Track) ---")
    it_res = client.get('/api/interview/questions?field=it')
    assert it_res.status_code == 200
    it_data = it_res.get_json()
    it_questions = it_data['questions']
    assert len(it_questions) > 0, "No IT questions found in MongoDB question bank"

    it_types = set(q['question_type'] for q in it_questions)
    assert 'mcq' in it_types, "IT questions must contain MCQs"
    assert 'long_answer' in it_types, "IT questions must contain long answer questions"

    for q in it_questions:
        assert q['field'] == 'it', f"Question field must be 'it', got {q['field']}"
        assert q['focus_dimension'], f"Question {q['id']} is missing 'focus_dimension'"
        assert q['question_type'] in ['mcq', 'long_answer']
        if q['question_type'] == 'mcq':
            assert len(q['options']) == 4, f"MCQ {q['id']} must have 4 options"
        else:
            assert len(q['expected_keywords']) > 0, f"Long answer {q['id']} must have expected_keywords"

    print(f"  [PASS] IT Question Bank: {len(it_questions)} questions retrieved.")
    print(f"  [PASS] IT Question Types: {', '.join(sorted(it_types))}")
    print(f"  [PASS] IT Focus Dimensions: {', '.join(sorted(set(q['focus_dimension'] for q in it_questions))[:3])}...")

    # -------------------------------------------------------------
    # STEP 5: Question Bank Verification for Management
    # -------------------------------------------------------------
    print("\n--- [STEP 5] Verifying Question Bank (Management Track) ---")
    mgt_res = client.get('/api/interview/questions?field=management')
    assert mgt_res.status_code == 200
    mgt_data = mgt_res.get_json()
    mgt_questions = mgt_data['questions']
    assert len(mgt_questions) > 0, "No Management questions found in MongoDB question bank"

    mgt_types = set(q['question_type'] for q in mgt_questions)
    assert 'mcq' in mgt_types, "Management questions must contain MCQs"
    assert 'long_answer' in mgt_types, "Management questions must contain long answer questions"

    for q in mgt_questions:
        assert q['field'] == 'management', f"Question field must be 'management', got {q['field']}"
        assert q['focus_dimension'], f"Question {q['id']} is missing 'focus_dimension'"
        assert q['question_type'] in ['mcq', 'long_answer']
        if q['question_type'] == 'mcq':
            assert len(q['options']) == 4, f"MCQ {q['id']} must have 4 options"
        else:
            assert len(q['expected_keywords']) > 0, f"Long answer {q['id']} must have expected_keywords"

    print(f"  [PASS] Management Question Bank: {len(mgt_questions)} questions retrieved.")
    print(f"  [PASS] Management Question Types: {', '.join(sorted(mgt_types))}")
    print(f"  [PASS] Management Focus Dimensions: {', '.join(sorted(set(q['focus_dimension'] for q in mgt_questions))[:3])}...")

    # -------------------------------------------------------------
    # STEP 6: Skills Collection Verification
    # -------------------------------------------------------------
    print("\n--- [STEP 6] Verifying Skills Collection (IT & Management) ---")
    skills_col = get_skills_col()
    it_skills = list(skills_col.find({'field': 'it'}))
    mgt_skills = list(skills_col.find({'field': 'management'}))

    assert len(it_skills) > 0, "No IT skills found in MongoDB skills collection"
    assert len(mgt_skills) > 0, "No Management skills found in MongoDB skills collection"

    print(f"  [PASS] Skills in MongoDB: {len(it_skills)} IT skills, {len(mgt_skills)} Management skills.")
    print(f"  [PASS] Sample IT Skills: {', '.join(s['name'] for s in it_skills[:4])}")
    print(f"  [PASS] Sample Management Skills: {', '.join(s['name'] for s in mgt_skills[:4])}")

    print("\n================================================================")
    print("  PHASE 1 CHECKPOINT STATUS: 100% VERIFIED SUCCESS")
    print("  - Signup / Login with Bcrypt + JWT: OK")
    print("  - Profile Get & Update (Field/Role): OK")
    print("  - IT & Management Questions tagged with Type & Dimension: OK")
    print("  - Skills Collection: OK")
    print("================================================================")

if __name__ == '__main__':
    test_phase1_checkpoint()

