import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HelpRequest } from '@/lib/types/index';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/layout/Card';
import Heading from '@/components/ui/Heading';
import RequestEditForm from '@/components/requests/RequestEditForm';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = await createServerSupabaseClient();
  
  try {
    const { data: request } = await supabase
      .from('help_requests')
      .select('title')
      .eq('id', resolvedParams.id)
      .single();

    return {
      title: request?.title ? `Edit: ${request.title}` : 'Edit Request',
      description: 'Update your help request details and preferences.',
      openGraph: {
        title: request?.title ? `Edit: ${request.title} - HelpConnect` : 'Edit Request - HelpConnect',
        description: 'Update your help request details and preferences.',
        url: `https://help-connect-amber.vercel.app/requests/edit/${resolvedParams.id}`,
      },
    };
  } catch {
    return {
      title: 'Edit Request',
      description: 'Update your help request details and preferences.',
      openGraph: {
        title: 'Edit Request - HelpConnect',
        description: 'Update your help request details and preferences.',
        url: `https://help-connect-amber.vercel.app/requests/edit/${resolvedParams.id}`,
      },
    };
  }
}

/**
 * Edit request page component that allows users to modify their help requests.
 * 
 * @param props - The page props containing route parameters
 * @returns The rendered page component
 */
export default async function EditRequestPage({ params }: Props) {
  const resolvedParams = await params;
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // Fetch the help request
  const { data: request, error: requestError } = await supabase
    .from('help_requests')
    .select('*, user:profiles(full_name)')
    .eq('id', resolvedParams.id)
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
}