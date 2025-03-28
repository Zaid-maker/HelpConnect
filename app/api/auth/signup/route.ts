import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create Supabase client with service role for admin privileges
// This allows us to bypass RLS policies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { email, password, username, fullName } = await request.json();

    // Validate input
    if (!email || !password || !username) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Create user with admin client
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ 
        error: authError.message 
      }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ 
        error: 'Failed to create user' 
      }, { status: 500 });
    }

    // Create profile with admin client (bypasses RLS)
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        full_name: fullName
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      
      // If profile creation fails, delete the user to avoid orphaned users
      await adminClient.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json({ 
        error: profileError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: authData.user
    });
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 