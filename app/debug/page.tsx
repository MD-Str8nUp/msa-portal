'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DebugInfo {
  environment: {
    supabaseUrl: string | undefined;
    hasAnonKey: boolean;
    hasServiceKey: boolean;
    nodeEnv: string | undefined;
    nextUrl: string;
  };
  supabase: {
    connected: boolean;
    error: string | null;
    tables: string[];
  };
  auth: {
    isLoggedIn: boolean;
    user: any;
    session: any;
    error: string | null;
  };
  api: {
    scoutsEndpoint: boolean;
    eventsEndpoint: boolean;
    errors: string[];
  };
}

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    setTestResults([]);
    
    const info: DebugInfo = {
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV,
        nextUrl: window.location.origin,
      },
      supabase: {
        connected: false,
        error: null,
        tables: [],
      },
      auth: {
        isLoggedIn: false,
        user: null,
        session: null,
        error: null,
      },
      api: {
        scoutsEndpoint: false,
        eventsEndpoint: false,
        errors: [],
      },
    };

    // Test Supabase connection
    try {
      const { data, error } = await supabase.from('scouts').select('count', { count: 'exact', head: true });
      if (error) {
        info.supabase.error = error.message;
        addTestResult(`❌ Supabase connection failed: ${error.message}`);
      } else {
        info.supabase.connected = true;
        addTestResult('✅ Supabase connection successful');
      }
    } catch (err) {
      info.supabase.error = String(err);
      addTestResult(`❌ Supabase connection error: ${err}`);
    }

    // Test tables
    try {
      const tables = ['scouts', 'events', 'users', 'scout_events'];
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('*').limit(1);
          if (!error) {
            info.supabase.tables.push(table);
            addTestResult(`✅ Table '${table}' accessible`);
          } else {
            addTestResult(`❌ Table '${table}' error: ${error.message}`);
          }
        } catch (err) {
          addTestResult(`❌ Table '${table}' error: ${err}`);
        }
      }
    } catch (err) {
      addTestResult(`❌ Table check error: ${err}`);
    }

    // Test auth
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        info.auth.error = error.message;
        addTestResult(`❌ Auth session error: ${error.message}`);
      } else if (session) {
        info.auth.isLoggedIn = true;
        info.auth.user = session.user;
        info.auth.session = session;
        addTestResult(`✅ User logged in: ${session.user.email}`);
      } else {
        addTestResult('ℹ️ No active session');
      }
    } catch (err) {
      info.auth.error = String(err);
      addTestResult(`❌ Auth check error: ${err}`);
    }

    // Test API endpoints
    try {
      const scoutsResponse = await fetch('/api/scouts');
      info.api.scoutsEndpoint = scoutsResponse.ok;
      if (scoutsResponse.ok) {
        addTestResult('✅ /api/scouts endpoint working');
      } else {
        const errorText = await scoutsResponse.text();
        info.api.errors.push(`Scouts API: ${errorText}`);
        addTestResult(`❌ /api/scouts failed: ${scoutsResponse.status}`);
      }
    } catch (err) {
      info.api.errors.push(`Scouts API: ${err}`);
      addTestResult(`❌ /api/scouts error: ${err}`);
    }

    try {
      const eventsResponse = await fetch('/api/events');
      info.api.eventsEndpoint = eventsResponse.ok;
      if (eventsResponse.ok) {
        addTestResult('✅ /api/events endpoint working');
      } else {
        const errorText = await eventsResponse.text();
        info.api.errors.push(`Events API: ${errorText}`);
        addTestResult(`❌ /api/events failed: ${eventsResponse.status}`);
      }
    } catch (err) {
      info.api.errors.push(`Events API: ${err}`);
      addTestResult(`❌ /api/events error: ${err}`);
    }

    setDebugInfo(info);
    setLoading(false);
  };

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const testLogin = async () => {
    addTestResult('🔄 Testing custom auth login...');
    addTestResult(`🌐 Current host: ${window.location.host}`);
    addTestResult(`🔗 API URL: ${window.location.origin}/api/auth/login`);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@msaportal.com',
          password: 'MSA@2025!'
        })
      });
      
      const result = await response.json();
      addTestResult(`📊 Response status: ${response.status}`);
      addTestResult(`📋 Response: ${JSON.stringify(result, null, 2)}`);
      
      if (result.success) {
        addTestResult(`✅ Custom auth login successful: ${result.user.email}`);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        addTestResult('💾 User stored in localStorage');
      } else {
        addTestResult(`❌ Custom auth login failed: ${result.error}`);
      }
    } catch (err) {
      addTestResult(`❌ Custom auth login error: ${err}`);
    }
  };

  const testRegularUserLogin = async () => {
    addTestResult('🔄 Testing regular parent login...');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'saharose_00@hotmail.com',
          password: 'MSA@2025!'
        })
      });
      
      const result = await response.json();
      addTestResult(`📊 Parent login status: ${response.status}`);
      addTestResult(`📋 Parent response: ${JSON.stringify(result, null, 2)}`);
      
      if (result.success) {
        addTestResult(`✅ Parent login successful: ${result.user.email}`);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        addTestResult('💾 Parent user stored in localStorage');
      } else {
        addTestResult(`❌ Parent login failed: ${result.error}`);
      }
    } catch (err) {
      addTestResult(`❌ Parent login error: ${err}`);
    }
  };

  const testLogout = async () => {
    addTestResult('🔄 Testing custom auth logout...');
    try {
      localStorage.removeItem('currentUser');
      addTestResult('✅ Custom auth logout successful (localStorage cleared)');
      // Refresh diagnostics
      setTimeout(runDiagnostics, 1000);
    } catch (err) {
      addTestResult(`❌ Logout error: ${err}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">MSA Portal Debug</h1>
          <div className="text-gray-600">Running diagnostics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MSA Portal Debug</h1>
          <div className="space-x-4">
            <button
              onClick={runDiagnostics}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
            <a
              href="/login"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Login
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Environment Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Environment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Supabase URL:</span>
                <span className={debugInfo?.environment.supabaseUrl ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo?.environment.supabaseUrl ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Anon Key:</span>
                <span className={debugInfo?.environment.hasAnonKey ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo?.environment.hasAnonKey ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Service Key:</span>
                <span className={debugInfo?.environment.hasServiceKey ? 'text-green-600' : 'text-orange-600'}>
                  {debugInfo?.environment.hasServiceKey ? '✅ Set' : '⚠️ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Node ENV:</span>
                <span>{debugInfo?.environment.nodeEnv || 'undefined'}</span>
              </div>
            </div>
          </div>

          {/* Supabase Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Supabase Connection</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Connection:</span>
                <span className={debugInfo?.supabase.connected ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo?.supabase.connected ? '✅ Connected' : '❌ Failed'}
                </span>
              </div>
              {debugInfo?.supabase.error && (
                <div className="text-red-600 text-xs mt-2 p-2 bg-red-50 rounded">
                  {debugInfo.supabase.error}
                </div>
              )}
              <div className="mt-4">
                <span className="font-medium">Accessible Tables:</span>
                <ul className="mt-2 space-y-1">
                  {debugInfo?.supabase.tables.map(table => (
                    <li key={table} className="text-green-600">✅ {table}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Auth Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Logged In:</span>
                <span className={debugInfo?.auth.isLoggedIn ? 'text-green-600' : 'text-orange-600'}>
                  {debugInfo?.auth.isLoggedIn ? '✅ Yes' : '⚠️ No'}
                </span>
              </div>
              {debugInfo?.auth.user && (
                <div className="mt-2">
                  <span className="font-medium">User Email:</span>
                  <div className="text-green-600">{debugInfo.auth.user.email}</div>
                </div>
              )}
              {debugInfo?.auth.error && (
                <div className="text-red-600 text-xs mt-2 p-2 bg-red-50 rounded">
                  {debugInfo.auth.error}
                </div>
              )}
              <div className="mt-4 space-x-2">
                <button
                  onClick={testLogin}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  Test Admin Login
                </button>
                <button
                  onClick={testRegularUserLogin}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Test Parent Login
                </button>
                <button
                  onClick={testLogout}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >
                  Clear Session
                </button>
              </div>
            </div>
          </div>

          {/* API Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>/api/scouts:</span>
                <span className={debugInfo?.api.scoutsEndpoint ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo?.api.scoutsEndpoint ? '✅ Working' : '❌ Failed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>/api/events:</span>
                <span className={debugInfo?.api.eventsEndpoint ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo?.api.eventsEndpoint ? '✅ Working' : '❌ Failed'}
                </span>
              </div>
              {debugInfo?.api.errors && debugInfo.api.errors.length > 0 && (
                <div className="mt-4">
                  <span className="font-medium text-red-600">API Errors:</span>
                  <ul className="mt-2 space-y-1">
                    {debugInfo.api.errors.map((error, index) => (
                      <li key={index} className="text-red-600 text-xs bg-red-50 p-2 rounded">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded text-sm font-mono max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
