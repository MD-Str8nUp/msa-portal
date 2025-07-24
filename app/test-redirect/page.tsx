'use client';

import { useEffect, useState } from 'react';

export default function TestRedirect() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const user = localStorage.getItem('currentUser');
      setCurrentUser(user);
    } catch (err) {
      setError('Error accessing localStorage: ' + String(err));
    }
  }, []);

  const clearStorage = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setError(null);
  };

  const testLogin = () => {
    const testUser = {
      email: 'test@test.com',
      role: 'PARENT',
      name: 'Test User'
    };
    localStorage.setItem('currentUser', JSON.stringify(testUser));
    setCurrentUser(JSON.stringify(testUser));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Redirect Debug Page</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Current User Session:</h2>
            {error ? (
              <div className="bg-red-50 p-3 rounded text-red-700">{error}</div>
            ) : (
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {currentUser || 'No user session found'}
              </pre>
            )}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={testLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Set Test User
            </button>
            
            <button
              onClick={clearStorage}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Session
            </button>
            
            <a
              href="/"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
            >
              Test Redirect
            </a>
            
            <a
              href="/login"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 inline-block"
            >
              Go to Login
            </a>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Available Routes:</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><a href="/parent/dashboard" className="text-blue-600 hover:underline">/parent/dashboard</a></li>
              <li><a href="/leader/dashboard" className="text-blue-600 hover:underline">/leader/dashboard</a></li>
              <li><a href="/executive/groups" className="text-blue-600 hover:underline">/executive/groups</a></li>
              <li><a href="/admin/data-management" className="text-blue-600 hover:underline">/admin/data-management</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}