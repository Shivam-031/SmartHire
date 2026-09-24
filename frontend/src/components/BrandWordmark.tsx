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
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}
      title="SmartHire Prep — Dynamic Career Intelligence Platform"
    >
      <svg className="h-8 w-auto shrink-0" viewBox="0 0 160 36" fill="none">
        {/* Tri-color interconnected emblem representing IT (#2E6FF2), Management (#8B4FE0), Law (#0EA5B7) */}
        <g transform="translate(2, 2)">
          {/* IT node/arc */}
          <path
            d="M 12 4 C 18 4 24 9 24 16 C 24 21 21 25 17 27"
            stroke="#2E6FF2"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="4" r="3" fill="#2E6FF2" />
          {/* Management node/arc */}
          <path
            d="M 26 18 C 26 25 21 29 14 29 C 9 29 5 26 4 21"
            stroke="#8B4FE0"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="26" cy="18" r="3" fill="#8B4FE0" />
          {/* Law node/arc */}
          <path
            d="M 4 16 C 4 10 9 5 15 5"
            stroke="#0EA5B7"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1 3"
          />
          <circle cx="4" cy="16" r="3" fill="#0EA5B7" />
          {/* Core central spark */}
          <polygon
            points="15,9 17,13 21,13 18,16 19,20 15,17 11,20 12,16 9,13 13,13"
            fill="#17181C"
          />
        </g>
        {/* Wordmark */}
        <text
          x="38"
          y="23"
          fontFamily="Inter, -apple-system, sans-serif"
          fontWeight="700"
          fontSize="17"
          fill="#17181C"
          letterSpacing="-0.5px"
        >
          SmartHire
        </text>
        <text
          x="116"
          y="23"
          fontFamily="Inter, -apple-system, sans-serif"
          fontWeight="500"
          fontSize="17"
          fill="#2E6FF2"
          letterSpacing="-0.5px"
        >
          Prep
        </text>
      </svg>
      {subtitle && (
        <span className="text-[11px] font-mono text-[#6B7078] border-l border-[#E5E7EB] pl-2 hidden sm:inline">
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default BrandWordmark;
