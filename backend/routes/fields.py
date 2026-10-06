from flask import Blueprint, jsonify

fields_bp = Blueprint('fields', __name__)

CAREER_FIELDS = {
    'it': {
        'id': 'it',
        'code': 'TRACK-IT-01',
        'title': 'Information Technology',
        'short_title': 'Technology',
        'description': 'Software engineering, systems architecture, algorithmic efficiency, and distributed infrastructure.',
        'rubric_summary': 'Keyword Match (45%) · Concept Completeness (35%) · Communication Clarity (20%)',
        'focus_dimensions': [
            'Technical Keyword Precision',
            'Algorithmic Complexity & Trade-offs',
            'Systems Architecture',
            'Code Hygiene & Testing'
        ],
        'rubric_weights': {
            'keywords': 0.45,
            'concepts': 0.35,
            'clarity': 0.20
        },
        'roles': [
            {'id': 'frontend_developer', 'title': 'Frontend Developer', 'level': 'Mid-Senior', 'skills': ['React', 'TypeScript', 'CSS/Tailwind', 'Performance', 'Testing']},
            {'id': 'backend_developer', 'title': 'Backend Developer', 'level': 'Mid-Senior', 'skills': ['Python', 'SQL', 'APIs', 'Docker', 'System Design']},
            {'id': 'fullstack_engineer', 'title': 'Full Stack Engineer', 'level': 'Mid-Senior', 'skills': ['React', 'Node.js/Python', 'Databases', 'Cloud', 'CI/CD']},
            {'id': 'data_scientist', 'title': 'Data Scientist', 'level': 'Mid-Senior', 'skills': ['Machine Learning', 'Python', 'Pandas', 'Statistics', 'Model Evaluation']},
            {'id': 'devops_engineer', 'title': 'DevOps Engineer', 'level': 'Mid-Senior', 'skills': ['Kubernetes', 'Terraform', 'CI/CD Pipelines', 'Monitoring', 'AWS/GCP']}
        ]
    },
    'management': {
        'id': 'management',
        'code': 'TRACK-MGT-02',
        'title': 'Management & Leadership',
        'short_title': 'Management',
        'description': 'Strategic alignment, product roadmap execution, stakeholder diplomacy, and cross-functional leadership.',
        'rubric_summary': 'SAR Structure (40%) · Communication Clarity (35%) · Domain Relevance (25%)',
        'focus_dimensions': [
            'Situation-Action-Result (SAR) Framework',
            'Strategic Prioritization & Roadmapping',
            'Stakeholder Negotiation & Diplomacy',
            'Quantitative Impact & OKR Delivery'
        ],
        'rubric_weights': {
            'sar_structure': 0.40,
            'clarity': 0.35,
            'domain_relevance': 0.25
        },
        'roles': [
            {'id': 'product_manager', 'title': 'Product Manager', 'level': 'Senior', 'skills': ['Roadmapping', 'User Research', 'A/B Testing', 'Agile/Scrum', 'Data Analytics']},
            {'id': 'project_manager', 'title': 'Project Manager', 'level': 'Mid-Senior', 'skills': ['Risk Management', 'Resource Allocation', 'Budgeting', 'Milestones', 'Scrum']},
            {'id': 'operations_lead', 'title': 'Operations Lead', 'level': 'Mid-Senior', 'skills': ['Process Optimization', 'Vendor Negotiation', 'Supply Chain', 'SLA Management']},
            {'id': 'engineering_manager', 'title': 'Engineering Manager', 'level': 'Staff/Director', 'skills': ['People Management', 'Technical Vision', 'Hiring', 'Sprint Planning']}
        ]
    },
    'law': {
        'id': 'law',
        'code': 'TRACK-LAW-03',
        'title': 'Legal & Regulatory',
        'short_title': 'Legal & Compliance',
        'description': 'Statutory interpretation, regulatory compliance audits, contract governance, and legal risk mitigation.',
        'rubric_summary': 'IRAC Structure (45%) · Legal Terminology (35%) · Precision & Brevity (20%)',
        'focus_dimensions': [
            'Issue-Rule-Application-Conclusion (IRAC)',
            'Statutory & Precedent Citations',
            'Factual Risk Assessment',
            'Synthesized Actionable Conclusions'
        ],
        'rubric_weights': {
            'irac_structure': 0.45,
            'legal_terms': 0.35,
            'precision': 0.20
        },
        'roles': [
            {'id': 'corporate_counsel', 'title': 'Corporate Counsel', 'level': 'Senior Counsel', 'skills': ['Contract Negotiation', 'M&A Due Diligence', 'Corporate Governance', 'IP Protection']},
            {'id': 'compliance_officer', 'title': 'Compliance Officer', 'level': 'Mid-Senior', 'skills': ['GDPR/Privacy', 'AML/KYC', 'Regulatory Audits', 'Policy Drafting', 'Risk Controls']},
            {'id': 'legal_analyst', 'title': 'Legal Analyst', 'level': 'Associate', 'skills': ['Case Research', 'Contract Review', 'Statutory Analysis', 'Brief Drafting']}
        ]
    }
}

@fields_bp.route('', methods=['GET'])
def get_fields():
    return jsonify({
        'fields': list(CAREER_FIELDS.values())
    }), 200

@fields_bp.route('/<field_id>', methods=['GET'])
def get_field_by_id(field_id):
    field_id = field_id.lower()
    if field_id not in CAREER_FIELDS:
        return jsonify({'error': f'Field track {field_id} is not supported.'}), 404
    return jsonify(CAREER_FIELDS[field_id]), 200

