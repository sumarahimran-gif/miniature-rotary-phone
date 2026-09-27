import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { User } from '../../types';

interface AccessDeniedViewProps {
  currentUser: User;
  onReturnToDashboard: () => void;
  onLogout?: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  currentUser,
  onReturnToDashboard,
  onLogout,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-[#16181D] border border-[rgba(242,241,237,0.08)] p-8 text-center space-y-6">
        <div className="w-12 h-12 bg-[#0E0F12] border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 stroke-[1.5]" />
        </div>

        <div className="space-y-2">
          <div className="text-xs text-[#9A9DA6] font-mono">
            Portal Access Control
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">
            Administrative Portal Restricted
          </h1>
          <p className="text-xs text-[#9A9DA6] leading-relaxed">
            You are signed in as <span className="font-mono text-[#F2F1ED]">{currentUser.name}</span> ({currentUser.email}) with <span className="font-mono text-[#4C63D2]">Student</span> credentials.
            The creator management studio, revenue analytics, and course authoring suites are restricted to platform administrators.
          </p>
        </div>

        <div className="pt-2 border-t border-[rgba(242,241,237,0.08)] space-y-2">
          <button
            onClick={onReturnToDashboard}
            className="w-full py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Student Dashboard</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2 px-4 text-xs font-medium text-[#9A9DA6] hover:text-[#F2F1ED] border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] bg-[#0E0F12] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
