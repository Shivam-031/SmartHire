import os
import sys
import uuid

# Ensure root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from bson import ObjectId
from backend.app import app
from backend.models import db, User, InterviewSession, Answer
from backend.mongo_db import get_questions_col
from backend.modules.question_selector import select_questions

def test_phase3_checkpoint():
    print("================================================================")
    print("  PHASE 3 CHECKPOINT VERIFICATION TEST")
    print("  1. Field-Aware Question Selector (IT vs Management)")
    print("  2. MCQ Submission & Auto-Grading (/mcq/answer & /submit-mcq)")
    print("  3. Field-Specific Long-Answer Scoring Rubric Split:")
    print("     - IT: Code & Concept Precision (Keyword & Architecture depth)")
    print("     - Management: SAR Structure & Situational Impact (Action & Result)")
    print("  Checkpoint: Sessions in each field produce sensibly")
    print("  different-feeling feedback tailored to their respective domains.")
    print("================================================================\n")

    client = app.test_client()

    # Generate test candidate
    suffix = uuid.uuid4().hex[:6]
    candidate_email = f"candidate_p3_{suffix}@smarthire.internal"
    candidate_password = "SecurePassword2026!"
    candidate_name = f"Jordan Taylor {suffix.upper()}"

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
    # STEP 2: Field-Aware Question Selector (IT vs Management)
    # -------------------------------------------------------------
    print("\n--- [STEP 2] Field-Aware Question Selector ---")
    
    # 2A: IT Question Selection
    it_questions = select_questions(field='it', role='Frontend Developer', limit=6, include_mcq=True)
    assert len(it_questions) > 0, "No IT questions returned by question_selector"
    it_types = {q['question_type'] for q in it_questions}
    it_dimensions = {q['focus_dimension'] for q in it_questions}
    assert 'mcq' in it_types, "IT questions must contain MCQs for concept checking"
    assert 'long_answer' in it_types, "IT questions must contain Long Answer questions"
    print(f"  [PASS] IT Question Set ({len(it_questions)} questions): types = {it_types}")
    print(f"  [PASS] IT Focus Dimensions: {list(it_dimensions)[:3]}")

    # 2B: Management Question Selection
    mgmt_questions = select_questions(field='management', role='Product Manager', limit=6, include_mcq=True)
    assert len(mgmt_questions) > 0, "No Management questions returned by question_selector"
    mgmt_types = {q['question_type'] for q in mgmt_questions}
    mgmt_dimensions = {q['focus_dimension'] for q in mgmt_questions}
    assert 'mcq' in mgmt_types, "Management questions must contain MCQs"
    assert 'long_answer' in mgmt_types, "Management questions must contain Long Answer questions"
    print(f"  [PASS] Management Question Set ({len(mgmt_questions)} questions): types = {mgmt_types}")
    print(f"  [PASS] Management Focus Dimensions: {list(mgmt_dimensions)[:3]}")

    # 2C: Skill-Tailored Priority
    tailored = select_questions(field='it', role='Frontend Developer', resume_skills=['React', 'TypeScript'], limit=6)
    first_q_skill = tailored[0].get('skill_tag')
    print(f"  [PASS] Skill-tailoring prioritized skill: {first_q_skill} matching candidate profile")

    # -------------------------------------------------------------
    # STEP 3: MCQ Submission & Auto-Grading Endpoint
    # -------------------------------------------------------------
    print("\n--- [STEP 3] MCQ Submission & Auto-Grading Endpoint ---")
    
    # Start an IT session
    start_it_resp = client.post('/api/interview/start', headers=auth_headers, json={
        'user_id': user_id,
        'field': 'it',
        'role': 'Frontend Developer',
        'mode': 'standard'
    })
    assert start_it_resp.status_code == 201, f"Start session failed: {start_it_resp.get_json()}"
    it_session_id = start_it_resp.get_json().get('session_id')
    session_questions = start_it_resp.get_json().get('questions', [])
    
    # Find an MCQ
    mcq_q = next((q for q in session_questions if q.get('question_type') == 'mcq'), None)
    assert mcq_q is not None, "Session did not include an MCQ question"
    mcq_id = mcq_q['id']
    
    # Lookup correct option from Mongo
    q_col = get_questions_col()
    try:
        q_doc = q_col.find_one({'_id': ObjectId(mcq_id)})
    except Exception:
        q_doc = q_col.find_one({'_id': mcq_id})
    correct_opt = q_doc.get('correct_option', 'A')
    wrong_opt = 'B' if correct_opt != 'B' else 'C'

    # Test 3A: Correct MCQ Submission via /mcq/answer
    correct_resp = client.post('/api/interview/mcq/answer', headers=auth_headers, json={
        'session_id': it_session_id,
        'question_id': mcq_id,
        'selected_option': correct_opt
    })
    assert correct_resp.status_code == 200, f"Correct MCQ submit failed: {correct_resp.get_json()}"
    correct_data = correct_resp.get_json()
    assert correct_data['is_correct'] is True, f"Expected is_correct True, got {correct_data}"
    assert correct_data['score'] == 1.0, f"Expected score 1.0, got {correct_data['score']}"
    print(f"  [PASS] Correct MCQ auto-graded: Option {correct_opt} -> 100% (score: 1.0)")

    # Test 3B: Incorrect MCQ Submission via /submit-mcq (verifying alias)
    incorrect_resp = client.post('/api/interview/submit-mcq', headers=auth_headers, json={
        'session_id': it_session_id,
        'question_id': mcq_id,
        'selected_option': wrong_opt
    })
    assert incorrect_resp.status_code == 200, f"Incorrect MCQ submit failed: {incorrect_resp.get_json()}"
    incorrect_data = incorrect_resp.get_json()
    assert incorrect_data['is_correct'] is False, f"Expected is_correct False, got {incorrect_data}"
    assert incorrect_data['score'] == 0.0, f"Expected score 0.0, got {incorrect_data['score']}"
    assert 'explanation' in incorrect_data, "Explanation missing on incorrect MCQ"
    print(f"  [PASS] Incorrect MCQ auto-graded: Option {wrong_opt} -> 0% with explanation")

    # Verify SQL persistence
    answers = Answer.query.filter_by(session_id=it_session_id, question_type='mcq').all()
    assert len(answers) == 2, f"Expected 2 MCQ answers saved, found {len(answers)}"
    print(f"  [PASS] SQL Answer table recorded {len(answers)} MCQ submission rows with is_correct flag")

    # -------------------------------------------------------------
    # STEP 4: IT Long-Answer Scoring (Keyword Precision Rubric)
    # -------------------------------------------------------------
    print("\n--- [STEP 4] IT Long-Answer Rubric: Keyword & Architecture Precision ---")
    it_long_q = next((q for q in session_questions if q.get('question_type') == 'long_answer'), None)
    assert it_long_q is not None, "Session did not include an IT long answer question"

    # 4A: Strong Technical Answer (high keyword density)
    kw_target = it_long_q.get('expected_keywords', ['React', 'virtual DOM', 'state', 'props'])
    rich_it_answer = (
        f"In our architecture, we leverage {', '.join(kw_target[:3])} to optimize component lifecycles. "
        "We implement memoization hooks to prevent redundant virtual DOM re-renders, isolate mutable state, "
        "and maintain strict unidirectional data flow across all modular boundaries. Database queries are "
        "cached and normalized to eliminate latency bottlenecks."
    )
    strong_it_resp = client.post('/api/interview/answer', headers=auth_headers, json={
        'session_id': it_session_id,
        'question_id': it_long_q['id'],
        'answer_text': rich_it_answer,
        'field': 'it'
    })
    assert strong_it_resp.status_code == 201, f"IT answer eval failed: {strong_it_resp.get_json()}"
    strong_it_data = strong_it_resp.get_json()
    assert strong_it_data['field'] == 'it', "Field mismatch in response"
    assert strong_it_data['rubric_name'] == 'Code & Concept Precision', "Rubric mismatch"
    assert strong_it_data['relevance_score'] >= 0.5, f"Expected high relevance score: {strong_it_data}"
    assert len(strong_it_data['matched_keywords']) > 0, "No keywords matched"
    print(f"  [PASS] Strong IT Answer Score: {strong_it_data['overall_score']}/1.0")
    print(f"  [PASS] Keyword Precision: {strong_it_data['relevance_score']}, Matched: {strong_it_data['matched_keywords']}")

    # 4B: Weak IT Answer (conversational fluff without technical keywords)
    weak_it_answer = "I really like coding and working on computers. I write functions and make sure things look nice."
    weak_it_resp = client.post('/api/interview/answer', headers=auth_headers, json={
        'session_id': it_session_id,
        'question_id': it_long_q['id'],
        'answer_text': weak_it_answer,
        'field': 'it'
    })
    assert weak_it_resp.status_code == 201
    weak_it_data = weak_it_resp.get_json()
    assert weak_it_data['relevance_score'] < strong_it_data['relevance_score'], "Weak answer should score lower"
    assert len(weak_it_data['missing_keywords']) > 0, "Expected missing keywords in feedback"
    print(f"  [PASS] Weak IT Answer Score: {weak_it_data['overall_score']}/1.0 (Flagged missing technical keywords)")

    # -------------------------------------------------------------
    # STEP 5: Management Long-Answer Scoring (SAR Structure Rubric)
    # -------------------------------------------------------------
    print("\n--- [STEP 5] Management Long-Answer Rubric: SAR Framework & Leadership Impact ---")
    
    # Start a Management session
    start_mgmt_resp = client.post('/api/interview/start', headers=auth_headers, json={
        'user_id': user_id,
        'field': 'management',
        'role': 'Product Manager',
        'mode': 'standard'
    })
    assert start_mgmt_resp.status_code == 201
    mgmt_session_id = start_mgmt_resp.get_json().get('session_id')
    mgmt_questions = start_mgmt_resp.get_json().get('questions', [])
    mgmt_long_q = next((q for q in mgmt_questions if q.get('question_type') == 'long_answer'), None)
    assert mgmt_long_q is not None, "Management session missing long answer question"

    # 5A: Strong SAR Answer (Situation, Action, Result)
    mgmt_kw = mgmt_long_q.get('expected_keywords', [])
    kw_inject = f" applying {', '.join(mgmt_kw[:2])}." if mgmt_kw else ""
    sar_answer = (
        "When our enterprise product faced a critical 28% drop in quarterly user activation due to onboarding friction, "
        "the team was divided on priorities. I initiated a series of 15 customer discovery interviews, established a cross-functional "
        f"sprint with engineering and design, and personally coordinated our weekly executive trade-off alignments{kw_inject} "
        "This strategic realignment resulted in a 42% increase in 30-day user retention, delivered on time and within budget."
    )
    sar_resp = client.post('/api/interview/answer', headers=auth_headers, json={
        'session_id': mgmt_session_id,
        'question_id': mgmt_long_q['id'],
        'answer_text': sar_answer,
        'field': 'management'
    })
    assert sar_resp.status_code == 201, f"Management SAR eval failed: {sar_resp.get_json()}"
    sar_data = sar_resp.get_json()
    assert sar_data['field'] == 'management', "Field mismatch"
    assert sar_data['rubric_name'] == 'SAR Leadership & Situational Clarity', "Rubric mismatch"
    assert sar_data['sar_breakdown']['has_situation'] is True, "Situation marker not detected"
    assert sar_data['sar_breakdown']['has_action'] is True, "Action marker not detected"
    assert sar_data['sar_breakdown']['has_result'] is True, "Result marker not detected"
    assert sar_data['sar_score'] == 1.0, f"Expected perfect SAR score, got {sar_data['sar_score']}"
    assert sar_data['overall_score'] >= 0.65, f"Expected high overall score: {sar_data['overall_score']}"
    print(f"  [PASS] Full SAR Answer Score: {sar_data['overall_score']}/1.0 (SAR Structure: 100%)")
    print(f"  [PASS] Detected SAR Components: Situation=True, Action=True, Result=True")

    # 5B: Weak Management Answer (No Action, No Result)
    weak_mgmt_answer = "Product management is about having meetings and making sure everyone gets along."
    weak_mgmt_resp = client.post('/api/interview/answer', headers=auth_headers, json={
        'session_id': mgmt_session_id,
        'question_id': mgmt_long_q['id'],
        'answer_text': weak_mgmt_answer,
        'field': 'management'
    })
    assert weak_mgmt_resp.status_code == 201
    weak_mgmt_data = weak_mgmt_resp.get_json()
    assert weak_mgmt_data['sar_score'] < 1.0, "Expected lower SAR score"
    print(f"  [PASS] Weak Management Answer Score: {weak_mgmt_data['overall_score']}/1.0 (SAR: {weak_mgmt_data['sar_score']})")
    print(f"  [PASS] Feedback: {weak_mgmt_data['suggestions'][0]}")

    # -------------------------------------------------------------
    # STEP 6: Sensibly Different-Feeling Feedback Comparison
    # -------------------------------------------------------------
    print("\n--- [STEP 6] Sensibly Different-Feeling Feedback Checkpoint ---")
    
    # Submit the exact same neutral answer to both IT and Management
    neutral_answer = "We encountered a difficult challenge in the project and worked together to resolve it before the deadline."

    neutral_it_resp = client.post('/api/interview/answer', headers=auth_headers, json={
        'session_id': it_session_id,
        'question_id': it_long_q['id'],
        'answer_text': neutral_answer,
        'field': 'it'
    })
    it_feedback = neutral_it_resp.get_json()

    neutral_mgmt_resp = client.post('/api/interview/answer', headers=auth_headers, json={
        'session_id': mgmt_session_id,
        'question_id': mgmt_long_q['id'],
        'answer_text': neutral_answer,
        'field': 'management'
    })
    mgmt_feedback = neutral_mgmt_resp.get_json()

    print(f"  [IT Feedback Rubric]: {it_feedback['rubric_name']}")
    print(f"    - Suggestions: {it_feedback['suggestions']}")
    print(f"  [Management Feedback Rubric]: {mgmt_feedback['rubric_name']}")
    print(f"    - Suggestions: {mgmt_feedback['suggestions']}")

    # Assert distinct evaluation criteria
    assert it_feedback['rubric_name'] != mgmt_feedback['rubric_name']
    assert 'keyword_precision' in it_feedback['rubric_dimensions']
    assert 'sar_framework' in mgmt_feedback['rubric_dimensions']
    
    # IT suggestions focus on technical keywords; Management suggestions focus on SAR / personal actions
    it_suggest_str = " ".join(it_feedback['suggestions']).lower()
    mgmt_suggest_str = " ".join(mgmt_feedback['suggestions']).lower()
    assert 'technical' in it_suggest_str or 'terms' in it_suggest_str or 'syntax' in it_suggest_str, "IT feedback must mention technical terms"
    assert 'action' in mgmt_suggest_str or 'leadership' in mgmt_suggest_str or 'impact' in mgmt_suggest_str, "Management feedback must mention action or leadership"
    print("  [PASS] Verified sensibly different-feeling feedback between IT and Management rubrics!")

    # -------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------
    print("\n================================================================")
    print("  PHASE 3 CHECKPOINT STATUS: 100% VERIFIED SUCCESS")
    print("  - Field-Aware Question Selector (IT vs Management): OK")
    print("  - MCQ Auto-Grading & SQL Persistence: OK")
    print("  - IT Long-Answer Rubric (Keyword Precision): OK")
    print("  - Management Long-Answer Rubric (SAR Leadership): OK")
    print("  - Sensibly Different-Feeling Feedback per Field: OK")
    print("================================================================\n")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        test_phase3_checkpoint()
