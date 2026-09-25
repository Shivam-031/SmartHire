import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { type DocketStep } from './AppLayout';

interface LandingPageProps {
  onNavigate: (step: DocketStep) => void;
  onSelectTrack?: (field: string, role?: string) => void;
}

export const SaaSLandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSelectTrack,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTrack, setActivePreviewTrack] = useState<'it' | 'management' | 'law'>('it');
  const [atsSampleType, setAtsSampleType] = useState<'it' | 'mgmt' | 'law'>('it');

  // Sticky header state & scroll telemetry
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const tickingRef = useRef(false);

  // Initialize 3D TubesCursor from CDN using runtime dynamic function import
  useEffect(() => {
    let isMounted = true;
    let appInstance: any = null;

    const initTubes = async () => {
      try {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
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
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
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

  // High-performance requestAnimationFrame scroll listener for navbar sticking & telemetry
  useEffect(() => {
    const handleScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setIsScrolled(scrollY > 20);

          const winHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (winHeight > 0) {
            setScrollProgress(Math.min(100, Math.max(0, (scrollY / winHeight) * 100)));
          }

          // Section Spy
          const sectionIds = ['hero', 'tracks', 'cockpit', 'ats-scanner', 'features', 'pricing'];
          for (const id of sectionIds) {
            const el = document.getElementById(id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= 180 && rect.bottom >= 180) {
                setActiveSection(id);
                break;
              }
            }
          }
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth sliding reveal animations on scroll
  useEffect(() => {
    const hero = document.getElementById('hero');
    if (hero) hero.classList.add('saas-visible');

    const elements = document.querySelectorAll('.saas-reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('saas-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Direct smooth navigation with exact header offset
  const handleDirectNav = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, elementPosition - navOffset),
        behavior: 'smooth',
      });
    }
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

  const handleLaunchTrack = (field: 'it' | 'management' | 'law', defaultRole?: string) => {
    if (onSelectTrack) {
      onSelectTrack(field, defaultRole);
    }
    onNavigate('role_select');
  };

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
    <div className="min-h-screen bg-[#030303] text-white font-sans antialiased selection:bg-[#7c3aed]/30 selection:text-white relative">
      {/* Self-contained exact CSS rules */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        .saas-fixed-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          pointer-events: none;
          transition: padding 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .saas-liquid-nav {
          pointer-events: auto;
          position: relative;
          height: 74px;
          padding: 0 24px;
          border-radius: 100px;
          max-width: 1200px;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: height 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      background 0.3s ease,
                      border-color 0.3s ease,
                      box-shadow 0.3s ease,
                      max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      padding 0.3s ease;
        }

        .saas-liquid-nav.is-stuck {
          height: 60px;
          max-width: 1240px;
          padding: 0 20px;
          background: rgba(8, 8, 14, 0.90);
          backdrop-filter: blur(20px) saturate(190%);
          -webkit-backdrop-filter: blur(20px) saturate(190%);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.8),
                      0 0 24px rgba(124, 58, 237, 0.22),
                      inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .saas-gradient-text {
          background: linear-gradient(135deg, #60a5fa, #c084fc, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .saas-btn-gradient {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          color: #ffffff;
          border-radius: 100px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .saas-btn-gradient:hover {
          filter: brightness(1.12);
          box-shadow: 0 0 25px rgba(139, 92, 246, 0.45);
        }

        .saas-btn-glass {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border-radius: 100px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .saas-btn-glass:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .saas-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }

        .saas-reveal.saas-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .saas-reveal {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* 3D Animated Background Canvas (TubesCursor) */}
      <canvas
        id="canvas"
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Ambient background glows */}
      <div className="fixed top-[-100px] left-[10%] w-[500px] h-[500px] rounded-full bg-[#7c3aed]/12 blur-[140px] pointer-events-none" />
      <div className="fixed top-[40%] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#3b82f6]/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[30%] w-[600px] h-[600px] rounded-full bg-[#8b5cf6]/10 blur-[160px] pointer-events-none" />

      {/* 1. FIXED FLOATING NAVBAR DOCK */}
      <header
        className={`saas-fixed-header ${
          isScrolled ? 'pt-2 sm:pt-3 px-3 sm:px-6' : 'pt-5 sm:pt-6 px-4 sm:px-6'
        }`}
      >
        <nav
          className={`saas-liquid-nav flex items-center justify-between mx-auto overflow-hidden ${
            isScrolled ? 'is-stuck' : ''
          }`}
        >
          {/* Scroll progress glow bar */}
          <div
            className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#7c3aed] via-[#3b82f6] to-[#f472b6] transition-all duration-100 pointer-events-none rounded-full"
            style={{ width: `${scrollProgress}%`, opacity: isScrolled ? 0.95 : 0 }}
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

          {/* Center: Desktop Navigation Links with active indicator */}
          <div className="hidden lg:flex items-center gap-2 text-sm font-medium">
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
              href="#tracks"
              onClick={(e) => handleDirectNav(e, 'tracks')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 group ${
                activeSection === 'tracks'
                  ? 'text-white bg-white/10 shadow-xs'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Solutions</span>
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

            <a
              href="#cockpit"
              onClick={(e) => handleDirectNav(e, 'cockpit')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 group ${
                activeSection === 'cockpit'
                  ? 'text-white bg-white/10 shadow-xs'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Resources</span>
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
              href="#ats-scanner"
              onClick={(e) => handleDirectNav(e, 'ats-scanner')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeSection === 'ats-scanner'
                  ? 'text-white bg-white/10 shadow-xs'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
              }`}
            >
              Changelog
            </a>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="saas-btn-glass px-5 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Workspace ({user?.name?.split(' ')[0] || 'Candidate'})</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
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
                  className="saas-btn-gradient px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.55)] transition-all"
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
            className="lg:hidden max-w-md mx-auto mt-2 rounded-3xl p-6 space-y-4 shadow-2xl pointer-events-auto transition-all"
            style={{
              background: 'rgba(10, 10, 15, 0.95)',
              backdropFilter: 'blur(20px) saturate(190%)',
              WebkitBackdropFilter: 'blur(20px) saturate(190%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div className="flex flex-col space-y-3 text-sm font-medium text-[#a1a1aa]">
              <a
                href="#features"
                onClick={(e) => handleDirectNav(e, 'features')}
                className="hover:text-white py-1.5 transition-colors"
              >
                Features
              </a>
              <a
                href="#tracks"
                onClick={(e) => handleDirectNav(e, 'tracks')}
                className="hover:text-white py-1.5 transition-colors"
              >
                Solutions
              </a>
              <a
                href="#pricing"
                onClick={(e) => handleDirectNav(e, 'pricing')}
                className="hover:text-white py-1.5 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#cockpit"
                onClick={(e) => handleDirectNav(e, 'cockpit')}
                className="hover:text-white py-1.5 transition-colors"
              >
                Resources
              </a>
              <a
                href="#ats-scanner"
                onClick={(e) => handleDirectNav(e, 'ats-scanner')}
                className="hover:text-white py-1.5 transition-colors"
              >
                Changelog
              </a>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('login');
                }}
                className="w-full py-2.5 rounded-full saas-btn-glass text-xs font-semibold text-white cursor-pointer"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('field_select');
                }}
                className="w-full py-2.5 rounded-full saas-btn-gradient text-xs font-semibold text-white cursor-pointer"
              >
                Start for free &rarr;
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* 3. HERO SECTION (Padding accounts for fixed navbar) */}
        <section id="hero" className="saas-reveal pt-32 sm:pt-40 pb-16 px-4 sm:px-6 flex flex-col items-center text-center max-w-5xl mx-auto w-full">
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

          {/* Headline (H1): font-size: 4.5rem; line-height: 1.1; font-weight: 700 */}
          <h1 className="text-[2.2rem] sm:text-[3rem] md:text-[3.8rem] lg:text-[4.5rem] font-bold tracking-tight text-white leading-[1.1] max-w-4xl">
            The all-in-one platform
            <br />
            to scale your{' '}
            <span className="saas-gradient-text">
              SaaS
            </span>
          </h1>

          {/* Subheadline (P): font-size: 1.25rem; max-width: 600px; color: #a1a1aa; */}
          <p className="mt-6 text-base sm:text-xl text-[#a1a1aa] max-w-[600px] mx-auto leading-relaxed">
            Build, launch, and grow your SaaS faster with powerful tools, beautiful analytics, and AI that works for you.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {/* Primary: Start for free -> */}
            <button
              type="button"
              onClick={() => onNavigate('field_select')}
              className="saas-btn-gradient w-full sm:w-auto px-8 py-4 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)]"
            >
              <span>Start for free</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Secondary: Book a demo */}
            <a
              href="#ats-scanner"
              onClick={(e) => handleDirectNav(e, 'ats-scanner')}
              className="saas-btn-glass w-full sm:w-auto px-7 py-4 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book a demo</span>
            </a>

            {/* Google OAuth Direct GIS Integration */}
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="saas-btn-glass w-full sm:w-auto px-6 py-4 text-sm font-medium flex items-center justify-center gap-2.5 cursor-pointer text-[#a1a1aa] hover:text-white"
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
        </section>

        {/* 4. SOCIAL PROOF SECTION */}
        <section
          id="social-proof"
          className="saas-reveal w-full max-w-6xl mx-auto px-4 sm:px-6 mt-10"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '40px 0 80px',
          }}
        >
          {/* Header & Review Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-wider text-[#71717a]">
              Trusted by 10,000+ teams worldwide
            </p>

            {/* Reviews: 5 yellow SVG stars + text */}
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

          {/* Logos Row: Linear, Loom, Remix, Raycast, Tailwind CSS (gap 48px, opacity 0.6 hover: 1) */}
          <div className="flex flex-wrap items-center justify-center lg:justify-between gap-8 lg:gap-12">
            {/* Linear Logo */}
            <div className="flex items-center gap-2.5 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 100 100" fill="currentColor">
                <path d="M1.229 64.91a48.77 48.77 0 0 1-.229-4.71c0-26.95 21.85-48.8 48.8-48.8 1.58 0 3.14.08 4.69.23L4.72 61.39a48.4 48.4 0 0 1-3.491 3.52zm8.01 10.36L69.49 15.02A48.66 48.66 0 0 1 88.58 35.13L24.6 98.74a48.77 48.77 0 0 1-15.361-13.47zM35.09 98.77l63.68-63.68c.81 3.12 1.23 6.38 1.23 9.71 0 26.95-21.85 48.8-48.8 48.8-5.61 0-10.97-.95-16.11-2.83zm59.68-69.2L70.4 5.2a48.7 48.7 0 0 1 24.37 24.37zM49.8 0C22.297 0 0 22.297 0 49.8s22.297 49.8 49.8 49.8 49.8-22.297 49.8-49.8S77.303 0 49.8 0z" />
              </svg>
              <span className="font-semibold text-lg tracking-tight">Linear</span>
            </div>

            {/* Loom Logo */}
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 40 40" fill="currentColor">
                <path d="M19.78 0c-4.32 0-8.1 2.37-10.1 5.92L0 22.68l9.68 16.78c2 3.54 5.78 5.92 10.1 5.92 4.32 0 8.1-2.38 10.1-5.92l9.68-16.78L29.88 5.92C27.88 2.37 24.1 0 19.78 0zm0 8.04c2.19 0 3.96 1.77 3.96 3.96v7.35l6.36 3.67c1.9 1.1 2.55 3.53 1.46 5.43-1.1 1.9-3.53 2.55-5.43 1.46L19.78 26.24v7.35c0 2.19-1.77 3.96-3.96 3.96-2.19 0-3.96-1.77-3.96-3.96v-7.35l-6.36 3.67c-1.9 1.1-4.34.44-5.43-1.46-1.1-1.9-.44-4.34 1.46-5.43l6.36-3.67v-7.35c0-2.19 1.77-3.96 3.96-3.96z" />
              </svg>
              <span className="font-semibold text-lg tracking-tight">loom</span>
            </div>

            {/* Remix Logo */}
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 36 36" fill="currentColor">
                <path d="M10 5h10.8c6.9 0 11.7 4.2 11.7 10.4 0 4.6-2.8 8.1-7 9.6l8.2 10h-6.8l-7.4-9.3H15.2V35H10V5zm5.2 15.6h5.3c3.8 0 6.3-2.1 6.3-5.3 0-3.2-2.5-5.3-6.3-5.3h-5.3v10.6z" />
              </svg>
              <span className="font-semibold text-lg tracking-tight">Remix</span>
            </div>

            {/* Raycast Logo */}
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.8 6.2c.4-.4.4-1.1 0-1.5-.4-.4-1.1-.4-1.5 0l-3.8 3.8-3.8-3.8c-.4-.4-1.1-.4-1.5 0-.4.4-.4 1.1 0 1.5l3.8 3.8-3.8 3.8c-.4.4-.4 1.1 0 1.5.4.4 1.1.4 1.5 0l3.8-3.8 3.8 3.8c.4.4 1.1.4 1.5 0 .4-.4.4-1.1 0-1.5L15 10l3.8-3.8z" />
              </svg>
              <span className="font-semibold text-lg tracking-tight">raycast</span>
            </div>

            {/* Tailwind CSS Logo */}
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" />
              </svg>
              <span className="font-semibold text-lg tracking-tight">tailwindcss</span>
            </div>
          </div>
        </section>

        {/* 5. INTERACTIVE SMART-HIRE CAPABILITIES IN LIQUID GLASS */}

        {/* SECTION A: DISCIPLINARY CAREER TRACKS */}
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
                  <div className="w-10 h-10 rounded-2xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 flex items-center justify-center text-[#c084fc]">
                    <span className="material-symbols-outlined text-[20px]">leaderboard</span>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-[#8b5cf6]/15 text-[#c084fc] border border-[#8b5cf6]/30">
                    TRACK 02 // STRATEGY
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#c084fc] transition-colors">
                    Management & Strategy
                  </h3>
                  <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                    Product roadmaps, stakeholder trade-offs, P&L modeling, and structured STAR scenarios.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2">
                  <p className="font-mono text-[10px] uppercase font-semibold text-[#71717a]">Specializations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Product Manager', 'Project Lead', 'Scrum Master', 'Operations'].map((r, i) => (
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
                    TRACK 03 // LAW
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#22D3EE] transition-colors">
                    Law & Governance
                  </h3>
                  <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                    SaaS enterprise MSAs, uncapped indemnities, GDPR/CCPA audits, and IRAC arguments.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2">
                  <p className="font-mono text-[10px] uppercase font-semibold text-[#71717a]">Specializations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Corporate Counsel', 'Compliance Officer', 'Contract Analyst'].map((r, i) => (
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
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10 text-xs">
                {(['it', 'management', 'law'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActivePreviewTrack(t)}
                    className={`px-3 py-1 rounded-full transition-all capitalize cursor-pointer font-medium ${
                      activePreviewTrack === t
                        ? 'bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white shadow-xs'
                        : 'text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    {t === 'it' ? 'IT Systems' : t === 'management' ? 'Management' : 'Legal Counsel'}
                  </button>
                ))}
              </div>
            </div>

            {/* Inner Interactive Split Screen */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Question card */}
              <div className="rounded-2xl p-5 border border-white/5 bg-white/[0.01] space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                  <span className="text-[#a1a1aa]">EXAMINER QUESTION</span>
                  <span className="text-[#60a5fa] font-semibold">{currentPreview.role}</span>
                </div>
                <p className="text-sm sm:text-base font-medium text-white leading-relaxed">
                  "{currentPreview.question}"
                </p>
              </div>

              {/* Candidate snippet */}
              <div className="rounded-2xl p-5 border border-white/5 bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#a1a1aa]">
                  <span>RECORDED CANDIDATE RESPONSE</span>
                  <span className="text-[#10B981] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    Verified STAR/IRAC
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed font-mono">
                  {currentPreview.answerSnippet}
                </p>
              </div>

              {/* Telemetry Evaluation Banner */}
              <div className="rounded-2xl p-5 border border-white/10 bg-white/[0.03] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{currentPreview.examinerName}</span>
                    <span className="text-xs text-[#71717a] font-mono">• {currentPreview.examinerTitle}</span>
                  </div>
                  <p className="text-xs text-[#a1a1aa] italic max-w-xl">
                    "{currentPreview.feedback}"
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="block text-[10px] font-mono text-[#71717a] uppercase">CALIBRATED SCORE</span>
                    <span className="text-2xl font-black saas-gradient-text">
                      {currentPreview.score}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLaunchTrack(activePreviewTrack)}
                    className="saas-btn-gradient px-4 py-2.5 text-xs font-semibold cursor-pointer shadow-md"
                  >
                    Simulate &rarr;
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
                  Operations
                </button>
                <button
                  type="button"
                  onClick={() => setAtsSampleType('law')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    atsSampleType === 'law' ? 'bg-[#0EA5B7] text-white' : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  Compliance
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score pod */}
              <div className="rounded-2xl p-6 border border-white/5 bg-white/[0.01] flex flex-col justify-center items-center text-center space-y-2">
                <span className="text-xs font-mono text-[#a1a1aa]">COMPATIBILITY INDEX</span>
                <div className="text-5xl font-black saas-gradient-text">
                  {currentAts.score}%
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] font-semibold border border-[#10B981]/30">
                  {currentAts.matchGrade}
                </span>
              </div>

              {/* Matched & Missing Keywords */}
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#a1a1aa]">VERIFIED KEYWORDS DETECTED</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentAts.matched.map((k, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/25 flex items-center gap-1 font-mono">
                        <span className="text-[10px]">✓</span> {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#a1a1aa]">RECOMMENDED GAP CORRECTIONS</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentAts.missing.map((k, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/25 flex items-center gap-1 font-mono">
                        <span className="text-[10px]">!</span> {k}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#71717a] pt-2 border-t border-white/5">
                  <strong>Heuristic Audit:</strong> {currentAts.summary}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-[#a1a1aa]">
                Compile and export your resume in our markdown studio with zero formatting penalties.
              </span>
              <button
                type="button"
                onClick={() => onNavigate('resume')}
                className="saas-btn-gradient px-5 py-2 text-xs font-semibold cursor-pointer shadow-md"
              >
                Scan Your Resume Now
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
              className="rounded-3xl p-7 space-y-3"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#7c3aed]/15 border border-[#7c3aed]/30 flex items-center justify-center text-[#c084fc]">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <h4 className="text-lg font-bold text-white">Persona AI Examiners</h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Adaptive examiners who interrogate depth, challenge trade-offs, and dynamically adjust difficulty.
              </p>
            </div>

            <div
              className="rounded-3xl p-7 space-y-3"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#60a5fa]">
                <span className="material-symbols-outlined text-[20px]">database</span>
              </div>
              <h4 className="text-lg font-bold text-white">Dual Database Engine</h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Relational candidate accounts in SQLite; dynamic resume schemas and evaluation trees in MongoDB Atlas.
              </p>
            </div>

            <div
              className="rounded-3xl p-7 space-y-3"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#0EA5B7]/15 border border-[#0EA5B7]/30 flex items-center justify-center text-[#22D3EE]">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
              <h4 className="text-lg font-bold text-white">STAR & IRAC Rubrics</h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Automated scoring based on formal industry interview frameworks with detailed critique on every answer.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION E: BOTTOM EPIC CALL TO ACTION BANNER */}
        <section id="pricing" className="saas-reveal py-24 px-4 sm:px-6 max-w-4xl mx-auto w-full text-center">
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
              Ready to scale your <span className="saas-gradient-text">SaaS?</span>
            </h2>

            <p className="text-sm sm:text-base text-[#a1a1aa] max-w-md mx-auto leading-relaxed">
              Start practicing with realistic personas and verify your resume ATS compatibility today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('field_select')}
                className="saas-btn-gradient w-full sm:w-auto px-8 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Start for free</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="saas-btn-glass w-full sm:w-auto px-7 py-3.5 text-sm font-medium cursor-pointer text-[#a1a1aa] hover:text-white"
              >
                Sign In to Existing Dossier
              </button>
            </div>
          </div>
        </section>

        {/* 6. LIQUID GLASS FOOTER */}
        <footer
          className="w-full mt-auto py-8 px-4 sm:px-6 border-t border-white/5"
          style={{ background: 'rgba(3, 3, 3, 0.8)' }}
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717a]">
            <div
              onClick={(e) => handleDirectNav(e, 'hero')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="4" fill="#7c3aed" />
                <rect x="12" y="12" width="16" height="16" rx="4" fill="#8b5cf6" fillOpacity="0.85" />
              </svg>
              <span className="text-white font-semibold group-hover:text-[#c084fc] transition-colors">SmartHire Prep</span>
              <span className="text-[#71717a] font-mono">• Dark SaaS Edition</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#features" onClick={(e) => handleDirectNav(e, 'features')} className="hover:text-white transition-colors cursor-pointer">Features</a>
              <a href="#tracks" onClick={(e) => handleDirectNav(e, 'tracks')} className="hover:text-white transition-colors cursor-pointer">Solutions</a>
              <a href="#ats-scanner" onClick={(e) => handleDirectNav(e, 'ats-scanner')} className="hover:text-white transition-colors cursor-pointer">ATS Scanner</a>
              <button
                type="button"
                onClick={() => onNavigate('field_select')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Practice
              </button>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>3D Engine: TubesCursor Active</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SaaSLandingPage;
