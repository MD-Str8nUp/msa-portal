'use client';

import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className = "", children }) => {
  return (
    <div 
      className={`animate-pulse bg-msa-light-sage/30 rounded-md ${className}`}
      aria-label="Loading content"
    >
      {children}
    </div>
  );
};

interface CardSkeletonProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  lines = 3, 
  showAvatar = false, 
  className = "" 
}) => {
  return (
    <div className={`card-mobile ${className}`}>
      <div className="flex items-start gap-4">
        {showAvatar && (
          <LoadingSkeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        )}
        <div className="flex-1 space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <LoadingSkeleton 
              key={i}
              className={`h-4 ${
                i === lines - 1 ? 'w-2/3' : 'w-full'
              }`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 4, 
  className = "" 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <LoadingSkeleton key={`header-${i}`} className="h-6 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className="h-8 flex-1" 
            />
          ))}
        </div>
      ))}
    </div>
  );
};

interface DashboardSkeletonProps {
  className?: string;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <LoadingSkeleton className="h-8 w-1/3" />
        <LoadingSkeleton className="h-4 w-1/2" />
      </div>
      
      {/* Stats Cards */}
      <div className="mobile-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`stat-${i}`} className="card-mobile">
            <LoadingSkeleton className="h-6 w-1/2 mb-2" />
            <LoadingSkeleton className="h-8 w-1/3 mb-1" />
            <LoadingSkeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
      
      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton lines={6} className="h-64" />
        <CardSkeleton lines={6} className="h-64" />
      </div>
    </div>
  );
};

interface ListSkeletonProps {
  items?: number;
  showActions?: boolean;
  className?: string;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  items = 5, 
  showActions = false, 
  className = "" 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={`list-item-${i}`} className="card-mobile">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <LoadingSkeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <LoadingSkeleton className="h-4 w-3/4" />
                <LoadingSkeleton className="h-3 w-1/2" />
              </div>
            </div>
            {showActions && (
              <div className="flex gap-2">
                <LoadingSkeleton className="h-8 w-16" />
                <LoadingSkeleton className="h-8 w-16" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Islamic-themed loading component
interface IslamicLoadingProps {
  message?: string;
  className?: string;
}

export const IslamicLoading: React.FC<IslamicLoadingProps> = ({ 
  message = "Loading...", 
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 p-8 ${className}`}>
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-msa-brand border-t-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="h-6 w-6 text-msa-golden" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L14.5 8.5L21 9L16 14L17.5 21L12 18L6.5 21L8 14L3 9L9.5 8.5L12 2Z" />
          </svg>
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-msa-charcoal font-medium">{message}</p>
        <p className="text-sm text-muted-foreground">جاري التحميل...</p>
      </div>
    </div>
  );
};

// Spinner component for inline loading
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = "" 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-msa-brand border-t-transparent ${sizeClasses[size]} ${className}`}
      aria-label="Loading"
    />
  );
};