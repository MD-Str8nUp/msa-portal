"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    <div className="h-screen flex overflow-hidden bg-msa-cream">
      {/* Mobile sidebar - MSA branded */}
      <div
        className={`fixed inset-0 flex z-50 md:hidden ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } transition-opacity ease-linear duration-300`}
      >
        <div
          className={`fixed inset-0 bg-msa-charcoal/75 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          } transition-opacity ease-linear duration-300`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-msa-soft-white transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition ease-in-out duration-300 border-r border-msa-light-sage/30`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-msa-golden bg-msa-sage/20 hover:bg-msa-sage/40 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-msa-soft-white" aria-hidden="true" />
            </button>
          </div>

          {/* MSA Mobile Header */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center px-4 border-b border-msa-light-sage/30 h-20 bg-gradient-to-b from-msa-cream/50 to-transparent">
            <Image
              src="/images/msa-logo-small.png"
              alt="Mi'raj Scouts Academy"
              width={40}
              height={40}
              className="h-10 w-10 mb-2"
              priority
            />
            <div className="text-center">
              <div className="text-sm font-bold text-msa-charcoal font-primary leading-tight">
                Mi'raj Scouts Academy
              </div>
              <div className="text-xs text-msa-sage font-arabic">
                مدرسة الكشافة
              </div>
            </div>
          </div>

          <div className="flex-1 h-0 overflow-y-auto">
            <div className="px-4 pt-4 pb-3">
              <h2 className="text-xs font-semibold text-msa-sage uppercase tracking-wider font-primary">
                Navigation
              </h2>
              <div className="text-xs text-msa-forest font-arabic mt-1">
                التنقل
              </div>
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
                      "group flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 touch-target-comfortable font-primary",
                      isActive
                        ? "bg-msa-sage/10 text-msa-sage border-l-4 border-msa-sage shadow-sm"
                        : "text-msa-charcoal/70 hover:bg-msa-light-sage/20 hover:text-msa-charcoal hover:border-l-4 hover:border-msa-light-sage"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        "mr-4 h-6 w-6",
                        isActive
                          ? "text-msa-sage"
                          : "text-msa-charcoal/60 group-hover:text-msa-sage"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* MSA User section for mobile */}
          <div className="flex-shrink-0 border-t border-msa-light-sage/30 p-4 bg-gradient-to-t from-msa-cream/50 to-transparent">
            <div className="flex flex-col items-center w-full">
              <div className="w-full text-center mb-3">
                <div className="text-sm font-medium text-msa-charcoal font-primary">
                  {`${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal`}
                </div>
                <div className="text-xs text-msa-sage font-arabic">
                  بوابة {userRole === "parent" ? "الوالدين" : userRole === "leader" ? "القادة" : "التنفيذيين"}
                </div>
              </div>
              <div className="flex items-center gap-2 w-full">
                <button
                  className="flex-1 text-sm text-msa-sage hover:text-msa-forest cursor-pointer transition-colors duration-200 hover:bg-msa-light-sage/20 px-4 py-2 rounded-lg font-primary border border-msa-light-sage/30 hover:border-msa-sage/50"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
                <div className="text-sm text-msa-sage">
                  🌙
                </div>
              </div>
              {/* Footer with copyright */}
              <div className="mt-3 pt-2 border-t border-msa-light-sage/20 w-full">
                <div className="flex items-center justify-center gap-1">
                  <Image
                    src="/images/msa-logo-small.png"
                    alt="MSA"
                    width={16}
                    height={16}
                    className="h-4 w-4 opacity-60"
                  />
                  <span className="text-xs text-msa-sage/70">© 2025 MSA</span>
                </div>
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
