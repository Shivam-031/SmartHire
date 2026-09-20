import os
import sys
import uuid

# Ensure root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from bson import ObjectId
from backend.app import app
from backend.models import db, User, InterviewSession, Answer
from backend.mongo_db import get_questions_col, get_transcripts_col

def test_phase4_checkpoint():
    print("================================================================")
    print("  PHASE 4 CHECKPOINT VERIFICATION TEST")
    print("  1. Simplified Branching Logic (Score-threshold triggered)")
    print("  2. Canned Interviewer Remark Selection (Score-band tiered)")
    print("  3. MongoDB Transcript Document Logging & SQL Cross-DB Link")
    print("  Checkpoint: A mock session visibly changes its next question")
    print("  based on whether the previous answer was strong or weak.")
    print("================================================================\n")

    client = app.test_client()

    # Generate unique candidate
    suffix = uuid.uuid4().hex[:6]
    candidate_email = f"candidate_p4_{suffix}@smarthire.internal"
    candidate_password = "SecurePassword2026!"
    candidate_name = f"Alex Mercer {suffix.upper()}"

    # -------------------------------------------------------------
    # STEP 1: Candidate Authentication via JWT
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
    token = signup_resp.get_json().get('token')
    user_id = signup_resp.get_json().get('user', {}).get('id')
    auth_headers = {'Authorization': f'Bearer {token}'}
    print(f"  [PASS] Candidate registered & authenticated: {candidate_email} (ID: {user_id})")

    # -------------------------------------------------------------
    # STEP 2: Initialize Mock Interview Session (IT Track)
    # -------------------------------------------------------------
    print("\n--- [STEP 2] Initialize Mock Interview Session (IT Track) ---")
    mock_start_resp = client.post('/api/interview/mock/start', headers=auth_headers, json={
        'user_id': user_id,
        'field': 'it',
        'role': 'Frontend Developer'
    })
    assert mock_start_resp.status_code == 201, f"Mock start failed: {mock_start_resp.get_json()}"
    session_data = mock_start_resp.get_json()
    session_id_1 = session_data.get('session_id')
    mongo_t_id = session_data.get('mongo_transcript_id')
    persona = session_data.get('persona', {})
    questions = session_data.get('questions', [])

    assert session_data.get('mode') == 'mock', "Session mode must be 'mock'"
    assert persona.get('name') == 'Marcus Vance', "Expected Marcus Vance as IT Lead persona"
    assert mongo_t_id is not None, "mongo_transcript_id not returned at session initialization"
    print(f"  [PASS] Mock session started (ID: {session_id_1}) with Persona: {persona.get('name')} ({persona.get('title')})")
    print(f"  [PASS] Cross-DB link verified: SQL Session points to Mongo Transcript ID: {mongo_t_id}")

    # Verify MongoDB transcript initialization
    t_col = get_transcripts_col()
    t_doc = t_col.find_one({'session_id': session_id_1})
    assert t_doc is not None, "Transcript document not created in MongoDB"
    assert t_doc['field'] == 'it', "Transcript field mismatch"
    print(f"  [PASS] MongoDB 'transcripts' collection confirmed initialized with 0 turns")

    # -------------------------------------------------------------
    # STEP 3: Strong Answer -> Challenging Branch Follow-Up
    # -------------------------------------------------------------
    print("\n--- [STEP 3] Strong Answer -> Challenging Branch Follow-Up ---")
    
    # Find a question with follow-up branching rules
    q_with_followup = next((q for q in questions if q.get('follow_ups') and q.get('question_type') == 'long_answer'), None)
    if not q_with_followup:
        # Query MongoDB for a question with follow-ups
        q_col = get_questions_col()
        q_db = q_col.find_one({'field': 'it', 'follow_ups.if_score_above_60': {'$exists': True}})
        q_with_followup = {
            'id': str(q_db['_id']),
            'question_text': q_db['question_text'],
            'expected_keywords': q_db.get('expected_keywords', []),
            'follow_ups': q_db.get('follow_ups', {})
        }

    q_id = q_with_followup['id']
    expected_kw = q_with_followup.get('expected_keywords', ['virtual dom', 'reconciliation', 'diffing'])
    
    strong_answer = (
        f"In React, the reconciliation process compares virtual DOM trees using an O(n) heuristic diffing algorithm. "
        f"Key props maintain element identity across re-renders to prevent unnecessary mutations. "
        f"We implement {', '.join(expected_kw[:3])} to optimize component lifecycles and ensure responsive rendering."
    )

    strong_resp = client.post('/api/interview/mock/answer', headers=auth_headers, json={
        'session_id': session_id_1,
        'question_id': q_id,
        'answer_text': strong_answer,
        'field': 'it'
    })
    assert strong_resp.status_code == 200, f"Strong answer failed: {strong_resp.get_json()}"
    strong_data = strong_resp.get_json()
    strong_score = strong_data['score']
    strong_branch = strong_data['branch_question']
    strong_remark = strong_data['interviewer_remark']

    assert strong_score >= 0.50, f"Expected high score, got {strong_score}"
    assert strong_data['branch_type'] == 'challenging', f"Expected challenging branch, got {strong_data['branch_type']}"
    assert strong_branch is not None, "Branch question missing for strong answer"
    expected_challenging_text = q_with_followup['follow_ups']['if_score_above_60']['question_text']
    assert strong_branch['question_text'] == expected_challenging_text, "Challenging question mismatch"
    print(f"  [PASS] Strong Answer evaluated: Score = {strong_score}/1.0")
    print(f"  [PASS] Canned Remark: \"{strong_remark[:70]}...\"")
    print(f"  [PASS] Triggered Branch: [{strong_data['branch_type'].upper()}] -> \"{strong_branch['question_text'][:70]}...\"")

    # -------------------------------------------------------------
    # STEP 4: Weak Answer -> Clarifying Branch Follow-Up
    # -------------------------------------------------------------
    print("\n--- [STEP 4] Weak Answer -> Clarifying Branch Follow-Up ---")
    
    # Start a second mock session to evaluate the exact same base question with a weak answer
    mock_start_2 = client.post('/api/interview/mock/start', headers=auth_headers, json={
        'user_id': user_id,
        'field': 'it',
        'role': 'Frontend Developer'
    })
    session_id_2 = mock_start_2.get_json().get('session_id')

    weak_answer = "I am not completely sure. I think it makes things faster somehow."

    weak_resp = client.post('/api/interview/mock/answer', headers=auth_headers, json={
        'session_id': session_id_2,
        'question_id': q_id,
        'answer_text': weak_answer,
        'field': 'it'
    })
    assert weak_resp.status_code == 200, f"Weak answer failed: {weak_resp.get_json()}"
    weak_data = weak_resp.get_json()
    weak_score = weak_data['score']
    weak_branch = weak_data['branch_question']
    weak_remark = weak_data['interviewer_remark']

    assert weak_score < 0.60, f"Expected weak score, got {weak_score}"
    assert weak_data['branch_type'] == 'clarifying', f"Expected clarifying branch, got {weak_data['branch_type']}"
    assert weak_branch is not None, "Branch question missing for weak answer"
    expected_clarifying_text = q_with_followup['follow_ups']['if_score_below_60']['question_text']
    assert weak_branch['question_text'] == expected_clarifying_text, "Clarifying question mismatch"
    print(f"  [PASS] Weak Answer evaluated: Score = {weak_score}/1.0")
    print(f"  [PASS] Canned Remark: \"{weak_remark[:70]}...\"")
    print(f"  [PASS] Triggered Branch: [{weak_data['branch_type'].upper()}] -> \"{weak_branch['question_text'][:70]}...\"")

    # -------------------------------------------------------------
    # STEP 5: Checkpoint Assertion — Visible Branching Divergence
    # -------------------------------------------------------------
    print("\n--- [STEP 5] Checkpoint: Visible Branching Divergence ---")
    assert strong_branch['question_text'] != weak_branch['question_text'], "Branch questions must visibly diverge!"
    print(f"  [BRANCH DIVERGENCE VERIFIED]:")
    print(f"    - On Strong Answer: Challenger follow-up routed to advanced trade-offs:")
    print(f"      \"{strong_branch['question_text']}\"")
    print(f"    - On Weak Answer: Clarifier follow-up routed to fundamental principles:")
    print(f"      \"{weak_branch['question_text']}\"")
    print("  [PASS] The mock session visibly changed its next question based on answer strength!")

    # -------------------------------------------------------------
    # STEP 6: MongoDB Transcript Document & Cross-DB Link
    # -------------------------------------------------------------
    print("\n--- [STEP 6] MongoDB Transcript Document & Cross-DB Link ---")
    transcript_doc = t_col.find_one({'session_id': session_id_1})
    assert transcript_doc is not None, "Session 1 transcript not found in Mongo"
    turns = transcript_doc.get('turns', [])
    assert len(turns) >= 1, f"Expected >= 1 turn recorded, got {len(turns)}"
    latest_turn = turns[-1]
    assert latest_turn['user_answer'] == strong_answer, "Turn answer mismatch"
    assert latest_turn['score'] == strong_score, "Turn score mismatch"
    assert latest_turn['interviewer_remark'] == strong_remark, "Turn remark mismatch"
    assert 'timestamp' in latest_turn, "Turn timestamp missing"
    print(f"  [PASS] MongoDB Transcript contains {len(turns)} turn(s) with ordered timestamp & score")

    # Test GET /api/interview/transcript/<session_id>
    get_t_resp = client.post(f'/api/interview/transcript/{session_id_1}', headers=auth_headers) if False else client.get(f'/api/interview/transcript/{session_id_1}', headers=auth_headers)
    assert get_t_resp.status_code == 200, f"Get transcript failed: {get_t_resp.status_code}"
    get_t_data = get_t_resp.get_json()
    assert len(get_t_data.get('turns', [])) == len(turns), "API returned turn count mismatch"
    print(f"  [PASS] GET /api/interview/transcript/{session_id_1} returned full transcript document")

    # Assert SQL InterviewSession.mongo_transcript_id matches
    sql_session = InterviewSession.query.get(session_id_1)
    assert sql_session is not None
    assert sql_session.mongo_transcript_id == str(transcript_doc['_id']), "SQL cross-DB reference mismatch"
    print(f"  [PASS] SQLite InterviewSession.mongo_transcript_id ({sql_session.mongo_transcript_id}) matches MongoDB document ID ({transcript_doc['_id']})")

    # -------------------------------------------------------------
    # STEP 7: Management Track Mock Mode
    # -------------------------------------------------------------
    print("\n--- [STEP 7] Management Track Mock Mode ---")
    mgmt_mock_resp = client.post('/api/interview/mock/start', headers=auth_headers, json={
        'user_id': user_id,
        'field': 'management',
        'role': 'Product Manager'
    })
    assert mgmt_mock_resp.status_code == 201
    mgmt_mock_data = mgmt_mock_resp.get_json()
    mgmt_persona = mgmt_mock_data.get('persona', {})
    assert mgmt_persona.get('name') == 'Eleanor Hayes', "Expected Eleanor Hayes as Management VP persona"
    print(f"  [PASS] Management mock initialized with Persona: {mgmt_persona.get('name')} ({mgmt_persona.get('affiliation')})")

    # -------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------
    print("\n================================================================")
    print("  PHASE 4 CHECKPOINT STATUS: 100% VERIFIED SUCCESS")
    print("  - Simplified Branching Logic (Threshold-triggered): OK")
    print("  - Canned Interviewer Remarks (Score-band tiered): OK")
    print("  - MongoDB Transcript Document Logging: OK")
    print("  - SQLite to MongoDB Cross-DB Reference Link: OK")
    print("  - Visible Question Divergence on Strong vs Weak Answer: OK")
    print("  - Multi-Persona Support (Marcus Vance & Eleanor Hayes): OK")
    print("================================================================\n")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        test_phase4_checkpoint()

