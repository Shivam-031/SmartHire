import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-5 h-5 border-2' : size === 'lg' ? 'w-10 h-10 border-3' : 'w-7 h-7 border-2';

  return (
    <div className="flex flex-col items-center justify-center p-3 text-center">
      <div className={`${sizeClass} border-white/10 border-t-[#7c3aed] rounded-full animate-spin`} />
      {message && (
        <p className="text-xs font-mono text-[#a1a1aa] mt-2.5 max-w-xs">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
