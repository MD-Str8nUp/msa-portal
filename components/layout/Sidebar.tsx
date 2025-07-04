"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mockAuthService } from "@/lib/mock/data";

interface SidebarProps {
  navigation: {
    name: string;
    href: string;
    icon: React.ElementType;
  }[];
  userRole: "parent" | "leader" | "executive";
}

export default function Sidebar({ navigation, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    mockAuthService.logout();
    router.push("/login");
  };

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-card border-r border-border">
      <div className="flex flex-col h-full">
        {/* Logo and title section */}
        <div className="flex items-center h-16 px-4 border-b border-border">
          <Link
            href={`/${userRole}/dashboard`}
            className="flex items-center space-x-2"
          >
            <span className="text-xl font-bold text-primary">MSA Portal</span>
          </Link>
        </div>

        {/* Navigation section */}
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <div className="px-4 mb-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Navigation
            </h2>
          </div>
          <nav className="flex-1 px-2 space-y-2">
            {navigation.map((item) => {
              // Check if current path matches exactly or is a subpath
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href) &&
                  item.href !== `/${userRole}/dashboard`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-accent-foreground"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User section */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center w-full">
            <div className="w-full">
              <div className="text-sm font-medium text-gray-700">
                {`${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal`}
              </div>              <button
                onClick={handleSignOut}
                className="text-xs text-red-500 hover:text-red-700 mt-1 cursor-pointer transition-colors duration-200 hover:bg-red-100 px-2 py-1 rounded"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
