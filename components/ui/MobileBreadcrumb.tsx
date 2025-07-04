"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MobileBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function MobileBreadcrumb({ items, className }: MobileBreadcrumbProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // On mobile, show only last 2 items when collapsed
  const visibleItems = isExpanded ? items : items.slice(-2);
  const hasHiddenItems = items.length > 2 && !isExpanded;

  return (
    <nav 
      className={cn("flex items-center text-sm md:hidden", className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
        {/* Home icon for first item if not visible */}
        {!isExpanded && items.length > 2 && (
          <li className="flex items-center">
            <Link 
              href={items[0].href || "/"}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
          </li>
        )}

        {/* Expansion button */}
        {hasHiddenItems && (
          <li className="flex items-center">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
              aria-label="Show all breadcrumb items"
            >
              ...
            </button>
            <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
          </li>
        )}

        {/* Breadcrumb items */}
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const actualIndex = isExpanded ? index : items.length - visibleItems.length + index;
          
          return (
            <li key={actualIndex} className="flex items-center">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "hover:text-gray-700 truncate max-w-[120px] px-2 py-1 rounded hover:bg-gray-100",
                    "text-gray-600"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span 
                  className={cn(
                    "truncate max-w-[120px] px-2 py-1",
                    isLast ? "text-gray-900 font-medium" : "text-gray-600"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1 flex-shrink-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Swipeable breadcrumb variant for gesture-based navigation
export function SwipeableBreadcrumb({ items, className }: MobileBreadcrumbProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    // Scroll to the end to show current page
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [items]);

  return (
    <div 
      ref={scrollRef}
      className={cn(
        "flex items-center overflow-x-auto scrollbar-hide md:hidden",
        "-mx-4 px-4", // Allow full-width scrolling
        className
      )}
    >
      <nav aria-label="Breadcrumb" className="flex items-center text-sm whitespace-nowrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <React.Fragment key={index}>
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-gray-600 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span 
                  className={cn(
                    "px-2 py-1",
                    isLast ? "text-gray-900 font-medium" : "text-gray-600"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}