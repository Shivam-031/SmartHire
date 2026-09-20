from flask import Blueprint, request, jsonify, g
from backend.models import db, User
from backend.modules.auth import hash_password, check_password, generate_jwt, require_auth
import re

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

