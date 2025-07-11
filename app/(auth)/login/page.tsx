"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Heart, Moon } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn, userDetails, loading } = useAuth();
  
  // Check if user is already logged in
  useEffect(() => {
    if (userDetails && !loading) {
      console.log("User already logged in:", userDetails);
      // Redirect based on user role
      switch (userDetails.role) {
        case "parent":
          router.push("/parent/dashboard");
          break;
        case "leader":
          router.push("/leader/dashboard");
          break;
        case "exec":
          router.push("/parent/dashboard"); // Executives can use parent view
          break;
        case "executive":
          router.push("/executive/dashboard");
          break;
        default:
          router.push("/");
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with:", { email, password });
    setError("");
    setIsLoading(true);

    try {
      const { data, error: signInError } = await signIn(email, password);
      console.log("Login response:", { data, error: signInError });
      
      if (signInError) {
        console.log("Login failed:", signInError.message);
        setError(signInError.message || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        console.log("Login successful, user:", data.user);
        // The AuthContext will handle redirection after fetching user details
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-msa-cream via-msa-light-sage/20 to-msa-sage/10">
      <div className="max-w-md w-full space-y-8 p-8 bg-msa-soft-white rounded-xl shadow-xl border border-msa-light-sage/30">
        {/* MSA Header */}
        <div className="text-center">
          <div className="mb-6">
            <Image
              src="/images/msa-logo-large.png"
              alt="Mi'raj Scouts Academy"
              width={200}
              height={80}
              className="mx-auto h-20 w-auto"
              priority
            />
          </div>
          
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-msa-charcoal font-primary">
              Mi'raj Scouts Academy Portal
            </h1>
            <p className="text-sm text-msa-sage font-arabic mt-1">
              مدرسة الكشافة - مرحباً بكم
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Moon className="h-5 w-5 text-msa-golden" />
            <p className="text-msa-charcoal/80 font-secondary">
              Assalamu Alaikum! Sign in to your account
            </p>
            <Heart className="h-4 w-4 text-msa-golden" />
          </div>
          
          <div className="text-xs text-msa-sage font-arabic">
            السلام عليكم ورحمة الله وبركاته
          </div>
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
              variant="msa-primary"
              className="w-full py-3 text-lg font-medium"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </div>
        </form>
        
        {/* Islamic Footer */}
        <div className="text-center border-t border-msa-light-sage/30 pt-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-msa-golden" />
            <span className="text-xs text-msa-sage font-arabic">
              بارك الله فيكم
            </span>
            <Heart className="h-4 w-4 text-msa-golden" />
          </div>
          <p className="text-xs text-msa-charcoal/60 font-secondary">
            May Allah bless your scouting journey
          </p>
        </div>
      </div>
    </div>
  );
}
