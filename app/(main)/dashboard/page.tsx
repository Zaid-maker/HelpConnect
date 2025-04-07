import HelpFeed from '@/components/requests/HelpFeed';
import { HelpRequest } from '@/lib/types/index';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/layout/Card';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View and manage your help requests, or offer assistance to others in your community.',
  openGraph: {
    title: 'HelpConnect Dashboard',
    description: 'Connect with your community and offer or receive help.',
    url: 'https://help-connect-amber.vercel.app/dashboard',
  },
};

/**
 * Renders the dashboard page for authenticated users.
 *
 * This asynchronous server component checks for a logged-in user using a Supabase client.
 * If the user is not authenticated or an authentication error occurs, it redirects to the login page.
 * Once authenticated, it fetches up to 20 recent help requests from the database and renders a dashboard
 * that includes a welcome message and a help request feed.
 *
 * @returns A JSX element representing the dashboard page.
 */
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
      <PageContainer>
        <Card className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Heading level={1}>
                Welcome to HelpConnect
              </Heading>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                Find community support or offer help to others in need
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button href="/requests/new" size="lg">
                Ask for Help
              </Button>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="mb-6">
            <Heading level={3}>
              Recent Help Requests
            </Heading>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Browse and respond to requests from your community
            </p>
          </div>
          
          <HelpFeed 
            initialRequests={helpRequests as HelpRequest[] || []} 
            currentUserId={user.id} 
          />
        </Card>
      </PageContainer>
    );
    
  } catch (e) {
    console.error('Unexpected error:', e);
    redirect('/login');
  }
} 