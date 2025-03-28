import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    // Check help_requests table
    const { data: requestsData, error: requestsError } = await supabase
      .from('help_requests')
      .select('*')
      .limit(1);
      
    // Check offers table
    const { data: offersData, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .limit(1);
      
    // Check messages table
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    // Try to check RLS policies - this will likely not work with regular permissions
    // but we'll handle that gracefully
    let policiesInfo = 'Unable to check policies';
    try {
      const { data: policiesData } = await supabase.rpc('get_policies');
      policiesInfo = policiesData || 'No policy data returned';
    } catch {
      // Silently handle RPC failure as this is expected
    }
    
    return NextResponse.json({
      tables: {
        profiles: {
          exists: !profilesError,
          error: profilesError?.message,
          sample: profilesData && profilesData.length > 0
        },
        help_requests: {
          exists: !requestsError,
          error: requestsError?.message,
          sample: requestsData && requestsData.length > 0
        },
        offers: {
          exists: !offersError,
          error: offersError?.message,
          sample: offersData && offersData.length > 0
        },
        messages: {
          exists: !messagesError,
          error: messagesError?.message,
          sample: messagesData && messagesData.length > 0
        }
      },
      policies: policiesInfo,
      success: !profilesError && !requestsError && !offersError && !messagesError
    });
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check database',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 