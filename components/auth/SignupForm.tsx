'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

/**
 * Renders the signup form for creating a new account.
 *
 * This component displays a form that collects a user's full name, username, email, and password (with confirmation). 
 * It validates that the password meets a minimum length and matches the confirmation before sending a signup request 
 * to the API endpoint. If the signup is successful, it automatically signs the user in via Supabase authentication 
 * and redirects to the dashboard after displaying a success message. Additionally, the component supports OAuth 
 * sign-in with Google or GitHub.
 *
 * Toast notifications are used to provide user feedback for both success and error conditions during the signup process.
 *
 * @returns The JSX element representing the signup form.
 */
export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /**
   * Processes the signup form submission to create a new user account.
   *
   * This function prevents the default form submission behavior and validates that the
   * password and confirmation match, and that the password meets a minimum length of 6 characters.
   * If the validations fail, it displays appropriate toast error notifications and stops further execution.
   * It then sends a POST request to the signup API endpoint with the user's email, password, username,
   * and full name. On a successful signup, it automatically signs the user in via Supabase, shows a success
   * toast notification, and redirects the user to the dashboard after a brief delay. In case of any errors
   * during the signup or sign-in process, an error toast notification is shown.
   *
   * @param e - The event triggered by the form submission.
   */
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
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

      // Call our API endpoint to create user and profile
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username,
          fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // If signup successful, sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      toast.success('Account created successfully!', {
        description: 'Welcome to HelpConnect. You are now logged in.',
        duration: 3000,
      });

      // Wait for the toast to be visible before redirecting
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle different error types properly
      if (error instanceof Error) {
        toast.error('Signup failed', {
          description: error.message || 'An error occurred during signup.',
          duration: 4000,
        });
      } else if (typeof error === 'object' && error !== null) {
        // For API errors that might be in a different format
        const errorObj = error as Record<string, unknown>;
        const errorMessage = 
          typeof errorObj.message === 'string' ? errorObj.message :
          typeof errorObj.error === 'string' ? errorObj.error :
          JSON.stringify(error);
          
        toast.error('Signup failed', {
          description: errorMessage || 'Unknown error format',
          duration: 4000,
        });
      } else {
        toast.error('Signup failed', {
          description: 'An unknown error occurred during signup',
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Initiates OAuth sign-in using Supabase authentication.
   *
   * Attempts to sign in the user via the specified OAuth provider and redirects to an authentication callback.
   * If an error occurs during sign-in, displays an error toast detailing the issue.
   *
   * @param provider - The OAuth provider to use for sign-in, either 'google' or 'github'.
   */
  async function handleOAuthSignIn(provider: 'google' | 'github') {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('OAuth error:', error);
      // Handle different error types properly
      if (error instanceof Error) {
        toast.error('OAuth sign-in failed', {
          description: error.message || 'An error occurred during OAuth sign-in',
          duration: 4000,
        });
      } else if (typeof error === 'object' && error !== null) {
        // For Supabase errors that might be in a different format
        const errorObj = error as Record<string, unknown>;
        const errorMessage = 
          typeof errorObj.message === 'string' 
            ? errorObj.message 
            : JSON.stringify(error);
        toast.error('OAuth sign-in failed', {
          description: errorMessage,
          duration: 4000,
        });
      } else {
        toast.error('OAuth sign-in failed', {
          description: 'An unknown error occurred during OAuth sign-in',
          duration: 4000,
        });
      }
    }
  }

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
      
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
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
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm Password
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
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleOAuthSignIn('google')}
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12.545,10.239V14.256h5.418c-0.212,1.198-0.872,2.217-1.853,2.89v2.401H19.1C21.243,17.719,22.001,15.139,22.001,12.001c0-0.628-0.057-1.231-0.161-1.761H12.545z"
                  fill="#4285F4"
                />
                <path
                  d="M12,22c3.241,0,5.963-1.051,7.951-2.854l-3.885-2.989c-1.075,0.726-2.458,1.157-4.065,1.157c-3.134,0-5.785-2.111-6.74-4.946h-4.002v3.088C3.167,19.207,7.244,22,12,22z"
                  fill="#34A853"
                />
                <path
                  d="M5.262,12.366c-0.239-0.72-0.375-1.485-0.375-2.276c0-0.791,0.136-1.556,0.375-2.276V4.726H1.26c-0.827,1.656-1.26,3.507-1.26,5.364c0,1.859,0.433,3.71,1.26,5.366l4.002-3.088z"
                  fill="#FBBC05"
                />
                <path
                  d="M12,5.184c1.784,0,3.36,0.614,4.613,1.804l3.44-3.42C17.947,1.673,15.324,0,12,0C7.247,0,3.167,2.794,1.26,6.886l4.002,3.088C6.214,7.139,8.866,5.184,12,5.184z"
                  fill="#EA4335"
                />
              </svg>
              <span>Google</span>
            </div>
          </button>

          <button
            onClick={() => handleOAuthSignIn('github')}
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.09.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.068-.608.068-.608 1.003.07 1.532 1.03 1.532 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.551 9.551 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.548 1.377.204 2.394.1 2.647.64.698 1.028 1.591 1.028 2.682 0 3.841-2.337 4.687-4.565 4.934.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                />
              </svg>
              <span>GitHub</span>
            </div>
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm">
        <p>
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 