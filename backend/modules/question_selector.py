import random
from backend.models import Question

def select_questions(role, resume_skills):
    """
    Selects a tailored set of questions based on the role and resume skills.

    Args:
        role (str): The target job role.
        resume_skills (list): List of canonical skill names extracted from the resume.

    Returns:
        list: A list of up to 10 Question objects.
    """
    # 1. Fetch all questions for the specified role
    role_questions = Question.query.filter_by(role=role).all()

    # 2. Filter questions based on skills
    # Keep if skill_tag is None (general role question) or if skill_tag is in resume_skills
    tailored_questions = [
        q for q in role_questions
        if q.skill_tag is None or q.skill_tag in resume_skills
    ]

    # 3. Cap at 10 questions, randomly sampled if there are more
    if len(tailored_questions) > 10:
        return random.sample(tailored_questions, 10)

    return tailored_questions
