'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        setLoading(true);
        setError(null);

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        // If we have a session, validate the user
        if (session) {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          if (mounted) setUser(user);
        } else {
          if (mounted) setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Authentication failed'));
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
        // Session was refreshed, no need to re-validate
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/login');
        return;
      }

      if (session) {
        try {
          // Validate user on auth state change
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          setUser(user);
        } catch (err) {
          console.error('Error validating user:', err);
          setUser(null);
          setError(err instanceof Error ? err : new Error('User validation failed'));
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
  }, [router]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err : new Error('Sign out failed'));
    }
  };

  return {
    user,
    loading,
    error,
    signOut,
    isAuthenticated: !!user,
  };
}