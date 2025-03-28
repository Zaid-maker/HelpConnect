import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use the client-side Supabase client for the auth check API
    // This is safe in an API route and avoids cookie handling issues
    const supabase = createClientComponentClient();
    
    // Get session using the client component client
    const { data: { session } } = await supabase.auth.getSession();
    
    return NextResponse.json({
      isAuthenticated: !!session,
      user: session?.user || null
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