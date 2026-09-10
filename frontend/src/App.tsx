import { useState } from 'react';
import DocketLayout, { type DocketStep } from './components/DocketLayout';
import ResumeUpload from './components/ResumeUpload';
import RoleSelect from './components/RoleSelect';
import InterviewQA from './components/InterviewQA';
import ATSReport from './components/ATSReport';
import SessionDetail from './components/SessionDetail';
import SessionHistory from './components/SessionHistory';

export const App = () => {
  const [step, setStep] = useState<DocketStep>('upload');
  const [targetRole, setTargetRole] = useState<string>('Frontend Developer');
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionData, setSessionData] = useState<{ sessionId: number; questions: any[] } | null>(null);
  const [, setTotalScore] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const handleResumeUploaded = (id: number) => {
    setResumeId(id);
    setStep('role_select');
  };

  const handleRoleConfirmed = (newSessionId: number, questions: any[], role: string) => {
    setTargetRole(role);
    setSessionId(newSessionId);
    setSessionData({ sessionId: newSessionId, questions });
    setStep('interview');
  };

  const handleInterviewCompleted = (score: number) => {
    setTotalScore(score);
    if (sessionId) {
      setSelectedSessionId(sessionId);
    }
    setStep('completed');
  };

  const handleATSCheckRequested = () => {
    setStep('ats_check');
  };

  const handleReset = () => {
    setStep('upload');
    setResumeId(null);
    setSessionId(null);
    setSessionData(null);
    setTotalScore(null);
    setSelectedSessionId(null);
  };

  return (
    <DocketLayout
      currentStep={step}
      targetRole={targetRole}
      onNavigate={(newStep) => setStep(newStep)}
      canNavigateToRole={true}
      canNavigateToResume={true}
      canNavigateToInterview={!!sessionData}
      canNavigateToATS={!!resumeId}
      canNavigateToSummary={!!sessionId || !!selectedSessionId}
    >
      {step === 'upload' && (
        <ResumeUpload
          onUploadSuccess={handleResumeUploaded}
          onATSCheckRequested={handleATSCheckRequested}
          onSkip={() => setStep('role_select')}
        />
      )}

      {step === 'role_select' && (
        <RoleSelect
          resumeId={resumeId}
          selectedRole={targetRole}
          onInterviewStart={handleRoleConfirmed}
          onBackToResume={() => setStep('upload')}
        />
      )}

      {step === 'interview' && sessionData && (
        <InterviewQA
          sessionId={sessionData.sessionId}
          questions={sessionData.questions}
          onComplete={handleInterviewCompleted}
        />
      )}

      {step === 'ats_check' && (
        <ATSReport
          resumeId={resumeId || 1}
          targetRole={targetRole}
          onClose={() => setStep('upload')}
          onProceedToSummary={
            sessionId ? () => setStep('completed') : () => setStep('role_select')
          }
        />
      )}

      {step === 'completed' && (sessionId || selectedSessionId) && (
        <SessionDetail
          sessionId={selectedSessionId || sessionId || 1}
          onBack={() => setStep('session_history')}
          onNewSession={handleReset}
          onSelectPastSession={(id) => {
            setSelectedSessionId(id);
            setStep('session_detail');
          }}
        />
      )}

      {step === 'session_history' && (
        <SessionHistory
          onSelectSession={(id) => {
            setSelectedSessionId(id);
            setStep('session_detail');
          }}
          onBack={() => setStep('upload')}
        />
      )}

      {step === 'session_detail' && selectedSessionId && (
        <SessionDetail
          sessionId={selectedSessionId}
          onBack={() => setStep('session_history')}
          onNewSession={handleReset}
          onSelectPastSession={(id) => setSelectedSessionId(id)}
        />
      )}
    </DocketLayout>
  );
};

export default App;
