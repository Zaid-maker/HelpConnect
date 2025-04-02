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
  const router = useRouter();

  // Check if hash fragment is present (from password reset email)
  useEffect(() => {
    // The #access_token and #type=recovery hash params are handled automatically by Supabase Auth
    const handlePasswordReset = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        toast.error('Invalid reset link', {
          description: 'This password reset link is invalid or has expired. Please request a new one.',
          duration: 4000,
        });
      }
    };

    handlePasswordReset();
  }, []);

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Validate passwords
    if (password !== confirmPassword) {
      toast.error('Password mismatch', {
        description: 'The passwords you entered do not match.',
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Invalid password', {
        description: 'Password must be at least 6 characters long.',
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast.success('Password updated', {
        description: 'Your password has been successfully updated.',
        duration: 3000,
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password', {
        description: (error as Error).message || 'Please try again later.',
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
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
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
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
} 