'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Renders a password reset form that allows users to update their password.
 *
 * The component performs a check on mount to verify the validity of the password reset link via session retrieval.
 * Upon submitting the form, it validates that the new password matches its confirmation and meets the minimum length
 * requirement before attempting to update the password using Supabase auth. Notifications for errors and successful updates
 * are displayed using toast messages, and a successful update triggers a redirect to the login page.
 *
 * @returns A JSX element that displays the password reset form.
 */
export default function PasswordResetForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const router = useRouter();

  // Check if hash fragment is present (from password reset email)
  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        // For password reset, we need a valid session with type 'recovery'
        if (!session?.user?.email || session.user.aud !== 'authenticated') {
          throw new Error('Invalid session');
        }
        
        setIsValidSession(true);
      } catch (error) {
        console.error('Session validation error:', error);
        toast.error('Invalid reset link', {
          description: 'This password reset link is invalid or has expired. Please request a new one.',
          duration: 4000,
        });
        // Redirect to password reset request page after a delay
        setTimeout(() => {
          router.push('/password-reset/request');
        }, 3000);
      }
    };

    handlePasswordReset();
  }, [router]);

  /**
   * Handles the password update process from the reset form.
   *
   * This asynchronous function first prevents the default form submission behavior and then validates that the new password matches its confirmation and meets
   * the minimum length requirement of 6 characters. If validation succeeds, it attempts to update the user's password using Supabase authentication. Success and error
   * feedback are provided via toast notifications, with a successful update triggering a redirect to the login page.
   *
   * @param e - The form submission event.
   */
  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    
    if (!isValidSession) {
      toast.error('Invalid session', {
        description: 'Your session has expired. Please request a new password reset link.',
        duration: 4000,
      });
      router.push('/password-reset/request');
      return;
    }
    
    setLoading(true);

    try {
      // Password validation
      if (password !== confirmPassword) {
        throw new Error('The passwords you entered do not match.');
      }

      // Password strength validation
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        throw new Error('Password must be at least 8 characters and contain letters, numbers, and special characters.');
      }

      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast.success('Password updated', {
        description: 'Your password has been successfully updated. Redirecting to login...',
        duration: 3000,
      });
      
      // Sign out the user from the recovery session
      await supabase.auth.signOut();
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center mb-6">Create New Password</h2>
      
      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="At least 8 characters"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Must contain letters, numbers, and special characters
          </p>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !isValidSession}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}