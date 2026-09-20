import os
import sys

# Ensure root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.mongo_db import get_questions_col, get_skills_col
from backend.models import db, User, Question as SQLQuestion
from backend.modules.auth import hash_password

QUESTIONS_DATA = [
    # =========================================================================
    # IT TRACK (Information Technology)
    # Focus Dimensions: Technical Precision, Algorithmic Complexity, Systems Architecture, Quality Engineering
    # =========================================================================

    # ------------------ IT: FRONTEND DEVELOPER ------------------
    {
        'field': 'it',
        'role': 'Frontend Developer',
        'skill_tag': 'React Lifecycle & Hooks',
        'question_type': 'mcq',
        'focus_dimension': 'Technical Precision',
        'question_text': 'In React 18, what is the primary purpose of the useDeferredValue hook?',
        'options': [
            {'label': 'A', 'text': 'To defer rendering an expensive piece of UI until higher-priority updates complete.'},
            {'label': 'B', 'text': 'To automatically memoize asynchronous API fetch requests across re-renders.'},
            {'label': 'C', 'text': 'To cancel long-running promises when a component unmounts.'},
            {'label': 'D', 'text': 'To manage global client-side caching without Redux or Context.'}
        ],
        'correct_option': 'A',
        'explanation': 'useDeferredValue lets you defer updating a part of the UI that is computationally expensive so that urgent input events remain responsive.'
    },
    {
        'field': 'it',
        'role': 'Frontend Developer',
        'skill_tag': 'Rendering Performance',
        'question_type': 'long_answer',
        'focus_dimension': 'Algorithmic Complexity & Architecture',
        'question_text': 'Explain how the React Virtual DOM reconciliation process works. What mechanisms does React utilize to minimize DOM mutations when rendering dynamic lists?',
        'expected_keywords': ['virtual dom', 'reconciliation', 'diffing', 'key prop', 'mutation', 'tree comparison'],
        'follow_ups': {
            'if_score_below_60': {
                'question_text': 'To clarify the fundamentals: Why is using array index as a key in dynamic lists considered an anti-pattern in React?',
                'expected_keywords': ['index', 'state', 'reorder', 'mutation', 'identity']
            },
            'if_score_above_60': {
                'question_text': 'Given that reconciliation diffs tree roots in O(n) heuristic time, how does React Fiber prioritize concurrent work between urgent user typing and background list rendering?',
                'expected_keywords': ['fiber', 'concurrent', 'priority', 'lanes', 'scheduler', 'time-slicing']
            }
        }
    },
    {
        'field': 'it',
        'role': 'Frontend Developer',
        'skill_tag': 'Web Performance & CWV',
        'question_type': 'long_answer',
        'focus_dimension': 'Systems Architecture',
        'question_text': 'A web application suffers from poor Interaction to Next Paint (INP) and Cumulative Layout Shift (CLS). What diagnostics would you run, and what architectural remedies would you deploy?',
        'expected_keywords': ['inp', 'cls', 'core web vitals', 'main thread', 'layout shift', 'aspect-ratio', 'long tasks'],
        'follow_ups': {
            'if_score_below_60': {
                'question_text': 'What specific HTML and CSS properties prevent layout shifts when images or dynamic ads load onto the page?',
                'expected_keywords': ['aspect-ratio', 'width', 'height', 'skeleton', 'min-height']
            },
            'if_score_above_60': {
                'question_text': 'How would you break up a monolithic 300ms JavaScript task on the main thread using modern web platform APIs like scheduler.yield() or Web Workers?',
                'expected_keywords': ['scheduler.yield', 'web workers', 'chunks', 'task splitting', 'event loop']
            }
        }
    },

    # ------------------ IT: BACKEND DEVELOPER ------------------
    {
        'field': 'it',
        'role': 'Backend Developer',
        'skill_tag': 'Database Indexing & Query Tuning',
        'question_type': 'mcq',
        'focus_dimension': 'Technical Precision',
        'question_text': 'When creating a composite B-Tree index on (tenant_id, created_at, status), which query CANNOT take advantage of this index?',
        'options': [
            {'label': 'A', 'text': 'WHERE tenant_id = 42 AND created_at > "2026-01-01"'},
            {'label': 'B', 'text': 'WHERE tenant_id = 42 AND status = "ACTIVE"'},
            {'label': 'C', 'text': 'WHERE created_at > "2026-01-01" AND status = "ACTIVE"'},
            {'label': 'D', 'text': 'WHERE tenant_id = 42 ORDER BY created_at DESC'}
        ],
        'correct_option': 'C',
        'explanation': 'B-Tree compound indexes require the leading column (tenant_id) to be part of the filter condition to navigate the index tree.'
    },
    {
        'field': 'it',
        'role': 'Backend Developer',
        'skill_tag': 'HTTP & REST Protocols',
        'question_type': 'mcq',
        'focus_dimension': 'Systems Architecture',
        'question_text': 'Which HTTP status code should a REST API return when a request has been accepted for background processing but the computation is not yet complete?',
        'options': [
            {'label': 'A', 'text': '200 OK with a progress body'},
            {'label': 'B', 'text': '202 Accepted with a status URI'},
            {'label': 'C', 'text': '204 No Content'},
            {'label': 'D', 'text': '304 Not Modified'}
        ],
        'correct_option': 'B',
        'explanation': 'HTTP 202 Accepted signifies that the request has been received and validated for asynchronous processing without blocking the client.'
    },
    {
        'field': 'it',
        'role': 'Backend Developer',
        'skill_tag': 'Distributed Systems & Microservices',
        'question_type': 'long_answer',
        'focus_dimension': 'Systems Architecture',
        'question_text': 'How would you implement the Saga Pattern to maintain data consistency across distributed microservices during a multi-step checkout workflow without distributed two-phase commit (2PC)?',
        'expected_keywords': ['saga', 'compensating transaction', 'orchestration', 'choreography', 'idempotency', 'event sourcing'],
        'follow_ups': {
            'if_score_below_60': {
                'question_text': 'What is the role of a compensating transaction in a Saga if the payment service fails halfway through the order workflow?',
                'expected_keywords': ['compensation', 'rollback', 'undo', 'refund', 'consistency']
            },
            'if_score_above_60': {
                'question_text': 'How do you guarantee exactly-once processing or idempotency when message brokers deliver duplicate payment events in a choreographed Saga?',
                'expected_keywords': ['idempotency key', 'deduplication', 'outbox pattern', 'unique constraint']
            }
        }
    },

    # ------------------ IT: FULL STACK DEVELOPER ------------------
    {
        'field': 'it',
        'role': 'Full Stack Developer',
        'skill_tag': 'Web Application Security',
        'question_type': 'mcq',
        'focus_dimension': 'Security Architecture',
        'question_text': 'When mitigating Cross-Site Scripting (XSS) in single-page applications, which defense mechanism provides the most robust browser-enforced boundary?',
        'options': [
            {'label': 'A', 'text': 'Stripping script tags with a client-side regex'},
            {'label': 'B', 'text': 'A strict Content Security Policy (CSP) with nonce-based script execution'},
            {'label': 'C', 'text': 'Encrypting all JSON payloads using AES-256 in transit'},
            {'label': 'D', 'text': 'Setting HTTP response header X-Frame-Options to DENY'}
        ],
        'correct_option': 'B',
        'explanation': 'A strict Content Security Policy (CSP) restricts executable script origins and inline scripts via cryptographic nonces, stopping injected scripts from running.'
    },
    {
        'field': 'it',
        'role': 'Full Stack Developer',
        'skill_tag': 'Full Stack Architecture',
        'question_type': 'long_answer',
        'focus_dimension': 'Systems Architecture',
        'question_text': 'Walk me through designing an optimistic UI update with conflict resolution for a real-time collaborative document editing tool backed by WebSockets and a relational database.',
        'expected_keywords': ['optimistic ui', 'websocket', 'conflict resolution', 'version vector', 'rollback', 'eventual consistency'],
        'follow_ups': {
            'if_score_below_60': {
                'question_text': 'How does the client gracefully handle state rollback when the backend rejects an optimistic mutation due to a validation error?',
                'expected_keywords': ['rollback', 'snapshot', 'previous state', 'toast', 'reconciliation']
            },
            'if_score_above_60': {
                'question_text': 'Compare Operational Transformation (OT) versus Conflict-Free Replicated Data Types (CRDTs) in terms of server convergence and network overhead.',
                'expected_keywords': ['crdt', 'operational transformation', 'commutative', 'peer-to-peer', 'state-based']
            }
        }
    },

    # ------------------ IT: DATA ANALYST ------------------
    {
        'field': 'it',
        'role': 'Data Analyst',
        'skill_tag': 'SQL Window Functions',
        'question_type': 'mcq',
        'focus_dimension': 'Technical Precision',
        'question_text': 'Which SQL window function computes the rank of each row within a partition WITHOUT leaving gaps in ranking values for ties?',
        'options': [
            {'label': 'A', 'text': 'RANK()'},
            {'label': 'B', 'text': 'DENSE_RANK()'},
            {'label': 'C', 'text': 'ROW_NUMBER()'},
            {'label': 'D', 'text': 'PERCENT_RANK()'}
        ],
        'correct_option': 'B',
        'explanation': 'DENSE_RANK() assigns consecutive integer rank values without skipping ranks after duplicate tied scores.'
    },
    {
        'field': 'it',
        'role': 'Data Analyst',
        'skill_tag': 'Data Cleansing & Modeling',
        'question_type': 'long_answer',
        'focus_dimension': 'Algorithmic Complexity & Architecture',
        'question_text': 'Describe your methodology for identifying and handling outliers and missing values in a high-volume transactional time-series dataset before training predictive models.',
        'expected_keywords': ['outliers', 'imputation', 'z-score', 'iqr', 'time-series', 'median', 'rolling window', 'data quality'],
        'follow_ups': {
            'if_score_below_60': {
                'question_text': 'Why is mean imputation often dangerous when data is skewed or has heavy tail distributions?',
                'expected_keywords': ['skew', 'bias', 'median', 'variance', 'distortion']
            },
            'if_score_above_60': {
                'question_text': 'How do you detect structural changepoints versus transient seasonal spikes in time-series monitoring metrics?',
                'expected_keywords': ['changepoint', 'seasonality', 'moving average', 'decomposition', 'cusum']
            }
        }
    },

    # ------------------ IT: QA / TEST ENGINEER ------------------
    {
        'field': 'it',
        'role': 'QA / Test Engineer',
        'skill_tag': 'Testing Methodologies',
        'question_type': 'mcq',
        'focus_dimension': 'Quality Engineering',
        'question_text': 'According to the standard Test Automation Pyramid, which layer of tests should represent the largest volume in an enterprise test suite?',
        'options': [
            {'label': 'A', 'text': 'End-to-End (E2E) Browser Tests'},
            {'label': 'B', 'text': 'Integration Service Tests'},
            {'label': 'C', 'text': 'Unit Tests'},
            {'label': 'D', 'text': 'Manual Acceptance Tests'}
        ],
        'correct_option': 'C',
        'explanation': 'Unit tests are fast, isolated, and inexpensive to run, forming the broad, reliable foundation of the test pyramid.'
    },
    {
        'field': 'it',
        'role': 'QA / Test Engineer',
        'skill_tag': 'Test Automation & Flakiness',
        'question_type': 'long_answer',
        'focus_dimension': 'Quality Engineering',
        'question_text': 'How do you diagnose, isolate, and systematically eliminate flaky tests in an asynchronous end-to-end continuous integration (CI) pipeline?',
        'expected_keywords': ['flaky', 'race condition', 'explicit wait', 'isolation', 'ci/cd', 'deterministic', 'test harness'],
        'follow_ups': {
            'if_score_below_60': {
                'question_text': 'Why is using hardcoded sleep timers like time.sleep(5) an anti-pattern in automated UI test suites?',
                'expected_keywords': ['sleep', 'slow', 'non-deterministic', 'explicit wait', 'flakiness']
            },
            'if_score_above_60': {
                'question_text': 'How do you isolate database side-effects when parallelizing integration test execution across multiple worker threads or containers?',
                'expected_keywords': ['transaction rollback', 'database template', 'test containers', 'parallelism', 'schemas']
            }
        }
    },


    # =========================================================================
    # MANAGEMENT TRACK (Management & Leadership)
    # Focus Dimensions: Strategic Prioritization, SAR Narrative Structure, Stakeholder Conflict & Trade-offs, Risk Management & Delivery
    # =========================================================================

    # ------------------ MANAGEMENT: PRODUCT MANAGER ------------------
    {
        'field': 'management',
        'role': 'Product Manager',
        'skill_tag': 'Prioritization Frameworks',
        'question_type': 'mcq',
        'focus_dimension': 'Strategic Prioritization',
        'question_text': 'In the RICE prioritization formula (Reach * Impact * Confidence / Effort), how does doubling the engineering Effort estimate alter the score?',
        'options': [
            {'label': 'A', 'text': 'It cuts the overall RICE score in half.'},
            {'label': 'B', 'text': 'It doubles the overall RICE score.'},
            {'label': 'C', 'text': 'It reduces the score logarithmically by 25%.'},
            {'label': 'D', 'text': 'It has no effect unless Confidence is below 80%.'}
        ],
        'correct_option': 'A',
        'explanation': 'Effort is in the denominator of the RICE formula; doubling the denominator reduces the quotient by 50%.'
    },
    {
        'field': 'management',
        'role': 'Product Manager',
        'skill_tag': 'Product-Market Fit & Analytics',
        'question_type': 'mcq',
        'focus_dimension': 'Strategic Prioritization',
        'question_text': 'When evaluating a cohort retention curve for a recurring SaaS product, which visual trajectory indicates healthy product-market fit?',
        'options': [
            {'label': 'A', 'text': 'A curve that steadily approaches zero at a constant slope'},
            {'label': 'B', 'text': 'A curve that flattens asymptotically parallel to the x-axis after initial drop-off'},
            {'label': 'C', 'text': 'A sinusoidal curve with sharp monthly oscillations'},
            {'label': 'D', 'text': 'A vertical step function that drops 80% every billing quarter'}
        ],
        'correct_option': 'B',
        'explanation': 'A retention curve that flattens out indicates that a predictable core group of users continues receiving ongoing value over time.'
    },
    {
        'field': 'management',
        'role': 'Product Manager',
        'skill_tag': 'Stakeholder Conflict & Trade-offs',
        'question_type': 'long_answer',
        'focus_dimension': 'SAR Narrative Structure',
        'question_text': 'Describe a situation where engineering, sales, and design had conflicting priorities for an upcoming release. How did you structure the decision-making process and what was the verifiable business outcome?',
        'expected_keywords': ['situation', 'stakeholders', 'trade-offs', 'data', 'action', 'result', 'alignment', 'metrics'],
        'follow_ups': {
            'if_score_below_60': {
                'question_text': 'To understand your execution: What specific framework or objective data points did you present to de-escalate the executive disagreement?',
                'expected_keywords': ['data', 'user research', 'revenue', 'okr', 'customer feedback']
            },
            'if_score_above_60': {
                'question_text': 'If the sales team threatened an enterprise deal unless their bespoke feature was built immediately, how would you protect the core roadmap integrity while mitigating client churn?',
                'expected_keywords': ['roadmap', 'compromise', 'workaround', 'client retention', 'technical debt']
            }
        }
    },

    # ------------------ MANAGEMENT: PROJECT MANAGER ------------------
    {
        'field': 'management',
        'role': 'Project Manager',
        'skill_tag': 'Critical Path Method',
        'question_type': 'mcq',
        'focus_dimension': 'Risk Management & Delivery',
        'question_text': 'In Critical Path Method (CPM) project scheduling, what is the total float (slack time) for activities located on the critical path?',
        'options': [
            {'label': 'A', 'text': 'Zero'},
            {'label': 'B', 'text': 'Equal to the duration of the shortest non-critical task'},
            {'label': 'C', 'text': 'Negative half the milestone variance'},
            {'label': 'D', 'text': 'One sprint cycle'}
        ],
        'correct_option': 'A',
        'explanation': 'Critical path activities have zero float; any delay in a critical path activity immediately slips the project completion date.'
    },
    {
        'field': 'management',
        'role': 'Project Manager',
        'skill_tag': 'Risk Management & Delivery',
        'question_type': 'long_answer',
        'focus_dimension': 'SAR Narrative Structure',
        'question_text': 'Walk me through a project where critical path milestones were at imminent risk of delay due to third-party vendor dependency failures. What actions did you execute to recover schedule slippage?',
        'expected_keywords': ['situation', 'critical path', 'vendor', 'mitigation', 'action', 'schedule', 'result', 'delivery'],
        'follow_ups': {
            'if_score_below_60': {
                'question_text': 'How did you communicate the variance and risk mitigation plan to executive sponsors?',
                'expected_keywords': ['transparency', 'executive update', 'risk matrix', 'contingency']
            },
            'if_score_above_60': {
                'question_text': 'What preventative SLA safeguards and governance cadence did you institute for future vendor contracts based on this retrospective?',
                'expected_keywords': ['sla', 'retrospective', 'contract', 'milestones', 'penalties']
            }
        }
    },

    # ------------------ MANAGEMENT: OPERATIONS LEAD ------------------
    {
        'field': 'management',
        'role': 'Operations Lead',
        'skill_tag': 'Process Optimization & Little Law',
        'question_type': 'mcq',
        'focus_dimension': 'Risk Management & Delivery',
        'question_text': 'According to Little\'s Law (Work in Progress = Throughput * Cycle Time), if your team\'s average arrival throughput doubles while average cycle time remains unchanged, what happens to Work in Progress?',
        'options': [
            {'label': 'A', 'text': 'Work in Progress doubles.'},
            {'label': 'B', 'text': 'Work in Progress is halved.'},
            {'label': 'C', 'text': 'Work in Progress remains completely unchanged.'},
            {'label': 'D', 'text': 'Work in Progress scales quadratically.'}
        ],
        'correct_option': 'A',
        'explanation': 'Little\'s Law states L = λW; if arrival rate λ doubles and wait time W is constant, total inventory/WIP L must double.'
    },
    {
        'field': 'management',
        'role': 'Operations Lead',
        'skill_tag': 'Operational Efficiency',
        'question_type': 'long_answer',
        'focus_dimension': 'SAR Narrative Structure',
        'question_text': 'Describe a situation where an operational bottleneck resulted in customer delivery delays or mounting SLA breach penalties. What process re-engineering did you lead to resolve the constraint?',
        'expected_keywords': ['situation', 'bottleneck', 'theory of constraints', 'sla', 'process', 'action', 'throughput', 'result'],
        'follow_ups': {
            'if_score_below_60': {
                'question_text': 'How did you measure the baseline constraint before introducing changes?',
                'expected_keywords': ['baseline', 'metrics', 'cycle time', 'lead time', 'audit']
            },
            'if_score_above_60': {
                'question_text': 'How did you establish automated alerting and operational dashboards to prevent regression?',
                'expected_keywords': ['monitoring', 'dashboard', 'alert', 'kpi', 'continuous improvement']
            }
        }
    },

    # ------------------ MANAGEMENT: TEAM LEAD ------------------
    {
        'field': 'management',
        'role': 'Team Lead',
        'skill_tag': 'Incident Culture & Blameless Postmortems',
        'question_type': 'mcq',
        'focus_dimension': 'Stakeholder Conflict & Trade-offs',
        'question_text': 'In a mature engineering leadership culture, what is the core objective of conducting a blameless postmortem after a major production outage?',
        'options': [
            {'label': 'A', 'text': 'To identify systemic, procedural, and tooling vulnerabilities without assigning personal culpability.'},
            {'label': 'B', 'text': 'To determine which individual engineer should have their deployment credentials revoked.'},
            {'label': 'C', 'text': 'To document the exact financial penalty owed to clients under SLAs.'},
            {'label': 'D', 'text': 'To satisfy compliance requirements without making changes to code.'}
        ],
        'correct_option': 'A',
        'explanation': 'Blameless postmortems assume well-intentioned individuals and focus entirely on fixing fragile systems, safeguards, and communication protocols.'
    },
    {
        'field': 'management',
        'role': 'Team Lead',
        'skill_tag': 'Performance Management & Coaching',
        'question_type': 'long_answer',
        'focus_dimension': 'SAR Narrative Structure',
        'question_text': 'Tell me about a time you coached an underperforming or disengaged team member. How did you diagnose the root cause, what action plan did you construct, and what was the outcome?',
        'expected_keywords': ['situation', 'underperformance', '1-on-1', 'feedback', 'action plan', 'coaching', 'result', 'improvement'],
        'follow_ups': {
            'if_score_below_60': {
                'question_text': 'How did you distinguish between a lack of technical capability versus motivation or external blockers?',
                'expected_keywords': ['skill vs will', 'root cause', 'blockers', 'expectations']
            },
            'if_score_above_60': {
                'question_text': 'If the performance plan failed to meet expectations, how would you execute a compassionate transition while protecting team morale?',
                'expected_keywords': ['documentation', 'hr', 'transition', 'clarity', 'morale']
            }
        }
    }
]

SKILLS_SEED = [
    # IT Track Skills
    {'field': 'it', 'name': 'React', 'synonyms': ['react.js', 'reactjs', 'react library'], 'importance_weight': 1.0},
    {'field': 'it', 'name': 'TypeScript', 'synonyms': ['ts', 'typescript'], 'importance_weight': 0.95},
    {'field': 'it', 'name': 'Python', 'synonyms': ['py', 'python3'], 'importance_weight': 1.0},
    {'field': 'it', 'name': 'SQL', 'synonyms': ['postgresql', 'mysql', 'sqlite', 'rdbms'], 'importance_weight': 0.9},
    {'field': 'it', 'name': 'Docker', 'synonyms': ['containers', 'dockerfile', 'compose'], 'importance_weight': 0.85},
    {'field': 'it', 'name': 'REST APIs', 'synonyms': ['rest', 'restful', 'http apis', 'fastapi', 'flask'], 'importance_weight': 0.9},
    {'field': 'it', 'name': 'Tailwind CSS', 'synonyms': ['tailwind', 'tailwindcss'], 'importance_weight': 0.8},
    {'field': 'it', 'name': 'System Design', 'synonyms': ['architecture', 'microservices', 'distributed systems'], 'importance_weight': 0.95},
    {'field': 'it', 'name': 'Data Analysis', 'synonyms': ['pandas', 'numpy', 'data modeling', 'statistics'], 'importance_weight': 0.9},
    {'field': 'it', 'name': 'Automated Testing', 'synonyms': ['pytest', 'jest', 'cypress', 'unit testing', 'qa'], 'importance_weight': 0.85},

    # Management Track Skills
    {'field': 'management', 'name': 'Agile / Scrum', 'synonyms': ['scrum', 'kanban', 'sprint planning', 'agile'], 'importance_weight': 0.95},
    {'field': 'management', 'name': 'Product Roadmapping', 'synonyms': ['roadmap', 'product strategy', 'vision', 'prioritization'], 'importance_weight': 1.0},
    {'field': 'management', 'name': 'Stakeholder Management', 'synonyms': ['stakeholder negotiation', 'executive communication', 'cross-functional alignment'], 'importance_weight': 0.95},
    {'field': 'management', 'name': 'User Research', 'synonyms': ['customer interviews', 'usability testing', 'personas', 'user feedback'], 'importance_weight': 0.85},
    {'field': 'management', 'name': 'Data Analytics & OKRs', 'synonyms': ['a/b testing', 'amplitude', 'mixpanel', 'sql analytics', 'okrs', 'kpis'], 'importance_weight': 0.9},
    {'field': 'management', 'name': 'Risk Management & Delivery', 'synonyms': ['critical path', 'milestones', 'vendor management', 'mitigation'], 'importance_weight': 0.9},
    {'field': 'management', 'name': 'People Leadership & Coaching', 'synonyms': ['1-on-1s', 'mentorship', 'performance coaching', 'hiring'], 'importance_weight': 0.95},
    {'field': 'management', 'name': 'Operations Optimization', 'synonyms': ['process re-engineering', 'bottleneck elimination', 'sla management', 'throughput'], 'importance_weight': 0.85}
]

def seed_mongo_data(force: bool = False):
    """
    Seeds the MongoDB 'questions' and 'skills' collections for IT and Management only.
    Safe to call repeatedly; skips if already populated unless force=True.
    """
    q_col = get_questions_col()
    s_col = get_skills_col()

    existing_q_count = q_col.count_documents({})
    if existing_q_count == 0 or force:
        if force and existing_q_count > 0:
            q_col.delete_many({})
        res_q = q_col.insert_many(QUESTIONS_DATA)
        print(f"[SEED] Successfully seeded {len(res_q.inserted_ids)} questions for IT and Management into Mongo.")
    else:
        print(f"[SEED] Mongo 'questions' collection already populated with {existing_q_count} items.")

    existing_s_count = s_col.count_documents({})
    if existing_s_count == 0 or force:
        if force and existing_s_count > 0:
            s_col.delete_many({})
        res_s = s_col.insert_many(SKILLS_SEED)
        print(f"[SEED] Successfully seeded {len(res_s.inserted_ids)} skills for IT and Management into Mongo.")
    else:
        print(f"[SEED] Mongo 'skills' collection already populated with {existing_s_count} items.")

def seed_database(force: bool = True):
    """
    Full seed function initializing SQL default records and MongoDB IT/Management collections.
    """
    from backend.app import app
    with app.app_context():
        # 1. SQL Seed: Default candidate user
        db.create_all()
        admin = User.query.filter_by(email='shivam@smarthire.internal').first()
        if not admin:
            admin = User(
                name='Shivam Sharma',
                email='shivam@smarthire.internal',
                password_hash=hash_password('password123'),
                target_field='it',
                target_role='Frontend Developer'
            )
            db.session.add(admin)
            db.session.commit()
            print(f"[SEED] Created SQL default user: {admin.email} (ID: {admin.id})")
        else:
            print(f"[SEED] SQL default user exists: {admin.email}")

        # 2. Seed MongoDB questions and skills for IT & Management
        seed_mongo_data(force=force)

        # 3. Mirror long-answer questions into SQL Question table for backwards-compatibility
        for q in QUESTIONS_DATA:
            if q.get('question_type') == 'long_answer':
                existing = SQLQuestion.query.filter_by(question_text=q['question_text']).first()
                if not existing:
                    sql_q = SQLQuestion(
                        role=q['role'],
                        skill_tag=q.get('skill_tag'),
                        question_text=q['question_text'],
                        expected_keywords=q.get('expected_keywords', [])
                    )
                    db.session.add(sql_q)
        db.session.commit()
        print("[SEED] Mirrored long-answer questions into SQL Question table.")

if __name__ == '__main__':
    seed_database(force=True)
