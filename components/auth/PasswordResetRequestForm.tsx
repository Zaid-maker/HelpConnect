'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { toast } from 'sonner';

const RATE_LIMIT_KEY = 'pwd-reset-attempts';
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export default function PasswordResetRequestForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Check rate limit on mount
  useEffect(() => {
    const checkRateLimit = () => {
      const rateLimit = localStorage.getItem(RATE_LIMIT_KEY);
      if (rateLimit) {
        const { attempts, timestamp } = JSON.parse(rateLimit);
        const timeElapsed = Date.now() - timestamp;
        
        if (attempts >= MAX_ATTEMPTS && timeElapsed < LOCKOUT_DURATION) {
          const minutesLeft = Math.ceil((LOCKOUT_DURATION - timeElapsed) / 60000);
          toast.error('Too many attempts', {
            description: `Please try again in ${minutesLeft} minutes.`,
            duration: 4000,
          });
        } else if (timeElapsed >= LOCKOUT_DURATION) {
          // Reset rate limit after lockout period
          localStorage.removeItem(RATE_LIMIT_KEY);
        }
      }
    };

    checkRateLimit();
  }, []);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();

    // Check rate limit
    const rateLimit = localStorage.getItem(RATE_LIMIT_KEY);
    if (rateLimit) {
      const { attempts, timestamp } = JSON.parse(rateLimit);
      const timeElapsed = Date.now() - timestamp;
      
      if (attempts >= MAX_ATTEMPTS && timeElapsed < LOCKOUT_DURATION) {
        const minutesLeft = Math.ceil((LOCKOUT_DURATION - timeElapsed) / 60000);
        toast.error('Too many attempts', {
          description: `Please try again in ${minutesLeft} minutes.`,
          duration: 4000,
        });
        return;
      } else if (timeElapsed >= LOCKOUT_DURATION) {
        localStorage.removeItem(RATE_LIMIT_KEY);
      }
    }

    setLoading(true);

    try {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset/confirm`,
      });

      if (error) throw error;
      
      toast.success('Reset link sent', {
        description: 'Check your email for a password reset link.',
        duration: 4000,
      });

      // Update rate limit
      const currentAttempts = rateLimit 
        ? JSON.parse(rateLimit).attempts + 1 
        : 1;
      
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
        attempts: currentAttempts,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Reset request error:', error);
      toast.error('Failed to send reset link', {
        description: error instanceof Error ? error.message : 'Please try again later.',
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