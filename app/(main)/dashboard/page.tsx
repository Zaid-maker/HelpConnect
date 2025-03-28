import HelpFeed from '@/components/requests/HelpFeed';
import { HelpRequest } from '@/lib/types';
import { redirect } from 'next/navigation';
import { checkAuthStatus } from '@/lib/helpers/authCheck';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  // Check authentication first
  const { isAuthenticated, user } = await checkAuthStatus();
  
  if (!isAuthenticated) {
    redirect('/login');
  }
  
  // Now that we know the user is authenticated, we can use the Supabase client
  // for data fetching only (not for auth checks)
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Fetch help requests
  const { data: helpRequests, error } = await supabase
    .from('help_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) {
    console.error('Error fetching help requests:', error);
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to HelpConnect</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Find community support or offer help to others in need
        </p>
      </div>
      
      <div className="mb-6 flex justify-end">
        <a 
          href="/requests/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Ask for Help
        </a>
      </div>
      
      <HelpFeed 
        initialRequests={helpRequests as HelpRequest[] || []} 
        currentUserId={user?.id} 
      />
    </div>
  );
} 