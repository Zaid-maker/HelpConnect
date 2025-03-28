'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function PasswordResetRequestForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/password-reset/confirm`,
      });

      if (error) throw error;
      
      setMessage({
        type: 'success',
        text: 'Check your email for a password reset link',
      });
    } catch (error) {
      console.error('Reset request error:', error);
      setMessage({
        type: 'error',
        text: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center mb-6">Reset Your Password</h2>
      
      {message && (
        <div 
          className={`${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          } p-4 rounded-md mb-4`}
        >
          {message.text}
        </div>
      )}
      
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