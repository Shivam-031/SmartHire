import React from 'react';

interface CareerFieldItem {
  id: string;
  badge: string;
  title: string;
  ladder: string;
  description: string;
  color: string;
  bgLight: string;
  icon: string;
  rubrics: string;
  keySkills: string[];
}

interface FieldSelectProps {
  selectedField: string;
  onSelectField: (field: string) => void;
  onProceedToRole: () => void;
}

export const FieldSelect: React.FC<FieldSelectProps> = ({
  selectedField,
  onSelectField,
  onProceedToRole,
}) => {
  const fields: CareerFieldItem[] = [
    {
      id: 'it',
      badge: 'TRACK 01 // SYSTEMS',
      title: 'Information Technology',
      ladder: 'L1–L7 Ladders',
      description:
        'Software engineering, cloud infrastructure, distributed architecture, and web performance.',
      color: '#2E6FF2',
      bgLight: 'bg-[#2E6FF2]/5',
      icon: 'terminal',
      rubrics: 'Keyword Precision (45%) · Architecture (35%) · Clean Code (20%)',
      keySkills: ['TypeScript / React', 'Python / Node', 'SQL / NoSQL', 'System Design', 'Docker / K8s'],
    },
    {
      id: 'management',
      badge: 'TRACK 02 // STRATEGY',
      title: 'Management & Leadership',
      ladder: 'IC & Director Tracks',
      description:
        'Product strategy, customer discovery, cross-functional roadmapping, PRDs, and OKRs.',
      color: '#8B4FE0',
      bgLight: 'bg-[#8B4FE0]/5',
      icon: 'groups',
      rubrics: 'STAR Framework (40%) · Prioritization (35%) · Executive Comms (25%)',
      keySkills: ['PRD Writing', 'RICE Scoring', 'User Discovery', 'Agile Cadence', 'Stakeholder Comms'],
    },
    {
      id: 'law',
      badge: 'TRACK 03 // GOVERNANCE',
      title: 'Law & Corporate Counsel',
      ladder: 'Associate to General Counsel',
      description:
        'Commercial contract drafting, M&A due diligence, regulatory compliance, and risk controls.',
      color: '#0EA5B7',
      bgLight: 'bg-[#0EA5B7]/5',
      icon: 'gavel',
      rubrics: 'IRAC Structure (45%) · Statutory Analysis (35%) · Risk Assessment (20%)',
      keySkills: ['Contract Review', 'Regulatory GDPR/AML', 'M&A Diligence', 'Precedent Research', 'IP Licensing'],
    },
  ];

  const selectedItem = fields.find((f) => f.id === selectedField) || fields[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left animate-fadeIn">
      {/* Eyebrow & Header (Stitch Screen 09) */}
      <div className="space-y-2 pb-2 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#6B7078]">
            STAGE 01 // CAREER TRACK CALIBRATION
          </span>
          <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#17181C]/5 text-[#17181C] font-semibold">
            3 Specialization Tracks Available
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#17181C]">
          Select Your Career Vertical
        </h1>
        <p className="text-sm text-[#6B7078] max-w-2xl">
          SmartHire dynamically calibrates ATS keyword scoring, oral interview personas, and rubric benchmarks to match your exact industry standard.
        </p>
      </div>

      {/* 3-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {fields.map((field) => {
          const isSelected = selectedField === field.id;

          return (
            <div
              key={field.id}
              onClick={() => onSelectField(field.id)}
              className={`relative rounded-2xl p-6 sm:p-7 border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:shadow-lg ${
                isSelected
                  ? `border-[${field.color}] shadow-md ${field.bgLight} bg-white`
                  : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]'
              }`}
              style={{
                borderColor: isSelected ? field.color : undefined,
              }}
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 transition-colors"
                style={{ backgroundColor: isSelected ? field.color : 'transparent' }}
              ></div>

              <div className="space-y-4">
                {/* Badge and Icon */}
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase"
                    style={{ backgroundColor: `${field.color}15`, color: field.color }}
                  >
                    {field.badge}
                  </span>

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: isSelected ? field.color : '#F3F4F6',
                      color: isSelected ? '#FFFFFF' : '#17181C',
                    }}
                  >
                    <span className="material-symbols-outlined text-[22px]">{field.icon}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold text-[#17181C] group-hover:text-[#2E6FF2] transition-colors">
                    {field.title}
                  </h3>
                  <span className="font-mono text-[11px] text-[#6B7078] block mt-0.5">
                    {field.ladder}
                  </span>
                  <p className="text-xs text-[#6B7078] mt-2.5 leading-relaxed">
                    {field.description}
                  </p>
                </div>

                {/* Rubric Criteria Strip */}
                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#6B7078] block">
                    Telemetry Benchmark Rubric:
                  </span>
                  <p className="text-[11px] font-mono text-[#17181C]">{field.rubrics}</p>
                </div>

                {/* Key Skills Pills */}
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-[#6B7078] block mb-1.5">
                    Core Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {field.keySkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB] text-[#17181C] text-[11px] font-mono font-medium shadow-2xs"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selection Status Footer */}
              <div className="pt-6 mt-6 border-t border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center border"
                    style={{
                      backgroundColor: isSelected ? field.color : 'transparent',
                      borderColor: isSelected ? field.color : '#D1D5DB',
                      color: '#FFFFFF',
                    }}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                    )}
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: isSelected ? field.color : '#6B7078' }}
                  >
                    {isSelected ? 'Active Track' : 'Select Track'}
                  </span>
                </div>

                <span className="material-symbols-outlined text-[18px] text-[#9CA3AF] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Bottom Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: selectedItem.color }}
          ></div>
          <div>
            <span className="text-xs text-[#6B7078]">Selected Career Track:</span>
            <span className="text-sm font-bold text-[#17181C] ml-1.5">
              {selectedItem.title}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onProceedToRole}
          className="w-full sm:w-auto px-6 py-3 bg-[#17181C] hover:bg-[#2A2B30] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Confirm Track &amp; Choose Specialization</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default FieldSelect;
