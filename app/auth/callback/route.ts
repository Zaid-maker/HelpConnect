import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  
  if (code) {
    // Exchange the auth code for a session
    await supabase.auth.exchangeCodeForSession(code);
    
    // Check if we need to create a profile
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      // If no profile exists, create one
      if (profileError || !profile) {
        const username = session.user.email?.split('@')[0] || `user_${Math.random().toString(36).substring(2, 7)}`;
        
        await supabase.from('profiles').insert({
          id: session.user.id,
          username,
          full_name: session.user.user_metadata.full_name || username,
        });
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', req.url));
} 