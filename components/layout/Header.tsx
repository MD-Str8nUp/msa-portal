"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Menu, Bell, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import ChildSelector from "@/components/selectors/ChildSelector";
import GroupSelector from "@/components/selectors/GroupSelector";
import UserMenu from "@/components/ui/UserMenu";
import { mockScoutService, mockGroupService, mockAuthService } from "@/lib/mock/data";

interface HeaderProps {
  setSidebarOpenAction: (open: boolean) => void;
  pageTitle: string;
  userRole?: "parent" | "leader" | "executive";
}

export default function Header({ setSidebarOpenAction, pageTitle, userRole = "parent" }: HeaderProps) {
  console.log('Header rendering', new Date().getTime());
  
  const router = useRouter();
  
  // Render count tracking to detect infinite loops
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
    console.log(`Header render count: ${renderCount.current}`);
    if (renderCount.current > 50) {
      console.error('Too many renders, stopping to prevent crash');
      return;
    }
  });
  
  // For parent role
  const [selectedScoutId, setSelectedScoutId] = useState<string | null>(null);
  const [myScouts, setMyScouts] = useState<any[]>([]);
  
  // For leader role
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  
  // Get current user
  const currentUser = mockAuthService.getCurrentUser();
  
  // Use memoized callbacks to prevent unnecessary re-renders
  const handleScoutChange = useCallback((scoutId: string) => {
    console.trace('setSelectedScoutId called from:');
    setSelectedScoutId(scoutId);
  }, []);
  
  const handleGroupChange = useCallback((groupId: string) => {
    console.trace('setSelectedGroupId called from:');
    setSelectedGroupId(groupId);
  }, []);
  
  const handleSidebarOpen = useCallback(() => {
    setSidebarOpenAction(true);
  }, [setSidebarOpenAction]);

  // Initialize data only once when component mounts or when user role changes
  // Use empty dependency array to run only once on mount
  useEffect(() => {
    // Only run this effect if userRole and currentUser are defined
    if (!userRole || !currentUser) return;
    
    // If parent, get their scouts
    if (userRole === "parent") {
      const parentScouts = mockScoutService.getScouts(currentUser.id);
      setMyScouts(parentScouts);
      
      // Only set selectedScoutId if there are scouts
      if (parentScouts.length > 0) {
        setSelectedScoutId(parentScouts[0].id);
      }
    }
    
    // If leader, get their groups
    if (userRole === "leader") {
      const groups = mockGroupService.getGroups();
      // Filter groups by leader ID in a real app
      setMyGroups(groups); 
      
      // Only set selectedGroupId if there are groups
      if (groups.length > 0) {
        setSelectedGroupId(groups[0].id);
      }
    }
    
    // Empty dependency array to run only once on mount
    // This prevents infinite re-render loops completely
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm">
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 md:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        onClick={handleSidebarOpen}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800 truncate">
            {pageTitle}
          </h1>
          
          {/* Conditional selector based on role */}
          {userRole === "parent" && myScouts.length > 0 && (
            <div className="hidden md:block">
              <ChildSelector 
                scouts={myScouts}
                selectedScoutId={selectedScoutId}
                onChangeAction={handleScoutChange}
              />
            </div>
          )}
          
          {userRole === "leader" && myGroups.length > 0 && (
            <div className="hidden md:block">
              <GroupSelector
                groups={myGroups}
                selectedGroupId={selectedGroupId}
                onChangeAction={handleGroupChange}
              />
            </div>
          )}
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          {/* Search button */}
          <button
            type="button"
            className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => {
              // Simple search functionality
              const searchTerm = prompt("Enter search term:");
              if (searchTerm) {
                alert(`Searching for: "${searchTerm}"\n(In a real app, this would open a search modal or navigate to search results)`);
              }
            }}
          >
            <span className="sr-only">Search</span>
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          
          {/* Notification button with badge */}
          <div className="relative">
            <button
              type="button"
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => {
                alert("Notifications:\n\n• New event: Summer Camp - Registration opens tomorrow\n• Achievement earned: Alex completed First Aid Badge\n• Message from Leader: Weekly meeting reminder\n• Permission slip required for Field Day\n\n(In a real app, this would open a notifications panel)");
              }}
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
            </button>
            {/* Notification badge */}
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </div>

          {/* User profile dropdown */}
          <UserMenu user={currentUser} />
        </div>
      </div>
    </div>
  );
}
