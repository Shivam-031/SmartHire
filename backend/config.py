import os
from dotenv import load_dotenv

# Get the project root directory (one level up from this file)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

load_dotenv(os.path.join(BASE_DIR, '.env'))
load_dotenv(os.path.join(BASE_DIR, 'backend', '.env'))

class Config:
    # SQL Database URI
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f'sqlite:///{os.path.join(BASE_DIR, "backend", "instance", "app.db")}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # MongoDB Configuration
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/smarthire')
    MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME', 'smarthire')

    # Security & JWT Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-12345-editorial-worksheet-system-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'smarthire-jwt-secret-key-32-bytes-long-super-secure-token-12345')
    JWT_EXPIRATION_DAYS = int(os.environ.get('JWT_EXPIRATION_DAYS', '7'))

    # Google OAuth 2.0 Client ID
    GOOGLE_CLIENT_ID = os.environ.get(
        'GOOGLE_CLIENT_ID',
        '228003091405-8p3lrjrfg1mo4nal0sru1417j95hqgef.apps.googleusercontent.com'
    )

    # Uploads
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'backend', 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB
    BASE_DIR = BASE_DIR
