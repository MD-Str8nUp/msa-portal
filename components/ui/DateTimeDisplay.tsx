'use client';

import { useState, useEffect } from 'react';

interface DateTimeDisplayProps {
  date?: Date | string;
  format?: 'full' | 'short' | 'time' | 'date' | string;
  fallbackText?: string;
  className?: string;
}

export default function DateTimeDisplay({ 
  date, 
  format = 'full',
  fallbackText = 'Loading...', 
  className = '' 
}: DateTimeDisplayProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Format date according to the specified format
  const formatDate = (date: Date | string, formatType: string): string => {
    const d = date instanceof Date ? date : new Date(date);
    
    // Handle invalid dates
    if (isNaN(d.getTime())) {
      return 'Invalid date';
    }
    
    // Common date formatting options
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    // Month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthShort = monthNames[d.getMonth()].substring(0, 3);
    const monthLong = monthNames[d.getMonth()];
    
    // Handle predefined formats
    switch(formatType) {
      case 'full':
        // e.g., "June 28, 2025, 2:30 PM"
        return `${monthLong} ${day}, ${year}, ${hour12}:${minutes} ${ampm}`;
      case 'short':
        // e.g., "Jun 28, 2025"
        return `${monthShort} ${day}, ${year}`;
      case 'time':
        // e.g., "2:30 PM"
        return `${hour12}:${minutes} ${ampm}`;
      case 'date':
        // e.g., "June 28, 2025"
        return `${monthLong} ${day}, ${year}`;
      default:
        // For complex format strings like "MMMM d, yyyy" or "MMM dd, yyyy",
        // we'll try to handle them in a more generic way

        let result = formatType;
        
        // Month formats
        if (result.includes("MMMM")) {
          result = result.replace(/MMMM/g, monthLong);
        } else if (result.includes("MMM")) {
          result = result.replace(/MMM/g, monthShort);
        } else if (result.includes("MM")) {
          result = result.replace(/MM/g, month);
        }
        
        // Day formats
        if (result.includes("dd")) {
          result = result.replace(/dd/g, day);
        } else if (result.includes("d")) {
          result = result.replace(/d/g, parseInt(day, 10).toString());
        }
        
        // Year formats
        if (result.includes("yyyy")) {
          result = result.replace(/yyyy/g, year.toString());
        } else if (result.includes("YYYY")) {
          result = result.replace(/YYYY/g, year.toString());
        } else if (result.includes("yy")) {
          result = result.replace(/yy/g, year.toString().slice(2));
        }
        
        // Hour formats
        if (result.includes("hh")) {
          result = result.replace(/hh/g, hour12.toString().padStart(2, '0'));
        } else if (result.includes("h")) {
          result = result.replace(/h(?![h])/g, hour12.toString());
        } else if (result.includes("HH")) {
          result = result.replace(/HH/g, hours.toString().padStart(2, '0'));
        } else if (result.includes("H")) {
          result = result.replace(/H(?![H])/g, hours.toString());
        }
        
        // Minute and second formats
        result = result.replace(/mm/g, minutes);
        result = result.replace(/ss/g, seconds);
        
        // AM/PM format
        result = result.replace(/a/g, ampm);
        
        return result;
    }
  };
  
  // Always render the same content on server and initial client render
  if (!isClient) {
    // Using suppressHydrationWarning to avoid hydration mismatch warnings
    return <span className={className} suppressHydrationWarning>{fallbackText}</span>;
  }
  
  // On client, render the actual formatted date
  const formattedDate = date 
    ? formatDate(date, format) 
    : formatDate(new Date(), format);
  
  return <span className={className} suppressHydrationWarning>{formattedDate}</span>;
}
