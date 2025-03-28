import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create a Supabase client with anon key - this avoids cookie issues
// since we're just checking if tables exist and not accessing authenticated data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
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