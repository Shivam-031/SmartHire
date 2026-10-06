import React from 'react';

interface CareerFieldItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  gradient: string;
  accentFrom: string;
  accentTo: string;
  glowColor: string;
  icon: string;
  rolesCount: string;
  atsMatch: string;
  specializations: string;
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
      description:
        'System design, distributed architectures, algorithms, and cloud infrastructure.',
      gradient: 'from-[#3b82f6] to-[#22d3ee]',
      accentFrom: '#3b82f6',
      accentTo: '#22d3ee',
      glowColor: 'rgba(59, 130, 246, 0.35)',
      icon: 'code',
      rolesCount: '6 Roles Available',
      atsMatch: '94% ATS Match',
      specializations: 'Backend · Frontend · DevOps · Data · Cloud',
    },
    {
      id: 'management',
      badge: 'TRACK 02 // STRATEGY',
      title: 'Management & Leadership',
      description:
        'Product strategy frameworks, cross-functional roadmapping, P&L governance, and OKRs.',
      gradient: 'from-[#8b5cf6] to-[#ec4899]',
      accentFrom: '#8b5cf6',
      accentTo: '#ec4899',
      glowColor: 'rgba(139, 92, 246, 0.35)',
      icon: 'groups',
      rolesCount: '5 Roles Available',
      atsMatch: '89% ATS Match',
      specializations: 'Product · Operations · Growth · Strategy',
    },
    {
      id: 'law',
      badge: 'TRACK 03 // GOVERNANCE',
      title: 'Law & Corporate Counsel',
      description:
        'Commercial contract drafting, M&A due diligence, regulatory compliance, and risk controls.',
      gradient: 'from-[#0EA5B7] to-[#10b981]',
      accentFrom: '#0EA5B7',
      accentTo: '#10b981',
      glowColor: 'rgba(14, 165, 183, 0.35)',
      icon: 'gavel',
      rolesCount: '4 Roles Available',
      atsMatch: '96% ATS Match',
      specializations: 'Contracts · Compliance · M&A · Corporate',
    },
  ];

  const currentActive = fields.find((f) => f.id === selectedField) || fields[0];

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-6 sm:gap-7 py-1 sm:py-3 select-none animate-fadeIn">
      {/* Top Ambient Flare */}
      <div className="relative w-full">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-96 h-24 bg-[#3b82f6]/10 blur-[80px] pointer-events-none rounded-full" />
      </div>

      {/* Header Section */}
      <header className="flex flex-col items-center text-center space-y-2.5">
        {/* Step Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.3)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#a1a1aa] font-semibold">
            Step 1 of 6
          </span>
          <span className="text-white/20 font-mono text-xs">/</span>
          <span className="text-xs text-[#c084fc] font-medium">Discipline Track</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-[2.6rem] font-bold text-white tracking-tight leading-tight">
          Which{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60a5fa] via-[#c084fc] to-[#f472b6]">
            field
          </span>{' '}
          are you preparing for?
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-lg leading-relaxed">
          Your entire interview simulation, resume evaluation, and question bank will be dynamically calibrated around your choice.
        </p>
      </header>

      {/* Field Cards Container (Bento Selection) */}
      <section
        aria-label="Career Field Selection"
        className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full items-stretch"
        role="radiogroup"
      >
        {fields.map((field) => {
          const isSelected = selectedField === field.id;

          return (
            <div
              key={field.id}
              aria-checked={isSelected}
              role="radio"
              tabIndex={0}
              onClick={() => onSelectField(field.id)}
              className={`group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 text-left cursor-pointer transition-all duration-300 overflow-hidden ${
                isSelected
                  ? 'bg-white/[0.05] border-2 shadow-2xl scale-[1.01]'
                  : 'bg-white/[0.015] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.18] shadow-[0_8px_24px_rgba(0,0,0,0.35)] opacity-90 hover:opacity-100 hover:scale-[1.005]'
              }`}
              style={{
                borderColor: isSelected ? field.accentFrom : undefined,
                boxShadow: isSelected
                  ? `0 0 32px ${field.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.15)`
                  : undefined,
              }}
            >
              {/* Subtle Ambient Radial Highlight inside card */}
              {isSelected && (
                <div
                  className="pointer-events-none absolute top-0 left-0 right-0 h-28 opacity-20 blur-2xl transition-opacity"
                  style={{
                    background: `linear-gradient(180deg, ${field.accentFrom}, transparent)`,
                  }}
                />
              )}

              <div className="relative z-10 flex flex-col">
                {/* Card Top Row: Icon + Checked Status Indicator */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${field.accentFrom}, ${field.accentTo})`,
                      boxShadow: `0 4px 18px ${field.glowColor}`,
                    }}
                  >
                    <span className="material-symbols-outlined text-[22px] sm:text-[24px] text-white">
                      {field.icon}
                    </span>
                  </div>

                  {/* Active / Inactive Status Indicator */}
                  {isSelected ? (
                    <div
                      className="flex items-center justify-center w-7 h-7 rounded-full shadow-inner"
                      style={{
                        backgroundColor: `${field.accentTo}25`,
                        border: `1px solid ${field.accentTo}60`,
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ color: field.accentTo, fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.03] border border-white/[0.1] group-hover:border-white/[0.25] transition-all">
                      <span className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/50 transition-colors" />
                    </div>
                  )}
                </div>

                {/* Field Info */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#71717a] font-semibold">
                    {field.badge}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                    {field.title}
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#a1a1aa] leading-relaxed">
                    {field.description}
                  </p>
                </div>
              </div>

              {/* Footer Metadata / Badges */}
              <div className="relative z-10 space-y-2.5 mt-5 pt-4 border-t border-white/[0.07]">
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: `${field.accentFrom}15`,
                      color: field.accentTo,
                      border: `1px solid ${field.accentFrom}30`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: field.accentTo }}
                    />
                    {field.rolesCount}
                  </span>
                  <span
                    className="font-mono text-xs font-semibold tracking-tight"
                    style={{ color: field.accentTo }}
                  >
                    {field.atsMatch}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#71717a] mb-0.5">
                    Specializations
                  </div>
                  <div className="text-[11px] sm:text-xs text-white/90 truncate font-medium">
                    {field.specializations}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom Sticky Action Footer (Stitch Sync Bar) */}
      <footer className="w-full rounded-2xl bg-[#0c0c0e]/80 border border-white/[0.08] backdrop-blur-xl px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-[0_12px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
            style={{
              background: `linear-gradient(135deg, ${currentActive.accentFrom}, ${currentActive.accentTo})`,
              boxShadow: `0 2px 10px ${currentActive.glowColor}`,
            }}
          >
            <span className="material-symbols-outlined text-[19px]">{currentActive.icon}</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#a1a1aa]">Selected Track:</span>
              <span className="text-xs font-bold text-white">{currentActive.title}</span>
            </div>
            <div className="text-[11px] text-[#71717a] font-mono mt-0.5">
              Engine ready • 1,400+ technical scenarios mapped
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onProceedToRole}
          className="btn-gradient-primary w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0_0_30px_rgba(124,58,237,0.55)] transition-all"
        >
          <span>Continue to Role Selection</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </footer>
    </div>
  );
};

export default FieldSelect;
