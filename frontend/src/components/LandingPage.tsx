import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { type DocketStep } from './AppLayout';
import { useThrottledScroll } from '../hooks/useThrottledScroll';
import { useSectionObserver } from '../hooks/useIntersectionObserver';

interface LandingPageProps {
  onNavigate: (step: DocketStep) => void;
  onSelectTrack?: (field: string, role?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectTrack }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTrack, setActivePreviewTrack] = useState<'it' | 'management' | 'law'>('it');
  const [atsSampleType, setAtsSampleType] = useState<'it' | 'mgmt' | 'law'>('it');

  // 3D background canvas init with requestIdleCallback for optimal initial render performance
  useEffect(() => {
    let isMounted = true;
    let appInstance: any = null;
    let idleId: any = null;
    let timerId: any = null;

    const init = async () => {
      try {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const loadModule = new Function('url', 'return import(url)');
        const module = await loadModule('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
        const TubesCursor = module.default || module;
        if (isMounted && typeof TubesCursor === 'function') {
          appInstance = TubesCursor(canvas, {
            tubes: {
              colors: ['#ff008a', '#8b5cf6', '#3b82f6', '#ffffff'],
              lights: {
                intensity: 50,
                colors: ['#ff008a', '#8b5cf6', '#3b82f6', '#ffffff'],
              },
            },
          });
        }
      } catch (err) {
        console.warn('TubesCursor 3D background notice:', err);
      }
    };

    if (typeof (window as any).requestIdleCallback === 'function') {
      idleId = (window as any).requestIdleCallback(() => {
        setTimeout(init, 1000);
      });
    } else {
      timerId = setTimeout(init, 2000);
    }

    const handleResize = () => {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      if (idleId != null) (window as any).cancelIdleCallback?.(idleId);
      if (timerId != null) clearTimeout(timerId);
      window.removeEventListener('resize', handleResize);
      if (appInstance && typeof appInstance.dispose === 'function') {
        appInstance.dispose();
      }
    };
  }, []);

  // Ref to navbar element for class toggling
  const navRef = useRef<HTMLElement>(null);

  // Throttled scroll handling – updates CSS variables and navbar class
  useThrottledScroll(({ isScrolled, progress }) => {
    document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
    if (navRef.current) {
      navRef.current.classList.toggle('nav-scrolled', isScrolled);
    }
  }, 100);

  // Section observer for active link highlighting
  useSectionObserver(
    ['hero', 'tracks', 'cockpit', 'ats-scanner', 'features', 'pricing'],
    '.nav-link'
  );

  // Direct navigation with offset compensation
  const handleDirectNav = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 84;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, elementPosition - navOffset),
        behavior: 'smooth',
      });
    }
  };

  const handleLaunchTrack = (field: 'it' | 'management' | 'law', defaultRole?: string) => {
    if (onSelectTrack) {
      onSelectTrack(field, defaultRole);
    }
    onNavigate('role_select');
  };

  const previewData = {
    it: {
      tag: 'IT SYSTEMS',
      role: 'Frontend Developer & Systems Engineer',
      color: '#3b82f6',
      badgeBorder: '#3b82f6',
      question:
        'Explain how React 19 concurrent features (such as useDeferredValue and Actions) optimize main thread execution compared to traditional debouncing.',
      answerSnippet:
        'useDeferredValue integrates directly with the React 19 concurrent scheduler to keep high-priority input events responsive while deferring non-urgent virtual DOM re-renders without artificial timer delays...',
      examinerName: 'Marcus Vance',
      examinerTitle: 'Principal Systems Architect',
      score: '9.2 / 10',
      feedback:
        'Exceptional architectural precision. Candidate accurately separated event-loop scheduler priority queues from standard task-queue timer delays.',
      rubric: 'Technical Precision & Concurrency Architecture',
      atsScore: 92,
      keywords: ['React 19', 'TypeScript', 'Concurrent Mode', 'Scheduler Queue', 'DOM Reconciliation'],
    },
    management: {
      tag: 'MANAGEMENT & STRATEGY',
      role: 'Senior Product Manager & Strategy Lead',
      color: '#8b5cf6',
      badgeBorder: '#8b5cf6',
      question:
        'When engineering velocity degrades due to legacy technical debt, how do you defend allocating 30% of a sprint to debt rather than high-visibility roadmap features?',
      answerSnippet:
        'I frame technical debt strictly around commercial risk, release velocity degradation, and customer SLA breach exposure, quantifying refactoring ROI against customer churn...',
      examinerName: 'Eleanor Hayes',
      examinerTitle: 'VP of Product & Strategic Growth',
      score: '8.8 / 10',
      feedback:
        'Strong executive framing. Candidate effectively converted engineering refactoring into business risk mitigation and measurable retention metrics.',
      rubric: 'Executive Communication & Business Trade-offs',
      atsScore: 89,
      keywords: ['Product Roadmap', 'Stakeholder Alignment', 'KPI Modeling', 'Sprint Allocation', 'Technical Debt'],
    },
    law: {
      tag: 'LAW & GOVERNANCE',
      role: 'Corporate Legal Counsel & Compliance Officer',
      color: '#60a5fa',
      badgeBorder: '#60a5fa',
      question:
        'How do you negotiate an uncapped liability clause in a SaaS Enterprise MSA when the prospective enterprise client mandates strict indemnity for data incidents?',
      answerSnippet:
        'I counter with a tiered super-cap tied to a 3x multiple of trailing 12-month contract value while carving out gross negligence and willful misconduct...',
      examinerName: 'Victoria Hastings',
      examinerTitle: 'General Counsel & Governance Director',
      score: '9.4 / 10',
      feedback:
        'Masterful contractual risk calibration. Candidate protected balance-sheet liability without stalling commercial deal momentum.',
      rubric: 'Statutory Compliance & Risk Mitigation',
      atsScore: 94,
      keywords: ['MSA Negotiation', 'Limitation of Liability', 'GDPR/CCPA Compliance', 'Indemnification', 'Risk Mitigation'],
    },
  };

  const currentPreview = previewData[activePreviewTrack];

  const atsSamples = {
    it: {
      title: 'Senior Frontend Engineer Dossier',
      score: 92,
      matchGrade: 'High ATS Pass Probability',
      matched: ['React.js', 'TypeScript', 'Tailwind CSS', 'Next.js', 'State Architecture', 'CI/CD Pipeline', 'RESTful APIs'],
      missing: ['GraphQL', 'Docker'],
      summary: 'Clean hierarchical formatting, optimal keyword density, strict reverse-chronological layout.',
    },
    mgmt: {
      title: 'Product Operations Director Dossier',
      score: 88,
      matchGrade: 'Strong Recruiter Match',
      matched: ['Product Strategy', 'Cross-Functional Leadership', 'Sprint Planning', 'Metrics & OKRs', 'User Research'],
      missing: ['SQL Analytics', 'P&L Accountability'],
      summary: 'Quantified accomplishments present across all sections. Good structural header fidelity.',
    },
    law: {
      title: 'Corporate Legal Counsel Dossier',
      score: 95,
      matchGrade: 'Exceptional Compliance Rating',
      matched: ['Contract Negotiation', 'Regulatory Compliance', 'Corporate Governance', 'Risk Auditing', 'Due Diligence'],
      missing: ['Patent Prosecution'],
      summary: 'Precise legal terminology, verified jurisdiction credentials, clear clause analysis bullet points.',
    },
  };

  const currentAts = atsSamples[atsSampleType];

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans antialiased selection:bg-[#7c3aed]/30 selection:text-white relative overflow-x-hidden">
      {/* 3D Animated Background Canvas (TubesCursor) */}
      <canvas id="canvas" className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />

      {/* Ambient background glows */}
      <div className="fixed top-[-100px] left-[10%] w-[500px] h-[500px] rounded-full bg-[#7c3aed]/12 blur-[140px] pointer-events-none" />
      <div className="fixed top-[40%] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#3b82f6]/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[30%] w-[600px] h-[600px] rounded-full bg-[#8b5cf6]/10 blur-[160px] pointer-events-none" />

      {/* Main content wrapper positioned above canvas */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sticky NavBar */}
        <header className="sticky top-0 z-50 w-full transition-all duration-300 pt-5 pb-2 px-4 sm:px-6 bg-transparent">
          <nav ref={navRef} className="liquid-glass-nav flex items-center justify-between mx-auto transition-all duration-300 relative overflow-hidden">
            {/* Ambient Progress Bar */}
            <div
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#7c3aed] via-[#3b82f6] to-[#ec4899] transition-all duration-150 pointer-events-none rounded-full"
              style={{ width: 'var(--scroll-progress)' }}
            />

            {/* Logo */}
            <div onClick={(e) => handleDirectNav(e, 'hero')} className="flex items-center gap-3 cursor-pointer select-none group">
              <svg className="w-8 h-8 shrink-0 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="4" fill="#7c3aed" />
                <rect x="12" y="12" width="16" height="16" rx="4" fill="#8b5cf6" fillOpacity="0.85" />
                <rect x="8" y="8" width="16" height="16" rx="4" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" />
              </svg>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-xl tracking-tight text-white">SmartHire</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#c084fc] border border-[#7c3aed]/30 font-mono hidden sm:inline">
                  PRO
                </span>
              </div>
            </div>

            {/* Desktop navigation links */}
            <div className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
              <a href="#features" onClick={(e) => handleDirectNav(e, 'features')} className="nav-link px-3 py-1.5 rounded-full transition-all cursor-pointer">
                Features
              </a>
              <a href="#tracks" onClick={(e) => handleDirectNav(e, 'tracks')} className="nav-link px-3 py-1.5 rounded-full flex items-center gap-1.5 group cursor-pointer">
                <span>Solutions</span>
                <svg className="w-3.5 h-3.5 text-[#71717a] group-hover:text-white transition-transform duration-200 group-hover:translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </a>
              <a href="#pricing" onClick={(e) => handleDirectNav(e, 'pricing')} className="nav-link px-3 py-1.5 rounded-full transition-all cursor-pointer">
                Pricing
              </a>
              <a href="#cockpit" onClick={(e) => handleDirectNav(e, 'cockpit')} className="nav-link px-3 py-1.5 rounded-full flex items-center gap-1.5 group cursor-pointer">
                <span>Cockpit</span>
                <svg className="w-3.5 h-3.5 text-[#71717a] group-hover:text-white transition-transform duration-200 group-hover:translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </a>
              <a href="#ats-scanner" onClick={(e) => handleDirectNav(e, 'ats-scanner')} className="nav-link px-3 py-1.5 rounded-full transition-all cursor-pointer">
                ATS Scanner
              </a>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('profile')}
                    className="btn-glass px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm hover:border-white/20 transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span>{user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Workspace'}</span>
                    <svg className="w-3.5 h-3.5 text-[#a1a1aa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="text-xs text-[#a1a1aa] hover:text-white transition-colors cursor-pointer px-2 py-1"
                    title="Logout"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors cursor-pointer hidden sm:inline px-3 py-1.5"
                  >
                    Log in
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('field_select')}
                    className="btn-gradient-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.55)] transition-all"
                  >
                    <span>Start for free</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-[#a1a1aa] hover:text-white cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </nav>

          {/* Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <div
              className="lg:hidden absolute left-4 right-4 top-[calc(100%+8px)] rounded-3xl p-6 space-y-4 shadow-2xl transition-all"
              style={{
                background: 'rgba(10, 10, 15, 0.95)',
                backdropFilter: 'blur(20px) saturate(190%)',
                WebkitBackdropFilter: 'blur(20px) saturate(190%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
              }}
            >
              <div className="flex flex-col space-y-3 text-sm font-medium text-[#a1a1aa]">
                <a href="#hero" onClick={(e) => handleDirectNav(e, 'hero')} className="hover:text-white py-1.5 transition-colors cursor-pointer">
                  Overview
                </a>
                <a href="#features" onClick={(e) => handleDirectNav(e, 'features')} className="hover:text-white py-1.5 transition-colors cursor-pointer">
                  Features
                </a>
                <a href="#tracks" onClick={(e) => handleDirectNav(e, 'tracks')} className="hover:text-white py-1.5 transition-colors cursor-pointer">
                  Solutions & Tracks
                </a>
                <a href="#cockpit" onClick={(e) => handleDirectNav(e, 'cockpit')} className="hover:text-white py-1.5 transition-colors cursor-pointer">
                  AI Cockpit
                </a>
                <a href="#ats-scanner" onClick={(e) => handleDirectNav(e, 'ats-scanner')} className="hover:text-white py-1.5 transition-colors cursor-pointer">
                  ATS Scanner
                </a>
                <a href="#pricing" onClick={(e) => handleDirectNav(e, 'pricing')} className="hover:text-white py-1.5 transition-colors cursor-pointer">
                  Pricing
                </a>
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('field_select');
                  }}
                  className="w-full py-2.5 rounded-full btn-gradient-primary text-xs font-semibold text-white cursor-pointer shadow-md"
                >
                  Select Track & Practice &rarr;
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('resume');
                    }}
                    className="py-2 px-3 rounded-xl btn-glass text-xs font-medium text-white cursor-pointer text-center"
                  >
                    ATS Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('resume_editor');
                    }}
                    className="py-2 px-3 rounded-xl btn-glass text-xs font-medium text-white cursor-pointer text-center"
                  >
                    Resume Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('template_picker');
                    }}
                    className="py-2 px-3 rounded-xl btn-glass text-xs font-medium text-white cursor-pointer text-center"
                  >
                    Templates
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('session_history');
                    }}
                    className="py-2 px-3 rounded-xl btn-glass text-xs font-medium text-white cursor-pointer text-center"
                  >
                    Past Sessions
                  </button>
                </div>

                {isAuthenticated ? (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('profile');
                      }}
                      className="text-xs font-semibold text-[#c084fc] hover:underline cursor-pointer"
                    >
                      Candidate Profile &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="text-xs text-[#a1a1aa] hover:text-white cursor-pointer"
                    >
                      Log out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('login');
                    }}
                    className="w-full py-2.5 rounded-full btn-glass text-xs font-semibold text-white cursor-pointer mt-1"
                  >
                    Log in
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* 3. HERO SECTION */}
        <section id="hero" className="saas-reveal pt-16 sm:pt-24 pb-12 px-4 sm:px-6 flex flex-col items-center text-center max-w-5xl mx-auto w-full">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#a1a1aa] mb-8 cursor-pointer hover:border-white/20 transition-all shadow-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onClick={() => onNavigate('field_select')}
          >
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#7c3aed] text-white">
              New
            </span>
            <span>AI Assistant is now live &rarr;</span>
          </div>

          {/* Headline */}
          <h1 className="text-[2.2rem] sm:text-[3rem] md:text-[3.8rem] lg:text-[4.5rem] font-bold tracking-tight text-white leading-[1.1] max-w-4xl">
            The all-in-one platform
            <br />
            to scale your{' '}
            <span className="gradient-text-highlights">
              SaaS
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-base sm:text-xl text-[#a1a1aa] max-w-[600px] mx-auto leading-relaxed">
            Build, launch, and grow your SaaS faster with powerful tools, beautiful analytics, and AI that works for you.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigate('field_select')}
              className="btn-gradient-primary w-full sm:w-auto px-8 py-4 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)]"
            >
              <span>Start for free</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <a
              href="#ats-scanner"
              onClick={(e) => handleDirectNav(e, 'ats-scanner')}
              className="btn-glass w-full sm:w-auto px-7 py-4 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book a demo</span>
            </a>

            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="btn-glass w-full sm:w-auto px-6 py-4 text-sm font-medium flex items-center justify-center gap-2.5 cursor-pointer text-[#a1a1aa] hover:text-white"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            )}
          </div>

          {/* Quick Page Jump Strip */}
          <div className="mt-12 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div
              onClick={() => onNavigate('field_select')}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base">🎯</span>
                <span className="text-[10px] font-mono text-[#7c3aed] uppercase font-bold tracking-wider">Step 01</span>
              </div>
              <p className="text-xs font-semibold text-white group-hover:text-[#c084fc] transition-colors">Select Track</p>
              <p className="text-[11px] text-[#71717a] mt-0.5">IT, Strategy, Law</p>
            </div>

            <div
              onClick={() => onNavigate('resume')}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base">📄</span>
                <span className="text-[10px] font-mono text-[#3b82f6] uppercase font-bold tracking-wider">Step 02</span>
              </div>
              <p className="text-xs font-semibold text-white group-hover:text-[#60a5fa] transition-colors">ATS Scanner</p>
              <p className="text-[11px] text-[#71717a] mt-0.5">Parse & match score</p>
            </div>

            <div
              onClick={() => onNavigate('resume_editor')}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base">✏️</span>
                <span className="text-[10px] font-mono text-[#ec4899] uppercase font-bold tracking-wider">Studio</span>
              </div>
              <p className="text-xs font-semibold text-white group-hover:text-[#f472b6] transition-colors">Resume Editor</p>
              <p className="text-[11px] text-[#71717a] mt-0.5">Interactive builder</p>
            </div>

            <div
              onClick={() => onNavigate('session_history')}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base">📊</span>
                <span className="text-[10px] font-mono text-[#10B981] uppercase font-bold tracking-wider">Analytics</span>
              </div>
              <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">Past Sessions</p>
              <p className="text-[11px] text-[#71717a] mt-0.5">Dossiers & rubrics</p>
            </div>
          </div>
        </section>

        {/* 4. SOCIAL PROOF SECTION */}
        <section
          id="social-proof"
          className="saas-reveal w-full max-w-6xl mx-auto px-4 sm:px-6 mt-6"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '40px 0 60px',
          }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-wider text-[#71717a]">
              Trusted by 10,000+ teams worldwide
            </p>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-[#EAB308]" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-semibold text-white">5.0/5</span>
              <span className="text-xs text-[#71717a]">from 1,200+ reviews</span>
            </div>
          </div>

          {/* Logos Row */}
          <div className="flex flex-wrap items-center justify-center lg:justify-between gap-8 lg:gap-12">
            <div className="flex items-center gap-2.5 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 100 100" fill="currentColor">
                <path d="M1.229 64.91a48.77 48.77 0 0 1-.229-4.71c0-26.95 21.85-48.8 48.8-48.8 1.58 0 3.14.08 4.69.23L4.72 61.39a48.4 48.4 0 0 1-3.491 3.52zm8.01 10.36L69.49 15.02A48.66 48.66 0 0 1 88.58 35.13L24.6 98.74a48.71 48.71 0 0 1-15.361-13.47zM35.09 98.77l63.68-63.68c.81 3.12 1.23 6.38 1.23 9.71 0 26.95-21.85 48.8-48.8 48.8-5.61 0-10.97-.95-16.11-2.83zm59.68-69.2L70.4 5.2a48.7 48.7 0 0 1 24.37 24.37zM49.8 0C22.297 0 0 22.297 0 49.8s22.297 49.8 49.8 49.8 49.8-22.297 49.8-49.8S77.303 0 49.8 0z" />
              </svg>
              <span className="font-semibold text-lg tracking-tight">Linear</span>
            </div>

            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 40 40" fill="currentColor">
                <path d="M19.78 0c-4.32 0-8.1 2.37-10.1 5.92L0 22.68l9.68 16.78c2 3.54 5.78 5.92 10.1 5.92 4.32 0 8.1-2.38 10.1-5.92l9.68-16.78L29.88 5.92C27.88 2.37 24.1 0 19.78 0zm0 8.04c2.19 0 3.96 1.77 3.96 3.96v7.35l6.36 3.67c1.9 1.1 2.55 3.53 1.46 5.43-1.1 1.9-3.53 2.55-5.43 1.46L19.78 26.24v7.35c0 2.19-1.77 3.96-3.96 3.96-2.19 0-3.96-1.77-3.96-3.96v-7.35l-6.36 3.67c-1.9 1.1-4.34.44-5.43-1.46-1.1-1.9-.44-4.34 1.46-5.43l6.36-3.67v-7.35c0-2.19 1.77-3.96 3.96-3.96z" />
              </svg>
              <span className="font-semibold text-lg tracking-tight">loom</span>
            </div>

            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.43 3H6.57C4.6 3 3 4.6 3 6.57v10.86C3 19.4 4.6 21 6.57 21h10.86c1.97 0 3.57-1.6 3.57-3.57V6.57C21 4.6 19.4 3 17.43 3zM9.57 6.43h4.86c1.74 0 3.14 1.4 3.14 3.14 0 1.25-.73 2.33-1.79 2.82 1.34.46 2.29 1.73 2.29 3.18v.86c0 .9-.73 1.63-1.63 1.63h-6.87V6.43zm2.57 4.29h2.29c.47 0 .86-.39.86-.86s-.39-.86-.86-.86h-2.29v1.72zm2.57 5.14h-2.57v-1.71h2.57c.47 0 .86.38.86.85s-.39.86-.86.86z" />
              </svg>
              <span className="font-semibold text-lg tracking-tight">Remix</span>
            </div>

            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.2 2.4a1.2 1.2 0 0 0-2.4 0v3.6a1.2 1.2 0 0 0 2.4 0V2.4zm-7.6 3a1.2 1.2 0 0 0-1.7 1.7l2.5 2.5a1.2 1.2 0 0 0 1.7-1.7L5.6 5.4zm12.8 0a1.2 1.2 0 0 0-1.7 0l-2.5 2.5a1.2 1.2 0 0 0 1.7 1.7l2.5-2.5a1.2 1.2 0 0 0 0-1.7zM2.4 10.8a1.2 1.2 0 0 0 0 2.4h3.6a1.2 1.2 0 0 0 0-2.4H2.4zm15.6 0a1.2 1.2 0 0 0 0 2.4h3.6a1.2 1.2 0 0 0 0-2.4H18zM6.4 16.9a1.2 1.2 0 0 0-1.7 0 1.2 1.2 0 0 0 0 1.7l2.5 2.5a1.2 1.2 0 0 0 1.7-1.7l-2.5-2.5zm11.2 0l-2.5 2.5a1.2 1.2 0 0 0 1.7 1.7l2.5-2.5a1.2 1.2 0 0 0-1.7-1.7zM10.8 18a1.2 1.2 0 0 0 0 2.4v1.2a1.2 1.2 0 0 0 2.4 0v-1.2a1.2 1.2 0 0 0 0-2.4h-2.4z" />
              </svg>
              <span className="font-semibold text-lg tracking-tight">Raycast</span>
            </div>

            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" />
              </svg>
              <span className="font-semibold text-lg tracking-tight">Tailwind</span>
            </div>
          </div>
        </section>

        {/* SECTION A: TRACKS / SOLUTIONS EXPLORER */}
        <section id="tracks" className="saas-reveal py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#7c3aed]">
              DOMAIN SPECIALIZATION DOSSIERS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Role-Calibrated Evaluation Engines
            </h2>
            <p className="text-sm sm:text-base text-[#a1a1aa]">
              Select a specialized track to initialize domain personas, custom ATS rubrics, and tailored examination banks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* IT Track Pod */}
            <div
              className="rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
              onClick={() => handleLaunchTrack('it', 'Frontend Developer')}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center text-[#60a5fa]">
                    <span className="material-symbols-outlined text-[20px]">terminal</span>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-[#3b82f6]/15 text-[#60a5fa] border border-[#3b82f6]/30">
                    TRACK 01 // SYSTEMS
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#60a5fa] transition-colors">
                    Information Technology
                  </h3>
                  <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                    Concurrency models, React 19 scheduler, distributed microservices, and system architecture.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2">
                  <p className="font-mono text-[10px] uppercase font-semibold text-[#71717a]">Specializations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Frontend', 'Backend', 'DevOps', 'Full Stack'].map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-white/5 text-[#a1a1aa] border border-white/5">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#60a5fa]">
                <span>Initialize Track</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* Management Track Pod */}
            <div
              className="rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
              onClick={() => handleLaunchTrack('management', 'Product Manager')}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 flex items-center justify-center text-[#c084fc]">
                    <span className="material-symbols-outlined text-[20px]">strategy</span>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-[#7c3aed]/15 text-[#c084fc] border border-[#7c3aed]/30">
                    TRACK 02 // STRATEGY
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#c084fc] transition-colors">
                    Management & Leadership
                  </h3>
                  <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                    Product vision, roadmap trade-offs, OKR modeling, stakeholder alignment, and team execution.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2">
                  <p className="font-mono text-[10px] uppercase font-semibold text-[#71717a]">Specializations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Product Manager', 'Operations', 'Engineering Lead', 'Strategy'].map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-white/5 text-[#a1a1aa] border border-white/5">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#c084fc]">
                <span>Initialize Track</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* Law Track Pod */}
            <div
              className="rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
              onClick={() => handleLaunchTrack('law', 'Corporate Counsel')}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#0EA5B7]/10 border border-[#0EA5B7]/30 flex items-center justify-center text-[#22D3EE]">
                    <span className="material-symbols-outlined text-[20px]">gavel</span>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0EA5B7]/15 text-[#22D3EE] border border-[#0EA5B7]/30">
                    TRACK 03 // GOVERNANCE
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#22D3EE] transition-colors">
                    Law & Corporate Counsel
                  </h3>
                  <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                    Contractual risk mitigation, statutory regulatory compliance, intellectual property, and governance.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2">
                  <p className="font-mono text-[10px] uppercase font-semibold text-[#71717a]">Specializations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Corporate Counsel', 'Compliance', 'Legal Analyst', 'Contracts Lead'].map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-white/5 text-[#a1a1aa] border border-white/5">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#22D3EE]">
                <span>Initialize Track</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION B: INTERACTIVE AI EXAMINER COCKPIT */}
        <section id="cockpit" className="saas-reveal py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#3b82f6]">
              LIVE MOCK INTERACTION PREVIEW
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Dynamic Examiner Cockpit
            </h2>
            <p className="text-sm sm:text-base text-[#a1a1aa]">
              Simulate questions, explore structured answers, and inspect multi-tiered evaluation matrices.
            </p>
          </div>

          <div
            className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Cockpit Top Bar */}
            <div className="px-6 py-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-xs font-medium text-emerald-400">SESSION LIVE</span>
                <span className="text-xs text-[#71717a] font-mono">• Persona Evaluation Mode</span>
              </div>

              {/* Track Selector Tabs inside Cockpit */}
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActivePreviewTrack('it')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activePreviewTrack === 'it' ? 'bg-[#3b82f6] text-white shadow-sm' : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  IT Systems
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTrack('management')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activePreviewTrack === 'management' ? 'bg-[#7c3aed] text-white shadow-sm' : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  Management
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTrack('law')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activePreviewTrack === 'law' ? 'bg-[#0EA5B7] text-white shadow-sm' : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  Corporate Law
                </button>
              </div>
            </div>

            {/* Cockpit Content */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold tracking-wider"
                      style={{ backgroundColor: `${currentPreview.color}25`, color: currentPreview.color }}
                    >
                      {currentPreview.tag}
                    </span>
                    <span className="text-xs text-[#a1a1aa] font-mono">• {currentPreview.role}</span>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Dimension: {currentPreview.rubric}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {currentPreview.question}
                </h3>
              </div>

              {/* Defense & Critique */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <p className="font-mono text-[10px] uppercase font-semibold text-[#71717a]">
                    Candidate Structured Defense
                  </p>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed italic">
                    "{currentPreview.answerSnippet}"
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {currentPreview.keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-[#a1a1aa]">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white"
                        style={{ backgroundColor: currentPreview.color }}
                      >
                        {currentPreview.examinerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{currentPreview.examinerName}</p>
                        <p className="text-[10px] text-[#71717a]">{currentPreview.examinerTitle}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white">
                      Score: {currentPreview.score}
                    </span>
                  </div>

                  <p className="text-xs text-[#a1a1aa] leading-relaxed font-mono">
                    <span className="font-bold text-white">Examiner Feedback: </span>
                    {currentPreview.feedback}
                  </p>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-[#a1a1aa] font-mono">
                  ATS Alignment: <strong className="text-white">{currentPreview.atsScore}%</strong>
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('role_select')}
                    className="btn-glass px-4 py-2 text-xs font-medium cursor-pointer text-[#a1a1aa] hover:text-white"
                  >
                    Browse Role Library
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchTrack(activePreviewTrack)}
                    className="btn-gradient-primary px-5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Practice This Track</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION C: DETERMINISTIC ATS SCANNER */}
        <section id="ats-scanner" className="saas-reveal py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <div
            className="rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#71717a]">Deterministic Heuristic Scanner</span>
                <h3 className="text-xl font-bold text-white">{currentAts.title}</h3>
              </div>

              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setAtsSampleType('it')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    atsSampleType === 'it' ? 'bg-[#3b82f6] text-white' : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  Frontend
                </button>
                <button
                  type="button"
                  onClick={() => setAtsSampleType('mgmt')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    atsSampleType === 'mgmt' ? 'bg-[#7c3aed] text-white' : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  Product
                </button>
                <button
                  type="button"
                  onClick={() => setAtsSampleType('law')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    atsSampleType === 'law' ? 'bg-[#0EA5B7] text-white' : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  Corporate Law
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Radial Score Gauge */}
              <div className="flex flex-col items-center justify-center p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="url(#saas-gauge-gradient)"
                      strokeWidth="8"
                      strokeDasharray={264}
                      strokeDashoffset={264 - (264 * currentAts.score) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700"
                    />
                    <defs>
                      <linearGradient id="saas-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-white font-mono">{currentAts.score}%</span>
                    <span className="text-[10px] text-[#71717a] uppercase font-semibold">Match Score</span>
                  </div>
                </div>

                <span className="mt-3 text-xs font-semibold text-emerald-400 font-mono">
                  {currentAts.matchGrade}
                </span>
              </div>

              {/* Keyword Analysis Breakdown */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Validated High-Impact Keywords ({currentAts.matched.length})</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentAts.matched.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Missing Required Competencies ({currentAts.missing.length})</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentAts.missing.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    <strong className="text-white">Parsing Analysis: </strong>
                    {currentAts.summary}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('resume_editor')}
                  className="btn-glass px-4 py-2 text-xs font-medium cursor-pointer text-[#a1a1aa] hover:text-white"
                >
                  Live Resume Editor
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('template_picker')}
                  className="btn-glass px-4 py-2 text-xs font-medium cursor-pointer text-[#a1a1aa] hover:text-white"
                >
                  Browse Templates
                </button>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('resume')}
                className="btn-gradient-primary px-5 py-2 text-xs font-semibold cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <span>Scan Your Resume Now</span>
                <span className="material-symbols-outlined text-[14px]">upload_file</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION D: BENTO GRID FEATURES */}
        <section id="features" className="saas-reveal py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#60a5fa]">
              SYSTEM ADVANTAGES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Built on Modern Architecture
            </h2>
            <p className="text-sm sm:text-base text-[#a1a1aa]">
              Everything you need to master competitive career transitions with verifiable precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={() => onNavigate('role_select')}
              className="rounded-3xl p-7 space-y-3 cursor-pointer hover:border-white/20 hover:scale-[1.01] transition-all group"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#7c3aed]/15 border border-[#7c3aed]/30 flex items-center justify-center text-[#c084fc]">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-[#c084fc] transition-colors">Persona AI Examiners</h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Adaptive examiners who interrogate depth, challenge trade-offs, and dynamically adjust difficulty.
              </p>
              <span className="text-xs text-[#7c3aed] font-semibold flex items-center gap-1 pt-2">
                Explore Personas &rarr;
              </span>
            </div>

            <div
              onClick={() => onNavigate('resume')}
              className="rounded-3xl p-7 space-y-3 cursor-pointer hover:border-white/20 hover:scale-[1.01] transition-all group"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#60a5fa]">
                <span className="material-symbols-outlined text-[20px]">database</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-[#60a5fa] transition-colors">Dual Database Engine</h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Relational candidate accounts in SQLite; dynamic resume schemas and evaluation trees in MongoDB Atlas.
              </p>
              <span className="text-xs text-[#3b82f6] font-semibold flex items-center gap-1 pt-2">
                Launch Resume Parser &rarr;
              </span>
            </div>

            <div
              onClick={() => onNavigate('session_history')}
              className="rounded-3xl p-7 space-y-3 cursor-pointer hover:border-white/20 hover:scale-[1.01] transition-all group"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#0EA5B7]/15 border border-[#0EA5B7]/30 flex items-center justify-center text-[#22D3EE]">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-[#22D3EE] transition-colors">STAR & IRAC Rubrics</h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Automated scoring based on formal industry interview frameworks with detailed critique on every answer.
              </p>
              <span className="text-xs text-[#0EA5B7] font-semibold flex items-center gap-1 pt-2">
                View Past Rubrics &rarr;
              </span>
            </div>

            <div
              onClick={() => onNavigate('field_select')}
              className="rounded-3xl p-7 space-y-3 cursor-pointer hover:border-white/20 hover:scale-[1.01] transition-all group"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#ec4899]/15 border border-[#ec4899]/30 flex items-center justify-center text-[#f472b6]">
                <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-[#f472b6] transition-colors">Real-Time Voice & Pace</h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Detect speech cadence, hesitation frequencies, filler counts, and delivery clarity in real-time.
              </p>
              <span className="text-xs text-[#ec4899] font-semibold flex items-center gap-1 pt-2">
                Practice Audio &rarr;
              </span>
            </div>

            <div
              onClick={() => onNavigate('resume_editor')}
              className="rounded-3xl p-7 space-y-3 cursor-pointer hover:border-white/20 hover:scale-[1.01] transition-all group"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-[20px]">edit_note</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Interactive Resume Studio</h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Craft industry-ready, ATS-compliant CVs with real-time preview and exportable high-fidelity formats.
              </p>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 pt-2">
                Open Studio &rarr;
              </span>
            </div>

            <div
              onClick={() => onNavigate('template_picker')}
              className="rounded-3xl p-7 space-y-3 cursor-pointer hover:border-white/20 hover:scale-[1.01] transition-all group"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#EAB308]/15 border border-[#EAB308]/30 flex items-center justify-center text-[#FACC15]">
                <span className="material-symbols-outlined text-[20px]">folder_special</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-[#FACC15] transition-colors">Curated ATS Templates</h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Battle-tested templates guaranteed to pass major enterprise ATS filters like Workday, Greenhouse, and Lever.
              </p>
              <span className="text-xs text-[#FACC15] font-semibold flex items-center gap-1 pt-2">
                Browse Templates &rarr;
              </span>
            </div>
          </div>
        </section>

        {/* SECTION E: BOTTOM CALL TO ACTION & PRICING BANNER */}
        <section id="pricing" className="saas-reveal py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full text-center">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#7c3aed]">
              PLANS & ACCELERATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Empowering Every Career Step
            </h2>
            <p className="text-sm sm:text-base text-[#a1a1aa]">
              Start with free simulation sessions, or upgrade for unlimited high-depth AI evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12">
            {/* Starter Plan */}
            <div
              className="rounded-3xl p-7 flex flex-col justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase text-[#71717a] font-semibold">STARTER</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">$0</span>
                  <span className="text-xs text-[#71717a]">/ forever</span>
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Ideal for candidates beginning interview practice and basic resume compatibility checks.
                </p>
                <div className="space-y-2 pt-2 text-xs text-[#a1a1aa]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>3 Full AI Mock Sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Standard ATS Keyword Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Core Rubric Evaluations</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('field_select')}
                className="mt-6 w-full py-2.5 rounded-full btn-glass text-xs font-semibold text-white cursor-pointer hover:border-white/20 transition-all text-center"
              >
                Start Free Practice
              </button>
            </div>

            {/* Pro Plan */}
            <div
              className="rounded-3xl p-7 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: 'rgba(124, 58, 237, 0.06)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(124, 58, 237, 0.4)',
                boxShadow: '0 0 35px rgba(124, 58, 237, 0.15)',
              }}
            >
              <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-[#7c3aed] text-white text-[10px] font-mono font-bold tracking-wider">
                POPULAR
              </div>

              <div className="space-y-4">
                <span className="text-xs font-mono uppercase text-[#c084fc] font-semibold">PRO CANDIDATE</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">$19</span>
                  <span className="text-xs text-[#71717a]">/ month</span>
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Full multi-turn interrogations with principal personas, voice cadence analysis, and unlimited resumes.
                </p>
                <div className="space-y-2 pt-2 text-xs text-[#a1a1aa]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#c084fc]">✓</span>
                    <span>Unlimited AI Examinations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#c084fc]">✓</span>
                    <span>Deep Voice Cadence Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#c084fc]">✓</span>
                    <span>Interactive Resume Studio Export</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#c084fc]">✓</span>
                    <span>Priority Examiner Personas</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate(isAuthenticated ? 'field_select' : 'signup')}
                className="mt-6 w-full py-2.5 rounded-full btn-gradient-primary text-xs font-semibold text-white cursor-pointer shadow-lg text-center"
              >
                Accelerate with Pro &rarr;
              </button>
            </div>

            {/* Enterprise Plan */}
            <div
              className="rounded-3xl p-7 flex flex-col justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase text-[#71717a] font-semibold">CAMPUS & TEAMS</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">Custom</span>
                  <span className="text-xs text-[#71717a]">/ cohort</span>
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  For university career centers, bootcamps, and talent accelerators seeking cohort dashboards.
                </p>
                <div className="space-y-2 pt-2 text-xs text-[#a1a1aa]">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Cohort Analytics Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Custom Industry Question Banks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Dedicated Advisor Workspace</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('field_select')}
                className="mt-6 w-full py-2.5 rounded-full btn-glass text-xs font-semibold text-white cursor-pointer hover:border-white/20 transition-all text-center"
              >
                Contact Academic Team
              </button>
            </div>
          </div>

          {/* Epic Call to Action Box */}
          <div
            className="rounded-3xl p-10 sm:p-14 space-y-6 shadow-2xl relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#a1a1aa]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>INSTANT ONBOARDING // ALL TRACKS OPEN</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Ready to scale your <span className="gradient-text-highlights">SaaS Career?</span>
            </h2>

            <p className="text-sm sm:text-base text-[#a1a1aa] max-w-md mx-auto leading-relaxed">
              Start practicing with realistic personas and verify your resume ATS compatibility today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('field_select')}
                className="btn-gradient-primary w-full sm:w-auto px-8 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Start for free</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="btn-glass w-full sm:w-auto px-7 py-3.5 text-sm font-medium cursor-pointer text-[#a1a1aa] hover:text-white"
              >
                Sign In to Existing Dossier
              </button>
            </div>
          </div>
        </section>

        {/* 6. LIQUID GLASS FOOTER */}
        <footer
          className="w-full mt-auto py-12 px-4 sm:px-6 border-t border-white/5"
          style={{ background: 'rgba(3, 3, 3, 0.85)', backdropFilter: 'blur(16px)' }}
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              {/* Brand Col */}
              <div className="space-y-3 max-w-sm">
                <div
                  onClick={(e) => handleDirectNav(e, 'hero')}
                  className="flex items-center gap-2.5 cursor-pointer group select-none"
                >
                  <svg className="w-6 h-6 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="4" fill="#7c3aed" />
                    <rect x="12" y="12" width="16" height="16" rx="4" fill="#8b5cf6" fillOpacity="0.85" />
                  </svg>
                  <span className="text-white font-bold text-base group-hover:text-[#c084fc] transition-colors">SmartHire Prep</span>
                  <span className="text-[#71717a] font-mono text-xs">• Dark SaaS Edition</span>
                </div>
                <p className="text-xs text-[#71717a] leading-relaxed">
                  Autonomous interview intelligence, deterministic ATS parser, and rubric-driven career evaluation.
                </p>
              </div>

              {/* Links Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
                {/* Sections */}
                <div className="space-y-2.5">
                  <p className="font-semibold text-white tracking-wider uppercase font-mono text-[11px]">Sections</p>
                  <div className="flex flex-col space-y-2 text-[#a1a1aa]">
                    <a href="#hero" onClick={(e) => handleDirectNav(e, 'hero')} className="hover:text-white transition-colors cursor-pointer">Overview</a>
                    <a href="#tracks" onClick={(e) => handleDirectNav(e, 'tracks')} className="hover:text-white transition-colors cursor-pointer">Solutions & Tracks</a>
                    <a href="#cockpit" onClick={(e) => handleDirectNav(e, 'cockpit')} className="hover:text-white transition-colors cursor-pointer">Live Cockpit</a>
                    <a href="#ats-scanner" onClick={(e) => handleDirectNav(e, 'ats-scanner')} className="hover:text-white transition-colors cursor-pointer">ATS Scanner</a>
                    <a href="#features" onClick={(e) => handleDirectNav(e, 'features')} className="hover:text-white transition-colors cursor-pointer">System Advantages</a>
                    <a href="#pricing" onClick={(e) => handleDirectNav(e, 'pricing')} className="hover:text-white transition-colors cursor-pointer">Plans & Pricing</a>
                  </div>
                </div>

                {/* Direct App Tools */}
                <div className="space-y-2.5">
                  <p className="font-semibold text-white tracking-wider uppercase font-mono text-[11px]">Applications</p>
                  <div className="flex flex-col space-y-2 text-[#a1a1aa]">
                    <button type="button" onClick={() => onNavigate('field_select')} className="hover:text-white transition-colors cursor-pointer text-left">
                      Field & Track Select
                    </button>
                    <button type="button" onClick={() => onNavigate('role_select')} className="hover:text-white transition-colors cursor-pointer text-left">
                      Role Selection
                    </button>
                    <button type="button" onClick={() => onNavigate('resume')} className="hover:text-white transition-colors cursor-pointer text-left">
                      ATS Resume Upload
                    </button>
                    <button type="button" onClick={() => onNavigate('resume_editor')} className="hover:text-white transition-colors cursor-pointer text-left">
                      Live Resume Studio
                    </button>
                    <button type="button" onClick={() => onNavigate('template_picker')} className="hover:text-white transition-colors cursor-pointer text-left">
                      Resume Templates
                    </button>
                    <button type="button" onClick={() => onNavigate('session_history')} className="hover:text-white transition-colors cursor-pointer text-left">
                      Examination History
                    </button>
                  </div>
                </div>

                {/* Candidate Account */}
                <div className="space-y-2.5">
                  <p className="font-semibold text-white tracking-wider uppercase font-mono text-[11px]">Account</p>
                  <div className="flex flex-col space-y-2 text-[#a1a1aa]">
                    {isAuthenticated ? (
                      <>
                        <button type="button" onClick={() => onNavigate('profile')} className="hover:text-white transition-colors cursor-pointer text-left font-medium text-[#c084fc]">
                          Candidate Profile
                        </button>
                        <button type="button" onClick={() => logout()} className="hover:text-white transition-colors cursor-pointer text-left">
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => onNavigate('login')} className="hover:text-white transition-colors cursor-pointer text-left">
                          Sign In
                        </button>
                        <button type="button" onClick={() => onNavigate('signup')} className="hover:text-white transition-colors cursor-pointer text-left">
                          Register Account
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717a]">
              <p>&copy; {new Date().getFullYear()} SmartHire Career Intelligence Systems. All rights reserved.</p>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>3D Engine: TubesCursor Active</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
