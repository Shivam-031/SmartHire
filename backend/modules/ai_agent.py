"""
AI Mock Interview Agent Module
Supports top free LLM models:
- Groq API (llama-3.3-70b-versatile / llama-3.1-8b-instant): ultra-fast <300ms verbal response
- Google Gemini API (gemini-1.5-flash / gemini-2.0-flash): free tier via Google AI Studio
- Intelligent Local Fallback Engine: deterministic NLP rubric analysis if no API key is provided
"""

import os
import json
import logging
import requests
from backend.config import Config

logger = logging.getLogger(__name__)

PERSONA_PROMPTS = {
    'it': {
        'name': 'Marcus Vance',
        'title': 'Principal Systems Architect · Core Platform Lead',
        'voice_tone': 'Sharp, pragmatic, senior engineering peer. Speaks naturally as an experienced systems architect conducting an oral whiteboard and architecture review. Evaluates technical accuracy, concurrency, scale, trade-offs, and failure modes.',
        'eval_rubric': 'System architecture precision, algorithmic correctness, scalability, edge-case resilience, and implementation clarity.'
    },
    'management': {
        'name': 'Eleanor Hayes',
        'title': 'VP of Product & Strategic Operations',
        'voice_tone': 'Executive, strategic, outcome-oriented. Speaks with executive clarity, looking for structured communication, business impact, stakeholder ownership, and KPI outcomes.',
        'eval_rubric': 'STAR framework structure (Situation, Task, Action, Result), quantifiable business outcomes, stakeholder alignment, and trade-off prioritization.'
    },
    'law': {
        'name': 'Victoria Hastings',
        'title': 'Senior Managing Counsel & Regulatory Partner',
        'voice_tone': 'Rigorous, analytical, statutory authority. Speaks with precision, testing legal doctrine, liability containment, contractual risk, and compliance governance.',
        'eval_rubric': 'IRAC framework (Issue, Rule, Application, Conclusion), statutory fidelity, regulatory risk mitigation, and factual soundness.'
    }
}

def get_active_model_info():
    """Returns the active provider and model being utilized."""
    groq_key = Config.GROQ_API_KEY or os.environ.get('GROQ_API_KEY', '').strip()
    gemini_key = Config.GEMINI_API_KEY or os.environ.get('GEMINI_API_KEY', '').strip()

    if groq_key:
        return 'groq', Config.GROQ_MODEL or 'llama-3.3-70b-versatile', groq_key
    elif gemini_key:
        return 'gemini', Config.GEMINI_MODEL or 'gemini-1.5-flash', gemini_key
    else:
        return 'local', 'smart-rubric-engine-v2', None

def call_groq_llm(messages, api_key, model='llama-3.3-70b-versatile'):
    """Calls Groq Cloud API for free, ultra-low latency LLM inference."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 750,
        "response_format": {"type": "json_object"}
    }
    resp = requests.post(url, json=payload, headers=headers, timeout=12)
    resp.raise_for_status()
    data = resp.json()
    raw_content = data['choices'][0]['message']['content']
    return json.loads(raw_content)

def call_gemini_llm(prompt, api_key, model='gemini-1.5-flash'):
    """Calls Google Gemini API (free tier) for generative evaluation."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 800,
            "responseMimeType": "application/json"
        }
    }
    resp = requests.post(url, json=payload, headers=headers, timeout=12)
    resp.raise_for_status()
    data = resp.json()
    raw_text = data['candidates'][0]['content']['parts'][0]['text']
    return json.loads(raw_text)

def generate_fallback_evaluation(field, role, question_text, candidate_answer, expected_keywords=None):
    """
    Intelligent Local Fallback Engine:
    Provides immediate, resilient, and realistic evaluation when no API key is set.
    """
    field_key = (field or 'it').strip().lower()
    persona_info = PERSONA_PROMPTS.get(field_key, PERSONA_PROMPTS['it'])
    words = candidate_answer.strip().split()
    word_count = len(words)

    # Keywords matching
    exp_kws = [k.lower().strip() for k in (expected_keywords or []) if k]
    answer_lower = candidate_answer.lower()
    matched_kws = [k for k in exp_kws if k in answer_lower]
    missing_kws = [k for k in exp_kws if k not in answer_lower]

    # Heuristic scoring
    length_score = min(1.0, max(0.2, word_count / 45.0))
    kw_score = (len(matched_kws) / len(exp_kws)) if exp_kws else 0.75
    
    # Check for domain-specific indicators
    structure_bonus = 0.0
    if field_key == 'management' and any(term in answer_lower for term in ['metric', 'kpi', 'result', 'revenue', 'growth', 'team', 'stakeholder']):
        structure_bonus += 0.15
    elif field_key == 'law' and any(term in answer_lower for term in ['statute', 'clause', 'liability', 'compliance', 'regulation', 'precedent']):
        structure_bonus += 0.15
    elif field_key == 'it' and any(term in answer_lower for term in ['architecture', 'concurrency', 'latency', 'state', 'cache', 'complexity', 'component']):
        structure_bonus += 0.15

    overall_score = round(min(0.98, max(0.35, (length_score * 0.4) + (kw_score * 0.4) + structure_bonus)), 2)
    relevance_score = round(min(0.95, max(0.40, kw_score + (0.1 if word_count > 25 else 0))), 2)
    clarity_score = round(min(0.95, max(0.40, length_score * 0.9 + 0.1)), 2)

    branch_type = 'challenging' if overall_score >= 0.65 else 'clarifying'

    # Construct persona verbal spoken remark
    name = persona_info['name']
    if overall_score >= 0.80:
        if field_key == 'it':
            spoken_remark = f"Solid analysis. You clearly grasp the underlying mechanics and trade-offs. I appreciate the focus on operational constraints. Now, let's see how you defend this under sudden traffic spikes."
            follow_up = "How would you safeguard this system against cascading failures if the primary downstream service degrades?"
        elif field_key == 'management':
            spoken_remark = f"Very well structured. You established clear situational context and tied your action to measurable business impact. Let's explore how you handle executive resistance."
            follow_up = "If a key stakeholder rejects your recommended trade-off due to budget constraints, how do you navigate that alignment?"
        else:
            spoken_remark = f"Precise statutory reasoning. You effectively connected the governing principle to the factual liabilities. Let's test the enforceability of that stance."
            follow_up = "What cross-jurisdictional liabilities might arise if this agreement is executed across multiple regulatory domains?"
    elif overall_score >= 0.55:
        if field_key == 'it':
            spoken_remark = f"Good foundational explanation. You touched on the core concepts, though I'd like to hear more about your memory footprint and edge cases. Let's delve a bit deeper."
            follow_up = "Can you walk me through the concrete runtime complexity and what happens if the cache expires concurrently?"
        elif field_key == 'management':
            spoken_remark = f"Good overview of the situation. To take this to an executive level, make sure to quantify the exact outcome and metrics achieved. Let's look closer at your execution."
            follow_up = "What specific KPIs or metrics did you track to validate that this intervention was actually successful?"
        else:
            spoken_remark = f"A sound premise. You identified the relevant doctrine, but be sure to articulate the counter-arguments opposing counsel would raise."
            follow_up = "How would you counter a claim that the limitation of liability clause is unenforceable under current state regulations?"
    else:
        if field_key == 'it':
            spoken_remark = f"You touched on the baseline, but the answer needs more concrete technical rigor and implementation specifics. Let's break this down step by step."
            follow_up = "Let's simplify: what is the fundamental state machine or data structure governing this behavior under normal conditions?"
        elif field_key == 'management':
            spoken_remark = f"I hear your general thought, but let's structure this using the STAR method. Focus specifically on your personal leadership interventions."
            follow_up = "What was your specific individual role and the immediate task you took ownership of in that scenario?"
        else:
            spoken_remark = f"You noted the initial topic, but remember to strictly link the governing rule directly to the fact pattern."
            follow_up = "Which specific statute or contract clause governs this liability threshold in your view?"

    strengths = []
    if matched_kws:
        strengths.append(f"Successfully integrated relevant terminology: {', '.join(matched_kws[:3])}")
    if word_count >= 30:
        strengths.append("Provided detailed situational depth and complete sentences.")
    else:
        strengths.append("Addressed the question promptly.")

    improvements = []
    if missing_kws:
        improvements.append(f"Incorporate key technical aspects: {', '.join(missing_kws[:3])}")
    if word_count < 35:
        improvements.append("Elaborate further on concrete implementation details or measurable outcomes.")

    return {
        'interviewer_remark': spoken_remark,
        'overall_score': overall_score,
        'relevance_score': relevance_score,
        'clarity_score': clarity_score,
        'technical_depth': round((overall_score + relevance_score) / 2, 2),
        'strengths': strengths,
        'improvements': improvements,
        'suggestions': [
            "Structure oral answers with clear problem statement, action, and outcome.",
            "Explicitly mention performance implications and constraints."
        ],
        'matched_keywords': matched_kws,
        'missing_keywords': missing_kws,
        'follow_up_question': follow_up,
        'branch_type': branch_type,
        'model_used': 'Smart Verbal NLP Engine (Built-in)'
    }

def evaluate_candidate_answer(field, role, question_text, candidate_answer, expected_keywords=None, transcript_history=None):
    """
    Evaluates candidate's answer using Groq (free LLaMA 3.3 70B), Gemini (free Flash),
    or resilient fallback engine.
    Returns speech-ready interviewer verbal remark, evaluation scores, and follow-up question.
    """
    field_key = (field or 'it').strip().lower()
    persona_info = PERSONA_PROMPTS.get(field_key, PERSONA_PROMPTS['it'])
    provider, model, api_key = get_active_model_info()

    if not candidate_answer or not candidate_answer.strip():
        return {
            'interviewer_remark': "I didn't quite catch that response. Could you speak clearly into your microphone or provide your thoughts on this question?",
            'overall_score': 0.1,
            'relevance_score': 0.1,
            'clarity_score': 0.1,
            'technical_depth': 0.1,
            'strengths': [],
            'improvements': ['Please provide a verbal response or typed answer.'],
            'suggestions': ['Check your microphone settings or speak aloud.'],
            'matched_keywords': [],
            'missing_keywords': expected_keywords or [],
            'follow_up_question': question_text,
            'branch_type': 'clarifying',
            'model_used': 'System'
        }

    # If provider is local, generate fallback directly
    if provider == 'local':
        return generate_fallback_evaluation(field_key, role, question_text, candidate_answer, expected_keywords)

    # Prompt Engineering for Verbal Oral Interviewer
    system_instruction = f"""You are {persona_info['name']}, {persona_info['title']}.
You are conducting a high-stakes, realistic oral mock interview for a candidate applying for the role of '{role}' in '{field_key.upper()}'.
Persona voice & style: {persona_info['voice_tone']}
Evaluation Rubric: {persona_info['eval_rubric']}

CRITICAL INSTRUCTIONS FOR ORAL/VERBAL SPEECH:
1. `interviewer_remark` MUST BE NATURAL CONVERSATIONAL SPOKEN ENGLISH. It will be read aloud to the candidate via Text-To-Speech (TTS). Do NOT use markdown symbols, bullet points, asterisks, or robotic phrases in `interviewer_remark`. Speak directly to the candidate as a human interviewer (2-3 spoken sentences: acknowledge what they said, give direct verbal feedback, and transition).
2. `overall_score` must be a realistic float between 0.10 and 1.00 based on accuracy, depth, and clarity.
3. `relevance_score` and `clarity_score` must be floats between 0.10 and 1.00.
4. `follow_up_question`: a crisp, natural spoken follow-up probe or next challenge based on the candidate's answer.
5. `branch_type`: 'challenging' if overall_score >= 0.65 else 'clarifying'.
6. `strengths`: list of 1-3 specific strong points from candidate's answer.
7. `improvements`: list of 1-3 actionable improvement points.
8. `suggestions`: list of 1-2 interview tips.

RETURN ONLY A VALID JSON OBJECT WITH THESE EXACT KEYS:
{{
  "interviewer_remark": "Spoken verbal words directly to candidate...",
  "overall_score": 0.85,
  "relevance_score": 0.90,
  "clarity_score": 0.80,
  "technical_depth": 0.85,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "suggestions": ["...", "..."],
  "follow_up_question": "Next spoken question or probe...",
  "branch_type": "challenging"
}}"""

    user_prompt = f"""Question asked: "{question_text}"
Candidate's spoken answer: "{candidate_answer}"
Key concepts expected: {json.dumps(expected_keywords or [])}

Evaluate candidate's answer rigorously as {persona_info['name']} and output the JSON."""

    try:
        if provider == 'groq':
            messages = [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ]
            result = call_groq_llm(messages, api_key, model=model)
            result['model_used'] = f"Groq ({model})"
        elif provider == 'gemini':
            full_prompt = f"{system_instruction}\n\nCandidate Input:\n{user_prompt}"
            result = call_gemini_llm(full_prompt, api_key, model=model)
            result['model_used'] = f"Google Gemini ({model})"
        else:
            return generate_fallback_evaluation(field_key, role, question_text, candidate_answer, expected_keywords)

        # Sanitize output values
        result['overall_score'] = round(float(result.get('overall_score', 0.75)), 2)
        result['relevance_score'] = round(float(result.get('relevance_score', 0.75)), 2)
        result['clarity_score'] = round(float(result.get('clarity_score', 0.75)), 2)
        result['technical_depth'] = round(float(result.get('technical_depth', result['overall_score'])), 2)
        result['branch_type'] = result.get('branch_type', 'challenging' if result['overall_score'] >= 0.65 else 'clarifying')
        
        # Calculate matched / missing keywords locally
        exp_kws = [k.lower().strip() for k in (expected_keywords or []) if k]
        ans_lower = candidate_answer.lower()
        result['matched_keywords'] = [k for k in exp_kws if k in ans_lower]
        result['missing_keywords'] = [k for k in exp_kws if k not in ans_lower]

        return result

    except Exception as e:
        logger.warning(f"LLM API call failed ({provider} / {model}): {e}. Falling back to smart NLP engine.")
        fallback = generate_fallback_evaluation(field_key, role, question_text, candidate_answer, expected_keywords)
        fallback['model_used'] = f"Local Fallback ({str(e)[:40]}...)"
        return fallback

def generate_spoken_question_intro(field, persona_name, question_text, q_num=1, total_q=5):
    """
    Generates an opening verbal phrase for the AI agent to audibly ask the question.
    """
    field_key = (field or 'it').strip().lower()
    persona_info = PERSONA_PROMPTS.get(field_key, PERSONA_PROMPTS['it'])
    name = persona_name or persona_info['name']

    intros = [
        f"Question {q_num}: {question_text}",
        f"Moving on to question {q_num}. {question_text}",
        f"Here is your next challenge: {question_text}",
        f"Let's explore this next area: {question_text}"
    ]
    idx = (q_num - 1) % len(intros)
    return intros[idx]
