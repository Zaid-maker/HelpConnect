import HelpFeed from '@/components/requests/HelpFeed';
import { HelpRequest } from '@/lib/types/index';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });

  // Simpler auth check using getUser directly
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
          currentUserId={user.id} 
        />
      </div>
    );
    
  } catch (e) {
    console.error('Auth error:', e);
    redirect('/login');
  }
} 