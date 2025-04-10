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
    const { data: { user } } = await supabase.auth.getUser();
    
    // If there's no user and trying to access protected route
    if (!user && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // If there's a user and trying to access auth routes
    if (user && (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  } catch (e) {
    console.error('Auth middleware error:', e);
    // On error, redirect protected routes to login
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/requests/new', '/login', '/signup'],
};
