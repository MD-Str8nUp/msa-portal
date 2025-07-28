'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Don't check for existing session - let user manually navigate if needed
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting login for:', email);
      
      // Use our profile-based authentication API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Login error:', result.error);
        setError(result.error || 'Login failed');
        setLoading(false);
        return;
      }

      if (result.user) {
        console.log('Login successful for:', result.user.email, 'Role:', result.user.role);
        
        // Store user session locally
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        
        // Determine role-based redirect URL
        let redirectUrl = '/';
        const userRole = result.user.role?.toLowerCase();
        
        switch (userRole) {
          case 'parent':
            redirectUrl = '/parent/dashboard';
            break;
          case 'leader':
            redirectUrl = '/leader/dashboard';
            break;
          case 'leader1':
            // Check view mode preference, default to leader dashboard
            redirectUrl = result.user.current_view_mode === 'parent' ? '/parent/dashboard' : '/leader/dashboard';
            break;
          case 'executive':
          case 'admin':
            redirectUrl = '/admin/data-management';
            break;
          default:
            redirectUrl = '/'; // Fallback to home page
        }
        
        console.log('Session stored, redirecting to:', redirectUrl);
        // Force redirect with window.location for maximum reliability  
        window.location.href = redirectUrl;
      } else {
        setError('Login response invalid. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };


  // Always render the login form immediately - don't wait for mounting
  // if (!mounted) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            MSA Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the Scout Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your email"
                disabled={loading}
                autoFocus
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
            
          </div>
        </form>
        
        <div className="text-center space-y-2">
          <a 
            href="/debug" 
            className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
            System Diagnostics
          </a>
        </div>
      </div>
    </div>
  );
}
