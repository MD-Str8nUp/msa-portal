"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestLoginPage() {
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("test123");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult("Testing login...");
    
    try {
      console.log("Starting login test with:", { email, password });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Login response:", { data, error });

      if (error) {
        setResult(`❌ Error: ${error.message}`);
        console.error("Login error:", error);
        return;
      }

      if (data.user) {
        setResult(`✅ Success! User: ${data.user.email}\nID: ${data.user.id}`);
        console.log("Login successful:", data.user);
        
        // Test fetching user details via API route (bypasses RLS)
        try {
          const response = await fetch(`/api/user?userId=${data.user.id}`);
          if (response.ok) {
            const userResult = await response.json();
            if (userResult.user) {
              setResult(prev => prev + `\n✅ User details: ${userResult.user.full_name} (${userResult.user.role})`);
            }
          } else {
            setResult(prev => prev + `\n⚠️ User fetch error: ${response.status} ${response.statusText}`);
          }
        } catch (fetchError: any) {
          setResult(prev => prev + `\n⚠️ User fetch error: ${fetchError.message || fetchError}`);
        }
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      setResult(`💥 Unexpected error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setResult(`❌ Logout error: ${error.message}`);
      } else {
        setResult("✅ Logged out successfully");
      }
    } catch (error: any) {
      setResult(`💥 Logout error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        setResult(`❌ Session error: ${error.message}`);
      } else if (session) {
        setResult(`✅ Active session: ${session.user.email}`);
      } else {
        setResult("ℹ️ No active session");
      }
    } catch (error: any) {
      setResult(`💥 Session check error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>Login Test Page</h1>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={testLogin}
            disabled={loading}
            style={{ 
              flex: 1, 
              backgroundColor: '#007bff', 
              color: 'white', 
              padding: '0.75rem', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Loading..." : "Test Login"}
          </button>
          
          <button
            onClick={checkSession}
            disabled={loading}
            style={{ 
              flex: 1, 
              backgroundColor: '#28a745', 
              color: 'white', 
              padding: '0.75rem', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            Check Session
          </button>
          
          <button
            onClick={testLogout}
            disabled={loading}
            style={{ 
              flex: 1, 
              backgroundColor: '#dc3545', 
              color: 'white', 
              padding: '0.75rem', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            Test Logout
          </button>
        </div>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
          <h3 style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Result:</h3>
          <pre style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', margin: 0 }}>{result || "No test run yet"}</pre>
        </div>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px', border: '1px solid #b3d7ff' }}>
          <h3 style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Instructions:</h3>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            <strong>Test Credentials:</strong><br />
            Email: test@test.com<br />
            Password: test123<br /><br />
            Click "Test Login" to authenticate, "Check Session" to verify session state, or "Test Logout" to clear session.
          </p>
        </div>
      </div>
    </div>
  );
}
