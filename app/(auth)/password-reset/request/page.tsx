import PasswordResetRequestForm from '@/components/auth/PasswordResetRequestForm';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';

export default async function PasswordResetRequestPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Check if user is already logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold">HelpConnect</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Reset your password
          </p>
        </div>
        
        <PasswordResetRequestForm />
      </div>
    </div>
  );
} 