'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_also_parent?: boolean;
  is_also_leader?: boolean;
  current_view_mode?: string;
  [key: string]: any;
}

export interface AuthContextType {
  userDetails: User | null;
  loading: boolean;
  viewMode: string;
  setViewMode: (mode: string) => void;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateViewMode: (newMode: string) => Promise<void>;
  isAuthenticated: boolean;
  isParent: boolean;
  isLeader: boolean;
  isLeader1: boolean;
  isExecutive: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('parent');


  // Sign in function using profile-based authentication
  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Login failed');
      }

      // Store user session
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      setUserDetails(result.user);

      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Clear local session
      localStorage.removeItem('currentUser');
      setUserDetails(null);
      setViewMode('parent');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Update view mode
  const updateViewMode = async (newMode: string) => {
    if (!userDetails) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ current_view_mode: newMode })
        .eq('id', userDetails.id);

      if (error) {
        console.error('Error updating view mode:', error);
        return;
      }

      setViewMode(newMode);
      setUserDetails(prev => ({
        ...prev!,
        current_view_mode: newMode
      }));
      
      // Update localStorage as well
      localStorage.setItem('currentUser', JSON.stringify({
        ...userDetails,
        current_view_mode: newMode
      }));
    } catch (error) {
      console.error('Error updating view mode:', error);
    }
  };

  // Check user session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        // Check for existing login session in localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            console.log('✅ Stored session found, verifying user');
            
            // Verify user still exists and is active
            const response = await fetch('/api/auth/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email }),
            });
            
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.user) {
                setUserDetails(result.user);
                console.log('✅ Session verified for:', result.user.email);
              } else {
                console.log('❌ Session verification failed:', result.error);
                localStorage.removeItem('currentUser');
                setUserDetails(null);
              }
            } else {
              console.log('❌ Profile API request failed:', response.status);
              localStorage.removeItem('currentUser');
              setUserDetails(null);
            }
          } catch (parseError) {
            console.error('❌ Invalid stored session');
            localStorage.removeItem('currentUser');
            setUserDetails(null);
          }
        } else {
          console.log('❌ No stored session found');
          setUserDetails(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        setLoading(false);
      }
    };

    // Reduce timeout to 1 second for faster recovery
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Auth initialization timeout reached, setting loading to false');
      setLoading(false);
      setUserDetails(null);
    }, 1000);

    initializeAuth().finally(() => {
      clearTimeout(timeoutId);
    });

    // No cleanup needed for localStorage-based auth
    return () => {};
  }, []);

  const value: AuthContextType = {
    userDetails,
    loading,
    viewMode,
    setViewMode,
    signIn,
    signOut,
    updateViewMode,
    isAuthenticated: !!userDetails,
    isParent: userDetails?.role?.toLowerCase() === 'parent' || userDetails?.is_also_parent || false,
    isLeader: userDetails?.role?.toLowerCase() === 'leader' || userDetails?.is_also_leader || false,
    isLeader1: userDetails?.role?.toLowerCase() === 'leader1' || false,
    isExecutive: userDetails?.role?.toLowerCase() === 'executive' || userDetails?.role?.toLowerCase() === 'admin' || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === null || context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
