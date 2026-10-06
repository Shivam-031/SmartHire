import React from 'react';

interface FeedbackReportProps {
  relevanceScore: number;
  clarityScore: number;
  suggestions: string[];
  onContinue: () => void;
}

export const FeedbackReport: React.FC<FeedbackReportProps> = ({
  relevanceScore,
  clarityScore,
  suggestions,
  onContinue,
}) => {
  const relPct = Math.round(relevanceScore * 100);
  const claPct = Math.round(clarityScore * 100);

  return (
    <div className="max-w-[640px] mx-auto p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg text-left select-none animate-fadeIn">
      <div className="border-b border-white/[0.08] pb-4 mb-6">
        <div className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider">
          EXAMINER INTAKE ASSESSMENT
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
          Instant Turn Evaluation
        </h3>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-white font-medium">Technical Precision & Keyword Match</span>
            <span className="font-bold text-[#22d3ee]">{relPct}%</span>
          </div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-full transition-all duration-300"
              style={{ width: `${relPct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-white font-medium">Structural Clarity & Framework Cohesion</span>
            <span className="font-bold text-[#c084fc]">{claPct}%</span>
          </div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] rounded-full transition-all duration-300"
              style={{ width: `${claPct}%` }}
            />
          </div>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
          <h4 className="font-mono text-[11px] uppercase font-bold text-[#c084fc]">
            Rubric Remediation Notes:
          </h4>
          <ul className="space-y-1.5 text-xs text-[#a1a1aa] font-sans">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#22d3ee] font-bold">·</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-white/[0.08] pt-4 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="btn-gradient-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <span>Continue to Next Question &rarr;</span>
        </button>
      </div>
    </div>
  );
};

export default FeedbackReport;
