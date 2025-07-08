"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";

export default function TestLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Msa@2025");
  const [loginResult, setLoginResult] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [demoUser, setDemoUser] = useState<any>(null);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await auth.login(email, password);
      setLoginResult(user);
      
      // Also get current user to verify token works
      const current = await auth.getCurrentUser();
      setCurrentUser(current);
    } catch (error) {
      setLoginResult({ error: error instanceof Error ? error.message : 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  const getDemoUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/demo-login', {
        method: 'POST',
      });
      const result = await response.json();
      setDemoUser(result);
      
      if (result.success) {
        // Set the token in localStorage to simulate login
        localStorage.setItem('auth-token', result.token);
        localStorage.setItem('user-id', result.user.id);
        
        // Update current user
        const current = await auth.getCurrentUser();
        setCurrentUser(current);
      }
    } catch (error) {
      setDemoUser({ error: error instanceof Error ? error.message : 'Demo failed' });
    } finally {
      setLoading(false);
    }
  };

  const getTestUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-users');
      const result = await response.json();
      setDemoUser(result);
    } catch (error) {
      setDemoUser({ error: error instanceof Error ? error.message : 'Test users failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">MSA Portal Authentication Test</h1>
        
        {/* Manual Login Test */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Login Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter parent email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Default: Msa@2025"
              />
            </div>
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              {loading ? "Logging in..." : "Login"}
            </Button>
            
            {loginResult && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h4 className="font-medium">Login Result:</h4>
                <pre className="text-sm">{JSON.stringify(loginResult, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Login Test */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Login Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={getDemoUser} disabled={loading}>
                {loading ? "Loading..." : "Get Demo Parent Login"}
              </Button>
              <Button onClick={getTestUsers} disabled={loading} variant="outline">
                {loading ? "Loading..." : "Show Test Users"}
              </Button>
            </div>
            
            {demoUser && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h4 className="font-medium">Demo/Test Result:</h4>
                <pre className="text-sm">{JSON.stringify(demoUser, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current User Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current User Status</CardTitle>
          </CardHeader>
          <CardContent>
            {currentUser ? (
              <div className="p-4 bg-green-100 rounded">
                <h4 className="font-medium text-green-800">Authenticated User:</h4>
                <pre className="text-sm text-green-700">{JSON.stringify(currentUser, null, 2)}</pre>
              </div>
            ) : (
              <div className="p-4 bg-red-100 rounded">
                <h4 className="font-medium text-red-800">No authenticated user</h4>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}