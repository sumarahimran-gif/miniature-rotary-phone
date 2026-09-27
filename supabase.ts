import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User, UserRole } from '../types';
import { apiService } from './api';

// Read exclusively from specified Vite environment variables - never hardcode credentials or secrets
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl.trim() !== '' &&
  supabasePublishableKey.trim() !== '' &&
  !supabaseUrl.includes('placeholder')
);

// Supabase client instance using publishable key (never secret/service-role key)
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-publishable-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  }
);

export interface DatabaseUserProfile {
  id?: string;
  auth_user_id?: string;
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  status?: string;
  avatar_url?: string;
  avatarUrl?: string;
  headline?: string;
  bio?: string;
  created_at?: string;
  enrolled_courses?: string[];
  enrolledCourseIds?: string[];
  [key: string]: any;
}

/**
 * Check if a user has an active ADMIN profile.
 * Role must be 'ADMIN' (case-insensitive) and status must be 'ACTIVE' (case-insensitive).
 */
export function isUserAdmin(user: { role?: string; status?: string } | null | undefined): boolean {
  if (!user) return false;
  const role = (user.role || '').toString().trim().toUpperCase();
  const status = (user.status || 'ACTIVE').toString().trim().toUpperCase();
  return role === 'ADMIN' && (status === 'ACTIVE' || status === '');
}

/**
 * Maps a Supabase Auth user record and authoritative public.users database record
 * to the application's internal User interface.
 * Real role and status from public.users are strictly preserved.
 */
export function mapSupabaseUserToAppUser(
  authUser: SupabaseUser,
  dbProfile?: DatabaseUserProfile | null
): User {
  const meta = authUser.user_metadata || {};
  const name =
    dbProfile?.name ||
    dbProfile?.full_name ||
    meta.name ||
    meta.full_name ||
    (authUser.email ? authUser.email.split('@')[0] : 'User');

  // Read the real role from public.users
  const rawRole = (dbProfile?.role || meta.role || '').toString().trim();
  const rawRoleUpper = rawRole.toUpperCase();

  // Read the real status from public.users
  const rawStatus = (dbProfile?.status || meta.status || 'ACTIVE').toString().trim().toUpperCase();

  // Map to UserRole while maintaining exact authority
  let role: UserRole = 'student';
  if (rawRoleUpper === 'ADMIN') {
    role = 'ADMIN';
  } else if (rawRoleUpper === 'STUDENT') {
    role = 'STUDENT';
  } else if (rawRole.toLowerCase() === 'admin') {
    role = 'admin';
  } else if (rawRole.toLowerCase() === 'student') {
    role = 'student';
  }

  return {
    id: dbProfile?.id || authUser.id,
    authUserId: authUser.id,
    name,
    email: dbProfile?.email || authUser.email || '',
    avatarUrl:
      dbProfile?.avatarUrl ||
      dbProfile?.avatar_url ||
      meta.avatar_url ||
      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80`,
    role,
    status: rawStatus || 'ACTIVE',
    headline: dbProfile?.headline || meta.headline || '',
    bio: dbProfile?.bio || meta.bio,
    joinedAt: dbProfile?.created_at || authUser.created_at || new Date().toISOString(),
    enrolledCourseIds: dbProfile?.enrolledCourseIds || dbProfile?.enrolled_courses || [],
  };
}

export interface RegisterWithCodeParams {
  name: string;
  email: string;
  password: string;
  registrationCode: string;
}

export interface RegisterWithCodeResponse {
  user: SupabaseUser | null;
  session: Session | null;
  error: Error | null;
  message?: string;
  appUser?: User;
}

/**
 * Registers a new user via the deployed Supabase Edge Function 'register-with-code'.
 * 
 * Direct supabase.auth.signUp() is NOT used.
 * The Edge Function is authoritative for code validation and user creation.
 * Endpoint: /functions/v1/register-with-code
 */
export async function registerWithCode(
  params: RegisterWithCodeParams
): Promise<RegisterWithCodeResponse> {
  const { name, email, password, registrationCode } = params;

  // If Supabase environment is not configured, delegate to mock API fallback
  if (!isSupabaseConfigured) {
    return await apiService.registerWithCode({
      name,
      email,
      password,
      registrationCode,
    });
  }

  try {
    const edgeFunctionEndpoint = `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/register-with-code`;

    const response = await fetch(edgeFunctionEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabasePublishableKey,
        'Authorization': `Bearer ${supabasePublishableKey}`,
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
        registrationCode: registrationCode.trim(),
      }),
    });

    let data: any = null;
    const responseText = await response.text();
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }
    }

    if (!response.ok) {
      const errorMessage =
        data?.error ||
        data?.message ||
        data?.msg ||
        (typeof data === 'string' && data ? data : null) ||
        `Registration request failed (HTTP ${response.status}).`;

      return {
        user: null,
        session: null,
        error: new Error(errorMessage),
      };
    }

    let authUser: SupabaseUser | null = data?.user || null;
    let authSession: Session | null = data?.session || null;

    // If an active session is returned by the Edge Function, update the local Supabase client session
    if (authSession?.access_token && authSession?.refresh_token) {
      try {
        const { data: sessionData } = await supabase.auth.setSession({
          access_token: authSession.access_token,
          refresh_token: authSession.refresh_token,
        });
        if (sessionData.session) {
          authSession = sessionData.session;
          authUser = sessionData.user;
        }
      } catch (err) {
        console.warn('Could not set session in Supabase client:', err);
      }
    }

    const successMessage =
      data?.message ||
      (authSession
        ? 'Account successfully registered and verified.'
        : 'Registration successful! Please check your email to confirm your student account.');

    return {
      user: authUser,
      session: authSession,
      error: null,
      message: successMessage,
    };
  } catch (err: unknown) {
    return {
      user: null,
      session: null,
      error:
        err instanceof Error
          ? err
          : new Error('Failed to connect to the registration service.'),
    };
  }
}

/**
 * Backward compatibility alias: redirects registration to the authoritative Edge Function.
 * Direct supabase.auth.signUp() is completely removed.
 */
export async function signUpStudent(
  name: string,
  email: string,
  password: string,
  registrationCode: string
): Promise<RegisterWithCodeResponse> {
  return registerWithCode({ name, email, password, registrationCode });
}

/**
 * Authenticate existing user with Supabase email & password.
 */
export async function signInUser(
  email: string,
  password: string
): Promise<{ user: SupabaseUser | null; session: Session | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return {
      user: null,
      session: null,
      error: new Error(
        'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
      ),
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err: unknown) {
    return {
      user: null,
      session: null,
      error: err instanceof Error ? err : new Error('Failed to sign in.'),
    };
  }
}

/**
 * Sign out the currently authenticated user from Supabase.
 */
export async function signOutUser(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err : new Error('Failed to sign out.') };
  }
}

/**
 * Resolves the canonical public application URL for Supabase Auth recovery redirects.
 * Prioritizes the cloud-hosted/preview URL over localhost to prevent ERR_CONNECTION_REFUSED.
 */
export function getAppRedirectUrl(): string {
  const envAppUrl =
    (import.meta.env.VITE_APP_URL as string | undefined) ||
    (typeof process !== 'undefined' && process.env?.APP_URL);

  if (
    envAppUrl &&
    typeof envAppUrl === 'string' &&
    envAppUrl.startsWith('http') &&
    !envAppUrl.includes('localhost')
  ) {
    return envAppUrl.replace(/\/+$/, '');
  }

  if (
    typeof window !== 'undefined' &&
    window.location?.origin &&
    !window.location.origin.includes('localhost')
  ) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return (envAppUrl || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/+$/, '');
}

/**
 * Send password reset email via Supabase Auth.
 */
export async function resetPasswordForEmail(
  email: string
): Promise<{ error: Error | null; success: boolean }> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: new Error(
        'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
      ),
    };
  }

  try {
    const redirectUrl = getAppRedirectUrl();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl ? `${redirectUrl}` : undefined,
    });

    if (error) {
      return { error, success: false };
    }

    return { error: null, success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err : new Error('Failed to send reset link.'),
      success: false,
    };
  }
}

/**
 * Update authenticated user's password via Supabase Auth.
 * Used during password recovery flow. Does not touch public.users schema.
 */
export async function updatePassword(
  newPassword: string
): Promise<{ error: Error | null; success: boolean }> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: new Error(
        'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
      ),
    };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error, success: false };
    }

    return { error: null, success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err : new Error('Failed to update password.'),
      success: false,
    };
  }
}

// In-flight profile request cache to avoid duplicate concurrent queries for the same auth_user_id
const inFlightProfileRequests = new Map<string, Promise<DatabaseUserProfile | null>>();

/**
 * Fetch authenticated user's profile from public.users using the Supabase Auth user's ID (`auth_user_id`).
 * Retrieves id, auth_user_id, role, status, name, email directly from public.users.
 * Preserves actual Supabase/PostgREST errors so callers can distinguish RLS/database errors from missing profiles.
 */
export async function getDatabaseUserProfile(
  authUserId?: string,
  authEmail?: string
): Promise<DatabaseUserProfile | null> {
  if (!isSupabaseConfigured) {
    console.warn('getDatabaseUserProfile: Supabase is not configured.');
    return null;
  }

  let targetAuthUserId = authUserId;
  let targetEmail = authEmail;

  if (!targetAuthUserId || !targetEmail) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!userError && userData?.user) {
        targetAuthUserId = targetAuthUserId || userData.user.id;
        targetEmail = targetEmail || userData.user.email;
      }
    } catch (err) {
      console.warn('Error reading authenticated user from supabase.auth.getUser():', err);
    }
  }

  if (!targetAuthUserId || !targetEmail) {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!sessionError && sessionData?.session?.user) {
        targetAuthUserId = targetAuthUserId || sessionData.session.user.id;
        targetEmail = targetEmail || sessionData.session.user.email;
      }
    } catch (err) {
      console.warn('Error reading session user from supabase.auth.getSession():', err);
    }
  }

  if (!targetAuthUserId) {
    console.warn('getDatabaseUserProfile: No authenticated user ID available to query.');
    return null;
  }

  // Deduplicate concurrent requests for the same targetAuthUserId
  const cacheKey = targetAuthUserId;
  const existingRequest = inFlightProfileRequests.get(cacheKey);
  if (existingRequest) {
    return existingRequest;
  }

  const profilePromise = (async (): Promise<DatabaseUserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, auth_user_id, role, status, name, email')
        .eq('auth_user_id', targetAuthUserId)
        .maybeSingle();

      if (error) {
        const errorDetails = error.details ? ` (${error.details})` : '';
        const dbError = new Error(
          `Database query error (${error.code || 'UNKNOWN'}): ${error.message}${errorDetails}`
        );
        (dbError as unknown as { code: string }).code = error.code;
        throw dbError;
      }

      if (data) {
        return data as DatabaseUserProfile;
      }

      return null;
    } finally {
      inFlightProfileRequests.delete(cacheKey);
    }
  })();

  inFlightProfileRequests.set(cacheKey, profilePromise);
  return profilePromise;
}

/**
 * Determine portal and view strictly from authoritative public.users role and status.
 * If role = 'ADMIN' and status = 'ACTIVE' -> Admin Portal
 * If role = 'STUDENT' and status = 'ACTIVE' -> Student Portal
 */
export function determineUserPortal(user: { role?: string; status?: string } | null | undefined): {
  portal: 'admin' | 'student';
  view: 'admin_dashboard' | 'student_dashboard';
  isAdmin: boolean;
} {
  const isAdmin = isUserAdmin(user);
  return {
    portal: isAdmin ? 'admin' : 'student',
    view: isAdmin ? 'admin_dashboard' : 'student_dashboard',
    isAdmin,
  };
}
