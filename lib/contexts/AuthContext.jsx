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

interface AuthContextType {
  userDetails: User | null;
  loading: boolean;
  viewMode: string;
  setViewMode: (mode: string) => void;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateViewMode: (newMode: string) => Promise<void>;
  fetchUserDetails: (userId: string) => Promise<void>;
  isAuthenticated: boolean;
  isParent: boolean;
  isLeader: boolean;
  isExecutive: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('parent');

  // Update the fetchUserDetails function:
  async function fetchUserDetails(userId) {
    try {
      setLoading(true);
      
      // First, check if we already have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setUserDetails(null);
        setLoading(false);
        return;
      }
      
      // Get user profile from users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user details:', error);
        setLoading(false);
        return;
      }
      
      if (data) {
        console.log('User details fetched:', data); // Debug log
        setUserDetails(data);
        setViewMode(data.current_view_mode || 'parent');
      } else {
        console.warn('No user found with ID:', session.user.id);
      }
    } catch (error) {
      console.error('Error in fetchUserDetails:', error);
    } finally {
      setLoading(false);
    }
  }

  // Sign in function
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await fetchUserDetails(data.user.id);
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
