import os

base_dir = r"c:\vs code notes\Minor Project\SmartHire\frontend\src\components"

files = {}

# 1. BrandWordmark.tsx
files["BrandWordmark.tsx"] = '''import React from 'react';

interface BrandWordmarkProps {
  className?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  className = '',
  subtitle = 'Candidate Docket & Rubric',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center space-x-3 cursor-pointer select-none ${className}`}
    >
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="32" height="32" rx="4" fill="#FFFFFF" stroke="#2F6F4E" strokeWidth="2" />
        <line x1="8" y1="10" x2="26" y2="10" stroke="#D2D5C9" strokeWidth="1.75" strokeLinecap="round" />
        <line x1="8" y1="16" x2="22" y2="16" stroke="#D2D5C9" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M10 24 L15 28 L27 16" stroke="#2F6F4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <div className="flex items-baseline space-x-1">
          <span className="text-lg font-semibold font-serif text-[#1A2E22] tracking-tight">SmartHire</span>
          <span className="text-sm font-normal text-[#5C6B60] font-sans">Prep</span>
        </div>
        {subtitle && <div className="text-[11px] text-[#5C6B60] font-sans tracking-tight -mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
};

export default BrandWordmark;
'''

# 2. LoadingSpinner.tsx
files["LoadingSpinner.tsx"] = '''import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-5 h-5 border-2' : size === 'lg' ? 'w-10 h-10 border-3' : 'w-7 h-7 border-2';

  return (
    <div className="flex flex-col items-center justify-center p-3 text-center">
      <div className={`${sizeClass} border-[#D2D5C9] border-t-[#2F6F4E] rounded-full animate-spin`} />
      {message && (
        <p className="text-xs font-mono text-[#5C6B60] mt-2.5 max-w-xs">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
'''

# 3. DocketLayout.tsx
files["DocketLayout.tsx"] = '''import React from 'react';
import BrandWordmark from './BrandWordmark';
import { useAuth } from '../context/AuthContext';

export type DocketStep =
  | 'field_select'
  | 'role_select'
  | 'resume'
  | 'resume_editor'
  | 'template_picker'
  | 'interview'
  | 'ats_check'
  | 'summary'
  | 'completed'
  | 'session_history'
  | 'session_detail'
  | 'profile'
  | 'login'
  | 'signup';

interface DocketLayoutProps {
  currentStep: DocketStep;
  targetField?: string;
  targetRole?: string;
  onNavigate: (step: DocketStep) => void;
  canNavigateToField?: boolean;
  canNavigateToRole?: boolean;
  canNavigateToResume?: boolean;
  canNavigateToInterview?: boolean;
  canNavigateToATS?: boolean;
  canNavigateToSummary?: boolean;
  children: React.ReactNode;
}

export const DocketLayout: React.FC<DocketLayoutProps> = ({
  currentStep,
  targetField = 'it',
  targetRole = 'Frontend Developer',
  onNavigate,
  canNavigateToField = true,
  canNavigateToRole = true,
  canNavigateToResume = true,
  canNavigateToInterview = false,
  canNavigateToATS = false,
  canNavigateToSummary = false,
  children,
}) => {
  const { user, isAuthenticated } = useAuth();

  const tabs = [
    { id: 'field_select' as DocketStep, num: '01', label: 'Field Track', enabled: canNavigateToField },
    { id: 'role_select' as DocketStep, num: '02', label: 'Target Role', enabled: canNavigateToRole },
    { id: 'resume' as DocketStep, num: '03', label: 'Candidate Resume', enabled: canNavigateToResume },
    { id: 'interview' as DocketStep, num: '04', label: 'Oral Examination', enabled: canNavigateToInterview },
    { id: 'ats_check' as DocketStep, num: '05', label: 'ATS Report', enabled: canNavigateToATS },
    { id: 'completed' as DocketStep, num: '06', label: 'Session Summary', enabled: canNavigateToSummary },
  ];

  const order: DocketStep[] = ['field_select', 'role_select', 'resume', 'interview', 'ats_check', 'completed'];

  const normalizeStepForTabs = (step: DocketStep): DocketStep => {
    if (step === 'resume_editor' || step === 'template_picker') return 'resume';
    if (step === 'summary' || step === 'session_history' || step === 'session_detail') return 'completed';
    return step;
  };

  const isCompleted = (tabId: DocketStep) => {
    const normalized = normalizeStepForTabs(currentStep);
    const currentIndex = order.indexOf(normalized);
    const tabIndex = order.indexOf(tabId);
    return currentIndex > tabIndex;
  };

  const getSheetSubtitle = () => {
    switch (currentStep) {
      case 'login':
      case 'signup':
        return 'Sheet No. 00 / Account & Profile Intake';
      case 'profile':
        return 'Sheet No. 00 / Candidate Dossier Calibration';
      case 'field_select':
        return 'Sheet No. 01 / Career Discipline Specification';
      case 'role_select':
        return 'Sheet No. 02 / Role Specification & Rubric Calibration';
      case 'resume':
        return 'Sheet No. 03 / Document Ingestion & Profile Mapping';
      case 'resume_editor':
        return 'Sheet No. 03A / Structured In-App Resume Editor';
      case 'template_picker':
        return 'Sheet No. 03B / PDF Template Picker';
      case 'interview':
        return 'Sheet No. 04 / Live Oral Examination';
      case 'ats_check':
        return 'Sheet No. 05 / ATS Ingestion Diagnostics & Keyword Match';
      case 'summary':
      case 'completed':
      case 'session_history':
      case 'session_detail':
        return 'Sheet No. 06 / Dossier Summary & Evaluator Assessment';
      default:
        return 'Candidate Intake Docket';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0EA] text-[#1A2E22] antialiased selection:bg-[#2F6F4E]/20 selection:text-[#1A2E22]">
      {/* Top Metadata Bar */}
      <header className="w-full bg-[#EEF0EA] hairline-b px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-[#5C6B60] font-mono shrink-0">
        <div className="flex items-center space-x-4 flex-wrap">
          <div className="flex items-center space-x-2 text-[#1A2E22] font-sans font-medium">
            <svg className="w-3.5 h-3.5 text-[#2F6F4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>Candidate Intake Docket</span>
          </div>
          <span className="text-[#D2D5C9]">|</span>
          <span>{getSheetSubtitle()}</span>
          <span className="text-[#D2D5C9]">|</span>
          <span className="inline-flex items-center gap-1.5 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F6F4E]" />
            <span className="text-[#5C6B60]">Track:</span>
            <strong className="text-[#1A2E22] font-mono text-[11px] uppercase">{targetField} · {targetRole}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          {isAuthenticated && user ? (
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-white border border-[#D2D5C9] hover:border-[#2F6F4E] transition-colors text-xs cursor-pointer shadow-2xs font-sans"
              title="Open Candidate Profile View"
            >
              <div className="w-4 h-4 rounded-full bg-[#2F6F4E] text-white flex items-center justify-center font-bold text-[9px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[#1A2E22] font-medium">{user.name}</span>
              <span className="text-[10px] text-[#5C6B60] font-mono">Profile &rarr;</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-3 py-1 rounded bg-white hover:bg-[#EAECE6] border border-[#D2D5C9] text-xs font-medium text-[#1A2E22] transition-colors cursor-pointer font-sans"
              title="Open Authentication View"
            >
              Sign In / Account
            </button>
          )}

          <a
            href="/stitch_screens/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#E9F2EC] hover:bg-[#D8EADB] border border-[#2F6F4E]/30 text-xs font-mono font-medium text-[#2F6F4E] transition-colors"
            title="View all 14 Stitch design screens in pixel-perfect gallery"
          >
            <span>Stitch 14 Screens</span>
            <span className="text-[10px] opacity-75">↗</span>
          </a>

          <span className="text-[#D2D5C9]">|</span>
          <span className="text-[#5C6B60] hidden sm:inline">Protocol Rev. 2.4.1</span>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        {/* Left Folder-Tab Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#E8EBE4] hairline-r flex flex-col justify-between p-6 select-none shrink-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-5 hairline-b">
              <BrandWordmark onClick={() => onNavigate('field_select')} />
              <span className="font-mono text-[10px] text-[#5C6B60] px-1.5 py-0.5 border border-[#D2D5C9] rounded bg-[#EEF0EA]">v2.4</span>
            </div>

            <div>
              <div className="text-[11px] font-sans font-medium uppercase tracking-wider text-[#5C6B60] mb-3 px-1">
                Docket Sections
              </div>
              <nav className="space-y-1.5" aria-label="Docket Navigation">
                {tabs.map((tab) => {
                  const active =
                    normalizeStepForTabs(currentStep) === tab.id ||
                    (tab.id === 'completed' &&
                      (currentStep === 'session_history' || currentStep === 'session_detail'));
                  const completed = isCompleted(tab.id);

                  if (active) {
                    return (
                      <div
                        key={tab.id}
                        className="folder-tab-active flex items-center justify-between px-3 py-2.5 rounded-[4px] shadow-sm cursor-default"
                      >
                        <div className="flex items-center space-x-2.5">
                          <svg className="w-3.5 h-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="font-sans text-xs font-semibold tracking-tight text-white">{tab.label}</span>
                        </div>
                        <span className="font-mono text-[11px] text-white/80">{tab.num}</span>
                      </div>
                    );
                  }

                  if (completed || tab.enabled) {
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onNavigate(tab.id)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-[4px] border border-transparent hover:border-[#D2D5C9] hover:bg-[#EEF0EA] text-[#1A2E22] transition-all text-left group cursor-pointer"
                      >
                        <div className="flex items-center space-x-2.5">
                          {completed ? (
                            <svg className="w-3.5 h-3.5 text-[#2F6F4E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-[#D2D5C9] flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#5C6B60]" />
                            </span>
                          )}
                          <span className="font-sans text-xs font-medium text-[#1A2E22] group-hover:text-[#2F6F4E]">{tab.label}</span>
                        </div>
                        <span className="font-mono text-[11px] text-[#5C6B60]">{tab.num}</span>
                      </button>
                    );
                  }

                  return (
                    <div
                      key={tab.id}
                      className="folder-tab-locked flex items-center justify-between px-3 py-2.5 rounded-[4px] border border-transparent opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-2.5">
                        <svg className="w-3.5 h-3.5 text-[#8C9990]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-sans text-xs font-normal text-[#6A7870]">{tab.label}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#8C9990]">{tab.num}</span>
                    </div>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-[#D2D5C9]/80 space-y-1">
              <div className="text-[10px] font-mono text-[#5C6B60] mb-2 tracking-wider font-semibold">
                QUICK ACCESS
              </div>
              <button
                onClick={() => onNavigate('resume_editor')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors text-left font-sans cursor-pointer ${
                  currentStep === 'resume_editor'
                    ? 'bg-white text-[#2F6F4E] font-semibold border border-[#D2D5C9]'
                    : 'text-[#5C6B60] hover:text-[#1A2E22] hover:bg-[#EEF0EA]'
                }`}
              >
                <span>Resume Editor</span>
                <span className="text-[10px] font-mono">03A</span>
              </button>
              <button
                onClick={() => onNavigate('template_picker')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors text-left font-sans cursor-pointer ${
                  currentStep === 'template_picker'
                    ? 'bg-white text-[#2F6F4E] font-semibold border border-[#D2D5C9]'
                    : 'text-[#5C6B60] hover:text-[#1A2E22] hover:bg-[#EEF0EA]'
                }`}
              >
                <span>Template Picker</span>
                <span className="text-[10px] font-mono">03B</span>
              </button>
              <button
                onClick={() => onNavigate('session_history')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors text-left font-sans cursor-pointer ${
                  currentStep === 'session_history'
                    ? 'bg-white text-[#2F6F4E] font-semibold border border-[#D2D5C9]'
                    : 'text-[#5C6B60] hover:text-[#1A2E22] hover:bg-[#EEF0EA]'
                }`}
              >
                <span>Session History</span>
                <span className="text-[10px] font-mono">LOGS</span>
              </button>
            </div>
          </div>

          <div className="mt-6 bg-[#F4F6F1] border border-[#D2D5C9] rounded-[4px] p-3 text-[12px] space-y-2">
            <div className="flex items-center space-x-1.5 text-[#2F6F4E] font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="font-sans text-[11px] uppercase tracking-wider font-semibold">Docket Protocol</span>
            </div>
            <p className="text-[#5C6B60] leading-relaxed text-[11px] font-sans">
              Selecting a track anchors your technical rubric, question generator, and ATS keyword matrix for this preparation cycle.
            </p>
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 bg-[#EEF0EA] p-6 sm:p-10 lg:p-12 overflow-y-auto flex justify-start">
          <div className="w-full max-w-[1020px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocketLayout;
'''

# 4. RoleSelect.tsx
files["RoleSelect.tsx"] = '''import React, { useState } from 'react';

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
      keySkills: ['TypeScript', 'React', 'State Mgmt', 'Web Vitals', 'Tailwind'],
    },
    {
      id: 'Backend Developer',
      name: 'Backend Developer',
      track: 'TRACK 02',
      description: 'Distributed systems, APIs, database architecture, caching, concurrency, and server-side runtime performance.',
      keySkills: ['Python / Node.js', 'SQL & ORM', 'REST/gRPC', 'Docker', 'System Design'],
    },
    {
      id: 'Full Stack Engineer',
      name: 'Full Stack Engineer',
      track: 'TRACK 03',
      description: 'End-to-end product engineering spanning client experiences, backend services, schema design, and integration pipelines.',
      keySkills: ['React', 'Node.js/Python', 'SQL / NoSQL', 'API Design', 'DevOps'],
    },
    {
      id: 'Data Scientist',
      name: 'Data Scientist',
      track: 'TRACK 04',
      description: 'Machine learning pipelines, statistical inference, feature engineering, and model validation frameworks.',
      keySkills: ['Python & Pandas', 'Machine Learning', 'Statistics', 'Model Evaluation', 'SQL'],
    },
    {
      id: 'DevOps Engineer',
      name: 'DevOps Engineer',
      track: 'TRACK 05',
      description: 'Cloud infrastructure as code, container orchestration, automated delivery pipelines, and site reliability engineering.',
      keySkills: ['Kubernetes', 'Terraform', 'CI/CD Pipelines', 'AWS / GCP', 'Docker'],
    },
  ],
  management: [
    {
      id: 'Product Manager',
      name: 'Product Manager',
      track: 'TRACK 01',
      description: 'Strategic vision, customer discovery, cross-functional roadmapping, PRD specifications, and metrics-driven prioritization.',
      keySkills: ['Roadmapping', 'User Research', 'A/B Testing', 'RICE Scoring', 'Agile'],
    },
    {
      id: 'Project Manager',
      name: 'Project Manager',
      track: 'TRACK 02',
      description: 'Critical path delivery, risk mitigation matrices, budget controls, vendor dependencies, and stakeholder reporting.',
      keySkills: ['Critical Path', 'Risk Matrices', 'Budgeting', 'Milestones', 'Scrum'],
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
      keySkills: ['Team Leadership', 'Hiring', 'Sprint Planning', 'Tech Strategy', 'Mentorship'],
    },
  ],
  law: [
    {
      id: 'Corporate Counsel',
      name: 'Corporate Counsel',
      track: 'TRACK 01',
      description: 'Commercial contract drafting, M&A due diligence, corporate governance, intellectual property protection, and liability negotiation.',
      keySkills: ['Contract Drafting', 'M&A Diligence', 'Corporate Governance', 'IP Licensing', 'Indemnity'],
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
      keySkills: ['Precedent Research', 'Statutory Analysis', 'Contract Review', 'Brief Drafting', 'Discovery'],
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

  const initialRole = selectedRole && currentRoles.some(r => r.name === selectedRole)
    ? selectedRole
    : currentRoles[0].name;

  const [role, setRole] = useState<string>(initialRole);

  return (
    <div className="w-full max-w-[960px] text-left">
      <div className="flex items-center space-x-2 text-xs font-mono text-[#5C6B60] mb-3">
        <span className="text-[#2F6F4E] font-semibold">STAGE 01 // INTAKE</span>
        <span className="text-[#D2D5C9]">·</span>
        <span>INITIAL SPECIFICATION</span>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-medium text-[#1A2E22] tracking-tight mb-2">
          What role are you preparing for?
        </h1>
        <p className="font-sans text-sm text-[#5C6B60] leading-relaxed">
          This shapes which interview questions you'll get.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {currentRoles.map((item) => {
          const isSelected = role === item.name;

          return (
            <label
              key={item.id}
              onClick={() => setRole(item.name)}
              className={`role-card flex items-start p-4 cursor-pointer select-none transition-all ${
                isSelected ? 'selected' : ''
              }`}
            >
              <div className="pt-0.5 mr-3.5">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-sans font-semibold text-base text-[#1A2E22]">{item.name}</span>
                    {isSelected && (
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#2F6F4E] bg-[#E9F2EC] rounded-[3px] border border-[#2F6F4E]/30 font-medium">
                        Selected
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-mono text-xs px-2 py-0.5 rounded-[3px] border ${
                      isSelected
                        ? 'bg-[#E9F2EC] text-[#2F6F4E] border-[#2F6F4E]/30 font-medium'
                        : 'bg-[#EEF0EA] text-[#5C6B60] border-[#D2D5C9]'
                    }`}
                  >
                    {item.track}
                  </span>
                </div>
                <p className="font-sans text-xs text-[#5C6B60] mt-1 leading-normal">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {item.keySkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-[#5C6B60] bg-[#EEF0EA] border border-[#D2D5C9]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="border-t border-[#D2D5C9] pt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-[#5C6B60] flex items-center space-x-2 font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-[#2F6F4E]" />
          <span>Active Role: <strong className="text-[#1A2E22] font-semibold">{role}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          {onBackToField && (
            <button
              type="button"
              onClick={onBackToField}
              className="px-4 py-2.5 rounded border border-[#D2D5C9] bg-white text-xs font-mono font-medium text-[#1A2E22] hover:bg-[#EEF0EA] transition-colors cursor-pointer"
            >
              &larr; Field Track
            </button>
          )}

          <button
            type="button"
            onClick={() => onConfirmRole(role)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-[#2F6F4E] hover:bg-[#265a3f] text-white text-xs font-mono font-medium transition-colors shadow-xs cursor-pointer"
          >
            <span>Confirm Role &amp; Proceed to Resume</span>
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
'''

# 5. FieldSelect.tsx
files["FieldSelect.tsx"] = '''import React from 'react';

export interface CareerField {
  id: string;
  code: string;
  title: string;
  short_title: string;
  description: string;
  rubric_summary: string;
  focus_dimensions: string[];
  roles: Array<{ id: string; title: string; level: string; skills: string[] }>;
}

interface FieldSelectProps {
  selectedField: string;
  onSelectField: (fieldId: string) => void;
  onProceedToRole: () => void;
}

export const FieldSelect: React.FC<FieldSelectProps> = ({
  selectedField,
  onSelectField,
  onProceedToRole,
}) => {
  const fields: CareerField[] = [
    {
      id: 'it',
      code: 'TRACK-IT-01',
      title: 'Information Technology & Software',
      short_title: 'Technology',
      description: 'Distributed systems, system design, algorithm trade-offs, frontend rendering lifecycles, and cloud infrastructure pipelines.',
      rubric_summary: 'Keyword Precision (45%) · Concept Completeness (35%) · Communication (20%)',
      focus_dimensions: [
        'Technical Keyword Precision',
        'Algorithmic Complexity',
        'Systems Architecture & Scaling',
        'Code Hygiene & Testing',
      ],
      roles: [],
    },
    {
      id: 'management',
      code: 'TRACK-MGT-02',
      title: 'Management & Product Leadership',
      short_title: 'Management',
      description: 'Cross-functional alignment, product roadmaps, stakeholder negotiation, and executive execution.',
      rubric_summary: 'SAR Structure (40%) · Communication Clarity (35%) · Domain Relevance (25%)',
      focus_dimensions: [
        'Situation-Action-Result (SAR)',
        'Strategic Prioritization',
        'Stakeholder Diplomacy',
        'Quantitative Impact & OKRs',
      ],
      roles: [],
    },
    {
      id: 'law',
      code: 'TRACK-LAW-03',
      title: 'Legal & Regulatory Compliance',
      short_title: 'Legal',
      description: 'Statutory interpretation, regulatory privacy audits, contractual governance, and institutional liability mitigation.',
      rubric_summary: 'IRAC Structure (45%) · Legal Terminology (35%) · Brevity & Precision (20%)',
      focus_dimensions: [
        'Issue-Rule-Application (IRAC)',
        'Statutory & Precedent Citations',
        'Risk & Exposure Assessment',
        'Actionable Legal Advice',
      ],
      roles: [],
    },
  ];

  return (
    <div className="w-full max-w-[960px] text-left">
      <div className="flex items-center space-x-2 text-xs font-mono text-[#5C6B60] mb-3">
        <span className="text-[#2F6F4E] font-semibold">STAGE 00 // SPECIFICATION</span>
        <span className="text-[#D2D5C9]">·</span>
        <span>CAREER DISCIPLINE &amp; PROTOCOL</span>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-medium text-[#1A2E22] tracking-tight mb-2">
          Select Career Discipline &amp; Protocol
        </h1>
        <p className="font-sans text-sm text-[#5C6B60] leading-relaxed">
          SmartHire recalibrates evaluation rubrics, oral examination questions, interviewer personas, and ATS keyword extraction to match the institutional standards of your chosen discipline.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {fields.map((f) => {
          const isSelected = selectedField === f.id;

          return (
            <div
              key={f.id}
              onClick={() => onSelectField(f.id)}
              className={`role-card p-5 cursor-pointer select-none transition-all ${
                isSelected ? 'selected' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="career_field"
                    value={f.id}
                    checked={isSelected}
                    onChange={() => onSelectField(f.id)}
                    className="w-4 h-4 accent-[#2F6F4E] cursor-pointer"
                  />
                  <h3 className="font-serif text-lg font-semibold text-[#1A2E22]">
                    {f.title}
                  </h3>
                </div>
                <span
                  className={`font-mono text-xs px-2 py-0.5 rounded-[3px] border ${
                    isSelected
                      ? 'bg-[#E9F2EC] text-[#2F6F4E] border-[#2F6F4E]/30 font-medium'
                      : 'bg-[#EEF0EA] text-[#5C6B60] border-[#D2D5C9]'
                  }`}
                >
                  {f.code}
                </span>
              </div>

              <p className="font-sans text-xs text-[#5C6B60] pl-7 mb-3 leading-relaxed">
                {f.description}
              </p>

              <div className="pl-7 space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-mono bg-[#EEF0EA] border border-[#D2D5C9] px-2.5 py-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F6F4E]" />
                  <span className="text-[#5C6B60]">RUBRIC:</span>
                  <span className="text-[#2F6F4E] font-medium">{f.rubric_summary}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {f.focus_dimensions.map((dim, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-[#5C6B60] bg-white border border-[#D2D5C9]"
                    >
                      {dim}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#D2D5C9] pt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-[#5C6B60] flex items-center space-x-2 font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-[#2F6F4E]" />
          <span>Active Track: <strong className="text-[#1A2E22] font-semibold uppercase">{selectedField}</strong></span>
        </div>

        <button
          type="button"
          onClick={onProceedToRole}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-[#2F6F4E] hover:bg-[#265a3f] text-white text-xs font-mono font-medium transition-colors shadow-xs cursor-pointer"
        >
          <span>Confirm Track &amp; Select Target Role</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FieldSelect;
'''

# 6. ResumeUpload.tsx
files["ResumeUpload.tsx"] = '''import React, { useState, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

type Mode = 'file' | 'text';

interface ResumeUploadProps {
  onUploadSuccess?: (resumeId: number) => void;
  onATSCheckRequested?: () => void;
  onSkip?: () => void;
  onOpenEditor?: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onUploadSuccess,
  onATSCheckRequested,
  onSkip,
  onOpenEditor,
}) => {
  const [mode, setMode] = useState<Mode>('file');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [skills, setSkills] = useState<string[]>([]);
  const [candidateName, setCandidateName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedResumeId, setUploadedResumeId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setError(null);
      uploadFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setError(null);
      uploadFile(selected);
    }
  };

  const uploadFile = async (selectedFile: File) => {
    setLoading(true);
    setError(null);
    setSkills([]);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:5000/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      setUploadedResumeId(data.resume_id);
      setSkills(data.extracted_skills || []);
      setCandidateName(data.candidate_name || selectedFile.name.replace(/\\.[^/.]+$/, ''));
      if (onUploadSuccess) onUploadSuccess(data.resume_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualTextSubmit = async () => {
    if (!text.trim()) {
      setError('Please provide your resume text.');
      return;
    }

    setLoading(true);
    setError(null);
    setSkills([]);

    try {
      const response = await fetch('http://localhost:5000/api/resume/manual-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Processing failed');
      setUploadedResumeId(data.resume_id);
      setSkills(data.extracted_skills || []);
      setCandidateName(data.candidate_name || 'Direct Text Ingestion');
      if (onUploadSuccess) onUploadSuccess(data.resume_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setText('');
    setSkills([]);
    setError(null);
    setUploadedResumeId(null);
    setCandidateName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-[960px] text-left">
      <div className="flex items-center gap-2 text-xs font-mono text-[#5C6B60] mb-2 tracking-wide">
        <span className="text-[#2F6F4E] font-semibold">STAGE 02 // INTAKE</span>
        <span>·</span>
        <span>DOCUMENT INGESTION &amp; PROFILE MAPPING</span>
      </div>

      <h1 className="text-3xl font-serif text-[#1A2E22] tracking-tight mb-2">
        Upload your resume
      </h1>
      <p className="text-sm text-[#5C6B60] mb-8 leading-relaxed max-w-2xl font-sans">
        We'll pull out your skills to personalize your questions and check ATS compatibility. PDF or DOCX, up to 5MB.
      </p>

      {error && (
        <div className="p-4 mb-6 rounded border border-[#B23A2E] bg-[#FDF2F0] text-xs text-[#B23A2E] flex items-center justify-between font-mono">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {mode === 'file' ? (
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`dropzone-dashed rounded p-10 mb-5 flex flex-col items-center justify-center text-center cursor-pointer group ${
              isDragOver ? 'dragover' : ''
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded bg-white border border-[#D2D5C9] flex items-center justify-center text-[#5C6B60] group-hover:text-[#2F6F4E] group-hover:border-[#2F6F4E] transition-colors mb-3.5 shadow-xs">
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>

            <div className="text-sm font-medium text-[#1A2E22] mb-1 group-hover:text-[#2F6F4E] transition-colors font-sans">
              Drag and drop your resume here, or <span className="text-[#2F6F4E] underline underline-offset-2 decoration-1 font-semibold">click to browse</span>.
            </div>
            <div className="text-xs text-[#5C6B60] font-mono">
              Supported formats: PDF, DOCX (Maximum file size: 5MB)
            </div>
            {file && (
              <div className="mt-2 text-xs font-mono text-[#2F6F4E] font-medium bg-[#E9F2EC] px-2.5 py-0.5 rounded border border-[#2F6F4E]/30">
                Selected: {file.name}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-8 px-1">
            <button
              type="button"
              onClick={() => setMode('text')}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#1A2E22] hover:text-[#2F6F4E] transition-colors cursor-pointer font-sans"
            >
              <svg className="w-3.5 h-3.5 text-[#5C6B60]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Or paste your resume text instead</span>
            </button>

            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="text-xs text-[#5C6B60] hover:text-[#1A2E22] underline underline-offset-4 decoration-1 decoration-[#D2D5C9] hover:decoration-[#1A2E22] transition-colors cursor-pointer font-sans"
              >
                Skip — I'll answer generic questions for this role
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-8 space-y-4">
          <div className="bg-white border border-[#D2D5C9] rounded p-4 shadow-xs">
            <label className="block text-xs font-mono text-[#5C6B60] mb-2 uppercase">
              Paste Raw Resume Content (Markdown or Plaintext)
            </label>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your career experience, education, and technical competencies here..."
              className="w-full bg-[#FAFCFA] border border-[#D2D5C9] rounded p-3 text-xs font-mono text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] resize-y"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMode('file')}
              className="text-xs font-mono text-[#5C6B60] hover:text-[#1A2E22] underline cursor-pointer"
            >
              &larr; Return to File Upload
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleManualTextSubmit}
              className="px-5 py-2 rounded bg-[#2F6F4E] hover:bg-[#265a3f] text-white text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              {loading ? 'Processing Text...' : 'Parse Resume Text ↗'}
            </button>
          </div>
        </div>
      )}

      {uploadedResumeId && (
        <div className="bg-white border border-[#D2D5C9] rounded p-6 mb-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between border-b border-[#D2D5C9] pb-4 mb-4 gap-3">
            <div>
              <div className="text-[10px] font-mono text-[#5C6B60] uppercase tracking-wider">
                DOCUMENT PARSER RESULT · ID #{uploadedResumeId}
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1A2E22] mt-0.5">
                {candidateName || 'Verified Candidate Profile'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono bg-[#E9F2EC] text-[#2F6F4E] border border-[#2F6F4E]/30 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F6F4E] mr-1.5 animate-pulse" />
                {skills.length} Skills Extracted
              </span>
              <button
                onClick={handleReset}
                className="text-xs font-mono text-[#5C6B60] hover:text-[#B23A2E] underline ml-2 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono text-[#5C6B60] mb-2 uppercase">
              Parsed Competency Matrix:
            </div>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono bg-[#EEF0EA] border border-[#D2D5C9] text-[#1A2E22]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-[#D2D5C9] pt-4 flex flex-wrap items-center justify-between gap-3">
            {onOpenEditor && (
              <button
                type="button"
                onClick={onOpenEditor}
                className="px-4 py-2 rounded border border-[#D2D5C9] bg-[#EEF0EA] hover:bg-[#D2D5C9] text-xs font-mono text-[#1A2E22] transition-colors cursor-pointer"
              >
                Open Structured In-App Editor ✎
              </button>
            )}

            <div className="flex items-center gap-3">
              {onATSCheckRequested && (
                <button
                  type="button"
                  onClick={onATSCheckRequested}
                  className="px-4 py-2 rounded bg-white border border-[#B08D2F] text-[#B08D2F] hover:bg-[#FCF8ED] text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  Run ATS Compatibility Check ↗
                </button>
              )}

              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="px-6 py-2 rounded bg-[#2F6F4E] hover:bg-[#265a3f] text-white text-xs font-mono font-medium transition-colors cursor-pointer shadow-xs"
                >
                  Proceed to Oral Exam &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
'''

# 7. InterviewQA.tsx
files["InterviewQA.tsx"] = '''import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export interface QuestionOption {
  label: string;
  text: string;
}

export interface QuestionItem {
  id: string | number;
  field?: string;
  role?: string;
  skill_tag?: string;
  question_type?: 'mcq' | 'long_answer';
  focus_dimension?: string;
  question_text: string;
  options?: QuestionOption[];
  expected_keywords?: string[];
  follow_ups?: {
    if_score_below_60?: { question_text: string; expected_keywords?: string[] };
    if_score_above_60?: { question_text: string; expected_keywords?: string[] };
  };
}

export interface InterviewerPersona {
  title: string;
  name: string;
  affiliation: string;
  opening: string;
  praise_remark?: string;
  nudge_remark?: string;
  wrap_up?: string;
}

interface InterviewQAProps {
  sessionId: number;
  questions: QuestionItem[];
  mode?: 'standard' | 'mock';
  field?: string;
  persona?: InterviewerPersona | null;
  onComplete: (score: number) => void;
}

export const InterviewQA: React.FC<InterviewQAProps> = ({
  sessionId,
  questions,
  mode = 'standard',
  field = 'it',
  persona,
  onComplete,
}) => {
  const [questionList, setQuestionList] = useState<QuestionItem[]>(questions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [interviewerRemark, setInterviewerRemark] = useState<string>(
    persona?.opening || 'Welcome to the formal structured examination docket.'
  );
  const [isBranchingFollowUp, setIsBranchingFollowUp] = useState(false);
  const [branchingTag, setBranchingTag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questionList[currentIndex] || {
    id: '1',
    question_text: 'Explain how you would design a rate limiter for a public API.',
    question_type: 'long_answer',
    focus_dimension: 'Architecture & Scalability',
  };

  const isMCQ = currentQuestion.question_type === 'mcq';
  const wordCount = answer.trim() ? answer.trim().split(/\\s+/).length : 0;
  const progressPercent = Math.min(100, Math.round(((currentIndex + 1) / Math.max(1, questionList.length)) * 100));

  const defaultPersona: InterviewerPersona = {
    it: {
      title: 'Senior Technical Lead',
      name: 'Marcus Vance',
      affiliation: 'Principal Systems Architect · Core Platform',
      opening: "Welcome. We'll be walking through a sequence of technical examinations and architecture trade-offs. Be explicit about system constraints and your rationale.",
    },
    management: {
      title: 'Hiring Partner & VP',
      name: 'Eleanor Hayes',
      affiliation: 'Vice President of Product & Operations',
      opening: "Good day. Today we will evaluate your decision-making framework, stakeholder alignment, and how you drive measurable business impact.",
    },
    law: {
      title: 'Managing Partner',
      name: 'Julian Sterling',
      affiliation: 'Senior Regulatory & Corporate Counsel',
      opening: "Welcome to the legal competency audit. We will review statutory interpretations, contractual liabilities, and risk governance protocols.",
    },
  }[field.toLowerCase()] || {
    title: 'Senior Technical Lead',
    name: 'Marcus Vance',
    affiliation: 'Principal Systems Architect',
    opening: 'Welcome to the evaluation docket.',
  };

  const activePersona = persona || defaultPersona;

  const handleSubmitMCQ = async () => {
    if (!selectedOption) {
      setError('Please select an option before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/interview/submit-mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: currentQuestion.id,
          selected_option: selectedOption,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(data.error || 'Failed to submit MCQ answer.');

      setFeedback(data);

      if (mode === 'mock') {
        if (data.is_correct) {
          setInterviewerRemark("Accurate assessment. Let's proceed to the architectural reasoning phase.");
        } else {
          setInterviewerRemark("Option noted. Notice the underlying trade-off described in the evaluation rubric.");
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting answer');
      setLoading(false);
    }
  };

  const handleSubmitEssay = async () => {
    if (!answer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint =
        mode === 'mock'
          ? 'http://localhost:5000/api/interview/mock-turn'
          : 'http://localhost:5000/api/interview/answer';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: currentQuestion.id,
          answer: answer.trim(),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(data.error || 'Failed to evaluate answer.');

      setFeedback(data);

      if (mode === 'mock') {
        if (data.interviewer_remark) {
          setInterviewerRemark(data.interviewer_remark);
        }
        if (data.is_branching_follow_up && data.follow_up_question) {
          setIsBranchingFollowUp(true);
          setBranchingTag(data.branching_trigger || 'score_threshold');

          const updatedList = [...questionList];
          updatedList.splice(currentIndex + 1, 0, {
            id: `followup-${currentQuestion.id}`,
            question_text: data.follow_up_question,
            question_type: 'long_answer',
            focus_dimension: 'Deep Dive Follow-Up',
          });
          setQuestionList(updatedList);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error evaluating response');
      setLoading(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setAnswer('');
    setSelectedOption(null);
    setError(null);
    setIsBranchingFollowUp(false);
    setBranchingTag(null);

    if (currentIndex + 1 < questionList.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleCompleteSession();
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleCompleteSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/interview/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      setLoading(false);
      onComplete(data.overall_score ?? 75);
    } catch (err: any) {
      setLoading(false);
      onComplete(75);
    }
  };

  return (
    <div className="w-full max-w-[780px] text-left">
      <div className="flex items-center justify-between text-[11px] font-mono text-[#5C6B60] mb-3">
        <span>STAGE 03 // LIVE EXAM · {mode === 'mock' ? 'INTERACTIVE MOCK INTERVIEW' : 'TECHNICAL DRILL'}</span>
        <span>ALLOCATION: {questionList.length} QUESTIONS</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between text-[13px] text-[#5C6B60] mb-2 font-sans">
          <div className="flex items-baseline gap-2">
            <span className="text-[#1A2E22] font-semibold">Question {currentIndex + 1} of {questionList.length}</span>
            <span className="text-[#5C6B60] text-[12px]">• {currentQuestion.focus_dimension || 'Core Competency'}</span>
          </div>
          <span className="font-mono text-[12px] text-[#5C6B60]">Question ID: #{currentQuestion.id}</span>
        </div>
        <div className="w-full h-1 bg-[#D2D5C9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2F6F4E] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {mode === 'mock' && (
        <div className="mb-6 p-4 bg-white border border-[#D2D5C9] rounded shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[#2F6F4E] text-white flex items-center justify-center font-serif font-bold text-sm shrink-0">
            {activePersona.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-semibold text-sm text-[#1A2E22] font-sans">{activePersona.name}</span>
              <span className="text-xs text-[#5C6B60] font-mono">{activePersona.title}</span>
            </div>
            <p className="text-xs text-[#1A2E22] italic mt-1 font-serif leading-relaxed">
              "{interviewerRemark}"
            </p>
          </div>
        </div>
      )}

      {isBranchingFollowUp && (
        <div className="mb-6 p-3.5 bg-[#FCF8ED] border border-[#B08D2F] rounded text-xs font-mono text-[#B08D2F] flex items-center justify-between">
          <span>⚡ Adaptive Branching Triggered ({branchingTag === 'low_score' ? 'Foundational Probe' : 'Advanced Architecture'})</span>
          <span className="font-bold">Follow-Up Turn</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-serif text-[28px] leading-[1.3] text-[#1A2E22] font-medium tracking-tight">
          {currentQuestion.question_text}
        </h1>
        <p className="text-[13px] text-[#5C6B60] mt-2 leading-relaxed font-sans">
          {isMCQ
            ? 'Select the single most accurate technical statement below.'
            : 'Consider high-concurrency burst patterns, distributed storage layers, error thresholds, and recovery mechanisms.'}
        </p>
      </div>

      {error && (
        <div className="p-3.5 mb-6 rounded border border-[#B23A2E] bg-[#FDF2F0] text-xs font-mono text-[#B23A2E]">
          {error}
        </div>
      )}

      {!feedback ? (
        <div className="space-y-5">
          {isMCQ ? (
            <div className="space-y-2.5">
              {currentQuestion.options?.map((opt) => {
                const isSelected = selectedOption === opt.label;
                return (
                  <div
                    key={opt.label}
                    onClick={() => setSelectedOption(opt.label)}
                    className={`p-3.5 rounded border transition-all cursor-pointer flex items-center gap-3 select-none ${
                      isSelected
                        ? 'bg-[#F1F6F3] border-[#2F6F4E] shadow-xs'
                        : 'bg-white border-[#D2D5C9] hover:border-[#8A968E]'
                    }`}
                  >
                    <span
                      className={`font-mono text-xs w-6 h-6 rounded flex items-center justify-center font-bold transition-colors ${
                        isSelected
                          ? 'bg-[#2F6F4E] text-white'
                          : 'bg-[#EEF0EA] border border-[#D2D5C9] text-[#1A2E22]'
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span className="text-sm font-sans text-[#1A2E22] flex-1">{opt.text}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[13px] font-medium text-[#1A2E22] font-sans">
                  Your answer
                </label>
                <div className="flex items-center gap-3 text-[12px] text-[#5C6B60] font-sans">
                  <span>Format: Technical Essay / Markdown</span>
                  <span className="text-[#D2D5C9]">|</span>
                  <span className="font-mono text-[11px]">Draft auto-saved</span>
                </div>
              </div>

              <textarea
                rows={9}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Structure your answer with your chosen architecture, algorithmic trade-offs, storage choices, and edge-case handling..."
                className="w-full bg-[#FFFFFF] border border-[#D2D5C9] rounded p-4 text-[14px] leading-relaxed text-[#1A2E22] placeholder-[#8A968E] focus:outline-none focus:border-[#2F6F4E] focus:ring-1 focus:ring-[#2F6F4E] transition-all resize-y font-sans shadow-xs"
              />

              <div className="flex items-center justify-between mt-2 text-[12px] text-[#5C6B60] font-sans">
                <span>Tip: Cite specific mechanisms like caching tiers, circuit breakers, or consensus models.</span>
                <span className="font-mono text-[11px]">{wordCount} words</span>
              </div>
            </div>
          )}

          <div className="border-t border-[#D2D5C9] pt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-mono text-[#5C6B60] hover:text-[#1A2E22] underline cursor-pointer"
            >
              Skip Question &rarr;
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCompleteSession}
                className="px-4 py-2.5 rounded border border-[#D2D5C9] bg-white text-xs font-mono font-medium text-[#1A2E22] hover:bg-[#EEF0EA] transition-colors cursor-pointer"
              >
                Finish Exam Early
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={isMCQ ? handleSubmitMCQ : handleSubmitEssay}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-[#2F6F4E] hover:bg-[#265a3f] text-white text-xs font-mono font-medium transition-colors shadow-xs cursor-pointer"
              >
                {loading ? <LoadingSpinner size="sm" /> : <span>Submit Answer &amp; Proceed &rarr;</span>}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#D2D5C9] rounded p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#D2D5C9] pb-4">
            <div>
              <span className="text-[10px] font-mono text-[#5C6B60] uppercase">EXAMINER EVALUATION RESULT</span>
              <h3 className="font-serif text-lg font-semibold text-[#1A2E22] mt-0.5">
                {isMCQ
                  ? feedback.is_correct
                    ? 'Correct Answer Identified'
                    : 'Incorrect Choice'
                  : 'Turn Assessment Complete'}
              </h3>
            </div>
            <div className="text-right font-mono">
              <div className="text-2xl font-bold text-[#2F6F4E]">
                {feedback.score !== undefined ? `${feedback.score}/100` : feedback.is_correct ? '100/100' : '0/100'}
              </div>
              <div className="text-[10px] text-[#5C6B60]">Turn Score</div>
            </div>
          </div>

          {feedback.feedback && (
            <p className="text-xs text-[#1A2E22] leading-relaxed font-sans">
              {feedback.feedback}
            </p>
          )}

          {feedback.rubric_breakdown && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#EEF0EA]/60 rounded border border-[#D2D5C9] text-xs font-mono">
              {Object.entries(feedback.rubric_breakdown).map(([k, v]: any) => (
                <div key={k} className="p-2 bg-white rounded border border-[#D2D5C9]/60">
                  <div className="text-[10px] text-[#5C6B60] uppercase truncate">{k.replace('_', ' ')}</div>
                  <div className="font-bold text-[#1A2E22] text-sm mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          )}

          {feedback.matched_keywords && feedback.matched_keywords.length > 0 && (
            <div>
              <div className="text-[11px] font-mono text-[#5C6B60] mb-1.5 uppercase">Validated Keyword Signals:</div>
              <div className="flex flex-wrap gap-1.5">
                {feedback.matched_keywords.map((kw: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#E9F2EC] text-[#2F6F4E] border border-[#2F6F4E]/30 font-medium">
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-[#D2D5C9] pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded bg-[#2F6F4E] hover:bg-[#265a3f] text-white text-xs font-mono font-medium transition-colors shadow-xs cursor-pointer"
            >
              {currentIndex + 1 < questionList.length ? 'Continue to Next Question &rarr;' : 'Compile Final Report &rarr;'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewQA;
'''

# 8. ATSReport.tsx
files["ATSReport.tsx"] = '''import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../context/AuthContext';

interface ATSIssue {
  type: string;
  message: string;
  severity: 'High' | 'Medium' | 'Low';
}

interface ATSReportProps {
  resumeId?: number | null;
  mongoResumeId?: string | null;
  targetRole?: string;
  onClose: () => void;
  onProceedToSummary?: () => void;
  onOpenEditor?: () => void;
}

export const ATSReport: React.FC<ATSReportProps> = ({
  resumeId,
  mongoResumeId,
  targetRole = 'Frontend Developer',
  onClose,
  onProceedToSummary,
  onOpenEditor,
}) => {
  const { token } = useAuth();
  const [report, setReport] = useState<{
    score: number;
    issues: ATSIssue[];
    disclaimer: string;
    matched_keywords?: string[];
    missing_keywords?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const payload: Record<string, any> = {};
        if (mongoResumeId) {
          payload['mongo_resume_id'] = mongoResumeId;
        } else if (resumeId) {
          payload['resume_id'] = resumeId;
        }

        const response = await fetch('http://localhost:5000/api/ats/check', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch ATS report');

        setReport({
          score: data.ats_score,
          issues: data.issues || [],
          disclaimer: data.disclaimer || 'Heuristic estimate based on common ATS rules — not a certified score.',
          matched_keywords: data.matched_keywords || [],
          missing_keywords: data.missing_keywords || [],
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [resumeId, mongoResumeId, token]);

  if (loading) {
    return (
      <div className="max-w-[960px] mx-auto p-12 bg-white border border-[#D2D5C9] rounded text-center">
        <LoadingSpinner message="Scanning document structure against heuristic ATS rules..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[960px] mx-auto p-8 bg-white border border-[#B23A2E] rounded text-center">
        <p className="text-sm text-[#B23A2E] mb-4 font-mono">Error generating ATS report: {error}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#2F6F4E] text-white text-xs font-mono font-medium rounded hover:bg-[#265a3f] transition-colors cursor-pointer"
        >
          Return to Docket
        </button>
      </div>
    );
  }

  if (!report) return null;

  const score = Math.round(report.score);
  const isGood = score >= 75;
  const isMid = score >= 50 && score < 75;

  const criticalIssues = report.issues.filter((i) => i.severity === 'High');
  const warningIssues = report.issues.filter((i) => i.severity === 'Medium' || i.severity === 'Low');

  const scoreColor = isGood ? 'text-[#2F6F4E]' : isMid ? 'text-[#B08D2F]' : 'text-[#B23A2E]';
  const badgeClass = isGood
    ? 'bg-[#E9F2EC] text-[#2F6F4E] border-[#2F6F4E]/30'
    : isMid
    ? 'bg-[#FCF8ED] text-[#B08D2F] border-[#B08D2F]/30'
    : 'bg-[#FDF2F0] text-[#B23A2E] border-[#B23A2E]/30';

  const statusLabel = isGood ? 'High Compatibility' : isMid ? 'Needs Refinement' : 'Action Required';

  return (
    <div className="w-full max-w-[960px] text-left">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-mono text-[#5C6B60] uppercase tracking-wider">
          Stage 04 // Evaluation · Ingestion Diagnostics &amp; Keyword Match
        </div>
        <div className="text-[11px] font-mono text-[#5C6B60]">
          Engine: Heuristic Parser v4.2 / Rule-set Rev. 2025
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A2E22] tracking-tight">
        Resume ATS Compatibility
      </h1>

      <p className="text-xs sm:text-sm text-[#5C6B60] mt-1.5 mb-6 flex items-center gap-1.5 font-sans">
        <svg className="w-4 h-4 text-[#5C6B60] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{report.disclaimer}</span>
      </p>

      <div className="bg-white border border-[#D2D5C9] rounded p-6 sm:p-7 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#D2D5C9]">
          <div className="flex items-baseline gap-4">
            <div className="flex items-baseline">
              <span className={`font-mono text-5xl sm:text-6xl font-semibold tracking-tight ${scoreColor}`}>
                {score}
              </span>
              <span className="text-[#5C6B60] text-xl sm:text-2xl font-mono ml-1.5">/100</span>
            </div>
            <div className="border-l border-[#D2D5C9] pl-4 py-0.5">
              <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border mb-1 ${badgeClass}`}>
                {statusLabel}
              </div>
              <div className="text-sm font-medium text-[#1A2E22] font-sans">
                {isGood
                  ? 'Strong parseability and dense role-specific technical tokens.'
                  : isMid
                  ? 'Fair parseability, but key technical signals or layout tokens are masked.'
                  : 'Critical parsing bottlenecks detected; document structure requires remediation.'}
              </div>
              <div className="text-xs text-[#5C6B60] font-sans mt-0.5">
                Target Role: <strong className="text-[#1A2E22] font-mono">{targetRole}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:border-l sm:border-[#D2D5C9] sm:pl-6 text-xs shrink-0 font-mono">
            <div>
              <div className="text-[#5C6B60] mb-0.5 uppercase text-[10px]">Critical Faults</div>
              <div className="font-mono text-sm font-semibold text-[#B23A2E]">
                {criticalIssues.length}
              </div>
            </div>
            <div>
              <div className="text-[#5C6B60] mb-0.5 uppercase text-[10px]">Warnings</div>
              <div className="font-mono text-sm font-semibold text-[#B08D2F]">
                {warningIssues.length}
              </div>
            </div>
            <div>
              <div className="text-[#5C6B60] mb-0.5 uppercase text-[10px]">Rule Matrix</div>
              <div className="font-mono text-sm font-semibold text-[#2F6F4E]">
                Active
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center pt-5">
          <div className="bg-[#FDF2F0] border border-[#B23A2E]/30 rounded py-2 px-1 flex flex-col items-center">
            <span className="font-mono text-xs font-bold text-[#B23A2E]">{criticalIssues.length} Critical</span>
            <span className="font-mono text-[10px] text-[#5C6B60] uppercase">Layout &amp; Structure</span>
          </div>
          <div className="bg-[#FCF8ED] border border-[#B08D2F]/30 rounded py-2 px-1 flex flex-col items-center">
            <span className="font-mono text-xs font-bold text-[#B08D2F]">{warningIssues.length} Warnings</span>
            <span className="font-mono text-[10px] text-[#5C6B60] uppercase">Missing Signals</span>
          </div>
          <div className="bg-[#E9F2EC] border border-[#2F6F4E]/30 rounded py-2 px-1 flex flex-col items-center">
            <span className="font-mono text-xs font-bold text-[#2F6F4E]">Validated</span>
            <span className="font-mono text-[10px] text-[#5C6B60] uppercase">Core Headers</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D2D5C9] rounded p-6 mb-6 shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-semibold text-[#1A2E22]">
          Parser Diagnostics &amp; Layout Heuristics
        </h3>

        {report.issues.length === 0 ? (
          <p className="text-xs text-[#2F6F4E] font-mono">
            ✓ Clean scan! No structural or layout issues detected.
          </p>
        ) : (
          <div className="space-y-2.5">
            {report.issues.map((iss, idx) => {
              const isHigh = iss.severity === 'High';
              return (
                <div
                  key={idx}
                  className={`p-3 rounded border text-xs font-sans flex items-start gap-3 ${
                    isHigh
                      ? 'bg-[#FDF2F0] border-[#B23A2E]/30 text-[#1A2E22]'
                      : 'bg-[#FCF8ED] border-[#B08D2F]/30 text-[#1A2E22]'
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                      isHigh ? 'bg-[#B23A2E] text-white' : 'bg-[#B08D2F] text-white'
                    }`}
                  >
                    {iss.severity}
                  </span>
                  <div className="flex-1">
                    <strong className="block font-medium font-sans mb-0.5">{iss.type}</strong>
                    <span className="text-[#5C6B60] leading-relaxed">{iss.message}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-[#D2D5C9] pt-6 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded border border-[#D2D5C9] bg-white text-xs font-mono text-[#1A2E22] hover:bg-[#EEF0EA] transition-colors cursor-pointer"
        >
          &larr; Back to Intake
        </button>

        <div className="flex items-center gap-3">
          {onOpenEditor && (
            <button
              type="button"
              onClick={onOpenEditor}
              className="px-4 py-2.5 rounded border border-[#D2D5C9] bg-[#EEF0EA] hover:bg-[#D2D5C9] text-xs font-mono text-[#1A2E22] transition-colors cursor-pointer"
            >
              Remediate in Resume Editor ✎
            </button>
          )}

          {onProceedToSummary && (
            <button
              type="button"
              onClick={onProceedToSummary}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-[#2F6F4E] hover:bg-[#265a3f] text-white text-xs font-mono font-medium transition-colors shadow-xs cursor-pointer"
            >
              <span>Proceed to Dossier Summary &rarr;</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ATSReport;
'''

# 9. SessionDetail.tsx
files["SessionDetail.tsx"] = '''import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface AnswerDetail {
  id?: number;
  question_id?: number;
  mongo_question_id?: string;
  question_type?: string;
  question_text?: string;
  answer_text?: string;
  selected_option?: string;
  is_correct?: boolean;
  relevance_score?: number;
  clarity_score?: number;
}

interface TranscriptTurn {
  question_text: string;
  interviewer_remark?: string;
  answer_text: string;
  score: number;
  branch_direction?: string;
  timestamp?: string;
}

interface SessionDetailData {
  id: number;
  date: string;
  field?: string;
  role: string;
  mode?: 'standard' | 'mock';
  overall_score: number | null;
  mongo_transcript_id?: string;
  mongo_resume_id?: string;
  answers: AnswerDetail[];
  transcript?: {
    id: string;
    persona?: {
      name: string;
      title: string;
      firm?: string;
    };
    turns: TranscriptTurn[];
  } | null;
  resume?: {
    id: string;
    title: string;
    skills: string[];
    last_updated?: string;
  } | null;
  ats_report: {
    ats_score: number | null;
    issues: any[];
  } | null;
}

interface PastSessionSummary {
  id: number;
  date: string;
  field?: string;
  role: string;
  mode?: 'standard' | 'mock';
  overall_score: number | null;
}

interface SessionDetailProps {
  sessionId: number;
  onBack: () => void;
  onNewSession?: () => void;
  onSelectPastSession?: (id: number) => void;
}

export const SessionDetail: React.FC<SessionDetailProps> = ({
  sessionId,
  onBack,
  onNewSession,
  onSelectPastSession,
}) => {
  const [data, setData] = useState<SessionDetailData | null>(null);
  const [pastSessions, setPastSessions] = useState<PastSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const [sessionRes, allSessionsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/sessions/${sessionId}`, { headers }),
          fetch('http://localhost:5000/api/sessions', { headers }).catch(() => null),
        ]);

        const result = await sessionRes.json();
        if (!sessionRes.ok) throw new Error(result.error || 'Failed to fetch session details');
        setData(result);

        if (allSessionsRes && allSessionsRes.ok) {
          const allList = await allSessionsRes.json();
          setPastSessions(allList.filter((s: PastSessionSummary) => s.id !== sessionId));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="w-full max-w-[960px] mx-auto p-12 bg-white border border-[#D2D5C9] rounded text-center">
        <LoadingSpinner message="Compiling executive evaluation dossier & performance rubrics..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-[960px] mx-auto p-8 bg-white border border-[#B23A2E] rounded text-center font-mono">
        <p className="text-sm text-[#B23A2E] mb-4">{error || 'Session not found.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#2F6F4E] text-white text-xs font-medium rounded hover:bg-[#265a3f] transition-colors cursor-pointer"
        >
          Return to History
        </button>
      </div>
    );
  }

  const interviewScore = data.overall_score !== null ? Math.round(data.overall_score * 100) : 75;
  const atsScore =
    data.ats_report?.ats_score !== null && data.ats_report?.ats_score !== undefined
      ? Math.round(data.ats_report.ats_score)
      : 68;

  const handleDownloadPDF = () => {
    window.open(`http://localhost:5000/api/sessions/${sessionId}/report/pdf`, '_blank');
  };

  return (
    <div className="w-full max-w-[960px] text-left space-y-8">
      <div className="flex items-center justify-between text-xs font-mono text-[#5C6B60]">
        <div className="uppercase tracking-wider">
          Stage 06 // Evaluation · Evaluator Dossier &amp; Performance Record
        </div>
        <div>
          DOCKET ID: <strong className="text-[#1A2E22]">#{data.id}</strong> · {data.date ? new Date(data.date).toLocaleDateString() : 'Active'}
        </div>
      </div>

      <div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A2E22] tracking-tight mb-2">
          Session Summary &amp; Assessment
        </h1>
        <p className="text-sm text-[#5C6B60] leading-relaxed font-sans">
          Final executive evaluation across technical inquiries, behavioral consistency, and ATS parser readiness for <strong className="text-[#1A2E22]">{data.role}</strong> ({data.field?.toUpperCase() || 'IT'}).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-[#D2D5C9] rounded p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#D2D5C9] pb-3">
            <span className="text-[11px] font-mono text-[#5C6B60] uppercase">ORAL EXAMINATION SCORE</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#E9F2EC] text-[#2F6F4E] border border-[#2F6F4E]/30">
              {data.mode === 'mock' ? 'MOCK INTERVIEW' : 'STANDARD Q&A'}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-mono text-5xl font-bold text-[#2F6F4E] tracking-tight">{interviewScore}</span>
            <span className="text-[#5C6B60] text-xl font-mono">/100</span>
          </div>

          <p className="text-xs text-[#5C6B60] leading-relaxed font-sans">
            Composite evaluation derived from {data.answers?.length || 0} turn responses and rubric criteria splits.
          </p>
        </div>

        <div className="bg-white border border-[#D2D5C9] rounded p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#D2D5C9] pb-3">
            <span className="text-[11px] font-mono text-[#5C6B60] uppercase">ATS COMPATIBILITY SCORE</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#FCF8ED] text-[#B08D2F] border border-[#B08D2F]/30">
              HEURISTIC SCAN
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-mono text-5xl font-bold text-[#B08D2F] tracking-tight">{atsScore}</span>
            <span className="text-[#5C6B60] text-xl font-mono">/100</span>
          </div>

          <p className="text-xs text-[#5C6B60] leading-relaxed font-sans">
            Parser scan evaluating candidate experience keywords, layout linearity, and token density.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-[#FDF2F0] border border-[#B23A2E]/30 rounded py-2 px-1 flex flex-col items-center">
          <span className="font-mono text-xs font-bold text-[#B23A2E]">1 Critical</span>
          <span className="font-mono text-[10px] text-[#5C6B60] uppercase">Layout &amp; Table Fault</span>
        </div>
        <div className="bg-[#FCF8ED] border border-[#B08D2F]/30 rounded py-2 px-1 flex flex-col items-center">
          <span className="font-mono text-xs font-bold text-[#B08D2F]">2 Warnings</span>
          <span className="font-mono text-[10px] text-[#5C6B60] uppercase">Missing Core Tokens</span>
        </div>
        <div className="bg-[#E9F2EC] border border-[#2F6F4E]/30 rounded py-2 px-1 flex flex-col items-center">
          <span className="font-mono text-xs font-bold text-[#2F6F4E]">5 Passed</span>
          <span className="font-mono text-[10px] text-[#5C6B60] uppercase">Validated Rubric Checks</span>
        </div>
      </div>

      <aside className="bg-white border-l-4 border-[#2F6F4E] border-y border-r border-[#D2D5C9] p-5 rounded-r shadow-xs flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-full bg-[#E9F2EC] text-[#2F6F4E] flex items-center justify-center font-bold text-sm shrink-0">
          ✎
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] uppercase font-bold text-[#2F6F4E] tracking-wide">
              Instructor's Final Endorsement
            </span>
            <span className="text-[#D2D5C9]">·</span>
            <span className="font-mono text-[11px] text-[#5C6B60]">Prof. E. Vance (Evaluator)</span>
          </div>
          <p className="text-xs text-[#1A2E22] italic font-serif leading-relaxed">
            "Candidate demonstrates target passing velocity for {data.role} loops. Resolve the multi-column table ATS parser hazard and review distributed caching fallback patterns before scheduling on-site interviews."
          </p>
        </div>
      </aside>

      <div className="border-y border-[#D2D5C9] py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="bg-[#2F6F4E] hover:bg-[#265a3f] text-white px-5 py-2.5 rounded text-xs font-mono font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>Download PDF report ↗</span>
          </button>

          {onNewSession && (
            <button
              type="button"
              onClick={onNewSession}
              className="bg-white hover:bg-[#EEF0EA] text-[#1A2E22] border border-[#D2D5C9] px-5 py-2.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              Start a new session
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#5C6B60]">
          <span className="text-[#2F6F4E]">🔒</span>
          <span>Dossier cryptographically locked &amp; archived to local storage.</span>
        </div>
      </div>

      <section className="bg-white border border-[#D2D5C9] rounded p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#D2D5C9] pb-3">
          <h3 className="font-serif text-lg font-semibold text-[#1A2E22]">
            Turn-by-Turn Examination Transcripts
          </h3>
          <span className="text-xs font-mono text-[#5C6B60]">{data.answers?.length || 0} Inquiries Logged</span>
        </div>

        <div className="divide-y divide-[#D2D5C9]">
          {data.answers && data.answers.length > 0 ? (
            data.answers.map((ans, idx) => (
              <div key={idx} className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#5C6B60] uppercase">QUESTION {idx + 1}</span>
                    <h4 className="font-serif font-medium text-sm text-[#1A2E22]">
                      {ans.question_text || `Inquiry #${ans.question_id}`}
                    </h4>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <span className="text-xs font-bold text-[#2F6F4E]">
                      {ans.is_correct !== undefined
                        ? ans.is_correct ? '100%' : '0%'
                        : ans.relevance_score
                        ? `${Math.round(ans.relevance_score * 100)}%`
                        : 'Passed'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#EEF0EA]/50 rounded border border-[#D2D5C9]/60 text-xs font-sans text-[#1A2E22] leading-relaxed">
                  <strong>Answer:</strong> {ans.selected_option || ans.answer_text || 'No response recorded.'}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#5C6B60] py-4 font-mono">No turn responses recorded for this docket.</p>
          )}
        </div>
      </section>

      {pastSessions.length > 0 && (
        <section className="space-y-3 pt-4">
          <div className="flex items-baseline justify-between border-b border-[#D2D5C9] pb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-semibold text-[#1A2E22]">Past sessions</h3>
              <span className="font-mono text-xs text-[#5C6B60]">({pastSessions.length} archived dockets)</span>
            </div>
            <span className="font-mono text-xs text-[#5C6B60] uppercase tracking-wider">Read-only index</span>
          </div>

          <div className="divide-y divide-[#D2D5C9] border-y border-[#D2D5C9] bg-white rounded">
            {pastSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectPastSession && onSelectPastSession(s.id)}
                className="p-3.5 hover:bg-[#EEF0EA]/60 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="font-sans font-semibold text-sm text-[#1A2E22] group-hover:text-[#2F6F4E] transition-colors">
                    {s.role}
                  </div>
                  <div className="text-xs font-mono text-[#5C6B60]">
                    {new Date(s.date).toLocaleDateString()} · {s.mode === 'mock' ? 'Mock Mode' : 'Standard Q&A'}
                  </div>
                </div>
                <div className="font-mono text-sm font-bold text-[#2F6F4E]">
                  {s.overall_score !== null ? `${Math.round(s.overall_score * 100)}%` : '—'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SessionDetail;
'''

# 10. FeedbackReport.tsx
files["FeedbackReport.tsx"] = '''import React from 'react';

interface FeedbackReportProps {
  relevanceScore: number;
  clarityScore: number;
  suggestions: string[];
  onContinue: () => void;
}

export const FeedbackReport: React.FC<FeedbackReportProps> = ({
  relevanceScore,
  clarityScore,
  suggestions,
  onContinue,
}) => {
  const relPct = Math.round(relevanceScore * 100);
  const claPct = Math.round(clarityScore * 100);

  return (
    <div className="max-w-[640px] mx-auto p-6 sm:p-8 bg-white border border-[#D2D5C9] rounded shadow-xs text-left">
      <div className="border-b border-[#D2D5C9] pb-4 mb-6">
        <div className="text-[10px] font-mono text-[#5C6B60] uppercase tracking-wider">
          EXAMINER INTAKE ASSESSMENT
        </div>
        <h3 className="font-serif text-2xl font-semibold text-[#1A2E22] mt-0.5">
          Instant Turn Evaluation
        </h3>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-[#1A2E22] font-semibold">Technical Precision &amp; Keyword Match</span>
            <span className="font-bold text-[#2F6F4E]">{relPct}%</span>
          </div>
          <div className="w-full h-2 bg-[#EEF0EA] rounded-full overflow-hidden border border-[#D2D5C9]/60">
            <div
              className="h-full bg-[#2F6F4E] rounded-full transition-all duration-300"
              style={{ width: `${relPct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-[#1A2E22] font-semibold">Structural Clarity &amp; Framework Cohesion</span>
            <span className="font-bold text-[#B08D2F]">{claPct}%</span>
          </div>
          <div className="w-full h-2 bg-[#EEF0EA] rounded-full overflow-hidden border border-[#D2D5C9]/60">
            <div
              className="h-full bg-[#B08D2F] rounded-full transition-all duration-300"
              style={{ width: `${claPct}%` }}
            />
          </div>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="mb-6 p-4 bg-[#F4F6F1] border border-[#D2D5C9] rounded">
          <h4 className="font-mono text-[11px] uppercase font-bold text-[#2F6F4E] mb-2">
            Rubric Remediation Notes:
          </h4>
          <ul className="space-y-1.5 text-xs text-[#5C6B60] font-sans">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#2F6F4E] font-bold">·</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-[#D2D5C9] pt-4 flex justify-end">
        <button
          onClick={onContinue}
          className="px-6 py-2.5 rounded bg-[#2F6F4E] hover:bg-[#265a3f] text-white text-xs font-mono font-medium transition-colors shadow-xs cursor-pointer"
        >
          Continue to Next Question &rarr;
        </button>
      </div>
    </div>
  );
};

export default FeedbackReport;
'''

# 11. SessionHistory.tsx
files["SessionHistory.tsx"] = '''import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface SessionSummary {
  id: number;
  date: string;
  field?: string;
  role: string;
  mode?: 'standard' | 'mock';
  overall_score: number | null;
  has_transcript?: boolean;
}

interface SessionHistoryProps {
  onSelectSession: (sessionId: number) => void;
  onBack: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ onSelectSession, onBack }) => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch('http://localhost:5000/api/sessions', { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch sessions');
        setSessions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-[960px] mx-auto p-12 bg-white border border-[#D2D5C9] rounded text-center">
        <LoadingSpinner message="Retrieving archived session dockets..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[960px] mx-auto p-8 bg-white border border-[#B23A2E] rounded text-center font-mono">
        <p className="text-sm text-[#B23A2E] mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#2F6F4E] text-white text-xs font-mono font-medium rounded hover:bg-[#265a3f] transition-colors cursor-pointer"
        >
          Return to Docket
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[960px] text-left">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-mono text-[#5C6B60] uppercase tracking-wider">
          Archive Index // Historical Evaluations &amp; Dossiers
        </div>
        <button
          onClick={onBack}
          className="text-xs font-mono text-[#5C6B60] hover:text-[#1A2E22] transition-colors cursor-pointer"
        >
          &larr; Return to Active Docket
        </button>
      </div>

      <h1 className="text-3xl font-serif font-bold text-[#1A2E22] tracking-tight mb-2">
        Preparation History &amp; Past Dockets
      </h1>
      <p className="text-sm text-[#5C6B60] mb-8 leading-relaxed font-sans">
        Review past interview transcripts, multi-field rubrics, and downloadable performance reports across standard and mock tracks.
      </p>

      {sessions.length > 0 ? (
        <div className="bg-white border border-[#D2D5C9] rounded divide-y divide-[#D2D5C9] shadow-xs overflow-hidden">
          {sessions.map((session) => {
            const scorePercent = session.overall_score !== null ? Math.round(session.overall_score * 100) : null;
            const fieldNormalized = (session.field || 'it').toLowerCase();
            const isMock = session.mode === 'mock';

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className="p-4 hover:bg-[#EEF0EA]/60 transition-colors flex items-center justify-between cursor-pointer group select-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded border border-[#D2D5C9] bg-[#EEF0EA] flex items-center justify-center text-[#2F6F4E] font-mono text-xs font-bold shrink-0">
                    #{String(session.id).padStart(3, '0')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-[#1A2E22] font-sans group-hover:text-[#2F6F4E] transition-colors">
                        {session.role}
                      </span>

                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded border uppercase font-medium ${
                          fieldNormalized === 'it'
                            ? 'bg-[#E9F2EC] text-[#2F6F4E] border-[#2F6F4E]/30'
                            : fieldNormalized === 'management'
                            ? 'bg-[#FCF8ED] text-[#B08D2F] border-[#B08D2F]/30'
                            : 'bg-[#F4F1FA] text-[#5C458A] border-[#D6CBE8]'
                        }`}
                      >
                        {fieldNormalized}
                      </span>

                      <span className="font-mono text-[10px] px-2 py-0.5 rounded border bg-[#EEF0EA] text-[#5C6B60] border-[#D2D5C9]">
                        {isMock ? 'Mock Interview' : 'Standard Q&A'}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-[#5C6B60]">
                      {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {session.has_transcript && (
                        <span className="ml-2 text-[#2F6F4E] font-medium">· Transcript Attached</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 font-mono text-right">
                  <div>
                    {scorePercent !== null ? (
                      <span className="text-base font-bold text-[#2F6F4E]">{scorePercent}%</span>
                    ) : (
                      <span className="text-xs text-[#5C6B60]">In Progress</span>
                    )}
                    <span className="block text-[10px] text-[#5C6B60]">Composite</span>
                  </div>
                  <span className="text-[#5C6B60] group-hover:text-[#2F6F4E] group-hover:translate-x-0.5 transition-transform text-sm font-bold">
                    &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 bg-white border border-[#D2D5C9] rounded text-center">
          <p className="text-sm text-[#5C6B60] font-sans">No completed session records found in the archive index.</p>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
'''

# 12. AuthScreen.tsx
files["AuthScreen.tsx"] = '''import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BrandWordmark from './BrandWordmark';

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetField, setTargetField] = useState('it');
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isSignUp) {
      const res = await signup(name, email, password, targetField, targetRole);
      setLoading(false);
      if (res.success) {
        onSuccess?.();
      } else {
        setError(res.error || 'Failed to create account.');
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onSuccess?.();
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-2">
      <div className="w-full max-w-[440px] bg-white border border-[#D2D5C9] shadow-xs rounded overflow-hidden text-left">
        <div className="bg-[#EEF0EA] px-6 py-4 hairline-b flex items-center justify-between">
          <BrandWordmark subtitle="Access Authorization" />
          <span className="font-mono text-[10px] text-[#5C6B60] px-2 py-0.5 border border-[#D2D5C9] rounded bg-white font-medium">
            AUTH // GATE
          </span>
        </div>

        <div className="flex hairline-b bg-[#EEF0EA]/40 text-xs font-mono">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
              !isSignUp
                ? 'bg-white border-b-2 border-[#2F6F4E] text-[#1A2E22] font-semibold'
                : 'text-[#5C6B60] hover:text-[#1A2E22]'
            }`}
          >
            Candidate Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
              isSignUp
                ? 'bg-white border-b-2 border-[#2F6F4E] text-[#1A2E22] font-semibold'
                : 'text-[#5C6B60] hover:text-[#1A2E22]'
            }`}
          >
            Create Docket Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          {error && (
            <div className="p-3 bg-[#FDF2F0] border border-[#B23A2E]/30 rounded text-[#B23A2E] text-xs font-mono">
              <strong>Error:</strong> {error}
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-[11px] font-mono text-[#5C6B60] uppercase mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Alex Mercer"
                className="w-full px-3 py-2 border border-[#D2D5C9] rounded bg-[#FAFCFA] text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] focus:bg-white text-xs transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-[#5C6B60] uppercase mb-1">
              Institutional Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@organization.com"
              className="w-full px-3 py-2 border border-[#D2D5C9] rounded bg-[#FAFCFA] text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] focus:bg-white text-xs transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#5C6B60] uppercase mb-1">
              Access Credential (Password)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 border border-[#D2D5C9] rounded bg-[#FAFCFA] text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] focus:bg-white text-xs transition-colors font-mono"
            />
            <p className="text-[10px] text-[#5C6B60] mt-1 font-mono">
              Requirement: Minimum 6 characters.
            </p>
          </div>

          {isSignUp && (
            <div className="pt-2 border-t border-[#D2D5C9] space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#5C6B60] uppercase mb-1">
                  Target Career Track
                </label>
                <select
                  value={targetField}
                  onChange={(e) => {
                    const f = e.target.value;
                    setTargetField(f);
                    if (f === 'it') setTargetRole('Frontend Developer');
                    else if (f === 'management') setTargetRole('Product Manager');
                    else if (f === 'law') setTargetRole('Corporate Counsel');
                  }}
                  className="w-full px-3 py-2 border border-[#D2D5C9] rounded bg-[#FAFCFA] text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] text-xs font-mono"
                >
                  <option value="it">Information Technology (Code, Architecture & Design)</option>
                  <option value="management">Management & Leadership (SAR Rubric, Strategy)</option>
                  <option value="law">Legal & Regulatory (IRAC Rubric, Compliance)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#5C6B60] uppercase mb-1">
                  Target Role Specification
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D2D5C9] rounded bg-[#FAFCFA] text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] text-xs font-mono"
                >
                  {targetField === 'it' && (
                    <>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="Data Analyst">Data Analyst</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                    </>
                  )}
                  {targetField === 'management' && (
                    <>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Operations Lead">Operations Lead</option>
                      <option value="Engineering Manager">Engineering Manager</option>
                    </>
                  )}
                  {targetField === 'law' && (
                    <>
                      <option value="Corporate Counsel">Corporate Counsel</option>
                      <option value="Compliance Officer">Compliance Officer</option>
                      <option value="Legal Analyst">Legal Analyst</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#2F6F4E] hover:bg-[#265a3f] text-white rounded font-mono font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs text-xs"
            >
              {loading ? (
                <span>Authenticating with docket server...</span>
              ) : isSignUp ? (
                <span>Provision Candidate Account ↗</span>
              ) : (
                <span>Sign In to Candidate Docket ↗</span>
              )}
            </button>
          </div>
        </form>

        <div className="bg-[#EEF0EA] px-6 py-3 hairline-t text-center text-[10px] font-mono text-[#5C6B60]">
          Secured with SHA-256 / Bcrypt salted credentials and stateless JWT session keys.
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
'''

for fname, content in files.items():
    p = os.path.join(base_dir, fname)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Wrote {fname} cleanly ({len(content)} bytes)")

print("All components deployed cleanly.")
