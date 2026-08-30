import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  designation: string;
  region: string;
  employeeId: string;
  avatar: string | null;
  avatar_url?: string | null;
  preferences?: {
    emailAlerts?: boolean;
    highSeverityAlerts?: boolean;
    twoFactorEnabled?: boolean;
  };
}

export interface SignupData {
  name: string;
  email: string;
  password?: string;
  organization?: string;
  designation?: string;
  region?: string;
  phone?: string;
}

interface AuthContextType {
  user: UserProfile;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; needsEmailVerification?: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  updateAvatar: (avatarDataUrl: string) => Promise<{ success: boolean; error?: string }>;
  removeAvatar: () => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; message: string; error?: string }>;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr-84920',
  name: 'Rajeev Sharma',
  email: 'inspector.delhi@gov.in',
  phone: '+91 98765 43210',
  organization: 'Legal Metrology Department',
  designation: 'Senior Metrology Officer',
  region: 'Delhi NCR',
  employeeId: 'LMD-DL-4928',
  avatar: null,
  avatar_url: null,
  preferences: {
    emailAlerts: true,
    highSeverityAlerts: true,
    twoFactorEnabled: false,
  },
};

const STORAGE_KEY_USER = 'legalmetrix_active_user_v2';
const STORAGE_KEY_AUTH = 'legalmetrix_is_auth_v2';
const STORAGE_KEY_SESSION = 'legalmetrix_session_v2';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PROFILE;
  });

  const [session, setSession] = useState<Session | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSION);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const auth = localStorage.getItem(STORAGE_KEY_AUTH);
      if (auth !== null) {
        return auth === 'true';
      }
    } catch {
      // Fallback
    }
    return false; // Default to unauthenticated for authentic security
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state to local storage
  const persistState = useCallback((activeUser: UserProfile | null, authed: boolean, sess: Session | null = null) => {
    try {
      if (authed && activeUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(activeUser));
        localStorage.setItem(STORAGE_KEY_AUTH, 'true');
        if (sess) {
          localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sess));
        }
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
        localStorage.removeItem(STORAGE_KEY_SESSION);
      }
    } catch {
      // Storage access blocked or quota exceeded
    }
  }, []);

  // Initialize Auth state on boot
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (!isMounted) return;

          if (initialSession && initialSession.user) {
            setSession(initialSession);
            setIsAuthenticated(true);
            await syncSupabaseProfile(initialSession.user);
          } else {
            setSession(null);
            setIsAuthenticated(false);
          }

          // Listen for Supabase auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
            if (!isMounted) return;
            if (currentSession && currentSession.user) {
              setSession(currentSession);
              setIsAuthenticated(true);
              await syncSupabaseProfile(currentSession.user);
            } else {
              setSession(null);
              setIsAuthenticated(false);
              persistState(null, false, null);
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        } else {
          // Local storage session validation
          const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
          const savedUserStr = localStorage.getItem(STORAGE_KEY_USER);

          if (savedAuth && savedUserStr) {
            const parsed = JSON.parse(savedUserStr);
            setUser(parsed);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('[Auth] Init error:', err);
        setIsAuthenticated(false);
      } finally {
        if (isMounted) {
          // Brief transition for smooth boot
          setTimeout(() => setIsLoading(false), 250);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [persistState]);

  // Synchronize profile with Supabase profiles table
  const syncSupabaseProfile = async (authUser: User) => {
    if (!supabase) return;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('[Auth] Profile fetch warning:', error.message);
      }

      if (profile) {
        const syncedUser: UserProfile = {
          ...DEFAULT_PROFILE,
          id: profile.id,
          name: profile.full_name || profile.name || authUser.user_metadata?.full_name || user.name,
          email: profile.email || authUser.email || user.email,
          organization: profile.organization || user.organization,
          designation: profile.designation || user.designation,
          phone: profile.phone || user.phone,
          region: profile.region || user.region,
          employeeId: profile.employee_id || user.employeeId,
          avatar: profile.avatar_url || user.avatar,
          avatar_url: profile.avatar_url || user.avatar,
        };
        setUser(syncedUser);
        persistState(syncedUser, true);
      } else {
        // Initialize new profile row if missing
        const newProfile = {
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || user.name || 'Metrology Officer',
          email: authUser.email || user.email,
          organization: authUser.user_metadata?.organization || user.organization,
          designation: authUser.user_metadata?.designation || user.designation,
          phone: user.phone,
          region: user.region,
          avatar_url: user.avatar,
        };

        const { error: insertError } = await supabase.from('profiles').insert(newProfile);
        if (insertError) {
          console.warn('[Auth] Profile creation notice:', insertError.message);
        }
      }
    } catch (err) {
      console.error('[Auth] Profile sync error:', err);
    }
  };

  // Sign In handler
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase || !password) {
        setIsLoading(false);
        return { success: false, error: 'Supabase authentication is not properly configured or password missing.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setIsLoading(false);
        let friendlyMessage = 'Email or password is incorrect.';
        if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('fetch')) {
          friendlyMessage = 'Unable to connect. Please check your internet connection and try again.';
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          friendlyMessage = 'Please verify your email address before signing in.';
        }
        return { success: false, error: friendlyMessage };
      }

      if (data.session && data.user) {
        setSession(data.session);
        setIsAuthenticated(true);
        await syncSupabaseProfile(data.user);
        persistState(user, true, data.session);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Unknown authentication error.' };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  };

  // Sign Up handler
  const signup = async (data: SignupData): Promise<{ success: boolean; needsEmailVerification?: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase || !data.password) {
        setIsLoading(false);
        return { success: false, error: 'Supabase authentication is not properly configured or password missing.' };
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.name.trim(),
            organization: data.organization?.trim() || 'Legal Metrology Department',
            designation: data.designation?.trim() || 'Enforcement Inspector',
          },
        },
      });

      if (error) {
        setIsLoading(false);
        let friendly = error.message;
        if (error.message.toLowerCase().includes('already registered')) {
          friendly = 'An account with this email already exists.';
        }
        return { success: false, error: friendly };
      }

      const newUserProfile: UserProfile = {
        ...DEFAULT_PROFILE,
        id: authData.user?.id || 'usr-' + Math.floor(10000 + Math.random() * 90000),
        name: data.name.trim(),
        email: data.email.trim(),
        organization: data.organization?.trim() || DEFAULT_PROFILE.organization,
        designation: data.designation?.trim() || DEFAULT_PROFILE.designation,
        region: data.region?.trim() || DEFAULT_PROFILE.region,
        avatar: null,
        avatar_url: null,
      };

      if (authData.session) {
        setSession(authData.session);
        setIsAuthenticated(true);
        setUser(newUserProfile);
        persistState(newUserProfile, true, authData.session);
        await syncSupabaseProfile(authData.user!);
        setIsLoading(false);
        return { success: true, needsEmailVerification: false };
      } else {
        // Email confirmation required
        setIsLoading(false);
        return { success: true, needsEmailVerification: true };
      }
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Failed to create account. Please try again.' };
    }
  };

  // Sign Out handler
  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[Auth] Signout warning:', err);
    } finally {
      setSession(null);
      setIsAuthenticated(false);
      persistState(null, false, null);
      setIsLoading(false);
    }
  };

  // Profile update
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    try {
      const updated = { ...user, ...updates };
      setUser(updated);
      persistState(updated, true, session);

      if (isSupabaseConfigured && supabase && user.id) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: updated.name,
            organization: updated.organization,
            designation: updated.designation,
            phone: updated.phone,
            region: updated.region,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          console.warn('[Auth] DB update warning:', error.message);
        }
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Could not save profile changes.' };
    }
  };

  // Avatar update
  const updateAvatar = async (avatarDataUrl: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const updated = { ...user, avatar: avatarDataUrl, avatar_url: avatarDataUrl };
      setUser(updated);
      persistState(updated, true, session);

      if (isSupabaseConfigured && supabase && user.id) {
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarDataUrl, updated_at: new Date().toISOString() })
          .eq('id', user.id);
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Could not update avatar.' };
    }
  };

  // Avatar removal
  const removeAvatar = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const updated = { ...user, avatar: null, avatar_url: null };
      setUser(updated);
      persistState(updated, true, session);

      if (isSupabaseConfigured && supabase && user.id) {
        await supabase
          .from('profiles')
          .update({ avatar_url: null, updated_at: new Date().toISOString() })
          .eq('id', user.id);
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Could not remove avatar.' };
    }
  };

  // Forgot password
  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          console.warn('[Auth] Reset warning:', error.message);
        }
      }
      return {
        success: true,
        message: 'If an account exists for this email, a password reset link has been sent.',
      };
    } catch {
      return {
        success: true,
        message: 'If an account exists for this email, a password reset link has been sent.',
      };
    }
  };

  // Reset password
  const resetPassword = async (newPassword: string): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          return { success: false, message: '', error: error.message };
        }
      }
      return { success: true, message: 'Password updated successfully.' };
    } catch {
      return { success: false, message: '', error: 'Failed to update password. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        updateAvatar,
        removeAvatar,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
