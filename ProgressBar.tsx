import React from 'react';

interface ProgressBarProps {
  id?: string;
  value: number; // 0 to 100
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'emerald' | 'amber' | 'neutral' | 'indigo';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  id = 'progress-bar',
  value,
  showLabel = false,
  size = 'sm',
  variant = 'primary',
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value || 0)));

  const heightClass = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }[size];

  const fillVariantClass = {
    primary: 'bg-[#4C63D2]',
    indigo: 'bg-[#4C63D2]',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-400',
    neutral: 'bg-[#9A9DA6]',
  }[variant];

  return (
    <div id={id} className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs mb-1.5 text-[#9A9DA6]">
          <span>Completion</span>
          <span className="font-mono text-[#F2F1ED] font-medium">{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-[#16181D] border border-[rgba(242,241,237,0.08)] overflow-hidden ${heightClass}`}>
        <div
          className={`h-full transition-all duration-300 ${fillVariantClass}`}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
