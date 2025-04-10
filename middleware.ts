import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Handles authentication redirection for protected and auth-related routes in a Next.js application.
 *
 * This middleware utilizes a Supabase client to determine the user's authentication status and enforces:
 * - A redirection to '/login' for unauthenticated users or when an error is encountered while accessing '/dashboard' routes.
 * - A redirection to '/dashboard' for authenticated users attempting to access the '/login' or '/signup' pages.
 *
 * @param req - The incoming NextRequest object.
 * @returns A NextResponse object that either continues processing or redirects based on authentication status.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Check both user and session validity
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Handle specific auth errors
    if (sessionError) {
      console.error('Session error:', sessionError);
      // Only redirect if it's a fatal session error
      if (sessionError.status !== 408 && sessionError.status !== 503) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Protected routes check
    if ((!user || !session) && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Auth routes check (logged in users)
    if (user && session && (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  } catch (e) {
    console.error('Auth middleware error:', e);
    // Only redirect on auth-specific errors
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/requests/new', '/login', '/signup'],
};
