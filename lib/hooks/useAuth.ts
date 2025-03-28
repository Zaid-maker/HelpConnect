'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get authenticated user
    const initAuth = async () => {
      setLoading(true);
      try {
        // Use getUser for better security
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // When we get a session change, validate the user with getUser
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } else {
        setUser(null);
      }
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
} 