import React from 'react';

interface InterviewModeModalProps {
  isOpen: boolean;
  field: string;
  role: string;
  onSelectMode: (mode: 'standard' | 'mock') => void;
  onClose: () => void;
}

export const InterviewModeModal: React.FC<InterviewModeModalProps> = ({
  isOpen,
  field,
  role,
  onSelectMode,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-[#141313] border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.9)] rounded-3xl w-full max-w-[540px] overflow-hidden text-left">
        {/* Header */}
        <div className="bg-white/[0.02] px-6 py-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
            <h3 className="font-semibold text-sm sm:text-base text-white">
              Select Examination Protocol Mode
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#71717a] hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            Target Track: <strong className="text-white uppercase font-mono">{field} · {role}</strong>. Select the simulation methodology for this practice session:
          </p>

          {/* Mode 1: Standard Q&A */}
          <div
            onClick={() => onSelectMode('standard')}
            className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15] cursor-pointer transition-all space-y-2 select-none"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#3b82f6]">quiz</span>
                <span>Standard Technical Drills</span>
              </h4>
              <span className="text-[10px] font-mono bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 rounded-full text-[#a1a1aa]">
                Self-Paced
              </span>
            </div>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Step-by-step oral questions and multiple choice verification. Evaluate technical terminology and readability at your own pace without persona interruptions.
            </p>
          </div>

          {/* Mode 2: Mock Interview */}
          <div
            onClick={() => onSelectMode('mock')}
            className="p-5 rounded-2xl border-2 border-[#7c3aed] bg-[#7c3aed]/10 hover:bg-[#7c3aed]/15 cursor-pointer transition-all space-y-2 select-none shadow-[0_0_25px_rgba(124,58,237,0.2)]"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#c084fc]">smart_toy</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] to-[#60a5fa]">
                  AI Simulated Mock Interview
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              </h4>
              <span className="text-[10px] font-mono bg-[#7c3aed] text-white px-2.5 py-0.5 rounded-full font-semibold shadow-sm">
                Persona Active
              </span>
            </div>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Experience dynamic canned interviewer remarks, conversational transitions, and score-based branching follow-ups (probing fundamentals or edge cases). Real-time telemetry archived to MongoDB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewModeModal;
