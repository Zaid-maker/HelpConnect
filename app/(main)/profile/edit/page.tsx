import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/layout/Card';
import Heading from '@/components/ui/Heading';
import ProfileEditForm from '@/components/profile/ProfileEditForm';

export const dynamic = 'force-dynamic';

export default async function EditProfilePage() {
  const supabase = createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    redirect('/profile');
  }

  return (
    <PageContainer>
      <Card>
        <div className="mb-8">
          <Heading level={1}>Edit Profile</Heading>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Update your profile information to help others get to know you better.
          </p>
        </div>
        
        <ProfileEditForm initialProfile={profile} />
      </Card>
    </PageContainer>
  );
}