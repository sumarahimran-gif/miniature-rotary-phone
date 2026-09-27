import React, { useState } from 'react';
import { BookOpen, KeyRound, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Input } from '../../components/common/FormFields';
import { updatePassword } from '../../services/supabase';

interface ResetPasswordProps {
  onSuccess: () => void;
  onNavigate: (view: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordProps> = ({ onSuccess, onNavigate }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword) {
      setErrorMessage('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('The passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      // Updates password in Supabase Auth directly via supabase.auth.updateUser({ password })
      // Does not store passwords in public.users or database schema
      const { error } = await updatePassword(newPassword);

      if (error) {
        setErrorMessage(error.message || 'Failed to update password.');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
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
          Set new password
        </h2>
        <p className="mt-1 text-xs text-[#9A9DA6]">
          Choose a secure, new password for your account.
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

          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-10 h-10 bg-[#4C63D2] text-[#F2F1ED] flex items-center justify-center mx-auto lesson-check-animated">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="font-serif text-base font-normal text-[#F2F1ED]">
                Password Updated Successfully
              </h3>
              <p className="text-xs text-[#9A9DA6] leading-relaxed max-w-xs mx-auto">
                Your account password has been updated in Supabase Auth. You can now sign in with your new credentials.
              </p>
              <button
                type="button"
                onClick={onSuccess}
                className="w-full py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer"
              >
                Sign In With New Password
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                id="reset-new-password"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                leftIcon={<KeyRound className="w-4 h-4 text-[#9A9DA6]" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                required
              />

              <Input
                id="reset-confirm-password"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                leftIcon={<KeyRound className="w-4 h-4 text-[#9A9DA6]" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors focus:outline-none cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                required
              />

              <button
                id="reset-submit-button"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('auth_login')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer"
                >
                  <span>Cancel and return to login</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
