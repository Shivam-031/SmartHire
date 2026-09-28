import React, { useState, useEffect, useRef } from 'react';
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
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTrack, setActivePreviewTrack] = useState<'it' | 'management' | 'law'>('it');
  const [atsSampleType, setAtsSampleType] = useState<'it' | 'mgmt' | 'law'>('it');

  // Sticky header scroll status, progress bar, and active section spy
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const scrollRaf = useRef<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize 3D TubesCursor from CDN immediately on mount
  useEffect(() => {
    let isMounted = true;
    let appInstance: any = null;

    const initTubes = async () => {
      try {
        const canvas = canvasRef.current || (document.getElementById('canvas') as HTMLCanvasElement);
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const loadModule = new Function('url', 'return import(url)');
        const module = await loadModule(
          'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'
        );
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

    initTubes();

    const handleResize = () => {
      const canvas = canvasRef.current || (document.getElementById('canvas') as HTMLCanvasElement);
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      try {
        if (appInstance && typeof appInstance.dispose === 'function') {
          appInstance.dispose();
        }
      } catch (_) {}
    };
  }, []);

  // Optimized RAF scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRaf.current !== null) {
        return;
      }
      scrollRaf.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setIsScrolled(scrollY > 20);

        const winHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (winHeight > 0) {
          setScrollProgress(Math.min(100, Math.max(0, (scrollY / winHeight) * 100)));
        }

        const sections = ['hero', 'tracks', 'cockpit', 'ats-scanner', 'features', 'pricing'];
        for (const sectionId of sections) {
          const el = document.getElementById(sectionId);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 180 && rect.bottom >= 180) {
              setActiveSection(sectionId);
              break;
            }
          }
        }

        scrollRaf.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRaf.current !== null) {
        cancelAnimationFrame(scrollRaf.current);
        scrollRaf.current = null;
      }
    };
  }, []);

  // IntersectionObserver for smooth sliding reveal animation
  useEffect(() => {
    const elements = document.querySelectorAll('.saas-reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('saas-visible');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Direct smooth navigation with navbar offset compensation
  const handleDirectNav = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 88;
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

  // Telemetry preview data for AI Cockpit
  const previewData = {
    it: {
      tag: 'IT SYSTEMS',
      role: 'Frontend Developer & Systems Engineer',
      color: '#3b82f6',
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
      color: '#0EA5B7',
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

  // ATS Scanner Sample Data
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
      <canvas
        ref={canvasRef}
        id="canvas"
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Ambient background glows */}
      <div className="fixed top-[-100px] left-[10%] w-[550px] h-[550px] rounded-full bg-[#7c3aed]/22 blur-[140px] pointer-events-none" style={{ zIndex: 0 }} />
      <div className="fixed top-[40%] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#3b82f6]/18 blur-[150px] pointer-events-none" style={{ zIndex: 0 }} />
      <div className="fixed bottom-[-100px] left-[30%] w-[650px] h-[650px] rounded-full bg-[#8b5cf6]/20 blur-[160px] pointer-events-none" style={{ zIndex: 0 }} />

      {/* Main content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* 1. LIQUID GLASS NAVBAR (Fixed Floating Pill Dock - No Jitter, Zero Layout Shift) */}
        <header className="sticky top-0 z-50 w-full pt-4 pb-2 px-4 sm:px-6 pointer-events-none">
          <nav
            className={`liquid-glass-nav pointer-events-auto flex items-center justify-between mx-auto relative overflow-hidden ${
              isScrolled ? 'is-scrolled' : ''
            }`}
          >
            {/* Ambient Progress Bar */}
            <div
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#7c3aed] via-[#3b82f6] to-[#ec4899] transition-all duration-150 pointer-events-none rounded-full"
              style={{ width: `${scrollProgress}%`, opacity: isScrolled ? 0.95 : 0.3 }}
            />

            {/* Left: SmartHire Logo */}
            <div
              onClick={(e) => handleDirectNav(e, 'hero')}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
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

            {/* Center: Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-2 text-sm font-medium">
              <a
                href="#hero"
                onClick={(e) => handleDirectNav(e, 'hero')}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeSection === 'hero'
                    ? 'text-white bg-white/10 shadow-xs'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
                }`}
              >
                Overview
              </a>

              <a
                href="#tracks"
                onClick={(e) => handleDirectNav(e, 'tracks')}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 group ${
                  activeSection === 'tracks'
                    ? 'text-white bg-white/10 shadow-xs'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Tracks</span>
                <svg
                  className="w-3.5 h-3.5 text-[#71717a] group-hover:text-white transition-transform duration-200 group-hover:translate-y-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </a>

              <a
                href="#cockpit"
                onClick={(e) => handleDirectNav(e, 'cockpit')}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 group ${
                  activeSection === 'cockpit'
                    ? 'text-white bg-white/10 shadow-xs'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>AI Cockpit</span>
              </a>

              <a
                href="#ats-scanner"
                onClick={(e) => handleDirectNav(e, 'ats-scanner')}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeSection === 'ats-scanner'
                    ? 'text-white bg-white/10 shadow-xs'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
                }`}
              >
                ATS Scanner
              </a>

              <a
                href="#features"
                onClick={(e) => handleDirectNav(e, 'features')}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeSection === 'features'
                    ? 'text-white bg-white/10 shadow-xs'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
                }`}
              >
                Features
              </a>

              <a
                href="#pricing"
                onClick={(e) => handleDirectNav(e, 'pricing')}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeSection === 'pricing'
                    ? 'text-white bg-white/10 shadow-xs'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
                }`}
              >
                Pricing
              </a>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Direct Link to ATS Scanner */}
              <button
                type="button"
                onClick={() => onNavigate('resume')}
                className="text-xs font-medium text-[#a1a1aa] hover:text-white transition-colors cursor-pointer hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/5"
              >
                <span className="material-symbols-outlined text-[15px]">document_scanner</span>
                <span>ATS Check</span>
              </button>

              {/* Direct Link to Resume Studio */}
              <button
                type="button"
                onClick={() => onNavigate('resume_editor')}
                className="text-xs font-medium text-[#a1a1aa] hover:text-white transition-colors cursor-pointer hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/5"
              >
                <span className="material-symbols-outlined text-[15px]">edit_note</span>
                <span>Resume Studio</span>
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('profile')}
                    className="btn-glass px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span>Workspace ({user?.name?.split(' ')[0] || 'Candidate'})</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="text-xs text-[#71717a] hover:text-white transition-colors px-2 py-1 cursor-pointer"
                    title="Sign Out"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors cursor-pointer hidden sm:inline px-2 py-1"
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

          {/* 2. MOBILE MENU DRAWER */}
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
                <a
                  href="#hero"
                  onClick={(e) => handleDirectNav(e, 'hero')}
                  className="hover:text-white py-1.5 transition-colors"
                >
                  Overview
                </a>
                <a
                  href="#tracks"
                  onClick={(e) => handleDirectNav(e, 'tracks')}
                  className="hover:text-white py-1.5 transition-colors"
                >
                  Career Tracks
                </a>
                <a
                  href="#cockpit"
                  onClick={(e) => handleDirectNav(e, 'cockpit')}
                  className="hover:text-white py-1.5 transition-colors"
                >
                  AI Cockpit Preview
                </a>
                <a
                  href="#ats-scanner"
                  onClick={(e) => handleDirectNav(e, 'ats-scanner')}
                  className="hover:text-white py-1.5 transition-colors"
                >
                  ATS Resume Scanner
                </a>
                <a
                  href="#features"
                  onClick={(e) => handleDirectNav(e, 'features')}
                  className="hover:text-white py-1.5 transition-colors"
                >
                  System Features
                </a>
                <a
                  href="#pricing"
                  onClick={(e) => handleDirectNav(e, 'pricing')}
                  className="hover:text-white py-1.5 transition-colors"
                >
                  Pricing
                </a>
              </div>

              {/* Direct App Tool Shortcuts inside Drawer */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Quick Tools</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('resume');
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-left text-[#a1a1aa] hover:text-white flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#3b82f6]">document_scanner</span>
                    <span>ATS Scan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('resume_editor');
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-left text-[#a1a1aa] hover:text-white flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#8b5cf6]">edit_note</span>
                    <span>Studio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('template_picker');
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-left text-[#a1a1aa] hover:text-white flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#0EA5B7]">palette</span>
                    <span>Templates</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('session_history');
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-left text-[#a1a1aa] hover:text-white flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-emerald-400">history</span>
                    <span>Sessions</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('profile');
                      }}
                      className="w-full py-2.5 rounded-full btn-glass text-xs font-semibold text-white cursor-pointer"
                    >
                      Open Candidate Workspace &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full py-2 text-xs text-[#71717a] hover:text-white cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('login');
                      }}
                      className="w-full py-2.5 rounded-full btn-glass text-xs font-semibold text-white cursor-pointer"
                    >
                      Log in
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('field_select');
                      }}
                      className="w-full py-2.5 rounded-full btn-gradient-primary text-xs font-semibold text-white cursor-pointer"
                    >
                      Start for free &rarr;
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </header>

        {/* 3. HERO SECTION */}
        <section
          id="hero"
          className="saas-reveal saas-visible pt-16 sm:pt-24 pb-16 px-4 sm:px-6 flex flex-col items-center text-center max-w-5xl mx-auto w-full"
        >
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
            <span>AI Mock Interview & ATS Scanner 2.0 is live &rarr;</span>
          </div>

          {/* Headline */}
          <h1 className="text-[2.2rem] sm:text-[3rem] md:text-[3.8rem] lg:text-[4.5rem] font-bold tracking-tight text-white leading-[1.1] max-w-4xl">
            The all-in-one platform
            <br />
            to ace your{' '}
            <span className="gradient-text-highlights">
              Interviews.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-base sm:text-xl text-[#a1a1aa] max-w-[620px] mx-auto leading-relaxed">
            Practice with adaptive AI examiners calibrated for IT, Management, and Law. Optimize your resume with deterministic ATS scoring and instant feedback.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {/* Primary: Start for free */}
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

            {/* Secondary: Check ATS Resume */}
            <button
              type="button"
              onClick={() => onNavigate('resume')}
              className="btn-glass w-full sm:w-auto px-7 py-4 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#60a5fa]">document_scanner</span>
              <span>Scan Resume (ATS)</span>
            </button>

            {/* Google OAuth Direct GIS Integration */}
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="btn-glass w-full sm:w-auto px-6 py-4 text-sm font-medium flex items-center justify-center gap-2.5 cursor-pointer text-[#a1a1aa] hover:text-white"
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
            )}
          </div>

          {/* Quick Jump Action Cards - Direct access to all pages */}
          <div className="mt-14 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div
              onClick={() => onNavigate('field_select')}
              className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#7c3aed]/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/30 flex items-center justify-center text-[#c084fc] mb-3">
                  <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <h3 className="font-semibold text-sm text-white group-hover:text-[#c084fc] transition-colors">
                  AI Mock Interview
                </h3>
                <p className="text-xs text-[#a1a1aa] mt-1 line-clamp-2">
                  Interactive dialogue with domain-calibrated examiners and STAR rubrics.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-[#c084fc] group-hover:translate-x-1 transition-transform">
                <span>Start Session &rarr;</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('resume')}
              className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#3b82f6]/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#60a5fa] mb-3">
                  <span className="material-symbols-outlined text-[20px]">document_scanner</span>
                </div>
                <h3 className="font-semibold text-sm text-white group-hover:text-[#60a5fa] transition-colors">
                  ATS Resume Scanner
                </h3>
                <p className="text-xs text-[#a1a1aa] mt-1 line-clamp-2">
                  Deep semantic keyword matching and pass-rate probability analysis.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-[#60a5fa] group-hover:translate-x-1 transition-transform">
                <span>Scan Resume &rarr;</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('resume_editor')}
              className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#0EA5B7]/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#0EA5B7]/15 border border-[#0EA5B7]/30 flex items-center justify-center text-[#22D3EE] mb-3">
                  <span className="material-symbols-outlined text-[20px]">edit_document</span>
                </div>
                <h3 className="font-semibold text-sm text-white group-hover:text-[#22D3EE] transition-colors">
                  Markdown Resume Studio
                </h3>
                <p className="text-xs text-[#a1a1aa] mt-1 line-clamp-2">
                  Zero-formatting penalty resume builder with live compile & template sync.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-[#22D3EE] group-hover:translate-x-1 transition-transform">
                <span>Open Studio &rarr;</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('session_history')}
              className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                  <span className="material-symbols-outlined text-[20px]">monitoring</span>
                </div>
                <h3 className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
                  Session Telemetry
                </h3>
                <p className="text-xs text-[#a1a1aa] mt-1 line-clamp-2">
                  Detailed transcripts, examiner critique archives, and historical scores.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>View History &rarr;</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SOCIAL PROOF SECTION */}
        <section
          id="social-proof"
          className="saas-reveal w-full max-w-6xl mx-auto px-4 sm:px-6 mt-6"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '36px 0 64px',
          }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-wider text-[#71717a]">
              Trusted by 10,000+ candidates and top engineering teams
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
              <span className="text-xs text-[#71717a]">from 1,200+ verified evaluations</span>
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
              <svg className="h-6 w-6" viewBox="0 0 36 36" fill="currentColor">
                <path d="M10 5h10.8c6.9 0 11.7 4.2 11.7 10.4 0 4.6-2.8 8.1-7 9.6l8.2 10h-6.8l-7.4-9.3H15.2V35H10V5zm5.2 15.6h5.3c3.8 0 6.3-2.1 6.3-5.3 0-3.2-2.5-5.3-6.3-5.3h-5.3v10.6z" />
              </svg>
              <span className="font-semibold text-lg tracking-tight">Remix</span>
            </div>

            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 36 36" fill="currentColor">
                <path d="M18.8 6.2l-3.5 3.5 7.1 7.1-7.1 7.1 3.5 3.5 10.6-10.6L18.8 6.2zm-12 10.6L17.4 6.2l-3.5-3.5L3.3 13.3c-2 2-2 5.2 0 7.2l10.6 10.6 3.5-3.5-10.6-10.8z" />
              </svg>
              <span className="font-semibold text-lg tracking-tight">Raycast</span>
            </div>

            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <svg className="h-6 w-7" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 8c-4.4 0-7.2 2.2-8.4 6.6 1.8-2.2 3.8-3 6-2.4 1.3.3 2.2 1.3 3.2 2.3C18.4 16.2 20.6 18 26 18c4.4 0 7.2-2.2 8.4-6.6-1.8 2.2-3.8 3-6 2.4-1.3-.3-2.2-1.3-3.2-2.3C23.6 9.8 21.4 8 16 8zM8 18c-4.4 0-7.2 2.2-8.4 6.6 1.8-2.2 3.8-3 6-2.4 1.3.3 2.2 1.3 3.2 2.3C10.4 26.2 12.6 28 18 28c4.4 0 7.2-2.2 8.4-6.6-1.8 2.2-3.8 3-6 2.4-1.3-.3-2.2-1.3-3.2-2.3C15.6 19.8 13.4 18 8 18z" />
              </svg>
              <span className="font-semibold text-lg tracking-tight">tailwindcss</span>
            </div>
          </div>
        </section>

        {/* 5. CAREER TRACKS SECTION */}
        <section id="tracks" className="saas-reveal py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#c084fc]">
              SOLUTIONS // THREE CALIBRATED VERTICALS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Calibrated For Your Career Domain
            </h2>
            <p className="text-sm sm:text-base text-[#a1a1aa]">
              Generic tools ask generic questions. SmartHire leverages dedicated AI examiners and rubrics engineered
              for your industry.
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
                <span>Initialize IT Track</span>
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
                <span>Initialize Management Track</span>
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
                <span>Initialize Legal Track</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. AI EXAMINER COCKPIT PREVIEW */}
        <section id="cockpit" className="saas-reveal py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <div
            className="rounded-3xl overflow-hidden shadow-2xl transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Header bar */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80" />
                <span className="ml-2 font-mono text-xs text-[#a1a1aa]">
                  EXAMINATION COCKPIT // TELEMETRY PREVIEW
                </span>
              </div>

              {/* Track pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 text-xs">
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
                    onClick={() => onNavigate('field_select')}
                    className="text-xs text-[#a1a1aa] hover:text-white transition-colors"
                  >
                    View All Tracks
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

        {/* 7. DETERMINISTIC ATS SCANNER */}
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
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="saas-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-white">{currentAts.score}%</span>
                    <span className="text-[10px] font-mono text-[#71717a]">Match Grade</span>
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold text-emerald-400">{currentAts.matchGrade}</p>
              </div>

              {/* Keywords List */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <p className="text-xs font-mono uppercase text-[#71717a] mb-2">Detected Keywords ({currentAts.matched.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentAts.matched.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-mono uppercase text-[#71717a] mb-2">Missing High-Impact Keywords ({currentAts.missing.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentAts.missing.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        ✕ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[#a1a1aa]">
                  <span className="font-semibold text-white">ATS Heuristic Analysis: </span>
                  {currentAts.summary}
                </div>
              </div>
            </div>

            {/* Direct Tool Links below ATS */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-[#a1a1aa]">
                Compile and export your resume in our markdown studio with zero formatting penalties.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('resume_editor')}
                  className="btn-glass px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Open Resume Studio
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('resume')}
                  className="btn-gradient-primary px-5 py-2 text-xs font-semibold cursor-pointer shadow-md"
                >
                  Scan Your Resume Now &rarr;
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 8. SYSTEM ADVANTAGES BENTO GRID */}
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
            {/* Card 1 */}
            <div
              onClick={() => onNavigate('field_select')}
              className="rounded-3xl p-7 space-y-3 cursor-pointer group hover:border-[#7c3aed]/40 transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#7c3aed]/15 border border-[#7c3aed]/30 flex items-center justify-center text-[#c084fc]">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-[#c084fc] transition-colors">
                Persona AI Examiners
              </h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Adaptive examiners who interrogate depth, challenge architectural trade-offs, and dynamically adjust difficulty.
              </p>
              <span className="inline-block text-xs font-semibold text-[#c084fc] pt-2">
                Launch Mock Session &rarr;
              </span>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => onNavigate('profile')}
              className="rounded-3xl p-7 space-y-3 cursor-pointer group hover:border-[#3b82f6]/40 transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#60a5fa]">
                <span className="material-symbols-outlined text-[20px]">database</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-[#60a5fa] transition-colors">
                Dual Database Engine
              </h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Relational candidate accounts in SQLite; dynamic resume schemas and evaluation trees in MongoDB Atlas.
              </p>
              <span className="inline-block text-xs font-semibold text-[#60a5fa] pt-2">
                View Candidate Dossier &rarr;
              </span>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => onNavigate('session_history')}
              className="rounded-3xl p-7 space-y-3 cursor-pointer group hover:border-[#0EA5B7]/40 transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#0EA5B7]/15 border border-[#0EA5B7]/30 flex items-center justify-center text-[#22D3EE]">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-[#22D3EE] transition-colors">
                STAR & IRAC Rubrics
              </h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Automated scoring based on formal industry interview frameworks with detailed critique on every answer.
              </p>
              <span className="inline-block text-xs font-semibold text-[#22D3EE] pt-2">
                Explore Analytics &rarr;
              </span>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => onNavigate('resume')}
              className="rounded-3xl p-7 space-y-3 cursor-pointer group hover:border-emerald-500/40 transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Deterministic ATS Engine
              </h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Heuristic keyword density, formatting compliance checks, and reverse-chronological hierarchy parsing.
              </p>
              <span className="inline-block text-xs font-semibold text-emerald-400 pt-2">
                Check ATS Score &rarr;
              </span>
            </div>

            {/* Card 5 */}
            <div
              onClick={() => onNavigate('resume_editor')}
              className="rounded-3xl p-7 space-y-3 cursor-pointer group hover:border-[#ec4899]/40 transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#ec4899]/15 border border-[#ec4899]/30 flex items-center justify-center text-[#f472b6]">
                <span className="material-symbols-outlined text-[20px]">edit_note</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-[#f472b6] transition-colors">
                Markdown Resume Studio
              </h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Live markdown resume editing with instant preview, zero-lag parsing, and multi-version draft storage.
              </p>
              <span className="inline-block text-xs font-semibold text-[#f472b6] pt-2">
                Open Resume Studio &rarr;
              </span>
            </div>

            {/* Card 6 */}
            <div
              onClick={() => onNavigate('template_picker')}
              className="rounded-3xl p-7 space-y-3 cursor-pointer group hover:border-[#eab308]/40 transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#eab308]/15 border border-[#eab308]/30 flex items-center justify-center text-[#facc15]">
                <span className="material-symbols-outlined text-[20px]">palette</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-[#facc15] transition-colors">
                Executive Template Gallery
              </h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Pre-calibrated typographical templates optimized for applicant tracking systems and executive recruiters.
              </p>
              <span className="inline-block text-xs font-semibold text-[#facc15] pt-2">
                Choose Templates &rarr;
              </span>
            </div>
          </div>
        </section>

        {/* 9. PRICING & ONBOARDING SECTION */}
        <section id="pricing" className="saas-reveal py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#c084fc]">
              PLANS & ONBOARDING
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Transparent Access for Every Candidate
            </h2>
            <p className="text-sm sm:text-base text-[#a1a1aa]">
              Start with free mock interviews and expand your preparation as you target top-tier companies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <span className="font-mono text-xs uppercase font-semibold text-[#a1a1aa]">Free Starter</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-white">$0</span>
                  <span className="text-xs text-[#71717a]">/ forever free</span>
                </div>
                <p className="text-xs text-[#a1a1aa]">Ideal for initial resume check and interview baseline.</p>
                <div className="pt-4 border-t border-white/5 space-y-2 text-xs text-[#d4d4d8]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Full ATS Resume Check</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>3 Full AI Mock Sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Markdown Resume Studio</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('field_select')}
                className="mt-6 w-full py-3 rounded-full btn-glass text-xs font-semibold cursor-pointer"
              >
                Start Practicing Free
              </button>
            </div>

            {/* Pro Plan */}
            <div
              className="rounded-3xl p-7 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: 'rgba(124, 58, 237, 0.08)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                boxShadow: '0 0 40px rgba(124, 58, 237, 0.2)',
              }}
            >
              <div className="absolute top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#7c3aed] text-[10px] font-mono font-semibold text-white uppercase">
                Most Popular
              </div>

              <div className="space-y-4">
                <span className="font-mono text-xs uppercase font-semibold text-[#c084fc]">Pro Candidate</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-white">$19</span>
                  <span className="text-xs text-[#71717a]">/ month</span>
                </div>
                <p className="text-xs text-[#a1a1aa]">Complete toolkit for active career transitions and offer hunting.</p>
                <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-[#d4d4d8]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Unlimited AI Mock Interviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Examiner STAR/IRAC Feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Unlimited ATS Scans & Keyword Tuning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>All Executive Resume Templates</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('field_select')}
                className="mt-6 w-full py-3 rounded-full btn-gradient-primary text-xs font-semibold cursor-pointer shadow-lg"
              >
                Get Pro Candidate &rarr;
              </button>
            </div>

            {/* Enterprise / Universities */}
            <div
              className="rounded-3xl p-7 flex flex-col justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="space-y-4">
                <span className="font-mono text-xs uppercase font-semibold text-[#a1a1aa]">Institutions & Teams</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-white">Custom</span>
                  <span className="text-xs text-[#71717a]">/ cohort</span>
                </div>
                <p className="text-xs text-[#a1a1aa]">Designed for universities, bootcamps, and career centers.</p>
                <div className="pt-4 border-t border-white/5 space-y-2 text-xs text-[#d4d4d8]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Cohort Telemetry & Score Export</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Custom Rubric Calibration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Dedicated Institutional Dashboard</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="mt-6 w-full py-3 rounded-full btn-glass text-xs font-semibold cursor-pointer"
              >
                Sign In to Institution
              </button>
            </div>
          </div>
        </section>

        {/* 10. BOTTOM EPIC CALL TO ACTION BANNER */}
        <section className="saas-reveal py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full text-center">
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
              <span>INSTANT ONBOARDING // FREE ACCESS</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Ready to ace your <span className="gradient-text-highlights">Next Interview?</span>
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

        {/* 11. LIQUID GLASS FOOTER */}
        <footer
          className="w-full mt-auto py-12 px-4 sm:px-6 border-t border-white/5"
          style={{ background: 'rgba(3, 3, 3, 0.8)' }}
        >
          <div className="max-w-6xl mx-auto space-y-10">
            {/* 4 Column Directory */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
              <div className="col-span-2 md:col-span-1 space-y-3">
                <div
                  onClick={(e) => handleDirectNav(e, 'hero')}
                  className="flex items-center gap-2.5 cursor-pointer group select-none"
                >
                  <svg className="w-6 h-6 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="4" fill="#7c3aed" />
                    <rect x="12" y="12" width="16" height="16" rx="4" fill="#8b5cf6" fillOpacity="0.85" />
                  </svg>
                  <span className="text-white font-bold text-base group-hover:text-[#c084fc] transition-colors">SmartHire</span>
                </div>
                <p className="text-[#71717a] leading-relaxed">
                  Next-generation AI interview preparation and deterministic applicant tracking system optimization.
                </p>
                <div className="flex items-center gap-2 font-mono text-[11px] text-[#71717a] pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>TubesCursor 3D Engine Active</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-mono text-[11px] uppercase font-semibold text-white tracking-wider">Sections</p>
                <div className="flex flex-col space-y-2 text-[#a1a1aa]">
                  <a href="#hero" onClick={(e) => handleDirectNav(e, 'hero')} className="hover:text-white transition-colors cursor-pointer">Overview</a>
                  <a href="#tracks" onClick={(e) => handleDirectNav(e, 'tracks')} className="hover:text-white transition-colors cursor-pointer">Career Tracks</a>
                  <a href="#cockpit" onClick={(e) => handleDirectNav(e, 'cockpit')} className="hover:text-white transition-colors cursor-pointer">AI Cockpit Preview</a>
                  <a href="#ats-scanner" onClick={(e) => handleDirectNav(e, 'ats-scanner')} className="hover:text-white transition-colors cursor-pointer">ATS Scanner</a>
                  <a href="#features" onClick={(e) => handleDirectNav(e, 'features')} className="hover:text-white transition-colors cursor-pointer">System Advantages</a>
                  <a href="#pricing" onClick={(e) => handleDirectNav(e, 'pricing')} className="hover:text-white transition-colors cursor-pointer">Pricing & Plans</a>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-mono text-[11px] uppercase font-semibold text-white tracking-wider">Applications</p>
                <div className="flex flex-col space-y-2 text-[#a1a1aa]">
                  <button type="button" onClick={() => onNavigate('field_select')} className="text-left hover:text-white transition-colors cursor-pointer">
                    Mock Interview Engine
                  </button>
                  <button type="button" onClick={() => onNavigate('role_select')} className="text-left hover:text-white transition-colors cursor-pointer">
                    Role & Track Catalog
                  </button>
                  <button type="button" onClick={() => onNavigate('resume')} className="text-left hover:text-white transition-colors cursor-pointer">
                    ATS Resume Scanner
                  </button>
                  <button type="button" onClick={() => onNavigate('resume_editor')} className="text-left hover:text-white transition-colors cursor-pointer">
                    Markdown Resume Studio
                  </button>
                  <button type="button" onClick={() => onNavigate('template_picker')} className="text-left hover:text-white transition-colors cursor-pointer">
                    Executive Template Picker
                  </button>
                  <button type="button" onClick={() => onNavigate('session_history')} className="text-left hover:text-white transition-colors cursor-pointer">
                    Session Telemetry History
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-mono text-[11px] uppercase font-semibold text-white tracking-wider">Candidate Account</p>
                <div className="flex flex-col space-y-2 text-[#a1a1aa]">
                  <button type="button" onClick={() => onNavigate('profile')} className="text-left hover:text-white transition-colors cursor-pointer">
                    Candidate Profile Dossier
                  </button>
                  <button type="button" onClick={() => onNavigate('login')} className="text-left hover:text-white transition-colors cursor-pointer">
                    Candidate Sign In
                  </button>
                  <button type="button" onClick={() => onNavigate('signup')} className="text-left hover:text-white transition-colors cursor-pointer">
                    Create New Account
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717a]">
              <span>© {new Date().getFullYear()} SmartHire Platform. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>All Systems Operational</span>
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
