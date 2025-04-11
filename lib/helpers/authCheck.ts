'use client';

import type { AuthCheckResponse } from '@/app/api/auth/check/route';

// This auth check helper is intended for client components only
export async function checkAuthStatus(): Promise<AuthCheckResponse> {
  try {
    const res = await fetch('/api/auth/check', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Important: This prevents caching of auth state
      cache: 'no-store',
      // Include credentials for cookie-based auth
      credentials: 'include'
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      return { 
        isAuthenticated: false, 
        user: null,
        error: errorData.error || `HTTP error ${res.status}`
      };
    }
    
    const data: AuthCheckResponse = await res.json();
    return {
      isAuthenticated: data.isAuthenticated,
      user: data.user,
      error: data.error
    };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return { 
      isAuthenticated: false, 
      user: null, 
      error: error instanceof Error ? error.message : 'Failed to check authentication'
    };
  }
}