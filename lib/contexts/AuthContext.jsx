'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} role
 * @property {boolean} [is_also_parent]
 * @property {boolean} [is_also_leader]
 * @property {string} [current_view_mode]
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} userDetails
 * @property {boolean} loading
 * @property {string} viewMode
 * @property {(mode: string) => void} setViewMode
 * @property {(email: string, password: string) => Promise<any>} signIn
 * @property {() => Promise<void>} signOut
 * @property {(newMode: string) => Promise<void>} updateViewMode
 * @property {(userId: string) => Promise<void>} fetchUserDetails
 * @property {boolean} isAuthenticated
 * @property {boolean} isParent
 * @property {boolean} isLeader
 * @property {boolean} isExecutive
 */

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('parent');

  // Update the fetchUserDetails function to use API route (bypasses RLS issue):
  async function fetchUserDetails(userId) {
    try {
      console.log('👤 AuthContext: fetchUserDetails called for userId:', userId);
      setLoading(true);
      
      // First, check if we already have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('❌ AuthContext: No session found');
        setUserDetails(null);
        setLoading(false);
        return;
      }
      
      console.log('🔄 AuthContext: Fetching user details via API...');
      // Use API route to get user profile (bypasses RLS)
      const response = await fetch(`/api/user?userId=${session.user.id}`);
      
      if (!response.ok) {
        console.error('❌ AuthContext: Error fetching user details from API');
        setLoading(false);
        return;
      }
      
      const result = await response.json();
      
      if (result.user) {
        console.log('✅ AuthContext: User details fetched successfully:', result.user);
        setUserDetails(result.user);
        setViewMode(result.user.current_view_mode || 'parent');
        console.log('📱 AuthContext: Updated userDetails state, triggering re-render');
      } else {
        console.warn('⚠️ AuthContext: No user found with ID:', session.user.id);
      }
    } catch (error) {
      console.error('💥 AuthContext: Error in fetchUserDetails:', error);
    } finally {
      setLoading(false);
      console.log('🏁 AuthContext: fetchUserDetails completed, loading set to false');
    }
  }

  // Sign in function
  const signIn = async (email, password) => {
    try {
      console.log('🔐 AuthContext: Starting sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('❌ AuthContext: Sign in error:', error.message);
        throw error;
      }

      if (data.user) {
        console.log('✅ AuthContext: Auth successful, fetching user details...');
        await fetchUserDetails(data.user.id);
        console.log('📊 AuthContext: User details fetched, userDetails state:', userDetails);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUserDetails(null);
      setViewMode('parent');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Update view mode
  const updateViewMode = async (newMode) => {
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
        ...prev,
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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await fetchUserDetails(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserDetails(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserDetails(null);
          setViewMode('parent');
          setLoading(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    userDetails,
    loading,
    viewMode,
    setViewMode,
    signIn,
    signOut,
    updateViewMode,
    fetchUserDetails,
    isAuthenticated: !!userDetails,
    isParent: userDetails?.role === 'parent' || userDetails?.is_also_parent,
    isLeader: userDetails?.role === 'leader' || userDetails?.is_also_leader,
    isExecutive: userDetails?.role === 'exec',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
