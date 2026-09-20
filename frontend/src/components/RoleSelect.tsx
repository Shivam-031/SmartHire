import React, { useState } from 'react';

interface RoleSelectProps {

  selectedField?: string;
  selectedRole?: string;
  resumeId?: number | null;
  onConfirmRole: (role: string) => void;
  onInterviewStart?: (sessionId: number, questions: any[], role: string) => void;
  onBackToField?: () => void;
}

interface RoleItem {
  id: string;
  name: string;
  track: string;
  description: string;
  keySkills: string[];
}

const FIELD_ROLES: Record<string, RoleItem[]> = {
  it: [
    {
      id: 'Frontend Developer',
      name: 'Frontend Developer',
      track: 'TRACK 01',
      description: 'Modern framework architecture, component lifecycles, state management, web performance, and browser APIs.',
      keySkills: ['TypeScript', 'React', 'State Mgmt', 'Web Vitals', 'CSS/Tailwind'],
    },
    {
      id: 'Backend Developer',
      name: 'Backend Developer',
      track: 'TRACK 02',
      description: 'Distributed systems, REST/gRPC APIs, database architecture, caching, concurrency, and server-side runtime performance.',
      keySkills: ['Python / Node.js', 'SQL & ORM', 'REST API', 'Docker', 'System Design'],
    },
    {
      id: 'Full Stack Engineer',
      name: 'Full Stack Engineer',
      track: 'TRACK 03',
      description: 'End-to-end product engineering spanning client experiences, backend services, schema design, and integration pipelines.',
      keySkills: ['React', 'Node.js/Python', 'SQL / NoSQL', 'API Design', 'DevOps basics'],
    },
    {
      id: 'Data Scientist',
      name: 'Data Scientist',
      track: 'TRACK 04',
      description: 'Machine learning model pipelines, statistical inference, data hygiene, feature engineering, and model evaluation.',
      keySkills: ['Python & Pandas', 'Machine Learning', 'Statistics', 'Model Evaluation', 'SQL'],
    },
    {
      id: 'DevOps Engineer',
      name: 'DevOps Engineer',
      track: 'TRACK 05',
      description: 'Cloud infrastructure as code, container orchestration, CI/CD automated gates, monitoring, and site reliability.',
      keySkills: ['Kubernetes', 'Terraform', 'CI/CD Pipelines', 'AWS / GCP', 'Docker'],
    },
  ],
  management: [
    {
      id: 'Product Manager',
      name: 'Product Manager',
      track: 'TRACK 01',
      description: 'Strategic vision, customer discovery, cross-functional roadmapping, PRD specifications, and metrics-driven prioritization.',
      keySkills: ['Roadmapping', 'User Research', 'A/B Testing', 'RICE Scoring', 'Agile / Scrum'],
    },
    {
      id: 'Project Manager',
      name: 'Project Manager',
      track: 'TRACK 02',
      description: 'Critical path delivery, risk mitigation matrices, budget controls, vendor dependencies, and stakeholder reporting.',
      keySkills: ['Critical Path Method', 'Risk Matrices', 'Budgeting', 'Milestones', 'Scrum'],
    },
    {
      id: 'Operations Lead',
      name: 'Operations Lead',
      track: 'TRACK 03',
      description: 'Process optimization, supply chain workflow tuning, vendor SLA compliance, and cross-department throughput scaling.',
      keySkills: ['Process Optimization', 'SLA Management', 'Vendor Negotiation', 'Capacity Planning'],
    },
    {
      id: 'Engineering Manager',
      name: 'Engineering Manager',
      track: 'TRACK 04',
      description: 'People leadership, talent hiring, sprint cadence, architectural alignment, and engineering career development.',
      keySkills: ['Team Leadership', 'Hiring', 'Sprint Planning', 'Performance Reviews', 'Tech Vision'],
    },
  ],
  law: [
    {
      id: 'Corporate Counsel',
      name: 'Corporate Counsel',
      track: 'TRACK 01',
      description: 'Commercial contract drafting, M&A due diligence, corporate governance, intellectual property protection, and liability negotiation.',
      keySkills: ['Contract Drafting', 'M&A Due Diligence', 'Corporate Governance', 'IP Licensing', 'Indemnity'],
    },
    {
      id: 'Compliance Officer',
      name: 'Compliance Officer',
      track: 'TRACK 02',
      description: 'Regulatory audit frameworks, GDPR/privacy standards, anti-money laundering controls, policy enforcement, and breach reporting.',
      keySkills: ['GDPR / Privacy', 'Regulatory Audits', 'AML / KYC', 'Policy Governance', 'Risk Controls'],
    },
    {
      id: 'Legal Analyst',
      name: 'Legal Analyst',
      track: 'TRACK 03',
      description: 'Statutory research, case law precedent synthesis, contract clause analysis, brief preparation, and discovery management.',
      keySkills: ['Case Precedent', 'Statutory Analysis', 'Contract Review', 'Brief Drafting', 'Discovery'],
    },
  ],
};

export const RoleSelect: React.FC<RoleSelectProps> = ({
  selectedField = 'it',
  selectedRole,
  onConfirmRole,
  onBackToField,
}) => {
  const fieldKey = selectedField.toLowerCase();
  const currentRoles = FIELD_ROLES[fieldKey] || FIELD_ROLES.it;

  // Initialize selected role
  const initialRole = selectedRole && currentRoles.some(r => r.name === selectedRole)
    ? selectedRole
    : currentRoles[0].name;

  const [role, setRole] = useState<string>(initialRole);

  const fieldTitleMap: Record<string, string> = {
    it: 'Information Technology',
    management: 'Management & Leadership',
    law: 'Legal & Regulatory'
  };

  const handleProceed = () => {
    onConfirmRole(role);
  };

  return (
    <div className="max-w-[960px] mx-auto text-left space-y-6">
      {/* Intake Tag / Step Indicator */}
      <div className="flex items-center gap-2 text-xs font-score-mono text-[#5C6B60] tracking-wide">
        <span className="text-[#2F6F4E] font-semibold">STAGE 02 // ROLE SPECIFICATION</span>
        <span>·</span>
        <span className="uppercase">{fieldTitleMap[fieldKey] || 'Technology Track'}</span>
      </div>

      {/* Primary Heading & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-[#1A2E22] tracking-tight mb-1.5">
          Select Your Target Role Specification
        </h1>
        <p className="text-xs text-[#5C6B60] leading-relaxed max-w-2xl">
          Configures technical interview inquiries, behavioral criteria, and the ATS keyword scoring dictionary for your discipline.
        </p>
      </div>

      {/* List of Role Cards */}
      <div className="space-y-3">
        {currentRoles.map((item) => {
          const isSelected = role === item.name;

          return (
            <div
              key={item.id}
              onClick={() => setRole(item.name)}
              className={`p-4 rounded border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                isSelected
                  ? 'bg-white border-[#2F6F4E] shadow-[0_2px_8px_rgba(47,111,78,0.1)] ring-1 ring-[#2F6F4E]'
                  : 'bg-white/80 hover:bg-white border-[#D2D5C9] hover:border-[#5C6B60]'
              }`}
            >
              <div className="pt-0.5">
                <input
                  type="radio"
                  name="target_role"
                  value={item.name}
                  checked={isSelected}
                  onChange={() => setRole(item.name)}
                  className="w-4 h-4 accent-[#2F6F4E] cursor-pointer"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-[#1A2E22]">{item.name}</span>
                    {isSelected && (
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-score-mono text-[#2F6F4E] bg-[#F1F6F3] rounded border border-[#C8E0CE] font-medium">
                        Target Track
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-score-mono text-[11px] px-2 py-0.5 rounded border ${
                      isSelected
                        ? 'bg-[#F1F6F3] border-[#C8E0CE] text-[#2F6F4E] font-medium'
                        : 'bg-[#EEF0EA] border-[#D2D5C9] text-[#5C6B60]'
                    }`}
                  >
                    {item.track}
                  </span>
                </div>

                <p className="text-xs text-[#5C6B60] mt-1.5 leading-relaxed">
                  {item.description}
                </p>

                {/* Core Competency Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {item.keySkills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal text-[#5C6B60] bg-[#EEF0EA] border border-[#D2D5C9]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="hairline-t pt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-[#5C6B60] flex items-center space-x-2 font-score-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-[#2F6F4E]" />
          <span>Active Role: <strong className="text-[#1A2E22]">{role}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          {onBackToField && (
            <button
              type="button"
              onClick={onBackToField}
              className="px-4 py-2.5 rounded border border-[#D2D5C9] bg-white text-xs font-medium text-[#1A2E22] hover:bg-[#EEF0EA] transition-colors cursor-pointer"
            >
              &larr; Field Track
            </button>
          )}

          <button
            type="button"
            onClick={handleProceed}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#2F6F4E] text-white text-xs font-medium hover:bg-[#24583E] transition-colors shadow-sm cursor-pointer"
          >
            <span>Confirm Role &amp; Proceed to Resume Dossier</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
