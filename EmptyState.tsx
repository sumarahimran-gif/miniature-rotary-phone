import React from 'react';
import { LucideIcon, Layers } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id = 'empty-state',
  icon: Icon = Layers,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-[rgba(242,241,237,0.08)] bg-[#16181D]"
    >
      <div className="w-10 h-10 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] flex items-center justify-center text-[#9A9DA6] mb-4">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-serif text-base font-normal text-[#F2F1ED]">{title}</h3>
      {description && (
        <p className="text-xs text-[#9A9DA6] max-w-sm mt-1 mb-5 leading-relaxed">{description}</p>
      )}
      {actionText && onAction && (
        <button
          id={`${id}-action-button`}
          onClick={onAction}
          className="px-4 py-2 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const LoadingState: React.FC<{ id?: string; message?: string }> = ({
  id = 'loading-state',
  message = 'Loading platform content...',
}) => {
  return (
    <div id={id} className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-[#0E0F12]">
      <div className="w-6 h-6 border-2 border-[rgba(242,241,237,0.1)] border-t-[#4C63D2] rounded-full animate-spin mb-3" />
      <p className="text-xs text-[#9A9DA6]">{message}</p>
    </div>
  );
};

export const ErrorState: React.FC<{
  id?: string;
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({
  id = 'error-state',
  title = 'Encountered an issue',
  message = 'Unable to fetch the requested record. Please retry.',
  onRetry,
}) => {
  return (
    <div
      id={id}
      className="p-6 border border-rose-500/30 bg-[#16181D] text-center flex flex-col items-center justify-center"
    >
      <h4 className="font-serif text-sm font-normal text-rose-300">{title}</h4>
      <p className="text-xs text-[#9A9DA6] max-w-md mt-1 mb-4">{message}</p>
      {onRetry && (
        <button
          id={`${id}-retry-button`}
          onClick={onRetry}
          className="px-3.5 py-1.5 text-xs font-medium text-[#F2F1ED] bg-rose-700 hover:bg-rose-600 transition-colors cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
};
