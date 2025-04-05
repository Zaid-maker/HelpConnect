import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { HelpRequest } from '@/lib/types/index';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/layout/Card';
import Heading from '@/components/ui/Heading';
import RequestEditForm from '@/components/requests/RequestEditForm';

type PageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

/**
 * Edit request page component that allows users to modify their help requests.
 * 
 * @param props - The page props containing route parameters
 * @returns The rendered page component
 */
export default async function EditRequestPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies });

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect('/login');
    }

    // Fetch the help request
    const { data: request, error: requestError } = await supabase
      .from('help_requests')
      .select('*, user:profiles(full_name)')
      .eq('id', params.id)
      .single();

    if (requestError || !request) {
      redirect('/dashboard');
    }

    // Check if the user owns this request
    if (request.user_id !== user.id) {
      redirect('/dashboard');
    }

    return (
      <PageContainer>
        <Card>
          <div className="mb-6">
            <Heading level={2}>Edit Help Request</Heading>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update the details of your help request
            </p>
          </div>

          <RequestEditForm 
            initialRequest={request as HelpRequest}
          />
        </Card>
      </PageContainer>
    );
  } catch (error) {
    console.error('Error:', error);
    redirect('/dashboard');
  }
} 