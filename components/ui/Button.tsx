"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] font-primary",
  {
    variants: {
      variant: {
        // Standard variants (updated with MSA colors)
        default: "bg-msa-sage text-msa-soft-white shadow-sm hover:bg-msa-sage/90 hover:shadow-md border border-msa-sage/20",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md",
        outline:
          "border border-msa-sage/30 bg-transparent shadow-sm hover:bg-msa-light-sage/20 hover:text-msa-charcoal hover:border-msa-sage hover:shadow-md text-msa-charcoal",
        secondary:
          "bg-msa-light-sage text-msa-charcoal shadow-sm hover:bg-msa-light-sage/80 hover:shadow-md border border-msa-light-sage/30",
        ghost: "hover:bg-msa-light-sage/20 hover:text-msa-charcoal text-msa-charcoal/70",
        link: "text-msa-sage underline-offset-4 hover:underline hover:text-msa-forest",
        success: "bg-msa-forest text-msa-soft-white shadow-sm hover:bg-msa-forest/90 hover:shadow-md border border-msa-forest/20",
        warning: "bg-msa-golden text-msa-charcoal shadow-sm hover:bg-msa-golden/90 hover:shadow-md border border-msa-golden/20",
        
        // MSA-specific variants
        "msa-primary": "bg-msa-sage text-msa-soft-white shadow-sm hover:bg-msa-sage/90 hover:shadow-md border border-msa-sage/20 hover:border-msa-sage/40",
        "msa-accent": "bg-msa-golden text-msa-charcoal font-semibold shadow-md hover:bg-msa-golden/90 hover:shadow-lg border border-msa-golden/30 hover:border-msa-golden/60 hover:scale-[1.02]",
        "msa-forest": "bg-msa-forest text-msa-soft-white shadow-sm hover:bg-msa-forest/90 hover:shadow-md border border-msa-forest/20",
        "msa-outline": "border-2 border-msa-sage bg-transparent text-msa-sage hover:bg-msa-sage hover:text-msa-soft-white shadow-sm hover:shadow-md",
        "msa-teal": "bg-msa-teal text-msa-soft-white shadow-sm hover:bg-msa-teal/90 hover:shadow-md border border-msa-teal/20",
        "msa-warm": "bg-msa-brown text-msa-soft-white shadow-sm hover:bg-msa-brown/90 hover:shadow-md border border-msa-brown/20",
      },
      size: {
        default: "h-11 px-6 py-2 text-base min-w-[44px]", // Mobile-first: larger default
        sm: "h-9 px-4 text-sm min-w-[44px]",
        lg: "h-12 px-8 text-lg min-w-[48px]",
        icon: "h-11 w-11", // Touch-friendly icon buttons
        xs: "h-8 px-3 text-xs min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
