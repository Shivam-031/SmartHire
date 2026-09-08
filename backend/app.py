from flask import Flask
from flask_cors import CORS
from backend.models import db
from backend.routes.resume import resume_bp
from backend.config import Config
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config.from_object(Config)

# Initialize Database
db.init_app(app)

# Ensure upload folder exists
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

# Register Blueprints
app.register_blueprint(resume_bp, url_prefix='/api/resume')

@app.route('/')
def index():
    return "SmartHire API is running"

if __name__ == '__main__':
    with app.app_context():
        # Create database tables if they don't exist
        db.create_all()
    app.run(debug=True, port=5000)
