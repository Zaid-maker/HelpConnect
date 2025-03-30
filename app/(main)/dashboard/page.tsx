import HelpFeed from '@/components/requests/HelpFeed';
import { HelpRequest } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  
  // Get auth token from cookies directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Create a new Supabase client for data fetching only (not for auth)
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });
  
  // For auth, manually get the token from cookies
  const authCookieName = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
  const authCookie = cookieStore.get(authCookieName);
  let userId = null;
  
  if (authCookie?.value) {
    try {
      // Parse the token
      const token = JSON.parse(authCookie.value);
      
      if (token.access_token) {
        // Use getUser for better security (validates the token)
        const { data: { user }, error } = await supabase.auth.getUser(token.access_token);
        
        if (error || !user) {
          // Invalid token or no user - redirect to login
          return redirect('/login');
        }
        
        // Set the userId from the validated user
        userId = user.id;
      } else {
        // No valid token found
        return redirect('/login');
      }
    } catch (e) {
      // Error parsing the token
      console.error('Error parsing auth token:', e);
      return redirect('/login');
    }
  } else {
    // No auth cookie found
    return redirect('/login');
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
        currentUserId={userId} 
      />
    </div>
  );
} 