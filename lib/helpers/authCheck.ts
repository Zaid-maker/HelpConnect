'use client';

// This auth check helper is intended for client components only
export async function checkAuthStatus() {
  try {
    const res = await fetch('/api/auth/check', {
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