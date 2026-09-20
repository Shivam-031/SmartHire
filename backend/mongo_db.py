import logging
from backend.config import Config

logger = logging.getLogger(__name__)

_client = None
_db = None
_using_mock = False

def init_mongo():
    global _client, _db, _using_mock
    if _db is not None:
        return _db

    try:
        from pymongo import MongoClient
        # Try connecting with a 2-second timeout
        real_client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=2000)
        # Test connection
        real_client.admin.command('ping')
        _client = real_client
        _db = _client[Config.MONGO_DB_NAME]
        _using_mock = False
        logger.info(f"Connected to live MongoDB at {Config.MONGO_URI}")
    except Exception as e:
        logger.warning(f"Could not connect to live MongoDB ({e}). Falling back to resilient in-memory mongomock.")
        try:
            import mongomock
            _client = mongomock.MongoClient()
            _db = _client[Config.MONGO_DB_NAME]
            _using_mock = True
            logger.info("Initialized mongomock fallback successfully.")
        except Exception as mock_err:
            logger.error(f"Failed to initialize mongomock: {mock_err}")
            raise mock_err

    # Auto-seed questions and skills if empty (ensures in-memory and fresh DB readiness)
    try:
        if _db['questions'].count_documents({}) == 0:
            from backend.seed_v2 import seed_mongo_data
            seed_mongo_data(force=False)
    except Exception as seed_err:
        logger.warning(f"Auto-seeding check failed: {seed_err}")

    return _db

def get_mongo_db():
    global _db
    if _db is None:
        return init_mongo()
    return _db

get_db = get_mongo_db

def is_using_mock():
    return _using_mock

def get_questions_col():
    return get_mongo_db()['questions']

def get_skills_col():
    return get_mongo_db()['skills']

def get_resumes_col():
    return get_mongo_db()['resumes']

def get_transcripts_col():
    return get_mongo_db()['transcripts']

