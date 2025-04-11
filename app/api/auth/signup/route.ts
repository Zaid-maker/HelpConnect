import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

interface SignupData {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

// Create Supabase client with service role for admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const data: SignupData = await request.json();
    const { email, password, username, fullName } = data;
    
    // Input validation
    const errors: string[] = [];
    
    if (!email?.trim()) errors.push('Email is required');
    if (!password?.trim()) errors.push('Password is required');
    if (!username?.trim()) errors.push('Username is required');
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    // Username format validation (letters, numbers, underscores, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      errors.push('Username must be 3-20 characters and contain only letters, numbers, and underscores');
    }

    // Password validation (8+ chars, 1 letter, 1 number, 1 special char)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      errors.push('Password must be at least 8 characters and contain letters, numbers, and special characters');
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: errors.join('. ')
      }, { status: 400 });
    }

    // Check for existing user with same email
    const { data: existingUserWithEmail } = await adminClient
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUserWithEmail) {
      return NextResponse.json({
        error: 'An account with this email already exists'
      }, { status: 400 });
    }

    // Check for existing user with same username (case insensitive)
    const { data: existingUser } = await adminClient
      .from('profiles')
      .select('username')
      .ilike('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json({
        error: 'Username is already taken'
      }, { status: 400 });
    }

    // Use RPC function to create user and profile in a transaction
    const { data: result, error } = await adminClient.rpc('create_user_with_profile', {
      p_email: email,
      p_password: password,
      p_username: username,
      p_full_name: fullName || username
    });

    if (error) {
      console.error('Transaction error:', error);
      // Check for specific error types
      if (error.message?.includes('duplicate key')) {
        return NextResponse.json({ 
          error: 'An account with this email or username already exists' 
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: error.message || 'Error creating account'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('Signup API error:', error);
    
    // Detailed error logging for debugging
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