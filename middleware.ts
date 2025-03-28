import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  try {
    // First try to get the user (more secure)
    const { data: { user } } = await supabase.auth.getUser();
    const isAuthenticated = !!user;
    
    // Check auth condition for protected routes
    if (!isAuthenticated && req.nextUrl.pathname.startsWith('/dashboard')) {
      // Redirect to login if accessing a protected route without authentication
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect to dashboard if already logged in and accessing auth pages
    if (isAuthenticated && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // If getUser fails, fall back to session check
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check auth condition for protected routes
      if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
        // Redirect to login if accessing a protected route without a session
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (sessionError) {
      console.error('Session fallback error:', sessionError);
      // If both methods fail, redirect protected routes to login
      if (req.nextUrl.pathname.startsWith('/dashboard')) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Apply middleware to these paths
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/profile/:path*',
    '/requests/:path*',
  ],
}; 