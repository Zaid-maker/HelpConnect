import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function checkAuthStatus() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    return { 
      isAuthenticated: !!session,
      user: session?.user || null 
    };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return { isAuthenticated: false, user: null };
  }
} 