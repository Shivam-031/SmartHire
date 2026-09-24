import React, { useState } from 'react';

interface RoleSelectProps {
  selectedField?: string;
  selectedRole?: string;
  resumeId?: number | null;
  onConfirmRole: (role: string) => void;
  onBackToField?: () => void;
  onInterviewStart?: (sessionId: number, questions: any[], role: string) => void;
}

interface RoleItem {
  title: string;
  icon: string;
  desc: string;
  scenarios: string;
  tags: string;
}

const ROLES_BY_FIELD: Record<string, RoleItem[]> = {
  it: [
    {
      title: 'Backend Developer',
      icon: 'terminal',
      desc: 'Distributed systems, high-throughput APIs, database indexing, caching, and microservices.',
      scenarios: '140+ Scenarios',
      tags: 'Python, Node.js, SQL, Docker, System Design',
    },
    {
      title: 'Frontend Developer',
      icon: 'code',
      desc: 'Component lifecycles, state management, web performance, modern CSS layouts, and browser APIs.',
      scenarios: '135+ Scenarios',
      tags: 'React, TypeScript, Next.js, Tailwind, State',
    },
    {
      title: 'Full Stack Engineer',
      icon: 'layers',
      desc: 'End-to-end applications spanning client interfaces, backend services, schema design, and CI/CD.',
      scenarios: '150+ Scenarios',
      tags: 'React, Python/Node, SQL/NoSQL, REST, DevOps',
    },
    {
      title: 'DevOps Engineer',
      icon: 'cloud_sync',
      desc: 'Container orchestration, infrastructure as code, automated pipelines, and site reliability.',
      scenarios: '110+ Scenarios',
      tags: 'Kubernetes, Docker, CI/CD, AWS/GCP, Terraform',
    },
    {
      title: 'Data Scientist',
      icon: 'analytics',
      desc: 'Machine learning pipelines, predictive modeling, statistical inference, and feature engineering.',
      scenarios: '95+ Scenarios',
      tags: 'Python, ML, Pandas, Statistics, Scikit',
    },
  ],
  management: [
    {
      title: 'Product Manager',
      icon: 'inventory_2',
      desc: 'Product strategy, customer discovery, PRDs, roadmaps, cross-functional sprints, and North Star metrics.',
      scenarios: '120+ Scenarios',
      tags: 'Roadmaps, PRDs, A/B Tests, RICE Scoring, OKRs',
    },
    {
      title: 'Engineering Manager',
      icon: 'groups',
      desc: 'Technical leadership, organizational scaling, people development, sprint velocity, and talent hiring.',
      scenarios: '95+ Scenarios',
      tags: 'Leadership, 1:1s, Hiring, Tech Strategy, Agility',
    },
    {
      title: 'Project Manager',
      icon: 'calendar_month',
      desc: 'Critical path delivery, risk mitigation matrices, budget controls, vendor dependencies, and Jira governance.',
      scenarios: '85+ Scenarios',
      tags: 'Critical Path, Risk Matrix, Budget, Milestones, Scrum',
    },
    {
      title: 'Operations Lead',
      icon: 'account_tree',
      desc: 'Process optimization, supply chain workflow tuning, vendor SLA compliance, and cross-team throughput.',
      scenarios: '80+ Scenarios',
      tags: 'Lean, SLA Governance, Vendor Negotiation, Capacity',
    },
  ],
  law: [
    {
      title: 'Corporate Counsel',
      icon: 'gavel',
      desc: 'Commercial contract drafting, M&A due diligence, corporate governance, and liability negotiation.',
      scenarios: '110+ Scenarios',
      tags: 'M&A Diligence, Contracts, Governance, IP Licensing',
    },
    {
      title: 'Compliance Officer',
      icon: 'verified_user',
      desc: 'Regulatory audit frameworks, GDPR/privacy standards, anti-money laundering controls, and ethics governance.',
      scenarios: '85+ Scenarios',
      tags: 'GDPR, AML/KYC, Audits, Policy Governance, Risk',
    },
    {
      title: 'Legal Analyst',
      icon: 'balance',
      desc: 'Statutory research, case law precedent synthesis, clause review, brief drafting, and discovery analysis.',
      scenarios: '75+ Scenarios',
      tags: 'Precedent Research, Statutory Analysis, Briefs, Discovery',
    },
  ],
};

export const RoleSelect: React.FC<RoleSelectProps> = ({
  selectedField = 'it',
  selectedRole,
  onConfirmRole,
  onBackToField,
}) => {
  const fieldKey = (selectedField || 'it').toLowerCase();
  const currentRoles = ROLES_BY_FIELD[fieldKey] || ROLES_BY_FIELD.it;

  const initialRole =
    selectedRole && currentRoles.some((r) => r.title === selectedRole)
      ? selectedRole
      : currentRoles[0].title;

  const [currentRole, setCurrentRole] = useState<string>(initialRole);

  const getDomainTheme = () => {
    switch (fieldKey) {
      case 'management':
        return {
          name: 'Management & Leadership',
          color: '#8B4FE0',
          bgLight: 'bg-[#8B4FE0]/5',
          border: 'border-[#8B4FE0]',
        };
      case 'law':
        return {
          name: 'Law & Governance',
          color: '#0EA5B7',
          bgLight: 'bg-[#0EA5B7]/5',
          border: 'border-[#0EA5B7]',
        };
      case 'it':
      default:
        return {
          name: 'Information Technology',
          color: '#2E6FF2',
          bgLight: 'bg-[#2E6FF2]/5',
          border: 'border-[#2E6FF2]',
        };
    }
  };

  const domain = getDomainTheme();

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start text-left animate-fadeIn">
      {/* Left Stepper Sub-Panel (Synchronized with Track Workflow - Stitch Screen 12) */}
      <aside className="w-full lg:w-72 shrink-0 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-[#F8F9FA] w-fit">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: domain.color }}></span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#17181C]">
            Track: {domain.name}
          </span>
        </div>

        <div>
          <span className="font-mono text-[11px] text-[#6B7078] font-bold uppercase tracking-wider block mb-4">
            Track Onboarding
          </span>

          {/* Vertical Stepper Sequence */}
          <div className="relative space-y-6">
            {/* Step 1: Field Selection (Completed) */}
            <div
              onClick={onBackToField}
              className="flex items-start gap-3 relative cursor-pointer group"
            >
              <div
                className="w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs z-10"
                style={{ backgroundColor: domain.color }}
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <div className="pt-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#17181C] group-hover:underline">
                  <span>Field Track</span>
                  <span className="material-symbols-outlined text-[14px]" style={{ color: domain.color }}>
                    lock_open
                  </span>
                </div>
                <span className="font-mono text-[11px] block mt-0.5" style={{ color: domain.color }}>
                  {domain.name}
                </span>
              </div>
            </div>

            {/* Step 2: Target Role (Active) */}
            <div className="flex items-start gap-3 relative z-10">
              <div
                className="w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 shadow-sm font-mono text-xs font-bold ring-4"
                style={{ backgroundColor: domain.color, boxShadow: `0 0 0 4px ${domain.color}25` }}
              >
                2
              </div>
              <div className="pt-0.5">
                <span className="text-xs font-bold block" style={{ color: domain.color }}>
                  Target Role
                </span>
                <span className="font-mono text-[11px] text-[#6B7078]">Specialization selection</span>
              </div>
            </div>

            {/* Step 3: Upcoming Resume Dossier */}
            <div className="flex items-start gap-3 relative z-10 opacity-60">
              <div className="w-8 h-8 rounded-full bg-[#E5E7EB] text-[#6B7078] flex items-center justify-center shrink-0 font-mono text-xs font-medium">
                3
              </div>
              <div className="pt-0.5">
                <span className="text-xs font-medium text-[#6B7078] block">Resume Telemetry</span>
                <span className="font-mono text-[10px] text-[#9CA3AF]">ATS Baseline intake</span>
              </div>
            </div>

            {/* Step 4: Upcoming Calibration & Exam */}
            <div className="flex items-start gap-3 relative z-10 opacity-60">
              <div className="w-8 h-8 rounded-full bg-[#E5E7EB] text-[#6B7078] flex items-center justify-center shrink-0 font-mono text-xs font-medium">
                4
              </div>
              <div className="pt-0.5">
                <span className="text-xs font-medium text-[#6B7078] block">Live Examination</span>
                <span className="font-mono text-[10px] text-[#9CA3AF]">Oral & Code drills</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Rubric Intelligence Card */}
        <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1.5">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold" style={{ color: domain.color }}>
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span className="uppercase">Dynamic Rubrics</span>
          </div>
          <p className="text-xs text-[#6B7078] leading-relaxed">
            Selecting a specific specialization tunes syntax parsers, benchmark rubrics, and simulator questions.
          </p>
        </div>

        {/* Quick Metrics Strip */}
        <div className="pt-2 border-t border-[#E5E7EB] space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-[#6B7078]">
            <span className="text-[11px] uppercase tracking-wider">Drill Library:</span>
            <span className="font-bold text-[#17181C]">590+ Challenges</span>
          </div>
          <div className="flex items-center justify-between text-[#6B7078]">
            <span className="text-[11px] uppercase tracking-wider">ATS Benchmark:</span>
            <span className="font-bold" style={{ color: domain.color }}>2025.4 Spec</span>
          </div>
        </div>
      </aside>

      {/* Main Focus Area: Role Selection Cards */}
      <section className="flex-1 w-full space-y-6">
        {/* Eyebrow & Page Headings */}
        <div className="space-y-2 pb-2 border-b border-[#E5E7EB]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold tracking-widest text-[#6B7078] uppercase">
              ONBOARDING // STEP 2 OF 4
            </span>
            <span
              className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${domain.color}15`, color: domain.color }}
            >
              Vertical: {domain.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17181C]">
            Which role in {fieldKey === 'it' ? 'IT' : fieldKey === 'management' ? 'Management' : 'Law'} are you targeting?
          </h1>
          <p className="text-sm text-[#6B7078]">
            We customize your coding drills, system design challenges, and ATS benchmark rubrics to your exact specialization.
          </p>
        </div>

        {/* Vertical List of Selectable Role Cards */}
        <div className="space-y-3">
          {currentRoles.map((r) => {
            const isSelected = currentRole === r.title;
            return (
              <div
                key={r.title}
                onClick={() => setCurrentRole(r.title)}
                className={`relative flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white border-2 cursor-pointer transition-all duration-150 overflow-hidden hover:shadow-md ${
                  isSelected
                    ? `shadow-sm ${domain.border} ${domain.bgLight}`
                    : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                }`}
              >
                {/* Active Indicator Bar (Left Edge) */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors"
                  style={{ backgroundColor: isSelected ? domain.color : 'transparent' }}
                ></div>

                <div className="flex items-start md:items-center gap-4 pl-2">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{
                      backgroundColor: isSelected ? domain.color : '#F3F4F6',
                      color: isSelected ? '#FFFFFF' : '#17181C',
                    }}
                  >
                    <span className="material-symbols-outlined text-[24px]">{r.icon}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-bold text-[#17181C]">{r.title}</span>
                      {isSelected && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-white font-mono text-[10px] font-semibold"
                          style={{ backgroundColor: domain.color }}
                        >
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          Active Selection
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7078] leading-snug">{r.desc}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E5E7EB] shrink-0 md:pl-4">
                  <div className="flex flex-col md:items-end font-mono text-xs">
                    <span className="font-bold" style={{ color: isSelected ? domain.color : '#17181C' }}>
                      {r.scenarios}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">{r.tags}</span>
                  </div>

                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: isSelected ? domain.color : '#FFFFFF',
                      borderColor: isSelected ? domain.color : '#D1D5DB',
                      color: isSelected ? '#FFFFFF' : 'transparent',
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          {onBackToField && (
            <button
              type="button"
              onClick={onBackToField}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-[#6B7078] hover:text-[#17181C] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Return to Field Track</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onConfirmRole(currentRole)}
            className="w-full sm:w-auto px-6 py-3 bg-[#17181C] hover:bg-[#2A2B30] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ml-auto"
          >
            <span>Confirm Specialization & Proceed to Resume Dossier</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default RoleSelect;
