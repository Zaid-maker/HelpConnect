'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

/**
 * Renders a responsive login form for user authentication.
 *
 * The component displays a form that collects the user's email and password. Upon submission, it attempts to sign
 * in the user via Supabase. If the login is successful, a success toast is shown and the user is redirected to the
 * dashboard after a short delay. If an error occurs during authentication, the error is logged and an error toast
 * is displayed.
 *
 * @returns The rendered login form component.
 */
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const router = useRouter();

  // Check for lockout
  useEffect(() => {
    const storedLockout = localStorage.getItem('auth-lockout');
    if (storedLockout) {
      const lockoutTime = new Date(storedLockout);
      if (lockoutTime > new Date()) {
        setLockoutUntil(lockoutTime);
      } else {
        localStorage.removeItem('auth-lockout');
      }
    }
  }, []);

  /**
   * Handles user sign-in via form submission using Supabase authentication.
   *
   * Prevents the default submission behavior, enables a loading state, and attempts to authenticate the user with the provided email and password. On success, it displays a success toast and, after a brief delay, redirects the user to the dashboard. On failure, it logs the error and shows an error toast with the relevant message.
   *
   * @param e - The form submission event.
   */
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    
    // Check lockout
    if (lockoutUntil && lockoutUntil > new Date()) {
      const timeLeft = Math.ceil((lockoutUntil.getTime() - new Date().getTime()) / 1000);
      toast.error('Too many login attempts', {
        description: `Please try again in ${timeLeft} seconds`,
        duration: 4000,
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Increment attempts and check for lockout
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          const lockoutTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
          setLockoutUntil(lockoutTime);
          localStorage.setItem('auth-lockout', lockoutTime.toISOString());
          throw new Error('Too many failed attempts. Please try again in 5 minutes.');
        }

        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password');
        }
        throw error;
      }

      // Reset attempts on successful login
      setAttempts(0);
      localStorage.removeItem('auth-lockout');

      toast.success('Welcome back!', {
        description: 'You have successfully logged in.',
        duration: 3000,
      });

      // Wait for the toast to be visible before redirecting
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed', {
        description: error instanceof Error ? error.message : 'Please check your credentials and try again.',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center mb-6">Login to HelpConnect</h2>
      
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <div className="mt-1 text-right">
            <Link href="/password-reset/request" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              Forgot password?
            </Link>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}