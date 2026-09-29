import React, { useState } from 'react';
import BrandWordmark from './BrandWordmark';
import { useAuth } from '../context/AuthContext';

export type DocketStep =
  | 'landing'
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

interface AppLayoutProps {
  currentStep: DocketStep;
  targetField?: string;
  targetRole?: string;
  onNavigate: (step: DocketStep) => void;
  onFieldChange?: (field: string) => void;
  canNavigateToField?: boolean;
  canNavigateToRole?: boolean;
  canNavigateToResume?: boolean;
  canNavigateToInterview?: boolean;
  canNavigateToATS?: boolean;
  canNavigateToSummary?: boolean;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentStep,
  targetField = 'it',
  targetRole = 'Frontend Developer',
  onNavigate,
  onFieldChange,
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [trackDropdownOpen, setTrackDropdownOpen] = useState(false);

  // Persistent hideable sidebar state across all pages
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smarthire_sidebar_open');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Persist preference to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('smarthire_sidebar_open', String(sidebarOpen));
    } catch (_) {}
  }, [sidebarOpen]);

  // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar anywhere
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && !(e.target as HTMLElement)?.isContentEditable) {
          e.preventDefault();
          setSidebarOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (step: DocketStep) => {
    onNavigate(step);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const getDomainConfig = () => {
    switch (targetField) {
      case 'management':
        return {
          title: 'Management & Leadership',
          tag: 'MGMT',
          color: '#8B4FE0',
          bgLight: '#EDDCFF',
          bgSurface: '#F7F0FF',
          textClass: 'text-[#8B4FE0]',
          bgClass: 'bg-[#8B4FE0]',
          borderClass: 'border-[#8B4FE0]',
        };
      case 'law':
        return {
          title: 'Law & Governance',
          tag: 'LAW',
          color: '#0EA5B7',
          bgLight: '#CCF2F6',
          bgSurface: '#EDFAFC',
          textClass: 'text-[#0EA5B7]',
          bgClass: 'bg-[#0EA5B7]',
          borderClass: 'border-[#0EA5B7]',
        };
      case 'it':
      default:
        return {
          title: 'IT Systems',
          tag: 'IT',
          color: '#2E6FF2',
          bgLight: '#DAE2FF',
          bgSurface: '#F0F4FF',
          textClass: 'text-[#2E6FF2]',
          bgClass: 'bg-[#2E6FF2]',
          borderClass: 'border-[#2E6FF2]',
        };
    }
  };

  const domain = getDomainConfig();

  const handleTrackSelect = (field: string) => {
    setTrackDropdownOpen(false);
    if (onFieldChange) onFieldChange(field);
  };

  const isStepActive = (steps: DocketStep[]) => steps.includes(currentStep);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#17181C] font-sans antialiased">
      {/* Fixed Top Header (h-16) */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-[#E5E7EB] shadow-[0_1px_8px_rgba(0,0,0,0.03)] px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle, Brand & Track Indicator */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="p-2 -ml-1 rounded-lg text-[#6B7078] hover:text-[#17181C] hover:bg-[#F1F2F4] active:bg-[#E5E7EB] transition-colors cursor-pointer flex items-center justify-center group"
            title={sidebarOpen ? "Hide sidebar (Ctrl+B)" : "Show sidebar (Ctrl+B)"}
            aria-label="Toggle navigation sidebar"
          >
            <span className="material-symbols-outlined text-[22px] transition-transform duration-200 group-hover:scale-105">
              {sidebarOpen ? 'menu_open' : 'menu'}
            </span>
          </button>

          <BrandWordmark onClick={() => onNavigate('landing')} />

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-[#E5E7EB] bg-[#F8F9FA]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color }}></span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#17181C]">
              Track: {domain.title}
            </span>
            <span className="text-[#9CA3AF] text-xs font-mono">• {targetRole}</span>
          </div>
        </div>

        {/* Center: Primary Navigation Tabs (Desktop) */}
        <nav className="hidden xl:flex items-center gap-1.5 p-1 rounded-lg bg-[#F1F2F4] text-xs font-medium">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              currentStep === 'landing'
                ? 'bg-white text-[#17181C] font-semibold shadow-xs'
                : 'text-[#6B7078] hover:text-[#17181C]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('field_select')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              isStepActive(['field_select', 'role_select'])
                ? 'bg-white text-[#17181C] font-semibold shadow-xs'
                : 'text-[#6B7078] hover:text-[#17181C]'
            }`}
          >
            Track Setup
          </button>
          <button
            onClick={() => onNavigate('resume')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              isStepActive(['resume', 'resume_editor', 'template_picker'])
                ? 'bg-white text-[#17181C] font-semibold shadow-xs'
                : 'text-[#6B7078] hover:text-[#17181C]'
            }`}
          >
            Resume Dossier
          </button>
          <button
            onClick={() => onNavigate('interview')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              isStepActive(['interview'])
                ? 'bg-white text-[#17181C] font-semibold shadow-xs'
                : 'text-[#6B7078] hover:text-[#17181C]'
            }`}
          >
            Mock Interview
          </button>
          <button
            onClick={() => onNavigate('ats_check')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              isStepActive(['ats_check'])
                ? 'bg-white text-[#17181C] font-semibold shadow-xs'
                : 'text-[#6B7078] hover:text-[#17181C]'
            }`}
          >
            ATS Diagnostics
          </button>
          <button
            onClick={() => onNavigate('completed')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              isStepActive(['summary', 'completed', 'session_history', 'session_detail'])
                ? 'bg-white text-[#17181C] font-semibold shadow-xs'
                : 'text-[#6B7078] hover:text-[#17181C]'
            }`}
          >
            Performance Overview
          </button>
        </nav>

        {/* Right: Quick Tools & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Domain Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setTrackDropdownOpen(!trackDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F8F9FA] text-xs font-mono font-bold transition-colors cursor-pointer"
              title="Switch Target Track"
            >
              <span style={{ color: domain.color }}>{domain.tag}</span>
              <span className="material-symbols-outlined text-[16px] text-[#6B7078]">expand_more</span>
            </button>

            {trackDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-1.5 z-50 space-y-1 text-xs">
                <button
                  onClick={() => handleTrackSelect('it')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F0F4FF] text-left transition-colors cursor-pointer"
                >
                  <span className="font-medium text-[#17181C]">Information Technology</span>
                  <span className="font-mono text-[10px] font-bold text-[#2E6FF2] bg-[#DAE2FF] px-1.5 py-0.5 rounded">IT</span>
                </button>
                <button
                  onClick={() => handleTrackSelect('management')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F7F0FF] text-left transition-colors cursor-pointer"
                >
                  <span className="font-medium text-[#17181C]">Management & Leadership</span>
                  <span className="font-mono text-[10px] font-bold text-[#8B4FE0] bg-[#EDDCFF] px-1.5 py-0.5 rounded">MGMT</span>
                </button>
                <button
                  onClick={() => handleTrackSelect('law')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EDFAFC] text-left transition-colors cursor-pointer"
                >
                  <span className="font-medium text-[#17181C]">Law & Governance</span>
                  <span className="font-mono text-[10px] font-bold text-[#0EA5B7] bg-[#CCF2F6] px-1.5 py-0.5 rounded">LAW</span>
                </button>
              </div>
            )}
          </div>


          <div className="h-6 w-[1px] bg-[#E5E7EB] hidden sm:block"></div>

          {/* User Account / Profile */}
          {isAuthenticated && user ? (
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-[#F8F9FA] border border-transparent hover:border-[#E5E7EB] transition-colors cursor-pointer"
              title="View Candidate Profile"
            >
              <div className="w-8 h-8 rounded-full bg-[#2E6FF2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="font-semibold text-xs text-[#17181C] leading-none">{user.name}</span>
                <span className="font-mono text-[10px] text-[#6B7078] leading-tight mt-0.5">{targetRole}</span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 rounded-lg bg-[#17181C] hover:bg-[#2A2B30] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Mobile Backdrop Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 top-16 bg-black/40 backdrop-blur-xs z-30 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Main Container with Collapsible Left Rail */}
      <div className="flex-1 flex w-full relative">
        {/* Left Execution Workspace Rail (Collapsible, Fixed, w-64) */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-[#E5E7EB] z-40 flex flex-col justify-between p-4 select-none transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0 shadow-xl lg:shadow-none' : '-translate-x-full'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between px-3 py-1">
              <span className="font-mono text-[11px] text-[#6B7078] uppercase tracking-wider font-bold">
                Execution Workspace
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-[#9CA3AF] hover:text-[#17181C] hover:bg-[#F1F2F4] transition-colors cursor-pointer"
                title="Collapse sidebar (Ctrl+B)"
                aria-label="Collapse sidebar"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
            </div>

            <nav className="flex flex-col gap-1 text-xs font-medium">
              <button
                onClick={() => handleNavClick('completed')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left cursor-pointer ${
                  isStepActive(['completed', 'summary'])
                    ? 'bg-[#2E6FF2] text-white font-semibold shadow-xs'
                    : 'text-[#6B7078] hover:bg-[#F8F9FA] hover:text-[#17181C]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">space_dashboard</span>
                <span>Performance Overview</span>
              </button>

              <button
                onClick={() => handleNavClick('interview')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left cursor-pointer ${
                  isStepActive(['interview'])
                    ? 'bg-[#2E6FF2] text-white font-semibold shadow-xs'
                    : 'text-[#6B7078] hover:bg-[#F8F9FA] hover:text-[#17181C]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">quiz</span>
                <span>Drill Modules</span>
              </button>

              <button
                onClick={() => handleNavClick('interview')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#6B7078] hover:bg-[#F8F9FA] hover:text-[#17181C] transition-colors text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
                <span>Simulated Sessions</span>
              </button>

              <button
                onClick={() => handleNavClick('ats_check')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left cursor-pointer ${
                  isStepActive(['ats_check'])
                    ? 'bg-[#2E6FF2] text-white font-semibold shadow-xs'
                    : 'text-[#6B7078] hover:bg-[#F8F9FA] hover:text-[#17181C]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">document_scanner</span>
                <span>Resume Telemetry</span>
              </button>

              <button
                onClick={() => handleNavClick('resume')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left cursor-pointer ${
                  isStepActive(['resume', 'resume_editor', 'template_picker'])
                    ? 'bg-[#2E6FF2] text-white font-semibold shadow-xs'
                    : 'text-[#6B7078] hover:bg-[#F8F9FA] hover:text-[#17181C]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">description</span>
                <span>Resume Dossier</span>
              </button>

              <button
                onClick={() => handleNavClick('session_history')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left cursor-pointer ${
                  isStepActive(['session_history'])
                    ? 'bg-[#2E6FF2] text-white font-semibold shadow-xs'
                    : 'text-[#6B7078] hover:bg-[#F8F9FA] hover:text-[#17181C]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">history</span>
                <span>Session History</span>
              </button>
            </nav>
          </div>

          {/* Bottom Rail Section: Readiness Index & Track Config */}
          <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
            {/* Readiness Index Meter */}
            <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#17181C] font-semibold uppercase">Readiness Index</span>
                <span className="font-mono text-xs font-bold" style={{ color: domain.color }}>84%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: '84%', backgroundColor: domain.color }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#6B7078]">
                <span>Target: L4 Benchmark</span>
                <span>Passing</span>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('field_select')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#6B7078] hover:bg-[#F8F9FA] hover:text-[#17181C] transition-colors text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Track Configuration</span>
            </button>
          </div>
        </aside>

        {/* Floating Quick-Open Tab when sidebar is collapsed */}
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="hidden lg:flex fixed left-0 top-20 z-30 items-center gap-1 py-1.5 px-2 bg-white hover:bg-[#F8F9FA] border border-l-0 border-[#E5E7EB] rounded-r-lg shadow-sm text-[#6B7078] hover:text-[#17181C] transition-all cursor-pointer group"
            title="Open sidebar (Ctrl+B)"
            aria-label="Open sidebar"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform text-[#2E6FF2]">
              chevron_right
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#6B7078]">
              Menu
            </span>
          </button>
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 w-full pt-16 min-h-screen bg-[#F8F9FA] flex flex-col transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'lg:pl-64' : 'pl-0'
          }`}
        >
          <div className="w-full max-w-7xl mx-auto p-4 sm:p-8 lg:p-10 flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

