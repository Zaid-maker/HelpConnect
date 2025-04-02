import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NewRequestForm from '@/components/requests/NewRequestForm';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/layout/Card';
import Heading from '@/components/ui/Heading';

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