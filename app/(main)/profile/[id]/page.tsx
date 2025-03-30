import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import MessageButton from '@/components/messaging/MessageButton';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, help_requests(*)')
    .eq('id', params.id)
    .single();

  if (error || !profile) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center space-x-6">
            <div className="relative h-24 w-24">
              <Image
                src={profile.avatar_url || '/default-avatar.png'}
                alt={profile.username}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              <p className="text-gray-600 dark:text-gray-300">@{profile.username}</p>
              <div className="mt-2 flex items-center">
                <span className="text-yellow-500">★</span>
                <span className="ml-1">{profile.rating || 'No ratings yet'}</span>
              </div>
            </div>
            <MessageButton recipientId={profile.id} />
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{profile.bio}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.skills?.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 