import React from 'react';
import BrandWordmark from './BrandWordmark';

export type DocketStep = 'role_select' | 'upload' | 'interview' | 'ats_check' | 'completed' | 'session_history' | 'session_detail';

interface DocketLayoutProps {
  currentStep: DocketStep;
  targetRole?: string;
  onNavigate: (step: DocketStep) => void;
  canNavigateToRole?: boolean;
  canNavigateToResume?: boolean;
  canNavigateToInterview?: boolean;
  canNavigateToATS?: boolean;
  canNavigateToSummary?: boolean;
  children: React.ReactNode;
}

export const DocketLayout = ({
  currentStep,
  targetRole = 'Frontend Developer',
  onNavigate,
  canNavigateToRole = true,
  canNavigateToResume = true,
  canNavigateToInterview = false,
  canNavigateToATS = false,
  canNavigateToSummary = false,
  children,
}: DocketLayoutProps) => {

  const tabs = [
    { id: 'role_select' as DocketStep, num: '01', label: 'Target Role', enabled: canNavigateToRole },
    { id: 'upload' as DocketStep, num: '02', label: 'Candidate Resume', enabled: canNavigateToResume },
    { id: 'interview' as DocketStep, num: '03', label: 'Interview Practice', enabled: canNavigateToInterview },
    { id: 'ats_check' as DocketStep, num: '04', label: 'ATS Evaluation', enabled: canNavigateToATS },
    { id: 'completed' as DocketStep, num: '05', label: 'Final Assessment', enabled: canNavigateToSummary },
  ];

  // Helper to determine if a step is "completed"
  const isCompleted = (tabId: DocketStep) => {
    const order: DocketStep[] = ['role_select', 'upload', 'interview', 'ats_check', 'completed'];
    const currentIndex = order.indexOf(currentStep);
    const tabIndex = order.indexOf(tabId);
    return currentIndex > tabIndex;
  };

  const getSheetSubtitle = () => {
    switch (currentStep) {
      case 'role_select':
        return 'Sheet No. 01 / Target Role Selection';
      case 'upload':
        return 'Sheet No. 02 / Document Intake';
      case 'interview':
        return 'Sheet No. 03 / Structured Oral Examination';
      case 'ats_check':
        return 'Sheet No. 04 / ATS Compatibility Audit';
      case 'completed':
      case 'session_history':
      case 'session_detail':
        return 'Sheet No. 05 / Evaluator Dossier & Performance Rubric';
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
            Target Track: <strong className="text-[#1A2E22] font-medium ml-1">{targetRole}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-4 text-[#5C6B60]">
          <span>Protocol Rev. 2.4.1</span>
          <span className="text-[#D2D5C9]">|</span>
          <span>System Status: <span className="text-[#2F6F4E] font-medium">Online</span></span>
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
                DOCKET SECTIONS
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
          </div>

          {/* Bottom Sidebar Reference / Session History Link */}
          <div className="mt-8 pt-4 hairline-t">
            <button
              onClick={() => onNavigate('session_history')}
              className="w-full flex items-center justify-between text-xs text-[#5C6B60] hover:text-[#1A2E22] py-2 px-2 rounded hover:bg-[#E3E8DF] transition-colors"
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
              <span className="font-medium text-[#1A2E22] block mb-0.5">Evaluation Mode</span>
              Standard technical interview rubric with real-time heuristic parsing.
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

