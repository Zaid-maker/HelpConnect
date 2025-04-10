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
    
    console.log('Signup request received:', { email, username, fullName });

    // Validate input
    if (!email || !password || !username) {
      console.log('Missing required fields', { email: !!email, password: !!password, username: !!username });
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Enhanced password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters long and contain letters, numbers, and special characters'
      }, { status: 400 });
    }

    // Check if username is taken (case insensitive)
    const { data: existingUser, error: userCheckError } = await adminClient
      .from('profiles')
      .select('username')
      .ilike('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json({
        error: 'Username is already taken'
      }, { status: 400 });
    }

    // Start transaction for user creation
    const { data, error } = await adminClient.rpc('create_user_with_profile', {
      p_email: email,
      p_password: password,
      p_username: username,
      p_full_name: fullName
    });

    if (error) {
      console.error('Transaction error:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: data.user
    });
  } catch (error) {
    console.error('Signup API error:', error);
    console.error('Error type:', typeof error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Non-Error object thrown:', error);
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}