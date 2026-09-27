import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface AnalyticsCardProps {
  id?: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  isPositive?: boolean;
  color?: string;
  period?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  id,
  title,
  value,
  change,
  changeType,
  isPositive,
  period = 'vs last 30 days',
  icon: Icon,
}) => {
  const resolvedChangeType = changeType || (isPositive !== undefined ? (isPositive ? 'positive' : 'negative') : 'positive');

  return (
    <div
      id={id || `stat-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="p-5 sm:p-6 bg-[#16181D] border border-[rgba(242,241,237,0.08)] flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs text-[#9A9DA6] font-mono">
            {title}
          </span>
          <div className="font-mono text-2xl font-medium text-[#F2F1ED] mt-1 tracking-tight">
            {value}
          </div>
        </div>
        <div className="p-2.5 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] text-[#4C63D2] shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {change && (
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[rgba(242,241,237,0.08)] text-xs">
          {resolvedChangeType === 'positive' && (
            <span className="inline-flex items-center text-emerald-400 font-mono gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              {change}
            </span>
          )}
          {resolvedChangeType === 'negative' && (
            <span className="inline-flex items-center text-rose-400 font-mono gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              {change}
            </span>
          )}
          {changeType === 'neutral' && (
            <span className="text-[#9A9DA6] font-mono">{change}</span>
          )}
          <span className="text-[#9A9DA6] font-mono">{period}</span>
        </div>
      )}
    </div>
  );
};
