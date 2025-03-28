import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
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