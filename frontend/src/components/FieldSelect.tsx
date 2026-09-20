import React from 'react';

export interface CareerField {
  id: string;
  code: string;
  title: string;
  short_title: string;
  description: string;
  rubric_summary: string;
  focus_dimensions: string[];
  roles: Array<{ id: string; title: string; level: string; skills: string[] }>;
}

interface FieldSelectProps {
  selectedField: string;
  onSelectField: (fieldId: string) => void;
  onProceedToRole: () => void;
}

export const FieldSelect: React.FC<FieldSelectProps> = ({
  selectedField,
  onSelectField,
  onProceedToRole
}) => {
  const fields: CareerField[] = [
    {
      id: 'it',
      code: 'TRACK-IT-01',
      title: 'Information Technology',
      short_title: 'Technology',
      description: 'Distributed systems, algorithms, frontend rendering lifecycles, and cloud infrastructure pipelines.',
      rubric_summary: 'Keyword Match (45%) · Concept Completeness (35%) · Communication Clarity (20%)',
      focus_dimensions: [
        'Technical Keyword Precision',
        'Algorithmic Complexity & Trade-offs',
        'Systems Architecture & Scaling',
        'Code Hygiene & Test Coverage'
      ],
      roles: []
    },
    {
      id: 'management',
      code: 'TRACK-MGT-02',
      title: 'Management & Leadership',
      short_title: 'Management',
      description: 'Cross-functional alignment, product roadmaps, stakeholder negotiation, and executive execution.',
      rubric_summary: 'SAR Structure (40%) · Communication Clarity (35%) · Domain Relevance (25%)',
      focus_dimensions: [
        'Situation-Action-Result (SAR) Framework',
        'Strategic Prioritization & Roadmapping',
        'Stakeholder Diplomacy & Consensus',
        'Quantitative Impact & OKR Delivery'
      ],
      roles: []
    },
    {
      id: 'law',
      code: 'TRACK-LAW-03',
      title: 'Legal & Regulatory',
      short_title: 'Legal & Compliance',
      description: 'Statutory interpretation, regulatory privacy audits, contractual governance, and risk mitigation.',
      rubric_summary: 'IRAC Structure (45%) · Legal Terminology (35%) · Precision & Brevity (20%)',
      focus_dimensions: [
        'Issue-Rule-Application-Conclusion (IRAC)',
        'Statutory & Precedent Citations',
        'Factual Risk & Exposure Assessment',
        'Actionable Legal Recommendations'
      ],
      roles: []
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Main Track Selection Sheet */}
      <div className="lg:col-span-8 space-y-6">
        <div className="border border-[#D2D5C9] bg-white rounded shadow-[0_1px_3px_rgba(26,46,34,0.06)] p-6 lg:p-8">
          {/* Sheet Header */}
          <div className="flex items-center justify-between border-b border-[#D2D5C9] pb-4 mb-6">
            <div>
              <span className="text-[10px] font-score-mono uppercase text-[#5C6B60] tracking-wider block">
                Docket Specification · Step 01
              </span>
              <h1 className="font-serif text-2xl font-bold text-[#1A2E22] mt-0.5">
                Target Career Field Track
              </h1>
            </div>
            <span className="text-xs font-score-mono bg-[#EEF0EA] px-2.5 py-1 rounded border border-[#D2D5C9] text-[#1A2E22]">
              3 Curated Disciplines
            </span>
          </div>

          <p className="text-xs text-[#5C6B60] leading-relaxed mb-6">
            Select your professional track. SmartHire will dynamically recalibrate evaluation rubrics,
            oral examination questions, interviewer personas, and ATS keyword extraction to match the rigorous standards of your chosen discipline.
          </p>

          {/* 3 Career Track Cards */}
          <div className="grid grid-cols-1 gap-4">
            {fields.map((f) => {
              const isSelected = selectedField === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => onSelectField(f.id)}
                  className={`p-5 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#F7F8F5] border-[#2F6F4E] shadow-[0_2px_8px_rgba(47,111,78,0.12)] ring-1 ring-[#2F6F4E]'
                      : 'bg-white border-[#D2D5C9] hover:border-[#8A968E] hover:bg-[#FAFAF8]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#2F6F4E] bg-[#2F6F4E]' : 'border-[#D2D5C9]'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <h3 className="font-serif text-base font-bold text-[#1A2E22]">
                        {f.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-score-mono text-[#5C6B60] bg-white border border-[#D2D5C9] px-2 py-0.5 rounded">
                      {f.code}
                    </span>
                  </div>

                  <p className="text-xs text-[#5C6B60] leading-relaxed mb-4 pl-6.5">
                    {f.description}
                  </p>

                  <div className="pl-6.5 space-y-2">
                    {/* Rubric Tag */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#1A2E22] bg-white px-2.5 py-1.5 rounded border border-[#D2D5C9] inline-flex">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2F6F4E]" />
                      <strong className="font-score-mono font-medium text-[10px] text-[#5C6B60]">EVALUATION RUBRIC:</strong>
                      <span className="font-score-mono text-[11px] text-[#2F6F4E] font-medium">{f.rubric_summary}</span>
                    </div>

                    {/* Focus Dimensions Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {f.focus_dimensions.map((dim, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-score-mono px-2 py-0.5 rounded bg-[#EEF0EA] border border-[#D2D5C9] text-[#1A2E22]"
                        >
                          {dim}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="mt-8 pt-5 border-t border-[#D2D5C9] flex items-center justify-between">
            <span className="text-xs text-[#5C6B60]">
              Active Selection: <strong className="text-[#1A2E22] font-semibold uppercase">{selectedField} Track</strong>
            </span>
            <button
              type="button"
              onClick={onProceedToRole}
              className="px-5 py-2.5 bg-[#2F6F4E] hover:bg-[#25583E] text-white text-xs font-medium rounded transition-colors shadow-sm flex items-center gap-2"
            >
              Confirm Track & Select Role &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Reference & Evaluation Standards */}
      <div className="lg:col-span-4 space-y-6">
        <div className="border border-[#D2D5C9] bg-white rounded p-5 shadow-[0_1px_3px_rgba(26,46,34,0.06)]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#D2D5C9]">
            <span className="w-2 h-2 rounded-full bg-[#2F6F4E]" />
            <h3 className="font-serif text-sm font-semibold text-[#1A2E22]">
              Track Calibration Protocol
            </h3>
          </div>
          <div className="space-y-3 text-xs text-[#5C6B60] leading-relaxed">
            <p>
              SmartHire uses deterministic, rule-based NLP engines calibrated specifically for each discipline:
            </p>
            <div className="p-3 bg-[#F7F8F5] border border-[#D2D5C9] rounded space-y-2 text-[11px]">
              <div>
                <strong className="text-[#1A2E22] block font-medium">Technology:</strong>
                Calculates precise keyword frequency and algorithm complexity coverage.
              </div>
              <div>
                <strong className="text-[#1A2E22] block font-medium">Management:</strong>
                Parses behavioral answers using the Situation-Action-Result (SAR) triad.
              </div>
              <div>
                <strong className="text-[#1A2E22] block font-medium">Legal:</strong>
                Audits legal argumentation using Issue-Rule-Application-Conclusion (IRAC).
              </div>
            </div>
            <p className="text-[11px] italic text-[#8A968E]">
              Zero non-deterministic generative LLMs are utilized. All scoring follows strict institutional heuristics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldSelect;

