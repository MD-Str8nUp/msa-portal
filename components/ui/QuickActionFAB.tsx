"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  X, 
  Calendar,
  MessageSquare,
  FileText,
  Users
} from "lucide-react";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

interface QuickActionFABProps {
  actions: QuickAction[];
  className?: string;
}

export default function QuickActionFAB({ actions, className }: QuickActionFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  };

  const handleActionClick = (action: QuickAction) => {
    action.onClick();
    setIsOpen(false);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className={cn("fixed bottom-20 right-4 z-40 md:hidden", className)}>
      {/* Action buttons */}
      <div className={cn(
        "absolute bottom-16 right-0 flex flex-col-reverse gap-3 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className={cn(
              "flex items-center gap-3 bg-white rounded-full shadow-lg px-4 py-3 transition-all duration-200 hover:shadow-xl active:scale-95",
              action.color || "text-gray-700"
            )}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
            }}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 -z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main FAB button */}
      <button
        onClick={handleToggle}
        className={cn(
          "relative h-14 w-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center",
          isOpen 
            ? "bg-gray-800 hover:bg-gray-900 rotate-45" 
            : "bg-blue-600 hover:bg-blue-700 rotate-0"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
        
        {/* Pulse animation when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-25" />
        )}
      </button>
    </div>
  );
}

// Example preset for parent actions
export const parentQuickActions: QuickAction[] = [
  {
    icon: Calendar,
    label: "Quick RSVP",
    onClick: () => console.log("Quick RSVP"),
    color: "text-blue-600"
  },
  {
    icon: MessageSquare,
    label: "Send Message",
    onClick: () => console.log("Send Message"),
    color: "text-green-600"
  },
  {
    icon: FileText,
    label: "Sign Permission",
    onClick: () => console.log("Sign Permission"),
    color: "text-orange-600"
  },
  {
    icon: Users,
    label: "Update Scout Info",
    onClick: () => console.log("Update Scout"),
    color: "text-purple-600"
  }
];