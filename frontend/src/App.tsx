import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout, { type DocketStep } from './components/AppLayout';
import FieldSelect from './components/FieldSelect';
import RoleSelect from './components/RoleSelect';
import ResumeContainer from './components/ResumeContainer';
import InterviewQA from './components/InterviewQA';
import ATSReport from './components/ATSReport';
import SessionDetail from './components/SessionDetail';
import SessionHistory from './components/SessionHistory';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import InterviewModeModal from './components/InterviewModeModal';
import AuthScreen from './components/AuthScreen';
import ProfileScreen from './components/ProfileScreen';
import { LandingPage } from './components/LandingPage';

// URL Hash to DocketStep mapping
const HASH_MAP: Record<string, DocketStep> = {
  '': 'landing',
  '#/': 'landing',
  '#/landing': 'landing',
  '#/home': 'landing',
  '#/overview': 'landing',
  '#/login': 'login',
  '#/signup': 'signup',
  '#/profile': 'profile',
  '#/fields': 'field_select',
  '#/field-select': 'field_select',
  '#/roles': 'role_select',
  '#/role-select': 'role_select',
  '#/resume': 'resume',
  '#/editor': 'resume_editor',
  '#/resume-editor': 'resume_editor',
  '#/templates': 'template_picker',
  '#/template-picker': 'template_picker',
  '#/interview': 'interview',
  '#/ats': 'ats_check',
  '#/ats-report': 'ats_check',
  '#/summary': 'completed',
  '#/completed': 'completed',
  '#/history': 'session_history',
};

// DocketStep to primary URL hash mapping
const STEP_TO_HASH: Record<DocketStep, string> = {
  landing: '#/',
  field_select: '#/fields',
  role_select: '#/roles',
  resume: '#/resume',
  resume_editor: '#/editor',
  template_picker: '#/templates',
  interview: '#/interview',
  ats_check: '#/ats',
  summary: '#/summary',
  completed: '#/summary',
  session_history: '#/history',
  session_detail: '#/summary',
  profile: '#/profile',
  login: '#/login',
  signup: '#/signup',
};

const getInitialStep = (): DocketStep => {
  const hash = window.location.hash.toLowerCase();
  return HASH_MAP[hash] || 'landing';
};

const AppContent = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<DocketStep>(getInitialStep);
  const [field, setField] = useState<string>(user?.target_field || 'it');
  const [role, setRole] = useState<string>(user?.target_role || 'Frontend Developer');
  const [sqlResumeId, setSqlResumeId] = useState<number | null>(null);
  const [mongoResumeId, setMongoResumeId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionData, setSessionData] = useState<{
    sessionId: number;
    questions: any[];
    persona?: any;
    mode: 'standard' | 'mock';
    field: string;
  } | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [modeModalOpen, setModeModalOpen] = useState(false);
  const [, setInterviewMode] = useState<'standard' | 'mock'>('standard');

  // Synchronize browser back/forward and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const mapped = HASH_MAP[hash];
      if (mapped) {
        setStep(mapped);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when navigating to step
  const navigateTo = (newStep: DocketStep) => {
    setStep(newStep);
    const targetHash = STEP_TO_HASH[newStep];
    if (targetHash && window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  };

  // Step 01 -> Step 02
  const handleFieldConfirmed = () => {
    navigateTo('role_select');
  };

  // Step 02 -> Step 03
  const handleRoleConfirmed = (chosenRole: string) => {
    setRole(chosenRole);
    navigateTo('resume');
  };

  // Step 03: Resume interactions
  const handleSqlResumeUploaded = (id: number) => {
    setSqlResumeId(id);
  };

  const handleMongoResumeSaved = (id: string) => {
    setMongoResumeId(id);
  };

  const handleATSCheckRequested = () => {
    navigateTo('ats_check');
  };

  // Trigger Interview Start with mode
  const initiateInterviewFlow = () => {
    setModeModalOpen(true);
  };

  const handleModeSelected = async (chosenMode: 'standard' | 'mock') => {
    setInterviewMode(chosenMode);
    setModeModalOpen(false);

    try {
      const response = await fetch('http://localhost:5000/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 1,
          field: field,
          role: role,
          mode: chosenMode,
          resume_id: sqlResumeId || null,
          mongo_resume_id: mongoResumeId || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize examination session');
      }

      setSessionId(data.session_id);
      setSessionData({
        sessionId: data.session_id,
        questions: data.questions,
        persona: data.persona,
        mode: chosenMode,
        field: field,
      });
      navigateTo('interview');
    } catch (err: any) {
      alert('Session start error: ' + err.message);
    }
  };

  const handleInterviewCompleted = (_finalScore: number) => {
    if (sessionId) {
      setSelectedSessionId(sessionId);
    }
    navigateTo('completed');
  };

  const handleReset = () => {
    setSessionId(null);
    setSessionData(null);
    setSelectedSessionId(null);
    navigateTo('field_select');
  };

  if (step === 'landing') {
    return (
      <>
        <LandingPage
          onNavigate={navigateTo}
          onSelectTrack={(f, r) => {
            setField(f);
            if (r) setRole(r);
            else if (f === 'it') setRole('Frontend Developer');
            else if (f === 'management') setRole('Product Manager');
            else if (f === 'law') setRole('Corporate Counsel');
          }}
        />
        <AuthModal />
      </>
    );
  }

  return (
    <AppLayout
      currentStep={step}
      targetField={field}
      targetRole={role}
      onNavigate={navigateTo}
      onFieldChange={(newField) => {
        setField(newField);
        if (newField === 'it') setRole('Frontend Developer');
        else if (newField === 'management') setRole('Product Manager');
        else if (newField === 'law') setRole('Corporate Counsel');
      }}
      canNavigateToField={true}
      canNavigateToRole={true}
      canNavigateToResume={true}
      canNavigateToInterview={true}
      canNavigateToATS={true}
      canNavigateToSummary={true}
    >
      {/* 00 Screen: Candidate Login & Signup */}
      {(step === 'login' || step === 'signup') && (
        <AuthScreen
          initialMode={step === 'signup' ? 'signup' : 'login'}
          onSuccess={() => navigateTo('profile')}
        />
      )}

      {/* 00 Screen: Candidate Profile Dossier */}
      {step === 'profile' && (
        <ProfileScreen
          onNavigateToFields={(newField) => {
            setField(newField);
            navigateTo('role_select');
          }}
          onNavigateToResumeEditor={() => navigateTo('resume_editor')}
          onNavigateToTemplatePicker={(resId) => {
            if (resId) setMongoResumeId(resId);
            navigateTo('template_picker');
          }}
          onNavigateToSession={(sId) => {
            setSelectedSessionId(sId);
            navigateTo('session_detail');
          }}
          onStartNewSession={initiateInterviewFlow}
          onNavigateToLogin={() => navigateTo('login')}
        />
      )}

      {/* 01 Screen: Field Track Selection */}
      {step === 'field_select' && (
        <FieldSelect
          selectedField={field}
          onSelectField={(f) => {
            setField(f);
            if (f === 'it') setRole('Frontend Developer');
            else if (f === 'management') setRole('Product Manager');
            else if (f === 'law') setRole('Corporate Counsel');
          }}
          onProceedToRole={handleFieldConfirmed}
        />
      )}

      {/* 02 Screen: Role Specification */}
      {step === 'role_select' && (
        <RoleSelect
          selectedField={field}
          selectedRole={role}
          resumeId={sqlResumeId}
          onConfirmRole={handleRoleConfirmed}
          onBackToField={() => navigateTo('field_select')}
        />
      )}

      {/* 03 Screen: Candidate Resume Dossier (Upload / In-App Editor / Template Picker) */}
      {(step === 'resume' || step === 'resume_editor' || step === 'template_picker') && (
        <ResumeContainer
          sqlResumeId={sqlResumeId}
          mongoResumeId={mongoResumeId}
          initialSubTab={
            step === 'resume_editor'
              ? 'editor'
              : step === 'template_picker'
              ? 'templates'
              : 'upload'
          }
          onSubTabChange={(tab) => {
            if (tab === 'editor') navigateTo('resume_editor');
            else if (tab === 'templates') navigateTo('template_picker');
            else navigateTo('resume');
          }}
          onUploadSuccess={handleSqlResumeUploaded}
          onMongoResumeSaved={handleMongoResumeSaved}
          onATSCheckRequested={handleATSCheckRequested}
          onProceedToInterview={initiateInterviewFlow}
        />
      )}

      {/* 04 Screen: Structured Oral Examination & Mock Interview */}
      {step === 'interview' && (
        sessionData ? (
          <InterviewQA
            sessionId={sessionData.sessionId}
            questions={sessionData.questions}
            mode={sessionData.mode}
            field={sessionData.field}
            persona={sessionData.persona}
            onComplete={handleInterviewCompleted}
          />
        ) : (
          <div className="max-w-2xl mx-auto w-full my-auto animate-fadeIn select-none">
            <div className="bg-[#141313]/90 border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl rounded-3xl p-7 sm:p-9 text-left space-y-6 relative overflow-hidden">
              {/* Refraction Accent Flare */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#7c3aed]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="border-b border-white/[0.08] pb-5 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee] animate-pulse" />
                  <span className="text-[10px] font-mono uppercase text-[#a1a1aa] tracking-wider font-semibold">
                    STAGE 04 // EXAMINATION INITIALIZATION
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Oral Examination & Mock Interview Ready
                </h2>
                <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1.5 leading-relaxed">
                  Calibrated for track <strong className="text-white uppercase font-mono">{field}</strong> targeting position <strong className="text-[#c084fc] font-medium">{role}</strong>.
                </p>
              </div>

              <div className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl text-xs space-y-3 shadow-inner relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono text-[#a1a1aa]">
                  <span className="text-[#71717a] font-semibold">EXAMINATION FORMAT:</span>
                  <span className="font-semibold text-white/90">MCQ Concepts + Scripted Behavioral & Technical Questions</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono text-[#a1a1aa] pt-2 border-t border-white/[0.05]">
                  <span className="text-[#71717a] font-semibold">EVALUATION CRITERIA:</span>
                  <span className="font-semibold text-[#22d3ee]">
                    {field === 'it' ? 'Code Correctness & Keyword Precision' : field === 'management' ? 'SAR Framework & Structural Clarity' : 'IRAC Legal Reasoning & Analysis'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 relative z-10">
                <button
                  type="button"
                  onClick={() => navigateTo('resume')}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Return to Resume Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={initiateInterviewFlow}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white text-xs font-semibold hover:opacity-95 shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02]"
                >
                  <span>Select Mode & Begin Examination</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* 05 Screen: ATS Compatibility Audit */}
      {step === 'ats_check' && (
        <ATSReport
          resumeId={sqlResumeId}
          mongoResumeId={mongoResumeId}
          targetRole={role}
          onClose={() => navigateTo('resume')}
          onProceedToSummary={() => navigateTo('completed')}
        />
      )}

      {/* 06 Screen: Dossier Summary & Final Assessment */}
      {(step === 'completed' || step === 'summary') && (
        <SessionDetail
          sessionId={selectedSessionId || sessionId || 1}
          onBack={() => navigateTo('session_history')}
          onNewSession={handleReset}
          onSelectPastSession={(id) => {
            setSelectedSessionId(id);
            navigateTo('session_detail');
          }}
        />
      )}

      {step === 'session_history' && (
        <SessionHistory
          onSelectSession={(id) => {
            setSelectedSessionId(id);
            navigateTo('session_detail');
          }}
          onBack={() => navigateTo('field_select')}
        />
      )}

      {step === 'session_detail' && (
        <SessionDetail
          sessionId={selectedSessionId || sessionId || 1}
          onBack={() => navigateTo('session_history')}
          onNewSession={handleReset}
          onSelectPastSession={(id) => setSelectedSessionId(id)}
        />
      )}

      {/* Global Modals for Quick In-Place Access */}
      <AuthModal />
      <UserProfile
        onSelectSession={(id) => {
          setSelectedSessionId(id);
          navigateTo('session_detail');
        }}
        onNavigateToField={(newField) => {
          setField(newField);
          navigateTo('role_select');
        }}
      />
      <InterviewModeModal
        isOpen={modeModalOpen}
        field={field}
        role={role}
        onSelectMode={handleModeSelected}
        onClose={() => setModeModalOpen(false)}
      />
    </AppLayout>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
