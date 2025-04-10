import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    
    // Get state from cookies synchronously since we're in an async function
    const storedState = cookieStore.get('supabase-auth-state')?.value;
    const state = searchParams.get('state');
    
    if (!state || !storedState || state !== storedState) {
      console.error('Invalid state parameter');
      return NextResponse.redirect(new URL('/login?error=invalid-state', req.url));
    }
    
    if (code) {
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        return NextResponse.redirect(new URL('/login?error=auth-failed', req.url));
      }
      
      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting user:', userError);
        return NextResponse.redirect(new URL('/login?error=user-fetch-failed', req.url));
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
          email: user.email
        });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Don't redirect to dashboard if profile creation fails
          return NextResponse.redirect(new URL('/login?error=profile-creation-failed', req.url));
        }
      }

      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.redirect(new URL('/login?error=no-code', req.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback-failed', req.url));
  }
}