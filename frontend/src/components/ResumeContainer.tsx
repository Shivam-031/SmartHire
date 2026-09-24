import React, { useState, useEffect } from 'react';
import ResumeUpload from './ResumeUpload';
import ResumeEditor from './ResumeEditor';
import ResumeTemplatePicker from './ResumeTemplatePicker';

interface ResumeContainerProps {
  sqlResumeId: number | null;
  mongoResumeId?: string | null;
  onUploadSuccess: (id: number) => void;
  onMongoResumeSaved: (id: string) => void;
  onATSCheckRequested: () => void;
  onProceedToInterview: () => void;
  initialSubTab?: 'upload' | 'editor' | 'templates';
  onSubTabChange?: (tab: 'upload' | 'editor' | 'templates') => void;
}

export const ResumeContainer: React.FC<ResumeContainerProps> = ({
  sqlResumeId,
  mongoResumeId,
  onUploadSuccess,
  onMongoResumeSaved,
  onATSCheckRequested,
  onProceedToInterview,
  initialSubTab = 'upload',
  onSubTabChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'editor' | 'templates'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab && initialSubTab !== activeSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleTabChange = (tab: 'upload' | 'editor' | 'templates') => {
    setActiveSubTab(tab);
    onSubTabChange?.(tab);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* Sub-tab Navigation Pill Bar (Stitch Screen 06) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B7078]">
            STAGE 03 // RESUME DOSSIER:
          </span>
          <div className="flex bg-[#F1F2F4] p-1 rounded-xl border border-[#E5E7EB] font-sans text-xs">
            <button
              type="button"
              onClick={() => handleTabChange('upload')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeSubTab === 'upload'
                  ? 'bg-white text-[#17181C] font-semibold shadow-xs'
                  : 'text-[#6B7078] hover:text-[#17181C]'
              }`}
            >
              01 Document Upload
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('editor')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeSubTab === 'editor'
                  ? 'bg-white text-[#17181C] font-semibold shadow-xs'
                  : 'text-[#6B7078] hover:text-[#17181C]'
              }`}
            >
              02 In-App Editor
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('templates')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeSubTab === 'templates'
                  ? 'bg-white text-[#17181C] font-semibold shadow-xs'
                  : 'text-[#6B7078] hover:text-[#17181C]'
              }`}
            >
              03 PDF Export
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onProceedToInterview}
          className="text-xs font-mono text-[#2E6FF2] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Skip to Live Examination</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>

      {/* Sub-view Content */}
      {activeSubTab === 'upload' && (
        <ResumeUpload
          onUploadSuccess={(id) => {
            onUploadSuccess(id);
            setActiveSubTab('editor');
          }}
          onATSCheckRequested={onATSCheckRequested}
          onSkip={onProceedToInterview}
          onOpenEditor={() => handleTabChange('editor')}
        />
      )}

      {activeSubTab === 'editor' && (
        <ResumeEditor
          sqlResumeId={sqlResumeId}
          onSaved={onMongoResumeSaved}
          onProceedToInterview={onProceedToInterview}
          onATSCheckRequested={onATSCheckRequested}
          onNavigateToTemplates={() => handleTabChange('templates')}
        />
      )}

      {activeSubTab === 'templates' && (
        <ResumeTemplatePicker
          resumeId={mongoResumeId}
          onProceedToInterview={onProceedToInterview}
        />
      )}
    </div>
  );
};

export default ResumeContainer;
