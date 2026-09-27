import React from 'react';

export type BadgeVariant =
  | 'neutral'
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'purple'
  | 'sky';

interface BadgeProps {
  id?: string;
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  id,
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    neutral: 'bg-[#16181D] text-[#9A9DA6] border-[rgba(242,241,237,0.08)]',
    default: 'bg-[#16181D] text-[#9A9DA6] border-[rgba(242,241,237,0.08)]',
    primary: 'bg-[rgba(76,99,210,0.12)] text-[#4C63D2] border-[rgba(76,99,210,0.3)]',
    success: 'bg-[rgba(16,185,129,0.1)] text-emerald-400 border-[rgba(16,185,129,0.25)]',
    warning: 'bg-[rgba(245,158,11,0.1)] text-amber-400 border-[rgba(245,158,11,0.25)]',
    danger: 'bg-[rgba(244,63,94,0.1)] text-rose-400 border-[rgba(244,63,94,0.25)]',
    purple: 'bg-[rgba(168,85,247,0.1)] text-purple-400 border-[rgba(168,85,247,0.25)]',
    sky: 'bg-[rgba(56,189,248,0.1)] text-sky-400 border-[rgba(56,189,248,0.25)]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  }[size];

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 border whitespace-nowrap ${variantStyles[variant]} ${sizeStyles} ${className}`}
    >
      {children}
    </span>
  );
};
