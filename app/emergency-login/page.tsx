"use client";

import React, { useState } from "react";
import { createClient } from '@supabase/supabase-js';

// Direct Supabase client - no context
const supabase = createClient(
  "https://munqzgxhluteurttlydq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4ODkyNzEsImV4cCI6MjA2MzQ2NTI3MX0.eUe393-WnrurxjW7jNqnYWdSLV5kqPrUcXRPauRwY5k"
);

export default function DirectLoginPage() {
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("test123");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const directLogin = async () => {
    setLoading(true);
    setResult("🔄 Starting direct login...");
    
    try {
      // Step 1: Authenticate
      setResult(prev => prev + "\n🔐 Step 1: Authenticating...");
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setResult(prev => prev + `\n❌ Auth failed: ${authError.message}`);
        setLoading(false);
        return;
      }

      setResult(prev => prev + `\n✅ Auth successful! User ID: ${authData.user.id}`);

      // Step 2: Get user details via API
      setResult(prev => prev + "\n📊 Step 2: Fetching user details...");
      const response = await fetch(`/api/user?userId=${authData.user.id}`);
      
      if (!response.ok) {
        setResult(prev => prev + `\n❌ API failed: ${response.status} ${response.statusText}`);
        setLoading(false);
        return;
      }

      const userData = await response.json();
      setResult(prev => prev + `\n✅ User details: ${userData.user.full_name} (${userData.user.role})`);

      // Step 3: Direct redirect
      setResult(prev => prev + "\n🎯 Step 3: Redirecting...");
      const redirectPath = '/simple-dashboard'; // Use simple dashboard for testing
      setResult(prev => prev + `\n📍 Redirecting to: ${redirectPath}`);
      
      // Direct window navigation
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 1000);

    } catch (error: any) {
      setResult(prev => prev + `\n💥 Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem', 
      backgroundColor: '#f5f5f5',
      fontFamily: 'monospace'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#333', marginBottom: '2rem' }}>🚨 EMERGENCY LOGIN FIX</h1>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '2px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '2px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <button
          onClick={directLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? "LOGGING IN..." : "🚀 EMERGENCY LOGIN"}
        </button>
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #dee2e6',
          minHeight: '200px',
          whiteSpace: 'pre-wrap',
          fontSize: '0.9rem'
        }}>
          <strong>🔍 Login Process:</strong>
          {result || "\nWaiting for login attempt..."}
        </div>
        
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px'
        }}>
          <strong>🎯 This bypasses all React context and state management!</strong><br/>
          If this works, the issue is in AuthContext or component state.<br/>
          If this fails, the issue is in the backend/API.
        </div>
      </div>
    </div>
  );
}
