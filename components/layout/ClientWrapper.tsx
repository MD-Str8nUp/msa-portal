'use client';

import React, { useEffect, useState } from 'react';
import { SocketProvider } from '@/lib/contexts/SocketContext';
import { auth } from '@/lib/auth';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        // Get user from auth service
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-lg font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {user ? (
        <SocketProvider userId={user.id} userRole={user.role}>
          {children}
        </SocketProvider>
      ) : (
        // If no user, just render children without socket context
        children
      )}
    </>
  );
}
