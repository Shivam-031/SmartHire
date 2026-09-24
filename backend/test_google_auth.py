from unittest.mock import patch
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import app
from backend.models import db, User

def run_tests():
    client = app.test_client()

    with app.app_context():
        print("[TEST 1] Missing credential token...")
        res = client.post('/api/auth/google', json={})
        assert res.status_code == 400
        print("  -> PASS: 400 on missing credential")

        print("[TEST 2] Forged / unverified credential without Google cryptographic signature...")
        res = client.post('/api/auth/google', json={"credential": "forged_unverified_token_12345"})
        assert res.status_code == 401, f"Expected 401 for forged token, got {res.status_code}"
        assert 'verification failed' in res.get_json()['error'].lower()
        print("  -> PASS: 401 strictly rejected forged / unverified token")

        print("[TEST 3] Valid Google ID token cryptographically verified by Google...")
        verified_payload = {
            "iss": "https://accounts.google.com",
            "aud": "228003091405-8p3lrjrfg1mo4nal0sru1417j95hqgef.apps.googleusercontent.com",
            "sub": "google-real-uid-998877",
            "email": "verified.candidate@gmail.com",
            "email_verified": True,
            "name": "Verified Google Candidate",
            "picture": "https://lh3.googleusercontent.com/a/real-photo"
        }
        with patch('google.oauth2.id_token.verify_oauth2_token', return_value=verified_payload):
            res = client.post('/api/auth/google', json={
                "credential": "genuine_google_id_token",
                "target_field": "management",
                "target_role": "Product Manager"
            })
            assert res.status_code == 201, f"Expected 201 for new candidate signup, got {res.status_code}: {res.get_json()}"
            data = res.get_json()
            assert "token" in data
            assert data["user"]["email"] == "verified.candidate@gmail.com"
            assert data["user"]["name"] == "Verified Google Candidate"
            assert data["user"]["target_field"] == "management"
            assert data["user"]["avatar_url"] == "https://lh3.googleusercontent.com/a/real-photo"
            print("  -> PASS: Candidate provisioned with verified Google identity and JWT")

            print("[TEST 4] Existing candidate signs in again with Google...")
            res2 = client.post('/api/auth/google', json={
                "credential": "genuine_google_id_token"
            })
            assert res2.status_code == 200, f"Expected 200 for existing user login, got {res2.status_code}"
            data2 = res2.get_json()
            assert data2["user"]["id"] == data["user"]["id"]
            print("  -> PASS: Existing user matched and authenticated")

            print("[TEST 5] Authenticated /api/auth/me check with issued token...")
            me_res = client.get('/api/auth/me', headers={"Authorization": f"Bearer {data['token']}"})
            assert me_res.status_code == 200
            me_data = me_res.get_json()
            assert me_data["user"]["email"] == "verified.candidate@gmail.com"
            print("  -> PASS: Token successfully accepted by protected endpoints")

            print("[TEST 6] Unverified email from Google token is rejected...")
            unverified_email_payload = dict(verified_payload, email_verified=False)
        with patch('google.oauth2.id_token.verify_oauth2_token', return_value=unverified_email_payload):
            unv_res = client.post('/api/auth/google', json={"credential": "token_with_unverified_email"})
            assert unv_res.status_code == 401
            print("  -> PASS: 401 rejected when email is unverified")

    print("\nALL GOOGLE AUTH BACKEND STRICT TESTS PASSED!")

if __name__ == '__main__':
    run_tests()
