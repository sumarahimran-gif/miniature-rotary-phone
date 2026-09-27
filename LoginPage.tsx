import React, { useState } from 'react';
import { BookOpen, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Input } from '../../components/common/FormFields';
import {
  signInUser,
  isSupabaseConfigured,
  getDatabaseUserProfile,
  mapSupabaseUserToAppUser,
} from '../../services/supabase';
import { apiService } from '../../services/api';
import { User as UserType } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (role: 'student' | 'admin', user?: UserType) => void;
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ============================================================
  // TEMPORARY DEVELOPMENT-ONLY BYPASS (Can be removed cleanly)
  // ============================================================
  const handleDevStudentLogin = () => {
    const devStudentUser: UserType = {
      id: 'dev-student',
      name: 'Dev Student',
      email: 'dev@example.com',
      role: 'STUDENT',
      status: 'ACTIVE',
      enrolledCourseIds: ['course-1', 'course-2'],
      joinedAt: new Date().toISOString(),
    };
    onLoginSuccess('student', devStudentUser);
  };

  const handleDevAdminLogin = () => {
    const devAdminUser: UserType = {
      id: 'dev-admin',
      name: 'Dev Administrator',
      email: 'admin.dev@example.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      headline: 'Platform Administrator (DEV MODE)',
      enrolledCourseIds: [],
      joinedAt: new Date().toISOString(),
    };
    onLoginSuccess('admin', devAdminUser);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        // Authenticate with Supabase Auth
        const { user, error } = await signInUser(cleanEmail, password);

        if (error) {
          setErrorMessage(error.message || 'Failed to authenticate. Please check your credentials.');
          setIsLoading(false);
          return;
        }

        if (user) {
          try {
            // 2. Get authenticated Supabase user from current session (user.id)
            // 3, 4, 5. Query public.users where auth_user_id = user.id, retrieve id, role, status, name, email
            // 6. Wait for this database profile query to finish BEFORE deciding which portal to show
            const dbProfile = await getDatabaseUserProfile(user.id, user.email);

            // 9. Never default a successfully authenticated user to STUDENT
            if (!dbProfile) {
              setErrorMessage(
                `No user profile found matching auth_user_id "${user.id}" in public.users.`
              );
              setIsLoading(false);
              return;
            }

            const role = (dbProfile.role || '').toString().trim().toUpperCase();
            const status = (dbProfile.status || 'ACTIVE').toString().trim().toUpperCase();

            if (status !== 'ACTIVE') {
              setErrorMessage(`Your account status is currently "${status}". Please contact support.`);
              setIsLoading(false);
              return;
            }

            const appUser = mapSupabaseUserToAppUser(user, dbProfile);

            // 7. If role === 'ADMIN' AND status === 'ACTIVE', route to Admin Portal
            // 8. If role === 'STUDENT' AND status === 'ACTIVE', route to Student Portal
            if (role === 'ADMIN' && status === 'ACTIVE') {
              onLoginSuccess('admin', appUser);
            } else if (role === 'STUDENT' && status === 'ACTIVE') {
              onLoginSuccess('student', appUser);
            } else {
              setErrorMessage(`Unrecognized account role "${dbProfile.role}". Access denied.`);
              setIsLoading(false);
              return;
            }
            return;
          } catch (profileErr: unknown) {
            const errorMsg =
              profileErr instanceof Error ? profileErr.message : 'Database profile retrieval error.';
            console.warn('Profile retrieval notice:', profileErr);
            setErrorMessage(errorMsg);
            setIsLoading(false);
            return;
          }
        }
      } else {
        // Fallback for offline development: strictly authenticate against user records
        const authResult = await apiService.authenticateUser(cleanEmail, password);
        if (authResult.error || !authResult.user) {
          setErrorMessage(
            authResult.error || 'Invalid credentials. Please verify your email and password.'
          );
          setIsLoading(false);
          return;
        }

        const rawRole = (authResult.user.role || '').toString().trim().toUpperCase();
        const rawStatus = (authResult.user.status || 'ACTIVE').toString().trim().toUpperCase();

        if (rawRole === 'ADMIN' && rawStatus === 'ACTIVE') {
          onLoginSuccess('admin', authResult.user);
        } else {
          onLoginSuccess('student', authResult.user);
        }
        return;
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during authentication.');
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
          Sign in to Creator Hub
        </h2>
        <p className="mt-1 text-xs text-[#9A9DA6]">
          Protected learning room and creator administration.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#16181D] py-8 px-6 border border-[rgba(242,241,237,0.08)] shadow-sm">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              id="login-email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              leftIcon={<Mail className="w-4 h-4 text-[#9A9DA6]" />}
              required
            />

            <div>
              <Input
                id="login-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-[#9A9DA6]" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="p-1 text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
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
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate('auth_forgot_password')}
                  className="text-xs text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* ============================================================ */}
          {/* TEMPORARY DEVELOPMENT-ONLY BYPASS (Can be removed cleanly) */}
          {/* ============================================================ */}
          <div className="mt-5 pt-4 border-t border-dashed border-amber-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30">
                DEV MODE
              </span>
              <span className="text-[10px] text-[#9A9DA6]">
                Testing bypass · No Supabase Auth required
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                id="dev-student-bypass-button"
                onClick={handleDevStudentLogin}
                className="w-full py-2.5 px-3 text-xs font-medium text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <span>Continue as Student (DEV)</span>
              </button>
              <button
                type="button"
                id="dev-admin-bypass-button"
                onClick={handleDevAdminLogin}
                className="w-full py-2.5 px-3 text-xs font-medium text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <span>Continue as Admin (DEV)</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[rgba(242,241,237,0.08)] text-center text-xs text-[#9A9DA6]">
            No active seat license?{' '}
            <button
              onClick={() => onNavigate('auth_register')}
              className="text-[#4C63D2] hover:underline cursor-pointer"
            >
              Request enrollment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
