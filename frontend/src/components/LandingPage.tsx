import React, { useState } from 'react';
import BrandWordmark from './BrandWordmark';
import { useAuth } from '../context/AuthContext';
import { type DocketStep } from './AppLayout';

interface LandingPageProps {
  onNavigate: (step: DocketStep) => void;
  onSelectTrack?: (field: string, role?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSelectTrack,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [activePreviewTrack, setActivePreviewTrack] = useState<'it' | 'management' | 'law'>('it');

  // Interactive ATS Demo state
  const [atsSampleType, setAtsSampleType] = useState<'it' | 'mgmt' | 'law'>('it');

  const previewData = {
    it: {
      tag: 'IT SYSTEMS',
      role: 'Frontend Developer & Systems Engineer',
      color: '#2E6FF2',
      bgLight: '#DAE2FF',
      bgSurface: '#F0F4FF',
      border: '#BFDBFE',
      question: 'Explain how React 19 concurrent features (such as useDeferredValue and Actions) optimize main thread execution compared to debouncing.',
      answerSnippet: 'useDeferredValue integrates directly with React concurrent scheduler to keep input events responsive while deferring non-urgent re-renders...',
      examinerName: 'Marcus Vance',
      examinerTitle: 'Principal Systems Architect',
      score: '9.2 / 10',
      feedback: 'Excellent architectural precision. Candidate correctly identified scheduler priority queues over arbitrary timer delays.',
      rubric: 'Technical Precision & Concurrency Architecture',
      atsScore: 92,
      keywords: ['React 19', 'TypeScript', 'Concurrent Mode', 'Virtual DOM', 'Performance Profiling'],
    },
    management: {
      tag: 'MANAGEMENT & LEADERSHIP',
      role: 'Senior Product Manager & Strategy Lead',
      color: '#8B4FE0',
      bgLight: '#EDDCFF',
      bgSurface: '#F7F0FF',
      border: '#E9D5FF',
      question: 'When engineering velocity slows due to legacy technical debt, how do you defend allocating 30% of a sprint to debt instead of high-visibility roadmap features?',
      answerSnippet: 'I frame technical debt in terms of business risk, release cycle degradation, and customer SLA exposure with quantifiable impact models...',
      examinerName: 'Eleanor Hayes',
      examinerTitle: 'VP of Product & Strategic Growth',
      score: '8.8 / 10',
      feedback: 'Strong executive framing. Candidate effectively linked refactoring sprints to customer churn reduction and developer retention.',
      rubric: 'Executive Communication & Business Trade-offs',
      atsScore: 89,
      keywords: ['Product Roadmap', 'Stakeholder Alignment', 'KPI Modeling', 'Sprint Allocation', 'Technical Debt'],
    },
    law: {
      tag: 'LAW & GOVERNANCE',
      role: 'Corporate Legal Counsel & Compliance Officer',
      color: '#0EA5B7',
      bgLight: '#CCF2F6',
      bgSurface: '#EDFAFC',
      border: '#BAE6FD',
      question: 'How do you negotiate an uncapped liability clause in a SaaS Enterprise MSA when the prospective enterprise client mandates strict indemnity for data breaches?',
      answerSnippet: 'I counter with a super-cap tied to a multiple of trailing 12-month contract value while establishing carve-outs for willful misconduct...',
      examinerName: 'Victoria Hastings',
      examinerTitle: 'General Counsel & Governance Director',
      score: '9.4 / 10',
      feedback: 'Masterful contractual risk mitigation. Candidate provided commercially viable liability tiers without compromising regulatory exposure.',
      rubric: 'Statutory Compliance & Risk Mitigation',
      atsScore: 94,
      keywords: ['MSA Negotiation', 'Limitation of Liability', 'GDPR/CCPA Compliance', 'Indemnification', 'Risk Mitigation'],
    },
  };

  const currentPreview = previewData[activePreviewTrack];

  const handleLaunchTrack = (field: 'it' | 'management' | 'law', defaultRole?: string) => {
    if (onSelectTrack) {
      onSelectTrack(field, defaultRole);
    }
    onNavigate('role_select');
  };

  const atsSamples = {
    it: {
      title: 'Senior Frontend Engineer Resume',
      score: 92,
      matchGrade: 'High ATS Pass Probability',
      matched: ['React.js', 'TypeScript', 'Tailwind CSS', 'Next.js', 'State Architecture', 'CI/CD Pipeline', 'RESTful APIs'],
      missing: ['GraphQL', 'Docker'],
      summary: 'Clean hierarchical formatting, optimal keyword density, strict reverse-chronological layout.',
    },
    mgmt: {
      title: 'Product Operations Director Resume',
      score: 88,
      matchGrade: 'Strong Recruiter Match',
      matched: ['Product Strategy', 'Cross-Functional Leadership', 'Sprint Planning', 'Metrics & OKRs', 'User Research'],
      missing: ['SQL Analytics', 'P&L Accountability'],
      summary: 'Quantified accomplishments present across all sections. Good structural header fidelity.',
    },
    law: {
      title: 'Corporate Legal Counsel Resume',
      score: 95,
      matchGrade: 'Exceptional Compliance Rating',
      matched: ['Contract Negotiation', 'Regulatory Compliance', 'Corporate Governance', 'Risk Auditing', 'Due Diligence'],
      missing: ['Patent Prosecution'],
      summary: 'Precise legal terminology, verified jurisdiction credentials, clear clause analysis bullet points.',
    },
  };

  const currentAts = atsSamples[atsSampleType];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#17181C] font-sans antialiased selection:bg-[#2E6FF2]/20 selection:text-[#17181C]">
      {/* 1. STICKY TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <BrandWordmark
              subtitle="Career Intelligence Suite"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
            <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-[#6B7078]">
              <a
                href="#tracks"
                className="px-3 py-1.5 rounded-lg hover:text-[#17181C] hover:bg-[#F1F2F4] transition-colors"
              >
                Career Tracks
              </a>
              <a
                href="#features"
                className="px-3 py-1.5 rounded-lg hover:text-[#17181C] hover:bg-[#F1F2F4] transition-colors"
              >
                Platform Features
              </a>
              <a
                href="#ats-scanner"
                className="px-3 py-1.5 rounded-lg hover:text-[#17181C] hover:bg-[#F1F2F4] transition-colors"
              >
                ATS Intelligence
              </a>
              <a
                href="#how-it-works"
                className="px-3 py-1.5 rounded-lg hover:text-[#17181C] hover:bg-[#F1F2F4] transition-colors"
              >
                How It Works
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#17181C] hover:bg-[#2A2B30] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <span>Workspace ({user?.name?.split(' ')[0] || 'Candidate'})</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#17181C] hover:bg-[#F1F2F4] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('field_select')}
                  className="px-4 py-2 rounded-xl bg-[#17181C] hover:bg-[#2A2B30] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Launch Free Practice</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E5E7EB] bg-linear-to-b from-white via-white to-[#F8F9FA]">
        {/* Subtle decorative background grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0F4FF] border border-[#BFDBFE] text-[#2E6FF2] text-xs font-semibold tracking-wide animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-[#2E6FF2] animate-pulse"></span>
              <span>Next-Generation Career Preparation & Examination Suite</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#17181C] leading-[1.12]">
              Master the Interview.{' '}
              <span className="bg-linear-to-r from-[#2E6FF2] via-[#8B4FE0] to-[#0EA5B7] bg-clip-text text-transparent">
                Beat the ATS.
              </span>{' '}
              Accelerate Your Career.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#6B7078] max-w-2xl mx-auto leading-relaxed">
              An enterprise-grade career preparation suite calibrated for{' '}
              <span className="font-semibold text-[#17181C]">IT Systems</span>,{' '}
              <span className="font-semibold text-[#17181C]">Executive Management</span>, and{' '}
              <span className="font-semibold text-[#17181C]">Legal Governance</span>. Practice dynamic
              persona-driven mock interviews, pass rigorous ATS algorithms, and track your telemetry across sessions.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('field_select')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#17181C] hover:bg-[#2A2B30] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Launch Career Practice Free</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-[#F8F9FA] text-[#17181C] border border-[#E5E7EB] hover:border-[#D1D5DB] text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto border-t border-[#E5E7EB]/80 text-left">
              <div>
                <p className="font-mono text-xl sm:text-2xl font-bold text-[#17181C]">3 Disciplines</p>
                <p className="text-xs text-[#6B7078]">IT, Management, Law</p>
              </div>
              <div>
                <p className="font-mono text-xl sm:text-2xl font-bold text-[#2E6FF2]">100% Heuristic</p>
                <p className="text-xs text-[#6B7078]">Deterministic ATS Engine</p>
              </div>
              <div>
                <p className="font-mono text-xl sm:text-2xl font-bold text-[#8B4FE0]">AI Personas</p>
                <p className="text-xs text-[#6B7078]">Branching Mock Examiners</p>
              </div>
              <div>
                <p className="font-mono text-xl sm:text-2xl font-bold text-[#0EA5B7]">Vector PDF</p>
                <p className="text-xs text-[#6B7078]">Instant Dossier Exports</p>
              </div>
            </div>
          </div>

          {/* 3. INTERACTIVE HERO COCKPIT PREVIEW */}
          <div className="mt-14 max-w-4xl mx-auto bg-white rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden text-left transition-all">
            {/* Cockpit Window Header */}
            <div className="bg-[#F8F9FA] px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]/60"></span>
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]/60"></span>
                <span className="w-3 h-3 rounded-full bg-[#16A34A]/60"></span>
                <span className="ml-2 font-mono text-[11px] font-semibold text-[#6B7078] uppercase tracking-wider">
                  Live Interactive Examination Cockpit
                </span>
              </div>

              {/* Track Selector Tabs */}
              <div className="flex items-center bg-[#E5E7EB]/60 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActivePreviewTrack('it')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activePreviewTrack === 'it'
                      ? 'bg-white text-[#2E6FF2] shadow-xs'
                      : 'text-[#6B7078] hover:text-[#17181C]'
                  }`}
                >
                  IT Systems
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTrack('management')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activePreviewTrack === 'management'
                      ? 'bg-white text-[#8B4FE0] shadow-xs'
                      : 'text-[#6B7078] hover:text-[#17181C]'
                  }`}
                >
                  Management
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTrack('law')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activePreviewTrack === 'law'
                      ? 'bg-white text-[#0EA5B7] shadow-xs'
                      : 'text-[#6B7078] hover:text-[#17181C]'
                  }`}
                >
                  Corporate Law
                </button>
              </div>
            </div>

            {/* Cockpit Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Question & Rubric Row */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wider"
                      style={{ backgroundColor: currentPreview.bgLight, color: currentPreview.color }}
                    >
                      {currentPreview.tag}
                    </span>
                    <span className="text-xs text-[#6B7078] font-mono">• {currentPreview.role}</span>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#ECFDF5] text-[#16A34A] rounded-md border border-[#BBF7D0]">
                    Dimension: {currentPreview.rubric}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#17181C] leading-snug">
                  {currentPreview.question}
                </h3>
              </div>

              {/* Response & Real-Time Examiner Remark */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Candidate Answer Preview */}
                <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2">
                  <p className="font-mono text-[10px] font-bold uppercase text-[#6B7078]">
                    Candidate Structured Defense
                  </p>
                  <p className="text-xs text-[#17181C] leading-relaxed italic">
                    "{currentPreview.answerSnippet}"
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {currentPreview.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-[#E5E7EB] text-[#17181C]"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Examiner Dynamic Evaluation */}
                <div
                  className="p-4 rounded-xl border space-y-2.5 transition-all"
                  style={{ backgroundColor: currentPreview.bgSurface, borderColor: currentPreview.border }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-xs shadow-xs text-[#17181C] border border-[#E5E7EB]">
                        {currentPreview.examinerName.charAt(0)}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#17181C]">{currentPreview.examinerName}</p>
                        <p className="text-[10px] text-[#6B7078]">{currentPreview.examinerTitle}</p>
                      </div>
                    </div>
                    <span
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white shadow-xs"
                      style={{ color: currentPreview.color }}
                    >
                      Score: {currentPreview.score}
                    </span>
                  </div>

                  <p className="text-xs text-[#17181C] leading-relaxed font-mono">
                    <span className="font-bold">Examiner Remark: </span>
                    {currentPreview.feedback}
                  </p>
                </div>
              </div>

              {/* Bottom Quick Action Bar inside preview */}
              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#16A34A] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Heuristic Verification Active</span>
                  </span>
                  <span className="text-xs text-[#6B7078] hidden sm:inline">|</span>
                  <span className="font-mono text-xs text-[#6B7078] hidden sm:inline">
                    ATS Audit Match: {currentPreview.atsScore}%
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchTrack(activePreviewTrack)}
                  className="px-4 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:brightness-110"
                  style={{ backgroundColor: currentPreview.color }}
                >
                  <span>Practice This Track</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE MULTI-FIELD TRACKS SECTION */}
      <section id="tracks" className="py-20 lg:py-28 border-b border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-mono text-xs uppercase font-bold text-[#2E6FF2] tracking-wider">
              Disciplinary Alignment
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17181C] tracking-tight">
              Calibrated For Your Professional Discipline
            </h2>
            <p className="text-sm sm:text-base text-[#6B7078]">
              Generic prep tools treat all careers the same. SmartHire uses distinct evaluation engines,
              rubrics, and examiners specifically engineered for each field.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* IT Track Card */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] hover:bg-white hover:border-[#BFDBFE] hover:shadow-lg p-6 sm:p-7 space-y-5 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F4FF] border border-[#BFDBFE] flex items-center justify-center text-[#2E6FF2]">
                    <span className="material-symbols-outlined text-[22px]">terminal</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#DAE2FF] text-[#2E6FF2]">
                    IT SYSTEMS
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-[#17181C]">Information Technology</h3>
                  <p className="text-xs text-[#6B7078] leading-relaxed">
                    Technical precision, concurrency models, algorithm optimization, and full-stack software architecture.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                  <p className="font-mono text-[10px] font-bold uppercase text-[#6B7078]">High-Yield Specializations:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Frontend Developer', 'Backend Architect', 'DevOps & Cloud', 'Full Stack Engineer'].map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-white border border-[#E5E7EB] text-[#17181C]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="font-mono text-[10px] font-bold uppercase text-[#6B7078]">Key Evaluated Competencies:</p>
                  <ul className="text-xs text-[#17181C] space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-[#2E6FF2]">check_circle</span>
                      <span>Algorithmic Complexity (Big O)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-[#2E6FF2]">check_circle</span>
                      <span>React 19 & Concurrent State Engines</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-[#2E6FF2]">check_circle</span>
                      <span>Scalable Microservice & API Contracts</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLaunchTrack('it', 'Frontend Developer')}
                className="mt-6 w-full py-2.5 rounded-xl bg-white hover:bg-[#2E6FF2] text-[#2E6FF2] hover:text-white border border-[#2E6FF2] text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch IT Track</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>

            {/* Management Track Card */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] hover:bg-white hover:border-[#E9D5FF] hover:shadow-lg p-6 sm:p-7 space-y-5 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F0FF] border border-[#E9D5FF] flex items-center justify-center text-[#8B4FE0]">
                    <span className="material-symbols-outlined text-[22px]">strategy</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#EDDCFF] text-[#8B4FE0]">
                    MGMT & PRODUCT
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-[#17181C]">Management & Business</h3>
                  <p className="text-xs text-[#6B7078] leading-relaxed">
                    Product vision, roadmap trade-offs, stakeholder negotiations, unit economics, and team execution.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                  <p className="font-mono text-[10px] font-bold uppercase text-[#6B7078]">High-Yield Specializations:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Product Manager', 'Strategy & Operations', 'Engineering Manager', 'Business Analyst'].map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-white border border-[#E5E7EB] text-[#17181C]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="font-mono text-[10px] font-bold uppercase text-[#6B7078]">Key Evaluated Competencies:</p>
                  <ul className="text-xs text-[#17181C] space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-[#8B4FE0]">check_circle</span>
                      <span>PRD Architecture & User Need Prioritization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-[#8B4FE0]">check_circle</span>
                      <span>Cross-functional Influence Without Authority</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-[#8B4FE0]">check_circle</span>
                      <span>KPI Root-Cause & Churn Mitigation</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLaunchTrack('management', 'Product Manager')}
                className="mt-6 w-full py-2.5 rounded-xl bg-white hover:bg-[#8B4FE0] text-[#8B4FE0] hover:text-white border border-[#8B4FE0] text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Management Track</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>

            {/* Law Track Card */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] hover:bg-white hover:border-[#BAE6FD] hover:shadow-lg p-6 sm:p-7 space-y-5 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#EDFAFC] border border-[#BAE6FD] flex items-center justify-center text-[#0EA5B7]">
                    <span className="material-symbols-outlined text-[22px]">gavel</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#CCF2F6] text-[#0EA5B7]">
                    LAW & GOVERNANCE
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-[#17181C]">Law & Governance</h3>
                  <p className="text-xs text-[#6B7078] leading-relaxed">
                    Contractual risk mitigation, statutory regulatory compliance, intellectual property, and governance defense.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                  <p className="font-mono text-[10px] font-bold uppercase text-[#6B7078]">High-Yield Specializations:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Corporate Counsel', 'Compliance Officer', 'Legal Analyst', 'IP & Contracts Lead'].map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-white border border-[#E5E7EB] text-[#17181C]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="font-mono text-[10px] font-bold uppercase text-[#6B7078]">Key Evaluated Competencies:</p>
                  <ul className="text-xs text-[#17181C] space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-[#0EA5B7]">check_circle</span>
                      <span>Limitation of Liability & Indemnity Caps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-[#0EA5B7]">check_circle</span>
                      <span>GDPR / CCPA / Cross-Border Data Privacy</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-[#0EA5B7]">check_circle</span>
                      <span>Regulatory Enforcement & Due Diligence</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLaunchTrack('law', 'Corporate Counsel')}
                className="mt-6 w-full py-2.5 rounded-xl bg-white hover:bg-[#0EA5B7] text-[#0EA5B7] hover:text-white border border-[#0EA5B7] text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Law Track</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE LIVE ATS AUDIT ENGINE PREVIEW */}
      <section id="ats-scanner" className="py-20 lg:py-28 border-b border-[#E5E7EB] bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-mono text-xs uppercase font-bold text-[#16A34A] tracking-wider">
              Recruiter Filter Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17181C] tracking-tight">
              Deterministic ATS Compatibility Scanner
            </h2>
            <p className="text-sm sm:text-base text-[#6B7078]">
              Over 75% of candidate resumes are filtered out before reaching a human recruiter.
              SmartHire tests your resume against strict heuristic rules so you can pass every parse test.
            </p>
          </div>

          {/* Interactive ATS Widget */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#E5E7EB] pb-4">
              <div>
                <p className="font-mono text-xs font-bold uppercase text-[#6B7078]">
                  Select Sample Dossier to Test:
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setAtsSampleType('it')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      atsSampleType === 'it'
                        ? 'bg-[#2E6FF2] text-white shadow-xs'
                        : 'bg-[#F1F2F4] text-[#6B7078] hover:text-[#17181C]'
                    }`}
                  >
                    IT Engineer Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => setAtsSampleType('mgmt')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      atsSampleType === 'mgmt'
                        ? 'bg-[#8B4FE0] text-white shadow-xs'
                        : 'bg-[#F1F2F4] text-[#6B7078] hover:text-[#17181C]'
                    }`}
                  >
                    Product Manager Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => setAtsSampleType('law')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      atsSampleType === 'law'
                        ? 'bg-[#0EA5B7] text-white shadow-xs'
                        : 'bg-[#F1F2F4] text-[#6B7078] hover:text-[#17181C]'
                    }`}
                  >
                    Legal Counsel Resume
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB]">
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold text-[#16A34A]">{currentAts.score}%</p>
                  <p className="text-[10px] text-[#6B7078] font-mono uppercase">{currentAts.matchGrade}</p>
                </div>
                <span className="material-symbols-outlined text-[32px] text-[#16A34A]">task_alt</span>
              </div>
            </div>

            {/* Result details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase text-[#6B7078] mb-1.5">
                    Analyzed Document
                  </p>
                  <p className="text-sm font-bold text-[#17181C]">{currentAts.title}</p>
                  <p className="text-[#6B7078] mt-1 leading-relaxed">{currentAts.summary}</p>
                </div>

                <div>
                  <p className="font-mono text-[11px] font-bold uppercase text-[#16A34A] mb-1.5">
                    Verified Competency Keywords ({currentAts.matched.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentAts.matched.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] font-mono text-[11px]"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase text-[#F59E0B] mb-1.5">
                    Recommended High-Yield Additions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentAts.missing.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-mono text-[11px]"
                      >
                        + Add "{kw}"
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2">
                  <p className="font-mono text-[11px] font-bold text-[#17181C]">15+ Algorithmic Checks Run:</p>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-[#6B7078]">
                    <span>✓ Reverse Chronology</span>
                    <span>✓ Heading Hierarchy</span>
                    <span>✓ Contact PII Syntax</span>
                    <span>✓ Bullet Metric Densities</span>
                    <span>✓ Typography Safety</span>
                    <span>✓ Zero Multi-column Table Traps</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-[#6B7078]">
                Ready to audit your actual PDF or text resume docket?
              </span>
              <button
                type="button"
                onClick={() => onNavigate('resume')}
                className="px-5 py-2.5 rounded-xl bg-[#17181C] hover:bg-[#2A2B30] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Upload & Audit My Resume</span>
                <span className="material-symbols-outlined text-[14px]">upload_file</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PLATFORM FEATURE BENTO GRID */}
      <section id="features" className="py-20 lg:py-28 border-b border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-mono text-xs uppercase font-bold text-[#8B4FE0] tracking-wider">
              Comprehensive Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17181C] tracking-tight">
              An End-to-End Preparation Engine
            </h2>
            <p className="text-sm sm:text-base text-[#6B7078]">
              Everything you need to calibrate your profile, practice high-friction interview scenarios,
              and walk into your next career opportunity fully prepared.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Dynamic Persona Branching */}
            <div className="md:col-span-2 rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] p-7 sm:p-8 space-y-4 hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-[#F7F0FF] border border-[#E9D5FF] flex items-center justify-center text-[#8B4FE0]">
                <span className="material-symbols-outlined text-[24px]">forum</span>
              </div>
              <h3 className="text-xl font-bold text-[#17181C]">
                Dynamic Persona-Driven Mock Interviews
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7078] leading-relaxed">
                Step beyond static question lists. Our mock examination engine adapts to your responses:
                if you present a sharp, executive-level answer, examiners like Eleanor Hayes and Marcus Vance
                will branch dynamically to probe deeper and test how you handle organizational friction and edge cases.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] text-[#17181C]">
                  • Multiple-Choice Core Knowledge
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] text-[#17181C]">
                  • Verbal Defense & Long Answers
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] text-[#17181C]">
                  • Adaptive Pressure Branching
                </span>
              </div>
            </div>

            {/* Bento Card 2: Structured Resume Studio */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] p-7 sm:p-8 space-y-4 hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-[#F0F4FF] border border-[#BFDBFE] flex items-center justify-center text-[#2E6FF2]">
                <span className="material-symbols-outlined text-[24px]">edit_document</span>
              </div>
              <h3 className="text-xl font-bold text-[#17181C]">Resume Studio & PDF Export</h3>
              <p className="text-xs text-[#6B7078] leading-relaxed">
                Build clean, recruiter-compliant resumes with real-time Markdown sync, autosaving to MongoDB,
                and instant crisp vector PDF downloads formatted to glide through ATS parsers.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('resume_editor')}
                className="text-xs font-semibold text-[#2E6FF2] hover:underline flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>Open Resume Editor</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            {/* Bento Card 3: Deep Telemetry Dossiers */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] p-7 sm:p-8 space-y-4 hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-[#EDFAFC] border border-[#BAE6FD] flex items-center justify-center text-[#0EA5B7]">
                <span className="material-symbols-outlined text-[24px]">analytics</span>
              </div>
              <h3 className="text-xl font-bold text-[#17181C]">Candidate Telemetry Dossiers</h3>
              <p className="text-xs text-[#6B7078] leading-relaxed">
                Every examination session archives complete turn-by-turn rubrics, overall scores, and
                downloadable comprehensive PDF reports to monitor your competency improvements over time.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('session_history')}
                className="text-xs font-semibold text-[#0EA5B7] hover:underline flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>View Session Archive</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            {/* Bento Card 4: Enterprise Dual SQL + NoSQL Architecture */}
            <div className="md:col-span-2 rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] p-7 sm:p-8 space-y-4 hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#16A34A]">
                <span className="material-symbols-outlined text-[24px]">database</span>
              </div>
              <h3 className="text-xl font-bold text-[#17181C]">
                Dual Database Architecture (SQLite + MongoDB)
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7078] leading-relaxed">
                Engineered for speed, resilience, and document flexibility. User accounts, scoring archives,
                and session metadata reside in ACID-compliant relational SQL tables, while unstructured resume
                dockets, rich rubric synopses, and question banks leverage flexible document collections.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-[#6B7078] pt-1">
                <span>• SQLite Relational Core</span>
                <span>• MongoDB Document Store</span>
                <span>• Resilient mongomock Fallback</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS 3-STEP WALKTHROUGH */}
      <section id="how-it-works" className="py-20 lg:py-28 border-b border-[#E5E7EB] bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-mono text-xs uppercase font-bold text-[#2E6FF2] tracking-wider">
              Execution Roadmap
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17181C] tracking-tight">
              Three Steps to Interview Readiness
            </h2>
            <p className="text-sm sm:text-base text-[#6B7078]">
              A structured workflow designed to build muscle memory and identify skill gaps rapidly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-7 border border-[#E5E7EB] shadow-xs space-y-4 relative">
              <span className="font-mono text-4xl font-black text-[#E5E7EB]">01</span>
              <h3 className="text-lg font-bold text-[#17181C]">Calibrate Discipline & Role</h3>
              <p className="text-xs text-[#6B7078] leading-relaxed">
                Select from IT Systems, Management, or Law. Choose your target role or customize a specialized
                title to ensure questions and rubrics align precisely with the industry benchmarks you face.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-7 border border-[#E5E7EB] shadow-xs space-y-4 relative">
              <span className="font-mono text-4xl font-black text-[#E5E7EB]">02</span>
              <h3 className="text-lg font-bold text-[#17181C]">Audit & Refine Your Resume</h3>
              <p className="text-xs text-[#6B7078] leading-relaxed">
                Upload your existing PDF or compose a new resume in the built-in Studio. Run the deterministic
                heuristic ATS checker to identify keyword deficiencies and ensure parser-safe formatting.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-7 border border-[#E5E7EB] shadow-xs space-y-4 relative">
              <span className="font-mono text-4xl font-black text-[#E5E7EB]">03</span>
              <h3 className="text-lg font-bold text-[#17181C]">Simulate, Defend & Review</h3>
              <p className="text-xs text-[#6B7078] leading-relaxed">
                Launch standard timed MCQs or dynamic mock persona interviews. Receive real-time examiner remarks,
                review dimension rubrics, and download a performance report dossier to benchmark your progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. COMPARISON TABLE: SMARTHIRE VS GENERIC CHATBOTS */}
      <section className="py-20 lg:py-28 border-b border-[#E5E7EB] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-mono text-xs uppercase font-bold text-[#17181C] tracking-wider">
              The SmartHire Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17181C] tracking-tight">
              Why SmartHire Outperforms Generic AI Prompts
            </h2>
            <p className="text-sm text-[#6B7078]">
              Generic chat models lack domain rubrics, deterministic ATS filters, and structured telemetry.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[#17181C] font-mono uppercase text-[11px]">
                  <th className="p-4 sm:p-5">Capability Dimension</th>
                  <th className="p-4 sm:p-5 text-[#2E6FF2] bg-[#F0F4FF]/60 font-bold">
                    SmartHire Prep Platform
                  </th>
                  <th className="p-4 sm:p-5 text-[#6B7078]">Generic AI Chatbots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[#17181C]">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Discipline-Specific Rubrics</td>
                  <td className="p-4 sm:p-5 bg-[#F0F4FF]/30 font-semibold text-[#16A34A] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>IT, Management, and Law calibrated scoring</span>
                  </td>
                  <td className="p-4 sm:p-5 text-[#6B7078]">Generic one-size-fits-all responses</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Deterministic ATS Checker</td>
                  <td className="p-4 sm:p-5 bg-[#F0F4FF]/30 font-semibold text-[#16A34A] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>15+ algorithmic formatting & keyword tests</span>
                  </td>
                  <td className="p-4 sm:p-5 text-[#6B7078]">No parsing rules; hallucinated advice</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Adaptive Examiner Branching</td>
                  <td className="p-4 sm:p-5 bg-[#F0F4FF]/30 font-semibold text-[#16A34A] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Personas probe friction based on answers</span>
                  </td>
                  <td className="p-4 sm:p-5 text-[#6B7078]">Static text output with no memory</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Publication-Ready Vector PDF</td>
                  <td className="p-4 sm:p-5 bg-[#F0F4FF]/30 font-semibold text-[#16A34A] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Instant downloadable PDF resumes & reports</span>
                  </td>
                  <td className="p-4 sm:p-5 text-[#6B7078]">Raw markdown text with manual copy/paste</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Long-Term Session Telemetry</td>
                  <td className="p-4 sm:p-5 bg-[#F0F4FF]/30 font-semibold text-[#16A34A] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>SQL archived performance records & trends</span>
                  </td>
                  <td className="p-4 sm:p-5 text-[#6B7078]">Lost once browser tab is closed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. BOTTOM HIGH-CONVERSION CTA BANNER */}
      <section className="py-20 lg:py-28 bg-[#17181C] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#2E6FF2_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono font-medium">
            <span>Enterprise-Grade Candidate Calibration</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Ready to Accelerate Your Career Trajectory?
          </h2>

          <p className="text-sm sm:text-base text-[#9CA3AF] max-w-xl mx-auto leading-relaxed">
            Join candidates using SmartHire to simulate rigorous interviews, optimize resumes for ATS bots,
            and walk into negotiations with verifiable confidence.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('field_select')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-[#F1F2F4] text-[#17181C] text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Practice Free</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>Candidate Sign In</span>
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-white border-t border-[#E5E7EB] py-12 text-xs text-[#6B7078]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <BrandWordmark
              subtitle="Career Intelligence Suite"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
            <p className="text-[11px] text-[#9CA3AF] text-center md:text-left">
              Dual SQLite Relational + MongoDB Document Architecture for high-precision career readiness.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-[#17181C]">
            <a
              href="#tracks"
              className="hover:text-[#2E6FF2] transition-colors"
            >
              Career Tracks
            </a>
            <a
              href="#features"
              className="hover:text-[#2E6FF2] transition-colors"
            >
              Features
            </a>
            <a
              href="#ats-scanner"
              className="hover:text-[#2E6FF2] transition-colors"
            >
              ATS Scanner
            </a>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="hover:text-[#2E6FF2] transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[#16A34A] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
            <span>All Systems Operational (v2.4)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
