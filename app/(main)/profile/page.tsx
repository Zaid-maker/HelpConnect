import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import Card from "@/components/layout/Card";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient();

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      redirect('/login');
    }

    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create one
    if (profileError || !profile) {
      const username = user.email?.split('@')[0] || `user_${Math.random().toString(36).substring(2, 7)}`;
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username,
          full_name: user.user_metadata.full_name || username,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return (
          <PageContainer>
            <Card>
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                  Error creating profile. Please try again later.
                </p>
              </div>
            </Card>
          </PageContainer>
        );
      }

      // Use the newly created profile
      return (
        <PageContainer>
          <Card>
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <Heading level={1}>
                    {newProfile?.full_name || 'My Profile'}
                  </Heading>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {newProfile?.bio || 'No bio available'}
                  </p>
                </div>
                <Button href="/profile/edit" size="md">
                  Edit Profile
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    {user.email || 'Not provided'}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{' '}
                    {newProfile?.phone || 'Not provided'}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{' '}
                    {newProfile?.location || 'Not provided'}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Account Details</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Member since:</span>{' '}
                    {new Date(newProfile?.created_at || '').toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Last updated:</span>{' '}
                    {new Date(newProfile?.updated_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </PageContainer>
      );
    }

    return (
      <PageContainer>
        <Card>
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <Heading level={1}>
                  {profile.full_name || 'My Profile'}
                </Heading>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {profile.bio || 'No bio available'}
                </p>
              </div>
              <Button href="/profile/edit" size="md">
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  {user.email || 'Not provided'}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{' '}
                  {profile.phone || 'Not provided'}
                </p>
                <p>
                  <span className="font-medium">Location:</span>{' '}
                  {profile.location || 'Not provided'}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Account Details</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Member since:</span>{' '}
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Last updated:</span>{' '}
                  {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </PageContainer>
    );
  } catch (e) {
    console.error('Unexpected error:', e);
    redirect('/login');
  }
} 