import os
import sys
from datetime import datetime, timedelta

# Ensure root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import app
from backend.models import db, User
from backend.mongo_db import init_mongo, get_mongo_db, is_using_mock
from backend.modules.auth import generate_jwt, hash_password
import jwt
from backend.config import Config

def test_phase0_checkpoint():
    print("================================================================")
    print("  PHASE 0 CHECKPOINT VERIFICATION TEST")
    print("  1. Both databases (SQL + Mongo) reachable from test script")
    print("  2. Protected API route ONLY responds with valid token")
    print("================================================================\n")

    # -------------------------------------------------------------
    # PART 1: Database Reachability Test (SQLAlchemy + PyMongo)
    # -------------------------------------------------------------
    print("--- [PART 1] Verifying Database Reachability ---")
    with app.app_context():
        # A. SQLAlchemy (SQL) Reachability
        try:
            db.session.execute(db.text("SELECT 1")).scalar()
            user_count = User.query.count()
            print(f"  [PASS] SQLAlchemy (SQL) is reachable. Found {user_count} user(s) in database.")
        except Exception as e:
            print(f"  [FAIL] SQLAlchemy connection failed: {e}")
            raise e

        # Ensure we have a valid test user in SQL for auth verification
        test_email = "checkpoint_tester@example.com"
        test_user = User.query.filter_by(email=test_email).first()
        if not test_user:
            test_user = User(
                name="Checkpoint Tester",
                email=test_email,
                password_hash=hash_password("checkpoint_secret_123"),
                target_field="it",
                target_role="Full Stack Developer"
            )
            db.session.add(test_user)
            db.session.commit()
            print(f"  [INFO] Created test user: {test_user.email} (ID: {test_user.id})")
        else:
            print(f"  [INFO] Using existing test user: {test_user.email} (ID: {test_user.id})")

        # B. PyMongo (MongoDB) Reachability
        try:
            mongo_db = get_mongo_db()
            mode = "In-Memory mongomock" if is_using_mock() else "Live MongoDB Service"
            print(f"  [INFO] PyMongo active mode: {mode}")

            # Test write and read on a checkpoint collection
            test_col = mongo_db['checkpoint_health']
            test_doc = {
                "check": "phase_0_dual_db_verification",
                "timestamp": datetime.utcnow().isoformat(),
                "status": "active"
            }
            insert_result = test_col.insert_one(test_doc)
            assert insert_result.inserted_id is not None

            found = test_col.find_one({"_id": insert_result.inserted_id})
            assert found is not None
            assert found["check"] == "phase_0_dual_db_verification"
            print(f"  [PASS] PyMongo (MongoDB) is reachable: successfully wrote & retrieved document ID {found['_id']}.")
        except Exception as e:
            print(f"  [FAIL] PyMongo connection failed: {e}")
            raise e

    # -------------------------------------------------------------
    # PART 2: Protected API Route Security Test
    # -------------------------------------------------------------
    print("\n--- [PART 2] Verifying Protected API Route (@require_auth) ---")
    client = app.test_client()
    protected_endpoint = "/api/auth/me"

    # Test Case 1: Missing Token
    res_no_token = client.get(protected_endpoint)
    assert res_no_token.status_code == 401, f"Expected 401 for no token, got {res_no_token.status_code}"
    no_token_data = res_no_token.get_json()
    assert "error" in no_token_data
    print(f"  [PASS] Missing token -> 401 Unauthorized: \"{no_token_data.get('error')}\"")

    # Test Case 2: Malformed / Invalid Token
    bad_headers = {"Authorization": "Bearer not-a-valid-jwt-token"}
    res_bad_token = client.get(protected_endpoint, headers=bad_headers)
    assert res_bad_token.status_code == 401, f"Expected 401 for invalid token, got {res_bad_token.status_code}"
    bad_token_data = res_bad_token.get_json()
    assert "error" in bad_token_data
    print(f"  [PASS] Invalid token -> 401 Unauthorized: \"{bad_token_data.get('error')}\"")

    # Test Case 3: Expired Token
    # Manually create an expired JWT (expired 10 seconds ago)
    expired_payload = {
        'sub': str(test_user.id),
        'email': test_user.email,
        'exp': datetime.utcnow() - timedelta(seconds=10),
        'iat': datetime.utcnow() - timedelta(seconds=60)
    }
    expired_token = jwt.encode(expired_payload, Config.JWT_SECRET_KEY, algorithm='HS256')
    expired_headers = {"Authorization": f"Bearer {expired_token}"}
    res_expired = client.get(protected_endpoint, headers=expired_headers)
    assert res_expired.status_code == 401, f"Expected 401 for expired token, got {res_expired.status_code}"
    expired_data = res_expired.get_json()
    assert "error" in expired_data
    print(f"  [PASS] Expired token -> 401 Unauthorized: \"{expired_data.get('error')}\"")

    # Test Case 4: Valid Token
    valid_token = generate_jwt(test_user.id, test_user.email)
    valid_headers = {"Authorization": f"Bearer {valid_token}"}
    res_valid = client.get(protected_endpoint, headers=valid_headers)
    assert res_valid.status_code == 200, f"Expected 200 for valid token, got {res_valid.status_code}: {res_valid.data}"
    valid_data = res_valid.get_json()
    assert "user" in valid_data
    assert valid_data["user"]["email"] == test_user.email
    assert valid_data["user"]["id"] == test_user.id
    print(f"  [PASS] Valid token -> 200 OK: User \"{valid_data['user']['name']}\" ({valid_data['user']['email']})")

    # Test Case 5: Additional Protected Endpoint (PUT /api/profile)
    res_profile_no_token = client.put("/api/profile", json={"target_role": "Architect"})
    assert res_profile_no_token.status_code == 401
    res_profile_valid = client.put("/api/profile", json={"target_role": "Full Stack Lead"}, headers=valid_headers)
    assert res_profile_valid.status_code == 200
    print(f"  [PASS] Additional protected route (PUT /api/profile) strictly enforces token.")

    print("\n================================================================")
    print("  CHECKPOINT STATUS: VERIFIED SUCCESSFULLY (100% PASS)")
    print("  Both databases reachable; protected routes strictly guarded.")
    print("================================================================")

if __name__ == "__main__":
    test_phase0_checkpoint()

