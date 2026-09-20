import bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, g
from backend.config import Config
from backend.models import db, User

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password(password: str, hashed: str) -> bool:
    if not hashed or not password:
        return False
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def generate_jwt(user_id: int, email: str, expires_in_seconds: int = None) -> str:
    if expires_in_seconds is not None:
        expiration = datetime.utcnow() + timedelta(seconds=expires_in_seconds)
    else:
        expiration = datetime.utcnow() + timedelta(days=Config.JWT_EXPIRATION_DAYS)
    payload = {
        'sub': str(user_id),
        'email': email,
        'exp': expiration,
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')

def decode_jwt(token: str) -> dict:
    return jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])

def get_token_from_header() -> str:
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header[7:].strip()
    return ''

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_header()
        if not token:
            return jsonify({'error': 'Authentication token is required.'}), 401
        
        try:
            payload = decode_jwt(token)
            user_id = int(payload.get('sub'))
            user = db.session.get(User, user_id) if hasattr(db.session, 'get') else User.query.get(user_id)
            if not user:
                return jsonify({'error': 'User associated with token not found.'}), 401
            g.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Session expired. Please sign in again.'}), 401
        except Exception:
            return jsonify({'error': 'Invalid authentication token.'}), 401

        return f(*args, **kwargs)
    return decorated_function

def optional_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_header()
        g.current_user = None
        if token:
            try:
                payload = decode_jwt(token)
                user_id = int(payload.get('sub'))
                if user_id:
                    g.current_user = db.session.get(User, user_id) if hasattr(db.session, 'get') else User.query.get(user_id)
            except Exception:
                pass

        
        # Fallback to default user (id=1) if available and not authenticated
        if g.current_user is None:
            g.current_user = User.query.first()

        return f(*args, **kwargs)
    return decorated_function
