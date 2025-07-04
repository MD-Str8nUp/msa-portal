"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockAuthService } from "@/lib/mock/data";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Check if user is already logged in
  useEffect(() => {
    const currentUser = mockAuthService.getCurrentUser();
    if (currentUser) {
      console.log("User already logged in:", currentUser);
      // Redirect based on user role
      switch (currentUser.role) {
        case "parent":
          router.push("/parent/dashboard");
          break;
        case "leader":
          router.push("/leader/dashboard");
          break;
        case "executive":
          router.push("/executive/dashboard");
          break;
        default:
          router.push("/");
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with:", { email, password });
    setError("");
    setIsLoading(true);

    try {
      const user = mockAuthService.login(email, password);
      console.log("Login response:", user);
      
      if (!user) {
        console.log("Login failed, setting error");
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      console.log("Login successful, redirecting to dashboard for role:", user.role);
      
      // Redirect based on user role
      switch (user.role) {
        case "parent":
          router.push("/parent/dashboard");
          break;
        case "leader":
          router.push("/leader/dashboard");
          break;
        case "executive":
          router.push("/executive/dashboard");
          break;
        default:
          router.push("/");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // For demo purposes, provide quick login buttons
  const handleQuickLogin = (role: "parent" | "leader" | "executive") => {
    let demoEmail = "";
    setIsLoading(true);
    
    switch (role) {
      case "parent":
        demoEmail = "john@example.com";
        break;
      case "leader":
        demoEmail = "jane@example.com";
        break;
      case "executive":
        demoEmail = "michael@example.com";
        break;
    }
    
    // Set credentials
    setEmail(demoEmail);
    setPassword("password");
    
    try {
      // Perform login
      const user = mockAuthService.login(demoEmail, "password");
      
      if (!user) {
        setError("Quick login failed. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Redirect based on user role
      switch (user.role) {
        case "parent":
          router.push("/parent/dashboard");
          break;
        case "leader":
          router.push("/leader/dashboard");
          break;
        case "executive":
          router.push("/executive/dashboard");
          break;
        default:
          router.push("/");
      }
    } catch (error) {
      console.error("Error during quick login:", error);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Scout Management System</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-500 rounded-md">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </div>
        </form>
        
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            Quick demo login:
          </p>
          <div className="flex justify-center space-x-2 mt-2">            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickLogin("parent")}
              disabled={isLoading}
            >
              Parent
            </Button>            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickLogin("leader")}
              disabled={isLoading}
            >
              Leader
            </Button>            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickLogin("executive")}
              disabled={isLoading}
            >
              Executive
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
