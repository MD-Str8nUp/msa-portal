"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare,
  Award
} from "lucide-react";

interface BottomNavigationProps {
  userRole: "parent" | "leader" | "executive";
}

const navigationItems = {
  parent: [
    { name: "Home", href: "/parent/dashboard", icon: Home },
    { name: "Scouts", href: "/parent/scouts", icon: Users },
    { name: "Events", href: "/parent/events", icon: Calendar },
    { name: "Progress", href: "/parent/progress", icon: Award },
    { name: "Messages", href: "/parent/messages", icon: MessageSquare },
  ],
  leader: [
    { name: "Home", href: "/leader/dashboard", icon: Home },
    { name: "Scouts", href: "/leader/scouts", icon: Users },
    { name: "Events", href: "/leader/events", icon: Calendar },
    { name: "Attendance", href: "/leader/attendance", icon: Award },
    { name: "Messages", href: "/leader/messages", icon: MessageSquare },
  ],
  executive: [
    { name: "Home", href: "/executive/dashboard", icon: Home },
    { name: "Members", href: "/executive/members", icon: Users },
    { name: "Events", href: "/executive/events", icon: Calendar },
    { name: "Groups", href: "/executive/groups", icon: Award },
    { name: "Messages", href: "/executive/messages", icon: MessageSquare },
  ],
};

export default function BottomNavigation({ userRole }: BottomNavigationProps) {
  const pathname = usePathname();
  const items = navigationItems[userRole];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-msa-soft-white border-t border-msa-light-sage px-2 pb-safe z-50 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href || 
            (pathname.startsWith(item.href) && item.href !== `/${userRole}/dashboard`);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-2 min-w-[64px] touch-target transition-all duration-200",
                isActive ? "text-msa-brand" : "text-msa-charcoal/60"
              )}
            >
              <div className="relative">
                <div className={cn(
                  "p-1 rounded-lg transition-all duration-200",
                  isActive ? "bg-msa-brand/10" : "hover:bg-msa-light-sage/30"
                )}>
                  <item.icon 
                    className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isActive && "scale-110"
                    )} 
                  />
                </div>
                {/* Islamic-styled notification dot for messages */}
                {item.name === "Messages" && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-msa-golden rounded-full border-2 border-msa-soft-white animate-pulse" />
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 font-medium text-center leading-tight",
                isActive ? "text-msa-brand" : "text-msa-charcoal/60"
              )}>
                {item.name}
              </span>
              {/* MSA-themed active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-msa-brand to-msa-golden rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Islamic decoration */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-msa-brand to-msa-golden opacity-30"></div>
    </nav>
  );
}