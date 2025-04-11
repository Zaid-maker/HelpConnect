import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: messages } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id(*),
      receiver:profiles!receiver_id(*)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="space-y-4">
        {messages?.map((message) => (
          <div
            key={message.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
          >
            <div className="flex items-center space-x-4">
              <Image
                src={message.sender.avatar_url || '/default-avatar.png'}
                alt={message.sender.username}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <Link
                  href={`/profile/${message.sender.id}`}
                  className="font-semibold hover:text-blue-600"
                >
                  {message.sender.username}
                </Link>
                <p className="text-sm text-gray-500">
                  {new Date(message.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="mt-2">{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}