"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Filter, Users, Calendar, MessageSquare, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  type: "scout" | "event" | "message" | "document";
  title: string;
  subtitle?: string;
  url: string;
  icon: React.ElementType;
}

interface SmartSearchProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export default function SmartSearch({ className, placeholder = "Search scouts, events, messages...", onSearch }: SmartSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Mock search function - replace with actual API call
  const performSearch = (searchQuery: string, filter?: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    // Mock results
    const mockResults: SearchResult[] = [
      {
        id: "1",
        type: "scout",
        title: "John Doe",
        subtitle: "Cubs • Age 10",
        url: "/parent/scouts/1",
        icon: Users
      },
      {
        id: "2",
        type: "event",
        title: "Summer Camp 2024",
        subtitle: "July 15-20",
        url: "/parent/events/2",
        icon: Calendar
      },
      {
        id: "3",
        type: "message",
        title: "Camp Registration Reminder",
        subtitle: "From: Leader Smith",
        url: "/parent/messages/3",
        icon: MessageSquare
      },
      {
        id: "4",
        type: "document",
        title: "Permission Slip - Summer Camp",
        subtitle: "Due: July 1",
        url: "/parent/documents/4",
        icon: FileText
      }
    ];

    // Filter results based on active filter
    const filtered = filter 
      ? mockResults.filter(r => r.type === filter)
      : mockResults.filter(r => 
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    setResults(filtered);
  };

  useEffect(() => {
    performSearch(query, activeFilter || undefined);
  }, [query, activeFilter]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    
    onSearch?.(searchQuery);
    setIsOpen(false);
    setQuery("");
  };

  const handleResultClick = (result: SearchResult) => {
    handleSearch(result.title);
    router.push(result.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      } else {
        handleSearch(query);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const filters = [
    { id: "scout", label: "Scouts", icon: Users },
    { id: "event", label: "Events", icon: Calendar },
    { id: "message", label: "Messages", icon: MessageSquare },
    { id: "document", label: "Documents", icon: FileText }
  ];

  return (
    <>
      {/* Search trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors",
          className
        )}
      >
        <Search className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-500">{placeholder}</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-white rounded border">
          ⌘K
        </kbd>
      </button>

      {/* Search modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-20">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            {/* Search dialog */}
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
              {/* Search input */}
              <div className="border-b">
                <div className="flex items-center px-4">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-4 text-base outline-none"
                    autoFocus
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 px-4 pb-3">
                  <Filter className="h-4 w-4 text-gray-400" />
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(activeFilter === filter.id ? null : filter.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm transition-colors",
                        activeFilter === filter.id
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <filter.icon className="h-3 w-3" />
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {query ? (
                  results.length > 0 ? (
                    <div className="py-2">
                      {results.map((result, index) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors",
                            selectedIndex === index && "bg-gray-50"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-lg",
                            result.type === "scout" && "bg-blue-100 text-blue-600",
                            result.type === "event" && "bg-green-100 text-green-600",
                            result.type === "message" && "bg-purple-100 text-purple-600",
                            result.type === "document" && "bg-orange-100 text-orange-600"
                          )}>
                            <result.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{result.title}</p>
                            {result.subtitle && (
                              <p className="text-sm text-gray-500">{result.subtitle}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-500">
                      No results found for "{query}"
                    </div>
                  )
                ) : (
                  <div className="py-4">
                    {recentSearches.length > 0 && (
                      <div className="px-4 pb-4">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Recent Searches</p>
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => setQuery(search)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded"
                            >
                              <Clock className="h-4 w-4 text-gray-400" />
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t px-4 py-3 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↵</kbd>
                    Select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">esc</kbd>
                    Close
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}