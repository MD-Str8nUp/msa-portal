"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Call the authentication API instead of hardcoded check
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const result = await response.json();
        // Store token and redirect based on user role
        localStorage.setItem('auth-token', result.token);
        
        switch (result.user.role) {
          case 'executive':
            router.push("/executive/dashboard");
            break;
          case 'leader':
            router.push("/leader/dashboard");
            break;
          case 'parent':
            router.push("/parent/dashboard");
            break;
          default:
            router.push("/dashboard");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Invalid credentials");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("An error occurred during login. Please try again.");
    }
    
    setIsLoading(false);
  };

  const handleQuickLogin = (role: string) => {
    setIsLoading(true);
    switch (role) {
      case "parent":
        router.push("/parent/dashboard");
        break;
      case "leader":
        router.push("/leader/dashboard");
        break;
      case "executive":
        router.push("/executive/dashboard");
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-xl border border-green-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            🕌 MSA Portal
          </h1>
          <p className="text-green-600 mb-4">
            Mi'raj Scouts Academy
          </p>
          <p className="text-green-700 text-sm">
            السلام عليكم ورحمة الله وبركاته
          </p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
        
        <div className="mt-6 border-t border-green-200 pt-6">
          <div className="text-center mb-3">
            <p className="text-sm text-green-800 font-medium">
              🚀 Quick Demo Access for Friday Presentation
            </p>
            <p className="text-xs text-green-600 mt-1">
              Use demo@msa.com / demo123 for login
            </p>
          </div>
          <div className="flex justify-center space-x-2 mt-3">
            <button 
              onClick={() => handleQuickLogin("parent")}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              👨‍👩‍👧‍👦 Parent
            </button>
            <button 
              onClick={() => handleQuickLogin("leader")}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              🧑‍🏫 Leader
            </button>
            <button 
              onClick={() => handleQuickLogin("executive")}
              disabled={isLoading}
              className="px-4 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            >
              👔 Executive
            </button>
          </div>
        </div>
        
        <div className="text-center border-t border-green-200 pt-4">
          <p className="text-xs text-green-600">
            🎯 Ready for Friday Community Demo
          </p>
          <p className="text-xs text-green-600 mt-1">
            79 Islamic Families • 16 API Endpoints • Complete Backend
          </p>
        </div>
      </div>
    </div>
  );
}