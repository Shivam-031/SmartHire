import React from 'react';

interface BrandWordmarkProps {
  className?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  className = '',
  subtitle,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
      title="SmartHire Prep — Dynamic Career Intelligence Platform"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] p-[1px] shadow-[0_0_15px_rgba(124,58,237,0.35)] shrink-0">
        <div className="w-full h-full bg-[#09090b] rounded-[11px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <svg className="w-4 h-4 text-[#c084fc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-bold text-base tracking-tight text-white group-hover:text-white/95">
          SmartHire
        </span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#c084fc] border border-[#7c3aed]/30 font-mono">
          PREP
        </span>
      </div>
      {subtitle && (
        <span className="text-[11px] font-mono text-[#a1a1aa] border-l border-white/[0.1] pl-2 hidden sm:inline">
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default BrandWordmark;
