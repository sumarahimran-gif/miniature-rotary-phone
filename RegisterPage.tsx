import React, { useState } from 'react';
import { BookOpen, Lock, Mail, User, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/common/FormFields';
import {
  registerWithCode,
  getDatabaseUserProfile,
  mapSupabaseUserToAppUser,
} from '../../services/supabase';
import { User as UserType } from '../../types';

interface RegisterPageProps {
  onRegisterSuccess: (role: 'student' | 'admin', user?: UserType) => void;
  onNavigate: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setConfirmationNotice(null);

    // 1. Client-side presence validation: All four fields are strictly required
    if (!name.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please provide a password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!registrationCode.trim()) {
      setErrorMessage('A valid admin-issued registration code is required.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Authoritative registration via deployed Supabase Edge Function 'register-with-code'
      // Direct supabase.auth.signUp() is NOT called.
      // The Edge Function authoritatively validates the code and provisions the account.
      const result = await registerWithCode({
        name: name.trim(),
        email: email.trim(),
        password,
        registrationCode: registrationCode.trim(),
      });

      if (result.error) {
        // Display authoritative backend error message
        setErrorMessage(result.error.message || 'Registration failed. Please check your details.');
        return;
      }

      if (result.session) {
        // Immediate active session returned
        let resolvedUser: UserType | undefined = result.appUser;
        if (result.session.user) {
          const dbProfile = await getDatabaseUserProfile(
            result.session.user.id,
            result.session.user.email
          );
          resolvedUser = mapSupabaseUserToAppUser(result.session.user, dbProfile);
        }
        onRegisterSuccess('student', resolvedUser);
      } else if (result.appUser) {
        // Active student user resolution
        onRegisterSuccess('student', result.appUser);
      } else {
        // Show existing email confirmation notice state
        setConfirmationNotice(
          result.message ||
            'Registration successful! Your invite code has been verified. Please check your email to confirm your student account.'
        );
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred during registration.'
      );
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
          Request student account
        </h2>
        <p className="mt-1 text-xs text-[#9A9DA6]">
          Access private masterclasses and engineering curriculums.
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

          {confirmationNotice ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-normal text-[#F2F1ED]">Account Created</h3>
              <p className="text-xs text-[#9A9DA6] leading-relaxed max-w-xs mx-auto">
                {confirmationNotice}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('auth_login')}
                className="w-full py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                id="register-name"
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                leftIcon={<User className="w-4 h-4 text-[#9A9DA6]" />}
                required
              />

              <Input
                id="register-email"
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@company.com"
                leftIcon={<Mail className="w-4 h-4 text-[#9A9DA6]" />}
                required
              />

              <Input
                id="register-password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                leftIcon={<Lock className="w-4 h-4 text-[#9A9DA6]" />}
                required
              />

              {/* Registration / Invite Code - REQUIRED field */}
              <Input
                id="register-registration-code"
                label="Registration Code"
                type="text"
                value={registrationCode}
                onChange={(e) => setRegistrationCode(e.target.value.toUpperCase())}
                placeholder="e.g. CORP-BULK-2026-001"
                leftIcon={<Key className="w-4 h-4 text-[#9A9DA6]" />}
                helperText="Admin-issued invite or registration code is required to register."
                required
              />

              <button
                id="register-submit-button"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Registering account...</span>
                  </>
                ) : (
                  <span>Complete Registration</span>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-[#9A9DA6]">
            Already have an active account?{' '}
            <button
              onClick={() => onNavigate('auth_login')}
              className="text-[#4C63D2] hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
