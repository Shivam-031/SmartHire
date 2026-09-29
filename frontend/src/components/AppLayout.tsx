import React, { useState, useEffect } from 'react';
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
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [trackDropdownOpen, setTrackDropdownOpen] = useState(false);

  // Global hotkey Ctrl+B / Cmd+B to toggle sidebar anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getDomainConfig = () => {
    switch (targetField) {
      case 'management':
        return {
          title: 'Management & Strategy',
          tag: 'MGMT',
          gradient: 'from-[#8b5cf6] to-[#ec4899]',
          glowColor: 'rgba(139, 92, 246, 0.4)',
          textColor: '#c084fc',
          accentColor: '#8b5cf6',
          icon: 'groups',
        };
      case 'law':
        return {
          title: 'Law & Governance',
          tag: 'LAW',
          gradient: 'from-[#0EA5B7] to-[#10b981]',
          glowColor: 'rgba(14, 165, 183, 0.4)',
          textColor: '#22d3ee',
          accentColor: '#0EA5B7',
          icon: 'gavel',
        };
      case 'it':
      default:
        return {
          title: 'IT & Software',
          tag: 'IT',
          gradient: 'from-[#3b82f6] to-[#22d3ee]',
          glowColor: 'rgba(59, 130, 246, 0.4)',
          textColor: '#60a5fa',
          accentColor: '#3b82f6',
          icon: 'code',
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
    <div className="min-h-screen bg-[#030303] text-[#e5e2e1] font-sans antialiased selection:bg-[#7c3aed]/30 selection:text-white relative overflow-x-hidden flex flex-col">
      {/* Stitch Ambient Refraction Flares */}
      <div className="fixed top-[-100px] left-[15%] w-[600px] h-[600px] rounded-full bg-[#7c3aed]/10 blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-[40%] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#06b6d4]/10 blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-150px] left-[30%] w-[550px] h-[550px] rounded-full bg-[#3b82f6]/10 blur-[140px] pointer-events-none z-0" />

      {/* Stitch Fixed Top Dock Header (Strict h-16 / 64px) */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 min-h-[64px] max-h-[64px] bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 flex-nowrap overflow-hidden">
        {/* Left: Brand Logo & Sidebar Toggle & Track Indicator */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 min-w-0">
          {/* Hideable Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#a1a1aa] hover:text-white transition-all cursor-pointer flex items-center justify-center group shrink-0"
            title={sidebarOpen ? 'Hide sidebar (Ctrl+B)' : 'Show sidebar (Ctrl+B)'}
            aria-label="Toggle navigation sidebar"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:scale-110">
              {sidebarOpen ? 'menu_open' : 'menu'}
            </span>
          </button>

          {/* SmartHire Logo Mark */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
            title="Return to Landing Overview"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] p-[1px] shadow-[0_0_15px_rgba(124,58,237,0.35)] shrink-0">
              <div className="w-full h-full bg-[#09090b] rounded-[11px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <svg className="w-4 h-4 text-[#c084fc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-white/95">SmartHire</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#c084fc] border border-[#7c3aed]/30 font-mono">
                PREP
              </span>
            </div>
          </div>

          {/* Active Target Track Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md whitespace-nowrap shrink-0 h-7 max-h-7 leading-none">
            <span
              className="w-2 h-2 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: domain.accentColor, boxShadow: `0 0 8px ${domain.glowColor}` }}
            />
            <span className="font-mono text-xs font-semibold text-white/90 whitespace-nowrap">
              {domain.title}
            </span>
            <span className="text-[#71717a] text-xs font-mono whitespace-nowrap truncate max-w-[140px] xl:max-w-[180px]">
              • {targetRole}
            </span>
          </div>
        </div>

        {/* Center: Stage Progress Tracker Pill (Desktop) */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] text-xs font-medium text-[#a1a1aa] whitespace-nowrap shrink-0 h-8 max-h-8">
          <button
            type="button"
            onClick={() => onNavigate('field_select')}
            className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              isStepActive(['field_select'])
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white font-semibold shadow-xs'
                : 'hover:text-white'
            }`}
          >
            01 Field
          </button>
          <span className="text-white/20">/</span>
          <button
            type="button"
            onClick={() => onNavigate('role_select')}
            className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              isStepActive(['role_select'])
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white font-semibold shadow-xs'
                : 'hover:text-white'
            }`}
          >
            02 Role
          </button>
          <span className="text-white/20">/</span>
          <button
            type="button"
            onClick={() => onNavigate('resume')}
            className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              isStepActive(['resume', 'resume_editor', 'template_picker'])
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white font-semibold shadow-xs'
                : 'hover:text-white'
            }`}
          >
            03 Resume
          </button>
          <span className="text-white/20">/</span>
          <button
            type="button"
            onClick={() => onNavigate('interview')}
            className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              isStepActive(['interview'])
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white font-semibold shadow-xs'
                : 'hover:text-white'
            }`}
          >
            04 Interview
          </button>
          <span className="text-white/20">/</span>
          <button
            type="button"
            onClick={() => onNavigate('ats_check')}
            className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              isStepActive(['ats_check'])
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white font-semibold shadow-xs'
                : 'hover:text-white'
            }`}
          >
            05 ATS Scan
          </button>
          <span className="text-white/20">/</span>
          <button
            type="button"
            onClick={() => onNavigate('completed')}
            className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              isStepActive(['summary', 'completed', 'session_history', 'session_detail'])
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white font-semibold shadow-xs'
                : 'hover:text-white'
            }`}
          >
            06 Summary
          </button>
        </div>

        {/* Right: Quick Track Switcher & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Domain Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setTrackDropdownOpen(!trackDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs font-mono font-bold transition-all cursor-pointer text-white/90"
              title="Switch Target Track"
            >
              <span style={{ color: domain.textColor }}>{domain.tag}</span>
              <span className="material-symbols-outlined text-[16px] text-[#71717a]">expand_more</span>
            </button>

            {trackDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#141313] border border-white/[0.1] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] p-2 z-50 space-y-1 text-xs backdrop-blur-2xl">
                <button
                  type="button"
                  onClick={() => handleTrackSelect('it')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.06] text-left transition-colors cursor-pointer text-white"
                >
                  <span className="font-medium">IT & Software</span>
                  <span className="font-mono text-[10px] font-bold text-[#60a5fa] bg-[#3b82f6]/20 px-2 py-0.5 rounded-full">
                    IT
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTrackSelect('management')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.06] text-left transition-colors cursor-pointer text-white"
                >
                  <span className="font-medium">Management & Leadership</span>
                  <span className="font-mono text-[10px] font-bold text-[#c084fc] bg-[#8b5cf6]/20 px-2 py-0.5 rounded-full">
                    MGMT
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTrackSelect('law')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.06] text-left transition-colors cursor-pointer text-white"
                >
                  <span className="font-medium">Law & Corporate</span>
                  <span className="font-mono text-[10px] font-bold text-[#22d3ee] bg-[#0EA5B7]/20 px-2 py-0.5 rounded-full">
                    LAW
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Landing Return Button */}
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs font-medium text-[#a1a1aa] hover:text-white transition-all cursor-pointer"
            title="Return to Landing Page"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Home</span>
          </button>

          <div className="h-5 w-[1px] bg-white/[0.1] hidden sm:block" />

          {/* User Account / Profile */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-colors cursor-pointer"
                title="View Candidate Dossier"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] text-white flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="font-semibold text-xs text-white leading-none">{user.name}</span>
                  <span className="font-mono text-[10px] text-[#71717a] leading-tight mt-0.5 truncate max-w-[100px]">
                    {targetRole}
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs text-[#71717a] hover:text-white transition-colors p-1.5 cursor-pointer"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.3)]"
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
          className="lg:hidden fixed inset-0 top-16 bg-black/60 backdrop-blur-xs z-30 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Main Body Layout with Collapsible Liquid Glass Left Rail */}
      <div className="flex-1 flex w-full relative pt-16">
        {/* Left Preparation Pipeline Rail (Stitch Liquid Glass Dock - Collapsible) */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-64 bg-[#09090b]/90 backdrop-blur-2xl border-r border-white/[0.08] z-40 flex flex-col justify-between p-4 select-none shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-4">
            {/* Rail Header with Collapse Button */}
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#7c3aed] text-[18px]">insights</span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa]">
                  Pipeline Navigator
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg text-[#71717a] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Collapse sidebar (Ctrl+B)"
                aria-label="Collapse sidebar"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
            </div>

            {/* Preparation Pipeline Steps (Stitch Style with Connected Line) */}
            <nav className="flex flex-col gap-1 text-xs font-medium relative">
              {/* Step 01: Field Selection */}
              <button
                type="button"
                onClick={() => onNavigate('field_select')}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                  isStepActive(['field_select'])
                    ? 'bg-gradient-to-r from-[#7c3aed]/20 to-[#3b82f6]/20 border border-[#7c3aed]/40 text-white font-semibold shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                    : 'text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                      isStepActive(['field_select'])
                        ? 'bg-[#7c3aed] text-white shadow-[0_0_10px_rgba(124,58,237,0.5)]'
                        : 'bg-white/[0.05] text-[#71717a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">explore</span>
                  </div>
                  <span>01 Field Track</span>
                </div>
                <span className="text-[10px] font-mono text-[#71717a] group-hover:text-white/60">
                  {domain.tag}
                </span>
              </button>

              {/* Step 02: Role Specification */}
              <button
                type="button"
                onClick={() => onNavigate('role_select')}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                  isStepActive(['role_select'])
                    ? 'bg-gradient-to-r from-[#7c3aed]/20 to-[#3b82f6]/20 border border-[#7c3aed]/40 text-white font-semibold shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                    : 'text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                      isStepActive(['role_select'])
                        ? 'bg-[#3b82f6] text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                        : 'bg-white/[0.05] text-[#71717a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">adjust</span>
                  </div>
                  <span>02 Target Role</span>
                </div>
                <span className="material-symbols-outlined text-[14px] text-[#71717a]">chevron_right</span>
              </button>

              {/* Step 03: Resume Dossier */}
              <button
                type="button"
                onClick={() => onNavigate('resume')}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                  isStepActive(['resume', 'resume_editor', 'template_picker'])
                    ? 'bg-gradient-to-r from-[#7c3aed]/20 to-[#3b82f6]/20 border border-[#7c3aed]/40 text-white font-semibold shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                    : 'text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                      isStepActive(['resume', 'resume_editor', 'template_picker'])
                        ? 'bg-[#0EA5B7] text-white shadow-[0_0_10px_rgba(14,165,183,0.5)]'
                        : 'bg-white/[0.05] text-[#71717a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">description</span>
                  </div>
                  <span>03 Resume Dossier</span>
                </div>
                <span className="material-symbols-outlined text-[14px] text-[#71717a]">chevron_right</span>
              </button>

              {/* Step 04: Oral Mock Interview */}
              <button
                type="button"
                onClick={() => onNavigate('interview')}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                  isStepActive(['interview'])
                    ? 'bg-gradient-to-r from-[#7c3aed]/20 to-[#3b82f6]/20 border border-[#7c3aed]/40 text-white font-semibold shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                    : 'text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                      isStepActive(['interview'])
                        ? 'bg-[#ec4899] text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                        : 'bg-white/[0.05] text-[#71717a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">forum</span>
                  </div>
                  <span>04 Mock Interview</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              </button>

              {/* Step 05: ATS Diagnostic Report */}
              <button
                type="button"
                onClick={() => onNavigate('ats_check')}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                  isStepActive(['ats_check'])
                    ? 'bg-gradient-to-r from-[#7c3aed]/20 to-[#3b82f6]/20 border border-[#7c3aed]/40 text-white font-semibold shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                    : 'text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                      isStepActive(['ats_check'])
                        ? 'bg-[#eab308] text-white shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                        : 'bg-white/[0.05] text-[#71717a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">document_scanner</span>
                  </div>
                  <span>05 ATS Diagnostic</span>
                </div>
                <span className="material-symbols-outlined text-[14px] text-[#71717a]">chevron_right</span>
              </button>

              {/* Step 06: Performance Summary */}
              <button
                type="button"
                onClick={() => onNavigate('completed')}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                  isStepActive(['summary', 'completed'])
                    ? 'bg-gradient-to-r from-[#7c3aed]/20 to-[#3b82f6]/20 border border-[#7c3aed]/40 text-white font-semibold shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                    : 'text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                      isStepActive(['summary', 'completed'])
                        ? 'bg-[#10b981] text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                        : 'bg-white/[0.05] text-[#71717a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">fact_check</span>
                  </div>
                  <span>06 Readiness</span>
                </div>
                <span className="material-symbols-outlined text-[14px] text-[#71717a]">chevron_right</span>
              </button>
            </nav>

            {/* Quick Workspace Tools Divider */}
            <div className="pt-2 border-t border-white/[0.06] space-y-1">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#71717a] px-3">
                Workspace Suites
              </span>
              <button
                type="button"
                onClick={() => onNavigate('resume_editor')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                  isStepActive(['resume_editor'])
                    ? 'bg-white/[0.08] text-white font-medium'
                    : 'text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-[#c084fc]">edit_note</span>
                <span>Markdown Resume Studio</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('template_picker')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                  isStepActive(['template_picker'])
                    ? 'bg-white/[0.08] text-white font-medium'
                    : 'text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-[#22d3ee]">palette</span>
                <span>Template Picker</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('session_history')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                  isStepActive(['session_history'])
                    ? 'bg-white/[0.08] text-white font-medium'
                    : 'text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-[#10b981]">history</span>
                <span>Session Telemetry</span>
              </button>
            </div>
          </div>

          {/* Bottom Rail Section: AI Evaluator Engine & Profile */}
          <div className="space-y-3 pt-3 border-t border-white/[0.06]">
            {/* Live AI Engine Status Box */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] shadow-inner space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#10b981] text-[16px]">bolt</span>
                  <span className="font-mono text-[10px] text-white font-semibold uppercase">
                    AI Evaluator Active
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#10b981] font-bold">v3.8</span>
              </div>
              <div className="w-full h-1 rounded-full bg-white/[0.08] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] w-3/4 animate-pulse" />
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-[#71717a]">
                <span>Readiness Calibration</span>
                <span className="text-[#a1a1aa]">Tier-1 Tech</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/[0.08]"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">person</span>
                <span>Candidate Profile</span>
              </div>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </aside>

        {/* Floating Quick-Open Tab when sidebar is collapsed */}
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="hidden lg:flex fixed left-0 top-20 z-30 items-center gap-1.5 py-2 px-2.5 bg-[#141313]/90 hover:bg-[#1f1e1e] border border-l-0 border-white/[0.1] rounded-r-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-[#a1a1aa] hover:text-white transition-all cursor-pointer group backdrop-blur-xl"
            title="Open sidebar (Ctrl+B)"
            aria-label="Open sidebar"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform text-[#c084fc]">
              chevron_right
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa] group-hover:text-white">
              Menu
            </span>
          </button>
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 w-full min-h-[calc(100vh-4rem)] flex flex-col transition-all duration-300 ease-in-out relative z-10 ${
            sidebarOpen ? 'lg:pl-64' : 'pl-0'
          }`}
        >
          <div className="w-full max-w-7xl mx-auto p-4 sm:p-8 lg:p-10 flex-1 flex flex-col justify-start">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
