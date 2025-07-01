"use client";

import { mockAuthService } from "./mock/data";

// Auth utility functions with real API integration
export const auth = {
  // Get the current user
  getCurrentUser: async () => {
    try {
      // First try to get from API
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const user = await response.json();
        return user;
      }
    } catch (error) {
      console.error('Error fetching current user, falling back to mock:', error);
    }
    
    // Fall back to mock for development
    return mockAuthService.getCurrentUser();
  },
  
  // Log in a user
  login: async (email: string, password: string) => {
    try {
      // First try to login via API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('auth-token', result.token);
        localStorage.setItem('user-id', result.user.id);
        return result.user;
      }
    } catch (error) {
      console.error('Error logging in via API, falling back to mock:', error);
    }
    
    // Fall back to mock for development
    return mockAuthService.login(email, password);
  },
  
  // Log out the current user
  logout: async () => {
    try {
      // First try to logout via API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-id');
        return true;
      }
    } catch (error) {
      console.error('Error logging out via API, falling back to mock:', error);
    }
    
    // Fall back to mock for development
    console.log("Logging out user:", mockAuthService.getCurrentUser()?.name);
    return mockAuthService.logout();
  },
  
  // Check if a user is logged in
  isAuthenticated: async () => {
    try {
      // First check if we have a token
      const token = localStorage.getItem('auth-token');
      if (token) {
        const response = await fetch('/api/auth/validate', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        return response.ok;
      }
    } catch (error) {
      console.error('Error validating authentication, falling back to mock:', error);
    }
    
    // Fall back to mock for development
    const user = mockAuthService.getCurrentUser();
    return user !== null;
  }
};
