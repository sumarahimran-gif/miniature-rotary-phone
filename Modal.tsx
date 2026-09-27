import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  id = 'app-modal',
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div
      id={`${id}-backdrop`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E0F12]/80 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className={`w-full ${maxWidthClass} bg-[#16181D] border border-[rgba(242,241,237,0.08)] overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(242,241,237,0.08)] bg-[#16181D]">
          <div>
            <h3 id={`${id}-title`} className="font-serif text-base font-normal text-[#F2F1ED]">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-[#9A9DA6] mt-0.5">{subtitle}</p>}
          </div>
          <button
            id={`${id}-close-button`}
            onClick={onClose}
            className="text-[#9A9DA6] hover:text-[#F2F1ED] p-1.5 hover:bg-[#1C1F26] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  id = 'confirm-dialog',
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal id={id} isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <p className="text-xs text-[#9A9DA6] leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[rgba(242,241,237,0.08)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-1.5 text-xs font-medium text-[#9A9DA6] hover:text-[#F2F1ED] bg-transparent border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.16)] transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-[#4C63D2] hover:bg-[#4055BA] text-[#F2F1ED]'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
