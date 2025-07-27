"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Menu, Bell, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ChildSelector from "@/components/selectors/ChildSelector";
import GroupSelector from "@/components/selectors/GroupSelector";
import UserMenu from "@/components/ui/UserMenu";
import { scoutService, groupService } from "@/lib/services/supabaseService";
import { useAuth } from "@/lib/contexts/AuthContext";

interface HeaderProps {
  setSidebarOpenAction: (open: boolean) => void;
  pageTitle: string;
  userRole?: "parent" | "leader" | "executive";
}

export default function Header({ setSidebarOpenAction, pageTitle, userRole = "parent" }: HeaderProps) {
  const router = useRouter();
  const { userDetails } = useAuth();
  
  // For parent role
  const [selectedScoutId, setSelectedScoutId] = useState<string | null>(null);
  const [myScouts, setMyScouts] = useState<any[]>([]);
  
  // For leader role
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  
  // Use memoized callbacks to prevent unnecessary re-renders
  const handleScoutChange = useCallback((scoutId: string) => {
    setSelectedScoutId(scoutId);
  }, []);
  
  const handleGroupChange = useCallback((groupId: string) => {
    setSelectedGroupId(groupId);
  }, []);
  
  const handleSidebarOpen = useCallback(() => {
    setSidebarOpenAction(true);
  }, [setSidebarOpenAction]);

  // Initialize data only once when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!userRole || !userDetails) return;
      
      try {
        // If parent, get their scouts
        if (userRole === "parent") {
          const parentScouts = await scoutService.getScoutsByParent(userDetails.id);
          if (Array.isArray(parentScouts)) {
            setMyScouts(parentScouts);
            
            // Only set selectedScoutId if there are scouts
            if (parentScouts.length > 0) {
              setSelectedScoutId(parentScouts[0].id);
            }
          }
        }
        
        // If leader, get their groups
        if (userRole === "leader") {
          const groups = await groupService.getAllGroups();
          if (Array.isArray(groups)) {
            setMyGroups(groups); 
          
            // Only set selectedGroupId if there are groups
            if (groups.length > 0) {
              setSelectedGroupId(groups[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing header data:', error);
      }
    };

    fetchData();
  }, [userRole, userDetails?.id]);

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-msa-soft-white shadow-sm border-b border-msa-light-sage/30">
      <button
        type="button"
        className="px-4 border-r border-msa-light-sage/30 text-msa-sage hover:text-msa-forest md:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-msa-sage"
        onClick={handleSidebarOpen}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* MSA Logo and Branding */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/msa-logo-horizontal.png"
              alt="Mi'raj Scouts Academy"
              width={120}
              height={40}
              className="hidden md:block h-8 w-auto"
              priority
            />
            <Image
              src="/images/msa-logo-small.png"
              alt="MSA"
              width={32}
              height={32}
              className="md:hidden h-8 w-8"
              priority
            />
            <div className="hidden lg:block border-l border-msa-light-sage/50 pl-3">
              <h1 className="text-lg font-semibold text-msa-charcoal font-primary">
                {pageTitle}
              </h1>
              <p className="text-xs text-msa-sage">
                Assalamu Alaikum
              </p>
            </div>
            <div className="lg:hidden">
              <h1 className="text-lg font-semibold text-msa-charcoal font-primary truncate">
                {pageTitle}
              </h1>
            </div>
          </div>
          
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
            className="p-2 rounded-full text-msa-sage hover:text-msa-forest hover:bg-msa-light-sage/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-msa-sage transition-colors duration-200"
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
              className="p-2 rounded-full text-msa-sage hover:text-msa-forest hover:bg-msa-light-sage/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-msa-sage transition-colors duration-200"
              onClick={() => {
                alert("بسم الله - Notifications:\n\n• New event: Summer Camp - Registration opens tomorrow\n• Achievement earned: Alex completed First Aid Badge\n• Message from Leader: Weekly meeting reminder\n• Permission slip required for Field Day\n\n(In a real app, this would open a notifications panel)");
              }}
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
            </button>
            {/* Notification badge - MSA Golden Yellow */}
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-msa-golden ring-2 ring-msa-soft-white"></span>
          </div>

          {/* User profile dropdown */}
          <UserMenu user={userDetails} />
        </div>
      </div>
    </div>
  );
}
