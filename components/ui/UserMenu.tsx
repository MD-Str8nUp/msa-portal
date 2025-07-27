"use client";

import React, { useState, useEffect, useRef } from "react";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

interface UserMenuProps {
  user: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Handle logout
  const handleLogout = () => {
    console.log("Logging out...");
    auth.logout();
    setIsOpen(false);
    router.push("/login");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Open user menu</span>
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-2">
          <User className="h-5 w-5" />
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {user?.name || "User"}
        </span>
      </button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none z-10">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">Role: {user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-2 text-gray-500" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
