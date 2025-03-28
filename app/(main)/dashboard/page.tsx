import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import HelpFeed from '@/components/requests/HelpFeed';
import { HelpRequest } from '@/lib/types';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }
  
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
        currentUserId={session.user.id} 
      />
    </div>
  );
} 