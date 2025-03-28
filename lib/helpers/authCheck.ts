// Helper to determine if code is running on server or client
const isServer = typeof window === 'undefined';

export async function checkAuthStatus() {
  try {
    // Create the appropriate URL based on environment
    let url: string;
    
    if (isServer) {
      // When running on server, we need an absolute URL
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL || 'localhost:3000';
      url = `${protocol}://${host}/api/auth/check`;
    } else {
      // When running in browser, we can use a relative URL
      url = '/api/auth/check';
    }
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      return { isAuthenticated: false, user: null };
    }
    
    const data = await res.json();
    return {
      isAuthenticated: data.isAuthenticated,
      user: data.user
    };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return { isAuthenticated: false, user: null };
  }
} 