'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User, AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
} {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const handleError = useCallback((error: AuthError | Error | unknown, context: string) => {
    console.error(`${context}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    setError(error instanceof Error ? error : new Error(errorMessage));
    toast.error('Authentication Error', {
      description: errorMessage,
      duration: 4000,
    });
  }, []);

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(user);
      } else {
        setUser(null);
      }
    } catch (error) {
      handleError(error, 'Session refresh error');
    }
  }, [handleError]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        setLoading(true);
        setError(null);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          if (mounted) setUser(user);
        } else {
          if (mounted) setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          handleError(error, 'Auth initialization error');
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event);
      
      if (event === 'TOKEN_REFRESHED') {
        // Refresh user data when token is refreshed
        await refreshSession();
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/login');
        return;
      }

      if (session) {
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          setUser(user);
        } catch (error) {
          handleError(error, 'User validation error');
          setUser(null);
        }
      } else {
        setUser(null);
      }

      router.refresh();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, handleError, refreshSession]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.push('/login');
      toast.success('Signed out successfully');
    } catch (error) {
      handleError(error, 'Sign out error');
    }
  }, [router, handleError]);

  return {
    user,
    loading,
    error,
    signOut,
    refreshSession,
    isAuthenticated: !!user,
  };
}