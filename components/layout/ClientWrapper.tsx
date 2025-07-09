'use client';

import React, { useEffect, useState } from 'react';
import { SocketProvider } from '@/lib/contexts/SocketContext';
import { auth } from '@/lib/auth';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get user from auth service
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // Better error handling - avoid console.error in production
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        setError(errorMessage);
        
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('User authentication failed:', errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-msa-cream">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-msa-brand border-t-transparent"></div>
          <p className="text-lg font-medium text-msa-charcoal">Loading Mi'raj Scouts Academy...</p>
          <p className="text-sm text-muted-foreground">Assalamu Alaikum! Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-msa-cream">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center p-6">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-msa-charcoal">Connection Issue</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-msa-brand text-white rounded-md hover:bg-msa-forest transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SocketProvider userId={user?.id || 'anonymous'} userRole={user?.role || 'guest'}>
          {children}
        </SocketProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
