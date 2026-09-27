import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div id="toast-portal-root" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
        };

        const bg = {
          success: 'border-emerald-100 bg-white text-slate-900 shadow-xl shadow-slate-900/5',
          error: 'border-rose-100 bg-white text-slate-900 shadow-xl shadow-slate-900/5',
          info: 'border-sky-100 bg-white text-slate-900 shadow-xl shadow-slate-900/5',
          warning: 'border-amber-100 bg-white text-slate-900 shadow-xl shadow-slate-900/5',
        }[toast.type];

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${bg}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-tight text-slate-900">{toast.title}</h4>
              {toast.message && <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              id={`toast-close-${toast.id}`}
              onClick={() => dismiss(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
