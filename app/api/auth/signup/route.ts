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

    // Create user with admin client
    console.log('Creating user with admin client...');
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
      console.error('Auth error details:', {
        message: authError.message,
        name: authError.name,
        code: authError.code,
        status: authError.status
      });
      return NextResponse.json({ 
        error: authError.message 
      }, { status: 400 });
    }

    if (!authData.user) {
      console.error('No user returned from auth.admin.createUser');
      return NextResponse.json({ 
        error: 'Failed to create user' 
      }, { status: 500 });
    }

    console.log('User created successfully:', { 
      id: authData.user.id, 
      email: authData.user.email 
    });

    // Create profile with admin client (bypasses RLS)
    console.log('Creating profile for user...');
    const { error: profileError, data: profileData } = await adminClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        full_name: fullName
      })
      .select();

    if (profileError) {
      console.error('Profile error:', profileError);
      console.error('Profile error details:', {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint
      });
      
      // If profile creation fails, delete the user to avoid orphaned users
      console.log('Deleting user due to profile creation failure:', authData.user.id);
      await adminClient.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json({ 
        error: profileError.message 
      }, { status: 500 });
    }

    console.log('Profile created successfully:', profileData);
    console.log('Signup complete for:', { email, username });

    return NextResponse.json({
      success: true,
      user: authData.user
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