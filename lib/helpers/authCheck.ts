export async function checkAuthStatus() {
  // Use absolute URL with origin
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const res = await fetch(`${origin}/api/auth/check`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // This is important to get the latest data and not cached data
      cache: 'no-store'
    });
    
    if (!res.ok) {
      // If the request failed, assume not authenticated
      return { isAuthenticated: false, user: null };
    }
    
    const data = await res.json();
    return {
      isAuthenticated: data.isAuthenticated,
      user: data.user
    };
  } catch (error) {
    console.error("Error checking auth status:", error);
    // Return not authenticated in case of any errors
    return { isAuthenticated: false, user: null };
  }
} 