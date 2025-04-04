'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { toast } from 'sonner';

/**
 * Renders a password reset request form.
 *
 * This component displays a form where users can request a password reset by providing their
 * email address. It manages the email input and loading state, handles form submission by calling
 * the authentication service to send a reset link, and uses toast notifications to inform the user
 * of success or failure.
 */
export default function PasswordResetRequestForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handles the password reset form submission by sending a reset link email.
   *
   * Prevents the default submission behavior, sets the loading state, and initiates a password
   * reset request using Supabase. Upon success, a success toast is displayed; on failure, the
   * error is logged and an error toast is shown. The loading state is reset after the operation.
   *
   * @param e - The form submission event.
   */
  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/password-reset/confirm`,
      });

      if (error) throw error;
      
      toast.success('Reset link sent', {
        description: 'Check your email for a password reset link.',
        duration: 4000,
      });
    } catch (error) {
      console.error('Reset request error:', error);
      toast.error('Failed to send reset link', {
        description: (error as Error).message || 'Please try again later.',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center mb-6">Reset Your Password</h2>
      
      <form onSubmit={handleResetRequest} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Enter your email address"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <p>
          Remember your password?{' '}
          <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
} 