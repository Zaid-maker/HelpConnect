import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use the client-side Supabase client for the auth check API
    const supabase = createClientComponentClient();
    
    // Use getUser for better security - validates the token on the server
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth check getUser error:', error);
      return NextResponse.json({ 
        isAuthenticated: false, 
        user: null,
        error: error.message
      }, { status: 401 });
    }
    
    return NextResponse.json({
      isAuthenticated: !!user,
      user: user
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ 
      isAuthenticated: false, 
      user: null,
      error: 'Failed to check authentication'
    }, { status: 500 });
  }
} 