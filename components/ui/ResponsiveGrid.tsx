"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  variant?: "cards" | "list" | "tiles";
  gap?: "sm" | "md" | "lg";
  minItemWidth?: string;
}

export default function ResponsiveGrid({ 
  children, 
  className,
  variant = "cards",
  gap = "md",
  minItemWidth = "280px"
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6"
  };

  const variantClasses = {
    cards: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    list: "flex flex-col",
    tiles: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
  };

  // Use CSS Grid with auto-fit for truly responsive layout
  const style = variant === "cards" ? {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
  } : undefined;

  return (
    <div 
      className={cn(
        variantClasses[variant],
        gapClasses[gap],
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

// Responsive container with fluid padding
export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = "7xl"
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
}) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl"
  };

  return (
    <div className={cn(
      "mx-auto px-4 sm:px-6 lg:px-8",
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-first card grid with responsive columns
export function CardGrid({ 
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "grid gap-4",
      "grid-cols-1", // Mobile: 1 column
      "sm:grid-cols-2", // Tablet: 2 columns
      "lg:grid-cols-3", // Desktop: 3 columns
      "xl:grid-cols-4", // Large desktop: 4 columns
      className
    )}>
      {children}
    </div>
  );
}

// Responsive table that converts to cards on mobile
export function ResponsiveTable({ 
  headers,
  rows,
  className
}: {
  headers: string[];
  rows: any[][];
  className?: string;
}) {
  return (
    <>
      {/* Desktop table */}
      <div className={cn("hidden md:block overflow-x-auto", className)}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className={cn("md:hidden space-y-4", className)}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="bg-white shadow rounded-lg p-4 space-y-2">
            {row.map((cell, cellIndex) => (
              <div key={cellIndex} className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">{headers[cellIndex]}:</span>
                <span className="text-sm text-gray-900">{cell}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}