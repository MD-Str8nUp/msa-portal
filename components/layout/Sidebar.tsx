"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/AuthContext";

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
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-msa-soft-white border-r border-msa-light-sage/30">
      <div className="flex flex-col h-full">
        {/* MSA Logo and title section */}
        <div className="flex flex-col items-center justify-center h-20 px-4 border-b border-msa-light-sage/30 bg-gradient-to-b from-msa-cream to-msa-soft-white">
          <Link
            href={`/${userRole}/dashboard`}
            className="flex flex-col items-center space-y-1 group"
          >
            <Image
              src="/images/msa-logo-small.png"
              alt="Mi'raj Scouts Academy"
              width={40}
              height={40}
              className="h-10 w-10 group-hover:scale-105 transition-transform duration-200"
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
          </Link>
        </div>

        {/* Navigation section */}
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <div className="px-4 mb-3">
            <h2 className="text-xs font-semibold text-msa-sage uppercase tracking-wider font-primary">
              Navigation
            </h2>
            <div className="text-xs text-msa-forest font-arabic mt-1">
              التنقل
            </div>
          </div>
          <nav className="flex-1 px-2 space-y-1">
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
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 font-primary",
                    isActive
                      ? "bg-msa-sage/10 text-msa-sage border-l-4 border-msa-sage shadow-sm"
                      : "text-msa-charcoal/70 hover:bg-msa-light-sage/20 hover:text-msa-charcoal hover:border-l-4 hover:border-msa-light-sage"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
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

        {/* User section */}
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
                onClick={handleSignOut}
                className="flex-1 text-xs text-msa-sage hover:text-msa-forest cursor-pointer transition-colors duration-200 hover:bg-msa-light-sage/20 px-3 py-2 rounded-lg font-primary border border-msa-light-sage/30 hover:border-msa-sage/50"
              >
                Sign out
              </button>
              <div className="text-xs text-msa-sage">
                🌙
              </div>
            </div>
            {/* Footer with copyright */}
            <div className="mt-2 pt-2 border-t border-msa-light-sage/20 w-full">
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
  );
}
