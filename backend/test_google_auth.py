import os
import sys
import json
import base64

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import app
from backend.models import db, User

def make_mock_google_token(email, name, sub, picture=None):
    header = base64.urlsafe_b64encode(json.dumps({"alg": "RS256", "typ": "JWT"}).encode()).decode().rstrip('=')
    payload_data = {
        "iss": "https://accounts.google.com",
        "sub": sub,
        "email": email,
        "email_verified": True,
        "name": name,
        "picture": picture or "https://lh3.googleusercontent.com/a/mock-avatar"
    }
    payload = base64.urlsafe_b64encode(json.dumps(payload_data).encode()).decode().rstrip('=')
    signature = "mock_sig_google"
    return f"{header}.{payload}.{signature}"

def run_tests():
    client = app.test_client()

    with app.app_context():
        print("[TEST 1] Missing credential token...")
        res = client.post('/api/auth/google', json={})
        assert res.status_code == 400
        print("  -> PASS: 400 on missing credential")

        print("[TEST 2] Invalid credential format...")
        res = client.post('/api/auth/google', json={"credential": "not_a_valid_token"})
        assert res.status_code == 401
        print("  -> PASS: 401 on invalid credential")

        print("[TEST 3] New candidate signs in with Google...")
        token_str = make_mock_google_token(
            email="google.dev.user@example.com",
            name="Google Test Candidate",
            sub="google-sub-123456",
            picture="https://example.com/avatar.png"
        )
        res = client.post('/api/auth/google', json={
            "credential": token_str,
            "target_field": "management",
            "target_role": "Product Manager"
        })
        assert res.status_code == 200, f"Expected 200 but got {res.status_code}: {res.get_json()}"
        data = res.get_json()
        assert "token" in data
        assert data["user"]["email"] == "google.dev.user@example.com"
        assert data["user"]["name"] == "Google Test Candidate"
        assert data["user"]["target_field"] == "management"
        assert data["user"]["avatar_url"] == "https://example.com/avatar.png"
        print("  -> PASS: User provisioned and returned JWT token")

        print("[TEST 4] Existing candidate signs in again with Google...")
        res2 = client.post('/api/auth/google', json={
            "credential": token_str
        })
        assert res2.status_code == 200
        data2 = res2.get_json()
        assert data2["user"]["id"] == data["user"]["id"]
        print("  -> PASS: Existing user matched and authenticated")

        print("[TEST 5] Authenticated /api/auth/me check with issued token...")
        me_res = client.get('/api/auth/me', headers={"Authorization": f"Bearer {data['token']}"})
        assert me_res.status_code == 200
        me_data = me_res.get_json()
        assert me_data["user"]["email"] == "google.dev.user@example.com"
        print("  -> PASS: Token successfully accepted by protected endpoints")

    print("\nALL GOOGLE AUTH BACKEND TESTS PASSED!")

if __name__ == '__main__':
    run_tests()

