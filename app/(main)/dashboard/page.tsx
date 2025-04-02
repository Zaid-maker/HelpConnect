import HelpFeed from '@/components/requests/HelpFeed';
import { HelpRequest } from '@/lib/types/index';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ 
    cookies 
  });

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      redirect('/login');
    }

    // Fetch help requests only if user is authenticated
    const { data: helpRequests, error: requestsError } = await supabase
      .from('help_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (requestsError) {
      console.error('Error fetching help requests:', requestsError);
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome to HelpConnect
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                  Find community support or offer help to others in need
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Link 
                  href="/requests/new" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 shadow-sm"
                >
                  Ask for Help
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Help Requests
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Browse and respond to requests from your community
              </p>
            </div>
            
            <HelpFeed 
              initialRequests={helpRequests as HelpRequest[] || []} 
              currentUserId={user.id} 
            />
          </div>
        </div>
      </div>
    );
    
  } catch (e) {
    console.error('Unexpected error:', e);
    redirect('/login');
  }
} 