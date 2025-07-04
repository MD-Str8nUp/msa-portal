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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pb-safe z-50">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href || 
            (pathname.startsWith(item.href) && item.href !== `/${userRole}/dashboard`);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-colors duration-150",
                isActive ? "text-blue-600" : "text-gray-500"
              )}
            >
              <div className="relative">
                <item.icon 
                  className={cn(
                    "h-6 w-6 transition-transform duration-200",
                    isActive && "scale-110"
                  )} 
                />
                {/* Notification dot example for messages */}
                {item.name === "Messages" && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 font-medium",
                isActive ? "text-blue-600" : "text-gray-500"
              )}>
                {item.name}
              </span>
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}