import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    
    if (code) {
      // Exchange the auth code for a session
      await supabase.auth.exchangeCodeForSession(code);
      
      // Get authenticated user with getUser for better security
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting user:', userError);
        return NextResponse.redirect(new URL('/login', req.url));
      }
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // If no profile exists, create one
      if (profileError || !profile) {
        const username = user.email?.split('@')[0] || `user_${Math.random().toString(36).substring(2, 7)}`;
        
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          username,
          full_name: user.user_metadata.full_name || username,
        });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
} 