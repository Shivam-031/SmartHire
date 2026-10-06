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
    <div className="max-w-5xl mx-auto w-full space-y-6 text-left animate-fadeIn">
      {/* Sub-tab Navigation Pill Bar (Stitch Liquid Glass Dock) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">
            STAGE 03 // RESUME DOSSIER:
          </span>
          <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/[0.08] backdrop-blur-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => handleTabChange('upload')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'upload'
                  ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white font-semibold shadow-xs'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
              <span>01 Ingestion Hub</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('editor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'editor'
                  ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white font-semibold shadow-xs'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              <span>02 Markdown Studio</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('templates')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'templates'
                  ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white font-semibold shadow-xs'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">palette</span>
              <span>03 Templates & PDF</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onProceedToInterview}
          className="text-xs font-mono text-[#22d3ee] font-semibold hover:underline flex items-center gap-1 cursor-pointer bg-[#0EA5B7]/10 px-3 py-1.5 rounded-full border border-[#0EA5B7]/25"
        >
          <span>Skip to Live Mock Interview</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>

      {/* Sub-view Content */}
      {activeSubTab === 'upload' && (
        <ResumeUpload
          onUploadSuccess={(id) => {
            onUploadSuccess(id);
          }}
          onATSCheckRequested={onATSCheckRequested}
          onSkip={onProceedToInterview}
          onOpenEditor={() => handleTabChange('editor')}
        />
      )}

      {activeSubTab === 'editor' && (
        <ResumeEditor
          sqlResumeId={sqlResumeId}
          mongoResumeId={mongoResumeId}
          onSaved={(id: string) => onMongoResumeSaved(id)}
          onATSCheckRequested={onATSCheckRequested}
          onProceedToInterview={onProceedToInterview}
          onNavigateToTemplates={() => handleTabChange('templates')}
        />
      )}

      {activeSubTab === 'templates' && (
        <ResumeTemplatePicker
          resumeId={mongoResumeId}
          onSelectTemplate={() => {}}
          onProceedToInterview={onProceedToInterview}
        />
      )}
    </div>
  );
};

export default ResumeContainer;
