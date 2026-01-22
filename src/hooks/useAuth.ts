/* ============================================================================
   Authentication Hook
   Manages user authentication state and operations
   ============================================================================ */

import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  organizationId: string;
  role?: 'admin' | 'member' | 'viewer';
}

interface SignInData {
  email: string;
  password: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  // Load user profile from database
  const loadProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return null;
    }

    return data;
  };

  // Initialize auth state on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      const profile = user ? await loadProfile(user.id) : null;

      setState({
        user,
        profile,
        session,
        loading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      const profile = user ? await loadProfile(user.id) : null;

      setState({
        user,
        profile,
        session,
        loading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign up a new user and create their profile
   */
  const signUp = async (data: SignUpData): Promise<{ error: AuthError | Error | null }> => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { error: authError };
      }

      if (!authData.user) {
        return { error: new Error('Failed to create user') };
      }

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        organization_id: data.organizationId,
        role: data.role || 'member',
      });

      if (profileError) {
        // If profile creation fails, we should ideally delete the auth user
        // but Supabase doesn't allow that from client side
        console.error('Failed to create profile:', profileError);
        return { error: profileError };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  /**
   * Sign in an existing user
   */
  const signIn = async (data: SignInData): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    return { error };
  };

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  };

  /**
   * Update user password
   */
  const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error };
  };

  /**
   * Update user profile
   */
  const updateProfile = async (
    updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<{ error: Error | null }> => {
    if (!state.user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', state.user.id);

    if (!error && state.profile) {
      // Update local state
      setState((prev) => ({
        ...prev,
        profile: { ...prev.profile!, ...updates },
      }));
    }

    return { error };
  };

  /**
   * Refresh the current profile from database
   */
  const refreshProfile = async (): Promise<void> => {
    if (state.user) {
      const profile = await loadProfile(state.user.id);
      setState((prev) => ({ ...prev, profile }));
    }
  };

  return {
    // State
    user: state.user,
    profile: state.profile,
    session: state.session,
    loading: state.loading,
    isAuthenticated: !!state.user,

    // Auth operations
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  };
}

// Hook to require authentication
export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      // Redirect to login or show error
      window.location.href = '/login';
    }
  }, [auth.loading, auth.isAuthenticated]);

  return auth;
}
