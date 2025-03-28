import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check if profiles table exists
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    // Check if help_requests table exists
    const { error: helpRequestsError } = await supabase
      .from('help_requests')
      .select('count')
      .limit(1);
    
    return NextResponse.json({
      status: 'ok',
      dbCheck: {
        profiles: {
          exists: !profilesError,
          error: profilesError ? profilesError.message : null
        },
        helpRequests: {
          exists: !helpRequestsError,
          error: helpRequestsError ? helpRequestsError.message : null
        }
      }
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error checking database'
    }, { status: 500 });
  }
} 