"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const mobileButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 select-none",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500",
        secondary: "bg-gray-100 text-gray-900 shadow-md hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-500",
        destructive: "bg-red-600 text-white shadow-md hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500",
        outline: "border-2 border-gray-300 bg-transparent shadow-sm hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-500",
        ghost: "hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-500",
        link: "text-blue-600 underline-offset-4 hover:underline active:text-blue-800",
      },
      size: {
        default: "min-h-[44px] px-6 py-3",
        sm: "min-h-[40px] px-4 py-2 text-sm",
        lg: "min-h-[52px] px-8 py-4 text-lg",
        xl: "min-h-[60px] px-10 py-5 text-xl",
        icon: "h-[44px] w-[44px]",
        iconLg: "h-[52px] w-[52px]",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mobileButtonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hapticFeedback?: boolean;
}

const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    isLoading, 
    leftIcon,
    rightIcon,
    hapticFeedback = true,
    children, 
    onClick,
    ...props 
  }, ref) => {
    
    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback on mobile devices
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
      
      onClick?.(e);
    }, [onClick, hapticFeedback]);
    
    return (
      <button
        className={cn(mobileButtonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        onClick={handleClick}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2 flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

MobileButton.displayName = "MobileButton";

export { MobileButton, mobileButtonVariants };