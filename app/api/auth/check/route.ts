import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export interface AuthCheckResponse {
  isAuthenticated: boolean;
  user: any | null;
  error?: string;
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth check error:', error);
      return NextResponse.json<AuthCheckResponse>({ 
        isAuthenticated: false, 
        user: null,
        error: error.message
      }, { status: 401 });
    }

    // Also verify the session is valid
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session validation error:', sessionError);
      return NextResponse.json<AuthCheckResponse>({ 
        isAuthenticated: false, 
        user: null,
        error: sessionError?.message || 'No valid session'
      }, { status: 401 });
    }

    // Verify user has a profile
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('User missing profile:', user.id);
      }
    }
    
    return NextResponse.json<AuthCheckResponse>({
      isAuthenticated: !!user,
      user: user
    });
  } catch (error) {
    console.error('Unexpected auth check error:', error);
    return NextResponse.json<AuthCheckResponse>({ 
      isAuthenticated: false, 
      user: null,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}