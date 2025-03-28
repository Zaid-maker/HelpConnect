import SignupForm from '@/components/auth/SignupForm';
import { redirect } from 'next/navigation';
import { checkAuthStatus } from '@/lib/helpers/authCheck';

export default async function SignupPage() {
  // Check authentication without directly using Supabase client in server component
  const { isAuthenticated } = await checkAuthStatus();
  
  if (isAuthenticated) {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold">HelpConnect</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join our community of helpers
          </p>
        </div>
        
        <SignupForm />
      </div>
    </div>
  );
} 