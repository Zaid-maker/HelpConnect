import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check auth condition for protected routes
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    // Redirect to login if accessing a protected route without a session
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    // Apply middleware to all routes under (main) group
    '/(main)/:path*',
    // And the dashboard route specifically
    '/dashboard',
    '/requests/:path*',
    '/profile/:path*',
  ],
}; 