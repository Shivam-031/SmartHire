from flask import Blueprint, request, jsonify, g
from backend.models import db, User
from backend.modules.auth import hash_password, check_password, generate_jwt, require_auth
from backend.config import Config
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
import re
import requests
import json

auth_bp = Blueprint('auth', __name__)

EMAIL_REGEX = r'^[\w\.-]+@[\w\.-]+\.\w+$'

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    target_field = (data.get('target_field') or 'it').strip().lower()
    target_role = (data.get('target_role') or 'Frontend Developer').strip()

    if not name:
        return jsonify({'error': 'Candidate name is required.'}), 400
    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({'error': 'A valid corporate or institutional email is required.'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters in length.'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'An account is already registered under this email address.'}), 409

    hashed = hash_password(password)
    new_user = User(
        name=name,
        email=email,
        password_hash=hashed,
        target_field=target_field,
        target_role=target_role
    )
    db.session.add(new_user)
    db.session.commit()

    token = generate_jwt(new_user.id, new_user.email)
    return jsonify({
        'message': 'Account provisioned successfully.',
        'token': token,
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Both email and password are required to authenticate.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.password_hash or not check_password(password, user.password_hash):
        return jsonify({'error': 'Invalid email address or credential authentication failure.'}), 401

    token = generate_jwt(user.id, user.email)
    return jsonify({
        'message': 'Authentication successful.',
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user():
    return jsonify({
        'user': g.current_user.to_dict()
    }), 200

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    data = request.get_json() or {}
    credential = (data.get('credential') or '').strip()
    target_field = (data.get('target_field') or 'it').strip().lower()
    target_role = (data.get('target_role') or 'Frontend Developer').strip()

    if not credential:
        return jsonify({'error': 'Google credential token is required.'}), 400

    google_info = None
    client_id = Config.GOOGLE_CLIENT_ID

    # 1. Primary verification: Cryptographic RSA signature check via Google's public JWK certificates
    try:
        google_info = google_id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            client_id
        )
    except Exception as verify_err:
        # 2. Secondary verification: Official Google tokeninfo API endpoint
        try:
            resp = requests.get(
                f'https://oauth2.googleapis.com/tokeninfo?id_token={credential}',
                timeout=5
            )
            if resp.status_code == 200:
                data_info = resp.json()
                if data_info.get('aud') == client_id:
                    google_info = data_info
        except Exception:
            pass

    # Strictly reject any unverified, forged, or unauthenticated tokens
    if not google_info or not isinstance(google_info, dict):
        return jsonify({
            'error': 'Google token verification failed. The provided token is invalid, expired, or was not signed by Google.'
        }), 401

    # Verify issuer is Google
    iss = google_info.get('iss', '')
    if iss not in ['accounts.google.com', 'https://accounts.google.com']:
        return jsonify({'error': 'Token issuer is not accounts.google.com.'}), 401

    # Verify email is confirmed by Google
    email_verified = google_info.get('email_verified')
    if str(email_verified).lower() not in ['true', '1']:
        return jsonify({'error': 'Google account email is not verified.'}), 401

    email = google_info.get('email', '').strip().lower()
    name = google_info.get('name') or google_info.get('given_name') or email.split('@')[0].capitalize()
    google_id = str(google_info.get('sub') or google_info.get('id') or '')
    avatar_url = google_info.get('picture')

    if not email:
        return jsonify({'error': 'Google account email could not be verified.'}), 400

    # Match existing user or provision a new user account
    is_new_user = False
    user = User.query.filter_by(email=email).first()
    if user:
        if not user.google_id and google_id:
            user.google_id = google_id
        if not user.avatar_url and avatar_url:
            user.avatar_url = avatar_url
        db.session.commit()
    else:
        is_new_user = True
        user = User(
            name=name,
            email=email,
            password_hash=None,
            google_id=google_id,
            avatar_url=avatar_url,
            target_field=target_field,
            target_role=target_role
        )
        db.session.add(user)
        db.session.commit()

    token = generate_jwt(user.id, user.email)
    return jsonify({
        'message': 'Account created and calibrated via Google.' if is_new_user else 'Google authentication successful.',
        'token': token,
        'user': user.to_dict(),
        'is_new_user': is_new_user
    }), 201 if is_new_user else 200


