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
  id: string;
  title: string;
  badge: string;
  icon: string;
  desc: string;
  scenarios: string;
  matchRate: string;
  tags: string;
}

const ROLES_BY_FIELD: Record<string, RoleItem[]> = {
  it: [
    {
      id: 'backend',
      title: 'Backend Developer',
      badge: 'Distributed Systems & APIs',
      icon: 'dns',
      desc: 'Distributed systems, high-throughput APIs, database indexing, caching, and microservices.',
      scenarios: '140+ Scenarios',
      matchRate: '98%',
      tags: 'Python, Node.js, SQL, Docker, System Design',
    },
    {
      id: 'frontend',
      title: 'Frontend Developer',
      badge: 'UI Engineering & Web Apps',
      icon: 'view_quilt',
      desc: 'Component lifecycles, state management, web performance, modern CSS layouts, and browser APIs.',
      scenarios: '135+ Scenarios',
      matchRate: '94%',
      tags: 'React, TypeScript, Next.js, Tailwind, State',
    },
    {
      id: 'fullstack',
      title: 'Full Stack Engineer',
      badge: 'Cloud Native & Architecture',
      icon: 'layers',
      desc: 'End-to-end applications spanning client interfaces, backend services, schema design, and CI/CD.',
      scenarios: '150+ Scenarios',
      matchRate: '96%',
      tags: 'React, Python/Node, SQL/NoSQL, REST, DevOps',
    },
    {
      id: 'devops',
      title: 'DevOps Engineer',
      badge: 'CI/CD Pipelines & Cloud Infra',
      icon: 'cloud_sync',
      desc: 'Container orchestration, infrastructure as code, automated pipelines, and site reliability.',
      scenarios: '110+ Scenarios',
      matchRate: '92%',
      tags: 'Kubernetes, Docker, CI/CD, AWS/GCP, Terraform',
    },
    {
      id: 'data',
      title: 'Data Scientist',
      badge: 'ML Pipelines & Statistical Analysis',
      icon: 'analytics',
      desc: 'Machine learning pipelines, predictive modeling, statistical inference, and feature engineering.',
      scenarios: '95+ Scenarios',
      matchRate: '93%',
      tags: 'Python, ML, Pandas, Statistics, Scikit',
    },
  ],
  management: [
    {
      id: 'pm',
      title: 'Product Manager',
      badge: 'Product Strategy & RICE Roadmaps',
      icon: 'tactic',
      desc: 'Cross-functional roadmapping, PRD authoring, user discovery, RICE prioritization, and sprint governance.',
      scenarios: '120+ Scenarios',
      matchRate: '97%',
      tags: 'PRDs, Discovery, RICE, OKRs, User Journeys',
    },
    {
      id: 'eng_mgr',
      title: 'Engineering Manager',
      badge: 'Team Health & Delivery Cadence',
      icon: 'diversity_3',
      desc: 'People management, engineering velocity, career ladders, architectural review, and technical debt.',
      scenarios: '90+ Scenarios',
      matchRate: '93%',
      tags: '1:1 Coaching, Velocity, Hiring, Tech Debt',
    },
    {
      id: 'ops_dir',
      title: 'Operations Director',
      badge: 'Scale Efficiencies & P&L Governance',
      icon: 'account_tree',
      desc: 'Process optimization, budget oversight, SLA management, vendor governance, and risk mitigation.',
      scenarios: '85+ Scenarios',
      matchRate: '90%',
      tags: 'SLA Tracking, Budgets, Scaling, Risk Audits',
    },
    {
      id: 'growth',
      title: 'Growth Lead',
      badge: 'Funnel Optimization & A/B Testing',
      icon: 'trending_up',
      desc: 'Customer acquisition cost analysis, retention cohort modeling, viral loops, and conversion metrics.',
      scenarios: '80+ Scenarios',
      matchRate: '94%',
      tags: 'CAC/LTV, A/B Testing, Funnels, Amplitude',
    },
  ],
  law: [
    {
      id: 'counsel',
      title: 'Corporate Counsel',
      badge: 'Commercial Contracts & MSA Negotiation',
      icon: 'policy',
      desc: 'Enterprise Master Service Agreements, SaaS terms, limitation of liability, and indemnification clauses.',
      scenarios: '105+ Scenarios',
      matchRate: '98%',
      tags: 'MSAs, NDAs, Super-caps, Liability, IP Rights',
    },
    {
      id: 'compliance',
      title: 'Compliance Officer',
      badge: 'Regulatory Auditing & GDPR/CCPA',
      icon: 'verified_user',
      desc: 'Statutory compliance audits, GDPR/CCPA frameworks, whistleblower protocols, and internal investigations.',
      scenarios: '90+ Scenarios',
      matchRate: '95%',
      tags: 'GDPR, CCPA, SOX, Internal Audits, Policies',
    },
    {
      id: 'legal_ops',
      title: 'Legal Operations Lead',
      badge: 'Contract Lifecycle & Legal Tech',
      icon: 'hub',
      desc: 'CLM automation, legal spend management, department KPIs, vendor selection, and workflow efficiency.',
      scenarios: '75+ Scenarios',
      matchRate: '91%',
      tags: 'CLM, Legal Spend, Workflow, Vendor Mgmt',
    },
  ],
};

export const RoleSelect: React.FC<RoleSelectProps> = ({
  selectedField = 'it',
  selectedRole,
  onConfirmRole,
  onBackToField,
}) => {
  const fieldKey = (selectedField?.toLowerCase() || 'it') as 'it' | 'management' | 'law';
  const roles = ROLES_BY_FIELD[fieldKey] || ROLES_BY_FIELD.it;

  const initialRole =
    selectedRole && roles.some((r) => r.title === selectedRole)
      ? selectedRole
      : roles[0].title;

  const [currentRole, setCurrentRole] = useState<string>(initialRole);

  const getDomainConfig = () => {
    switch (fieldKey) {
      case 'management':
        return {
          title: 'Management & Leadership',
          tag: 'MGMT',
          gradient: 'from-[#8b5cf6] to-[#ec4899]',
          accent: '#8b5cf6',
          textColor: '#c084fc',
          benchmark: 'Tier-1 Executive Track',
        };
      case 'law':
        return {
          title: 'Law & Governance',
          tag: 'LAW',
          gradient: 'from-[#0EA5B7] to-[#10b981]',
          accent: '#0EA5B7',
          textColor: '#22d3ee',
          benchmark: 'Tier-1 Legal & Corporate',
        };
      case 'it':
      default:
        return {
          title: 'Information Technology',
          tag: 'IT',
          gradient: 'from-[#3b82f6] to-[#22d3ee]',
          accent: '#3b82f6',
          textColor: '#60a5fa',
          benchmark: 'Tier-1 Tech Benchmark',
        };
    }
  };

  const domain = getDomainConfig();
  const activeRoleData = roles.find((r) => r.title === currentRole) || roles[0];

  const handleSelectRole = (title: string) => {
    setCurrentRole(title);
  };

  const handleProceed = () => {
    onConfirmRole(currentRole);
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col justify-between py-2 sm:py-6 select-none animate-fadeIn space-y-6">
      {/* Top Ambient Flare */}
      <div className="relative w-full">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[540px] h-[180px] bg-gradient-to-r from-[#3b82f6]/15 to-[#22d3ee]/15 blur-[90px] pointer-events-none rounded-full" />
      </div>

      {/* Header Section (Stitch Screen 02) */}
      <div className="relative z-10 flex flex-col items-start gap-2 shrink-0 text-left">
        {/* Stepper Pill Counter */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22d3ee] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#a1a1aa] font-semibold">
            Step 2 of 6
          </span>
          <span className="text-white/20 font-mono text-xs">·</span>
          <span className="font-mono text-[11px] text-[#22d3ee] font-semibold uppercase tracking-wider">
            {domain.title} Specialization
          </span>
        </div>

        {/* Main Heading with IT/Domain Gradient */}
        <div className="mt-1">
          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Which{' '}
            <span
              className={`bg-gradient-to-r ${domain.gradient} bg-clip-text text-transparent underline decoration-[#22d3ee]/30 decoration-2 underline-offset-4`}
            >
              role
            </span>{' '}
            in {domain.tag} are you targeting?
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1 max-w-2xl leading-relaxed">
            Tailor your resume analysis, technical challenges, and AI mock interviews to your specific discipline.
          </p>
        </div>

        {/* Live Role Target Intelligence Badge Bar */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 font-mono text-[11px] text-[#71717a]">
          <div className="flex items-center gap-1.5 text-[#22d3ee]">
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span>Adaptive Interview Protocol v3.8</span>
          </div>
          <span className="text-white/20 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 text-white/80">
            <span className="material-symbols-outlined text-[16px] text-[#3b82f6]">dataset</span>
            <span>1,420+ vetted question bank</span>
          </div>
          <span className="text-white/20 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 text-[#a1a1aa]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span>Market benchmark: {domain.benchmark}</span>
          </div>
        </div>
      </div>

      {/* Vertical Role Selection List (Stitch 56px precise target cards) */}
      <div
        aria-label="Target Roles"
        className="relative z-10 flex flex-col gap-3 my-auto w-full"
        role="radiogroup"
      >
        {roles.map((role) => {
          const isSelected = currentRole === role.title;

          return (
            <div
              key={role.id}
              aria-checked={isSelected}
              role="radio"
              tabIndex={0}
              onClick={() => handleSelectRole(role.title)}
              className={`group relative min-h-[58px] py-3 w-full rounded-2xl px-5 flex items-center justify-between cursor-pointer transition-all duration-200 select-none border ${
                isSelected
                  ? 'bg-white/[0.06] border-transparent ring-2 ring-[#3b82f6]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_28px_rgba(59,130,246,0.25)]'
                  : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.06] hover:border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
              }`}
            >
              {/* Left vertical gradient anchor bar when active */}
              {isSelected && (
                <span className="selected-indicator absolute left-0 top-2 bottom-2 w-1.5 rounded-r bg-gradient-to-b from-[#3b82f6] via-[#22d3ee] to-[#7c3aed] shadow-[0_0_12px_#22d3ee]" />
              )}

              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#3b82f6] to-[#22d3ee] text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                      : 'bg-white/[0.04] text-[#a1a1aa] group-hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{role.icon}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 truncate text-left">
                  <span
                    className={`text-sm font-semibold tracking-tight transition-colors ${
                      isSelected ? 'text-white' : 'text-white/80 group-hover:text-white'
                    }`}
                  >
                    {role.title}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[#71717a] font-mono text-[11px] truncate">
                    {role.badge}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`font-mono text-xs hidden sm:inline-block ${
                    isSelected ? 'text-[#22d3ee] font-semibold' : 'text-[#71717a]'
                  }`}
                >
                  Match {role.matchRate}
                </span>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#22d3ee]/20 text-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                      : 'text-[#71717a] group-hover:text-white'
                  }`}
                >
                  {isSelected ? (
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Detailed Dossier Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
              Active Role Calibrator:
            </span>
            <span className="text-xs font-bold text-white">{activeRoleData.title}</span>
          </div>
          <p className="text-xs text-[#a1a1aa] max-w-xl">{activeRoleData.desc}</p>
          <div className="font-mono text-[10px] text-[#71717a] pt-1">
            Core Keywords: <span className="text-white/80">{activeRoleData.tags}</span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Footer */}
      <footer className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          onClick={onBackToField}
          className="text-xs font-mono text-[#a1a1aa] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-2 px-3 rounded-xl hover:bg-white/[0.04]"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Field Track</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="btn-gradient-primary w-full sm:w-auto px-7 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(124,58,237,0.35)] hover:shadow-[0_0_35px_rgba(124,58,237,0.55)] transition-all"
        >
          <span>Confirm Role & Proceed to Resume Dossier</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </footer>
    </div>
  );
};

export default RoleSelect;
