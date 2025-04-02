import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import Card from "@/components/layout/Card";
import Heading from "@/components/ui/Heading";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfilePage({
  params,
}: PageProps) {
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
            <Heading level={1}>Error</Heading>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Failed to load profile. Please try again later.
            </p>
          </Card>
        </PageContainer>
      );
    }

    return (
      <PageContainer>
        <Card>
          <Heading level={1}>Profile</Heading>
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {profile?.full_name || "Anonymous User"}
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              {profile?.bio || "No bio available"}
            </p>
          </div>
        </Card>
      </PageContainer>
    );
  } catch (e) {
    console.error("Unexpected error:", e);
    redirect("/login");
  }
}
