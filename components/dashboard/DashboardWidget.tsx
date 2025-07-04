"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MoreVertical, Move, X } from "lucide-react";

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  size?: "small" | "medium" | "large" | "full";
  data?: any;
  visible?: boolean;
  order?: number;
}

interface DashboardWidgetProps {
  config: WidgetConfig;
  onRemove?: (id: string) => void;
  onResize?: (id: string, size: WidgetConfig["size"]) => void;
  isDragging?: boolean;
  children: React.ReactNode;
}

export default function DashboardWidget({
  config,
  onRemove,
  onResize,
  isDragging,
  children
}: DashboardWidgetProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const sizeClasses = {
    small: "col-span-1",
    medium: "col-span-1 md:col-span-2",
    large: "col-span-1 md:col-span-3",
    full: "col-span-full"
  };

  return (
    <div 
      className={cn(
        sizeClasses[config.size || "medium"],
        "transition-all duration-200",
        isDragging && "opacity-50 scale-95"
      )}
    >
      <Card className="h-full relative group">
        {/* Widget controls */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            className="p-1.5 rounded hover:bg-gray-100 cursor-move"
            aria-label="Move widget"
          >
            <Move className="h-4 w-4 text-gray-500" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded hover:bg-gray-100"
              aria-label="Widget options"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
            
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 py-1">
                  <button
                    onClick={() => {
                      onResize?.(config.id, "small");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Resize to Small
                  </button>
                  <button
                    onClick={() => {
                      onResize?.(config.id, "medium");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Resize to Medium
                  </button>
                  <button
                    onClick={() => {
                      onResize?.(config.id, "large");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Resize to Large
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      onRemove?.(config.id);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Remove Widget
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}