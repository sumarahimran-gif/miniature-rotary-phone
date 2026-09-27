import React, { useState } from 'react';
import { BookOpen, ChevronLeft, Mail, Check, AlertCircle } from 'lucide-react';
import { Input } from '../../components/common/FormFields';
import { resetPasswordForEmail } from '../../services/supabase';

interface ForgotPasswordProps {
  onNavigate: (view: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);

    try {
      // Connect to real Supabase Auth password reset
      const { error } = await resetPasswordForEmail(email);

      if (error) {
        setErrorMessage(error.message || 'Failed to dispatch password reset request.');
        return;
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0F12] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-10 h-10 bg-[#16181D] border border-[rgba(242,241,237,0.08)] text-[#F2F1ED] items-center justify-center mb-4">
          <BookOpen className="w-5 h-5 text-[#4C63D2]" />
        </div>
        <h2 className="font-serif text-2xl font-normal tracking-tight text-[#F2F1ED]">
          Reset password
        </h2>
        <p className="mt-1 text-xs text-[#9A9DA6]">
          Enter your registered email and we&apos;ll send an authorized reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#16181D] py-8 px-6 border border-[rgba(242,241,237,0.08)]">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-10 h-10 bg-[#4C63D2] text-[#F2F1ED] flex items-center justify-center mx-auto lesson-check-animated">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="font-serif text-base font-normal text-[#F2F1ED]">Password Reset Dispatched</h3>
              <p className="text-xs text-[#9A9DA6] leading-relaxed max-w-xs mx-auto">
                If an account exists for <strong className="text-[#F2F1ED] font-mono">{email}</strong>, you will receive instructions shortly.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('auth_login')}
                className="w-full py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                id="forgot-email"
                label="Registered Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                leftIcon={<Mail className="w-4 h-4 text-[#9A9DA6]" />}
                required
              />

              <button
                id="forgot-submit-button"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <span>Send Password Reset Link</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('auth_login')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
