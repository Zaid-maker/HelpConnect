export async function checkAuthStatus() {
  // Use fetch to call our API endpoint
  const res = await fetch('/api/auth/check', {
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
} 