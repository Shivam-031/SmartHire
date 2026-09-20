import React from 'react';
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
    { id: 'ats_check' as DocketStep, num: '05', label: 'ATS Compatibility', enabled: canNavigateToATS },
    { id: 'completed' as DocketStep, num: '06', label: 'Dossier Summary', enabled: canNavigateToSummary },
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
        return 'Account & Authentication / Candidate Sign In & Profile Provisioning';
      case 'profile':
        return 'Candidate Profile / Career Track Calibration & Dossier Records';
      case 'field_select':
        return 'Sheet No. 01 / Target Career Discipline';
      case 'role_select':
        return 'Sheet No. 02 / Role Specification & Rubric Calibration';
      case 'resume':
        return 'Sheet No. 03 / Candidate Resume Dossier';
      case 'resume_editor':
        return 'Sheet No. 03 / Structured In-App Resume Editor';
      case 'template_picker':
        return 'Sheet No. 03 / PDF Export Template Picker';
      case 'interview':
        return 'Sheet No. 04 / Structured Examination (Standard & Mock)';
      case 'ats_check':
        return 'Sheet No. 05 / ATS Compatibility & Keyword Audit';
      case 'summary':
      case 'completed':
      case 'session_history':
      case 'session_detail':
        return 'Sheet No. 06 / Evaluator Dossier & Performance Record';
      default:
        return 'Candidate Intake Docket';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0EA] text-[#1A2E22] antialiased selection:bg-[#2F6F4E] selection:text-white">
      {/* Top Header Docket Strip */}
      <header className="w-full bg-[#EEF0EA] hairline-b text-xs text-[#5C6B60] px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium text-[#1A2E22]">
            <svg className="w-3.5 h-3.5 text-[#2F6F4E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Candidate Intake Docket
          </span>
          <span className="text-[#D2D5C9]">|</span>
          <span>{getSheetSubtitle()}</span>
          <span className="text-[#D2D5C9]">|</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F6F4E]" />
            Track: <strong className="text-[#1A2E22] font-medium ml-1 uppercase">{targetField} · {targetRole}</strong>
          </span>
        </div>

        {/* User Auth / Profile Badge */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-white border border-[#D2D5C9] hover:border-[#2F6F4E] transition-colors text-xs cursor-pointer shadow-2xs"
              title="Open Candidate Profile View"
            >
              <div className="w-4 h-4 rounded-full bg-[#2F6F4E] text-white flex items-center justify-center font-bold text-[9px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[#1A2E22] font-medium">{user.name}</span>
              <span className="text-[10px] text-[#5C6B60] font-score-mono">Profile &rarr;</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-3 py-1 rounded bg-white hover:bg-[#EAECE6] border border-[#D2D5C9] text-xs font-medium text-[#1A2E22] transition-colors cursor-pointer"
              title="Open Authentication View"
            >
              Sign In / Account
            </button>
          )}

          <span className="text-[#D2D5C9]">|</span>
          <span className="text-[#5C6B60] hidden sm:inline">Rev. 2.4.1</span>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#EEF0EA] hairline-r flex flex-col justify-between p-5 select-none shrink-0">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 hairline-b">
              <BrandWordmark />
              <span className="text-[11px] font-score-mono bg-white px-2 py-0.5 rounded border border-[#D2D5C9] text-[#5C6B60]">
                v2.4
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-score-mono text-[#5C6B60] mb-2 tracking-wider font-semibold">
                DOCKET WORKFLOW
              </div>

              {tabs.map((tab) => {
                const active = currentStep === tab.id || (tab.id === 'completed' && (currentStep === 'session_history' || currentStep === 'session_detail'));
                const completed = isCompleted(tab.id);

                return (
                  <button
                    key={tab.id}
                    disabled={!tab.enabled}
                    onClick={() => tab.enabled && onNavigate(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-all text-left ${
                      active
                        ? 'bg-white text-[#2F6F4E] border border-[#D2D5C9] shadow-[0_1px_3px_rgba(26,46,34,0.06)]'
                        : tab.enabled
                        ? 'text-[#1A2E22] hover:bg-[#E3E8DF]'
                        : 'text-[#8A968E] opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {completed ? (
                        <span className="w-4 h-4 rounded-full bg-white border border-[#2F6F4E] flex items-center justify-center text-[#2F6F4E]">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : (
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            active
                              ? 'border-[#2F6F4E] text-[#2F6F4E]'
                              : 'border-[#D2D5C9] text-[#5C6B60]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#2F6F4E]' : 'bg-[#D2D5C9]'}`} />
                        </span>
                      )}
                      <span className={active ? 'font-semibold text-[#1A2E22]' : ''}>{tab.label}</span>
                    </span>
                    <span className="font-score-mono text-[11px] text-[#5C6B60]">{tab.num}</span>
                  </button>
                );
              })}
            </div>

            {/* Dedicated Screen Shortcuts */}
            <div className="mt-5 pt-3 border-t border-[#D2D5C9]/70 space-y-1">
              <div className="text-[10px] font-score-mono text-[#5C6B60] mb-2 tracking-wider font-semibold">
                SCREEN SHORTCUTS
              </div>
              <button
                onClick={() => onNavigate('resume_editor')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                  currentStep === 'resume_editor'
                    ? 'bg-white text-[#2F6F4E] font-semibold border border-[#D2D5C9]'
                    : 'text-[#5C6B60] hover:text-[#1A2E22] hover:bg-[#E3E8DF]'
                }`}
              >
                <span>Resume Editor</span>
                <span className="text-[10px] font-score-mono">03A</span>
              </button>
              <button
                onClick={() => onNavigate('template_picker')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                  currentStep === 'template_picker'
                    ? 'bg-white text-[#2F6F4E] font-semibold border border-[#D2D5C9]'
                    : 'text-[#5C6B60] hover:text-[#1A2E22] hover:bg-[#E3E8DF]'
                }`}
              >
                <span>Template Picker</span>
                <span className="text-[10px] font-score-mono">03B</span>
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                  currentStep === 'profile'
                    ? 'bg-white text-[#2F6F4E] font-semibold border border-[#D2D5C9]'
                    : 'text-[#5C6B60] hover:text-[#1A2E22] hover:bg-[#E3E8DF]'
                }`}
              >
                <span>Candidate Profile</span>
                <span className="text-[10px] font-score-mono">USER</span>
              </button>
              <button
                onClick={() => onNavigate('login')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                  currentStep === 'login' || currentStep === 'signup'
                    ? 'bg-white text-[#2F6F4E] font-semibold border border-[#D2D5C9]'
                    : 'text-[#5C6B60] hover:text-[#1A2E22] hover:bg-[#E3E8DF]'
                }`}
              >
                <span>Auth & Access</span>
                <span className="text-[10px] font-score-mono">AUTH</span>
              </button>
            </div>
          </div>

          {/* Bottom Sidebar Reference / Session History Link */}
          <div className="mt-6 pt-3 hairline-t">
            <button
              onClick={() => onNavigate('session_history')}
              className={`w-full flex items-center justify-between text-xs py-2 px-2 rounded transition-colors ${
                currentStep === 'session_history'
                  ? 'bg-white text-[#2F6F4E] font-semibold border border-[#D2D5C9]'
                  : 'text-[#5C6B60] hover:text-[#1A2E22] hover:bg-[#E3E8DF]'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#5C6B60]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Session History Log
              </span>
              <span className="text-[10px] font-score-mono">&rarr;</span>
            </button>

            <div className="mt-3 p-3 bg-white rounded border border-[#D2D5C9] text-[11px] text-[#5C6B60] leading-relaxed">
              <span className="font-medium text-[#1A2E22] block mb-0.5">Dual Database Active</span>
              SQL relational records alongside MongoDB document collections with zero external LLM dependencies.
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 bg-[#EEF0EA] p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-[1240px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocketLayout;
