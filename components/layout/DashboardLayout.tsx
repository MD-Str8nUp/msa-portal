"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { mockAuthService } from "@/lib/mock/data";

// Import navigation if needed later
// import { parentNavigation } from "../navigation/ParentNavigation";
// import { leaderNavigation } from "../navigation/LeaderNavigation";
// import { executiveNavigation } from "../navigation/ExecutiveNavigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  navigation: {
    name: string;
    href: string;
    icon: React.ElementType;
  }[];
  pageTitle: string;
  userRole: "parent" | "leader" | "executive";
}

export default function DashboardLayout({
  children,
  navigation,
  pageTitle,
  userRole,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    mockAuthService.logout();
    router.push("/login");
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar - improved z-index and styling to match desktop */}
      <div
        className={`fixed inset-0 flex z-50 md:hidden ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } transition-opacity ease-linear duration-300`}
      >
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          } transition-opacity ease-linear duration-300`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition ease-in-out duration-300`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-shrink-0 flex items-center px-4 border-b border-gray-200 h-16">
            <span className="text-xl font-bold text-blue-600">Scout MS</span>
          </div>

          <div className="flex-1 h-0 overflow-y-auto">
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Navigation
              </h2>
            </div>
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                // Check if current path matches exactly or is a subpath
                const isActive =
                  pathname === item.href ||
                  (pathname.startsWith(item.href) && item.href !== `/${userRole}/dashboard`);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors duration-150 ease-in-out",
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        "mr-4 h-6 w-6",
                        isActive
                          ? "text-blue-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User section for mobile */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="w-full">
                <div className="text-sm font-medium text-gray-700">
                  {`${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal`}
                </div>                <button
                  className="text-xs text-red-500 hover:text-red-700 mt-1 cursor-pointer transition-colors duration-200 hover:bg-red-100 px-2 py-1 rounded"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <Sidebar navigation={navigation} userRole={userRole} />      {/* Main content - improved with md:ml-64 to properly offset from sidebar */}
      <div className="flex flex-col w-0 flex-1 md:ml-64 overflow-hidden">
        <Header setSidebarOpenAction={setSidebarOpen} pageTitle={pageTitle} userRole={userRole} />
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
