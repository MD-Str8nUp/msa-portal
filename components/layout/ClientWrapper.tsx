'use client';

import React from 'react';
import { SocketProvider } from '@/lib/contexts/SocketContext';
import { AuthProvider, useAuth } from '@/lib/contexts/AuthContext';

function SocketWrapper({ children }: { children: React.ReactNode }) {
  const { userDetails, loading } = useAuth();
  
  if (loading) {
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
    <SocketProvider userId={userDetails?.id || 'anonymous'} userRole={userDetails?.role || 'guest'}>
      {children}
    </SocketProvider>
  );
}

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketWrapper>
        {children}
      </SocketWrapper>
    </AuthProvider>
  );
}
