interface BrandWordmarkProps {
  className?: string;
  subtitle?: string;
}

export const BrandWordmark = ({ className = '', subtitle = 'Candidate Docket & Rubric' }: BrandWordmarkProps) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="w-8 h-8 rounded border border-[#2F6F4E] bg-white flex items-center justify-center text-[#2F6F4E] shadow-[0_1px_2px_rgba(26,46,34,0.06)]">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <div className="flex items-baseline space-x-1">
          <span className="text-lg font-semibold font-serif-heading text-[#1A2E22] tracking-tight">SmartHire</span>
          <span className="text-sm font-normal text-[#5C6B60]">Prep</span>
        </div>
        {subtitle && <div className="text-[11px] text-[#5C6B60] tracking-tight -mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
};

export default BrandWordmark;

