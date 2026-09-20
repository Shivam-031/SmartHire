import React, { useState } from 'react';
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
  onSubTabChange
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'editor' | 'templates'>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab && initialSubTab !== activeSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleTabChange = (tab: 'upload' | 'editor' | 'templates') => {
    setActiveSubTab(tab);
    onSubTabChange?.(tab);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Sub-tab Navigation Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D2D5C9] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-score-mono uppercase text-[#5C6B60] tracking-wider font-semibold">
            SHEET 03 // RESUME DOSSIER:
          </span>
          <div className="flex bg-[#EEF0EA] p-0.5 rounded border border-[#D2D5C9]">
            <button
              type="button"
              onClick={() => handleTabChange('upload')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeSubTab === 'upload'
                  ? 'bg-white text-[#1A2E22] font-semibold shadow-xs border border-[#D2D5C9]'
                  : 'text-[#5C6B60] hover:text-[#1A2E22]'
              }`}
            >
              01 Upload Document (PDF/DOCX)
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('editor')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeSubTab === 'editor'
                  ? 'bg-white text-[#1A2E22] font-semibold shadow-xs border border-[#D2D5C9]'
                  : 'text-[#5C6B60] hover:text-[#1A2E22]'
              }`}
            >
              02 Structured In-App Editor
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('templates')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeSubTab === 'templates'
                  ? 'bg-white text-[#1A2E22] font-semibold shadow-xs border border-[#D2D5C9]'
                  : 'text-[#5C6B60] hover:text-[#1A2E22]'
              }`}
            >
              03 PDF Export Templates
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onProceedToInterview}
            className="text-xs text-[#2F6F4E] font-medium hover:underline flex items-center gap-1"
          >
            <span>Skip to Oral Examination</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Sub-view Content */}
      {activeSubTab === 'upload' && (
        <ResumeUpload
          onUploadSuccess={(id) => {
            onUploadSuccess(id);
            setActiveSubTab('editor'); // Suggest opening editor after upload
          }}
          onATSCheckRequested={onATSCheckRequested}
          onSkip={onProceedToInterview}
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

