export const dynamic = 'force-dynamic';

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import Card from "@/components/layout/Card";
import Heading from "@/components/ui/Heading";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Renders the user profile page.
 *
 * This asynchronous server component awaits the route parameters to extract the user ID, checks the current user's
 * authentication status via Supabase, and retrieves the relevant profile data. If the user is not authenticated,
 * it redirects to the login page. In case of a profile retrieval error or missing profile, it displays an appropriate
 * error message. Otherwise, it renders the user's full name, bio, and additional contact and account details.
 *
 * @param params - A promise that resolves to an object containing the user ID.
 *
 * @returns A component displaying the user's profile details or an error message.
 */
export default async function ProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const supabase = createServerSupabaseClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      redirect("/login");
    }

    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", resolvedParams.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return (
        <PageContainer>
          <Card>
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">
                Error loading profile. Please try again later.
              </p>
            </div>
          </Card>
        </PageContainer>
      );
    }

    if (!profile) {
      return (
        <PageContainer>
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                Profile not found.
              </p>
            </div>
          </Card>
        </PageContainer>
      );
    }

    return (
      <PageContainer>
        <Card>
          <div className="mb-6">
            <Heading level={1}>{profile.full_name || "User Profile"}</Heading>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {profile.bio || "No bio available"}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Contact Information
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {profile.email || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {profile.phone || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {profile.location || "Not provided"}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Account Details</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Member since:</span>{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Last updated:</span>{" "}
                  {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </PageContainer>
    );
  } catch (e) {
    console.error("Unexpected error:", e);
    redirect("/login");
  }
}
