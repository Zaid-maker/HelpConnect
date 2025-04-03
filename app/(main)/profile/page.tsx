import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import Card from "@/components/layout/Card";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default async function ProfilePage() {
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
    redirect('/login');
  }

  return (
    <PageContainer>
      <Card>
        <div className="flex justify-between items-start mb-8">
          <div>
            <Heading level={1}>Profile</Heading>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Manage your profile information and preferences.
            </p>
          </div>
          <Link href="/profile/edit">
            <Button>Edit Profile</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</h3>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">{profile.full_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</h3>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">{profile.username}</p>
          </div>
          <div className="sm:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</h3>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">{profile.bio || 'No bio provided'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">{profile.phone || 'No phone provided'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">{profile.location || 'No location provided'}</p>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
