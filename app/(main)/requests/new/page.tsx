import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NewRequestForm from '@/components/requests/NewRequestForm';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/layout/Card';
import Heading from '@/components/ui/Heading';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Request',
  description: 'Create a new help request and connect with community members who can assist you.',
  openGraph: {
    title: 'Create New Help Request - HelpConnect',
    description: 'Need help? Create a request and connect with community members who can assist you.',
  },
};

/**
 * Renders a page for creating a new help request.
 *
 * This asynchronous server-side component uses a Supabase client with cookies to retrieve the authenticated user.
 * If the user is not authenticated or an error occurs during authentication, it redirects to the "/login" page.
 * When authenticated, it displays a page container with a card that includes a heading, description, and a form
 * for submitting a new help request using the authenticated user's ID.
 *
 * @returns The JSX structure for the new help request page.
 */
export default async function NewRequestPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return (
    <PageContainer>
      <Card>
        <div className="mb-8">
          <Heading level={1}>
            Create New Help Request
          </Heading>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Describe what kind of help you need from the community
          </p>
        </div>
        <NewRequestForm userId={user.id} />
      </Card>
    </PageContainer>
  );
} 