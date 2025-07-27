'use client';

import React from 'react';
import { SocketProvider } from '@/lib/contexts/SocketContext';
import { AuthProvider, useAuth } from '@/lib/contexts/AuthContext';

function SocketWrapper({ children }: { children: React.ReactNode }) {
  const { userDetails, loading } = useAuth();
  
  // Always render children for now to debug the loading issue
  // TODO: Re-enable loading state once auth is working
  console.log('🔍 SocketWrapper render - loading:', loading, 'userDetails:', !!userDetails);
  
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
