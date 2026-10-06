import sqlite3
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
db_path = os.path.join(BASE_DIR, 'backend', 'instance', 'app.db')

def migrate():
    if not os.path.exists(db_path):
        print("Database file does not exist yet. It will be created on first start.")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    def add_col_if_missing(tbl, col, col_type):
        cur.execute(f"PRAGMA table_info({tbl})")
        cols = [r[1] for r in cur.fetchall()]
        if col not in cols:
            cur.execute(f"ALTER TABLE {tbl} ADD COLUMN {col} {col_type}")
            print(f"Added {col} to {tbl}")
        else:
            print(f"{col} already in {tbl}")

    add_col_if_missing('user', 'password_hash', 'VARCHAR(255)')
    add_col_if_missing('user', 'target_field', "VARCHAR(50) DEFAULT 'it'")
    add_col_if_missing('user', 'target_role', "VARCHAR(100) DEFAULT 'Frontend Developer'")

    add_col_if_missing('resume', 'mongo_resume_id', 'VARCHAR(50)')

    add_col_if_missing('interview_session', 'mongo_resume_id', 'VARCHAR(50)')
    add_col_if_missing('interview_session', 'field', "VARCHAR(50) DEFAULT 'it'")
    add_col_if_missing('interview_session', 'mode', "VARCHAR(20) DEFAULT 'standard'")
    add_col_if_missing('interview_session', 'mongo_transcript_id', 'VARCHAR(50)')

    add_col_if_missing('answer', 'mongo_question_id', 'VARCHAR(50)')
    add_col_if_missing('answer', 'question_type', "VARCHAR(20) DEFAULT 'long_answer'")
    add_col_if_missing('answer', 'selected_option', 'VARCHAR(10)')
    add_col_if_missing('answer', 'is_correct', 'BOOLEAN')

    add_col_if_missing('ats_report', 'mongo_resume_id', 'VARCHAR(50)')

    conn.commit()
    conn.close()
    print("Database migration successfully completed!")

if __name__ == '__main__':
    migrate()

