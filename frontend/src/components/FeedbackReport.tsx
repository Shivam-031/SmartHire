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
    <div className="max-w-[640px] mx-auto p-6 sm:p-8 bg-white border border-[#D2D5C9] rounded shadow-xs text-left">
      <div className="border-b border-[#D2D5C9] pb-4 mb-6">
        <div className="text-[10px] font-mono text-[#5C6B60] uppercase tracking-wider">
          EXAMINER INTAKE ASSESSMENT
        </div>
        <h3 className="font-serif text-2xl font-semibold text-[#1A2E22] mt-0.5">
          Instant Turn Evaluation
        </h3>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-[#1A2E22] font-semibold">Technical Precision &amp; Keyword Match</span>
            <span className="font-bold text-[#2F6F4E]">{relPct}%</span>
          </div>
          <div className="w-full h-2 bg-[#EEF0EA] rounded-full overflow-hidden border border-[#D2D5C9]/60">
            <div
              className="h-full bg-[#2F6F4E] rounded-full transition-all duration-300"
              style={{ width: `${relPct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-[#1A2E22] font-semibold">Structural Clarity &amp; Framework Cohesion</span>
            <span className="font-bold text-[#B08D2F]">{claPct}%</span>
          </div>
          <div className="w-full h-2 bg-[#EEF0EA] rounded-full overflow-hidden border border-[#D2D5C9]/60">
            <div
              className="h-full bg-[#B08D2F] rounded-full transition-all duration-300"
              style={{ width: `${claPct}%` }}
            />
          </div>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="mb-6 p-4 bg-[#F4F6F1] border border-[#D2D5C9] rounded">
          <h4 className="font-mono text-[11px] uppercase font-bold text-[#2F6F4E] mb-2">
            Rubric Remediation Notes:
          </h4>
          <ul className="space-y-1.5 text-xs text-[#5C6B60] font-sans">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#2F6F4E] font-bold">·</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-[#D2D5C9] pt-4 flex justify-end">
        <button
          onClick={onContinue}
          className="px-6 py-2.5 rounded bg-[#2F6F4E] hover:bg-[#265a3f] text-white text-xs font-mono font-medium transition-colors shadow-xs cursor-pointer"
        >
          Continue to Next Question &rarr;
        </button>
      </div>
    </div>
  );
};

export default FeedbackReport;
