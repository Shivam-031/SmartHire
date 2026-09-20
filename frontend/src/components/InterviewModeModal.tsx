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
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2E22]/40 backdrop-blur-[2px] animate-fadeIn">
      <div className="bg-[#FFFFFF] border border-[#D2D5C9] shadow-[0_4px_24px_rgba(26,46,34,0.12)] rounded w-full max-w-[520px] overflow-hidden text-left">
        {/* Header */}
        <div className="bg-[#EEF0EA] px-6 py-4 hairline-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F6F4E]" />
            <h3 className="font-serif font-semibold text-sm text-[#1A2E22]">
              Select Examination Protocol Mode
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#5C6B60] hover:text-[#1A2E22] text-sm p-1 rounded hover:bg-[#E3E8DF] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#5C6B60] leading-relaxed">
            Target Track: <strong className="text-[#1A2E22] uppercase">{field} · {role}</strong>. Select the simulation methodology for this practice session:
          </p>

          {/* Mode 1: Standard Q&A */}
          <div
            onClick={() => onSelectMode('standard')}
            className="p-4 rounded border border-[#D2D5C9] hover:border-[#2F6F4E] hover:bg-[#F7F8F5] cursor-pointer transition-all space-y-1.5 select-none"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-sm font-bold text-[#1A2E22]">
                Standard Technical Practice
              </h4>
              <span className="text-[10px] font-score-mono bg-[#EEF0EA] px-2 py-0.5 rounded text-[#5C6B60]">
                Baseline Mode
              </span>
            </div>
            <p className="text-xs text-[#5C6B60] leading-relaxed">
              Step-by-step oral questions and multiple choice verification. Evaluate technical terminology and readability at your own pace without persona interruptions.
            </p>
          </div>

          {/* Mode 2: Mock Interview */}
          <div
            onClick={() => onSelectMode('mock')}
            className="p-4 rounded border-2 border-[#2F6F4E] bg-[#F7F8F5] hover:bg-[#F1F5EE] cursor-pointer transition-all space-y-1.5 select-none shadow-xs"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-sm font-bold text-[#2F6F4E] flex items-center gap-2">
                <span>Rule-Based Mock Interview</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F6F4E] animate-pulse" />
              </h4>
              <span className="text-[10px] font-score-mono bg-[#2F6F4E] text-white px-2 py-0.5 rounded font-medium">
                Simulated Persona
              </span>
            </div>
            <p className="text-xs text-[#5C6B60] leading-relaxed">
              Experience dynamic canned interviewer remarks, conversational transitions, and score-based branching follow-ups (clarifying fundamentals if score &lt; 60%, or probing edge cases if score &ge; 60%). Transcript archived to MongoDB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewModeModal;

