import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';

// Create a cached version to prevent redundant client creation
export const createServerSupabaseClient = cache(async () => {
  const cookieStore = cookies();
  return createServerComponentClient({ 
    cookies: () => cookieStore 
  });
}); 