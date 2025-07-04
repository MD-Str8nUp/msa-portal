"use client";

import React, { memo, useCallback } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Scout } from "@/types";

interface ChildSelectorProps {
  scouts: Scout[];
  selectedScoutId: string | null;
  onChangeAction: (scoutId: string) => void;
}

// Simplified ChildSelector that doesn't use complex ref patterns
function ChildSelector({ scouts, selectedScoutId, onChangeAction }: ChildSelectorProps) {
  // Use callback to ensure stable handler
  const handleValueChange = useCallback((value: string) => {
    onChangeAction(value);
  }, [onChangeAction]);

  return (
    <div className="max-w-xs">
      {/* Use native Radix UI components directly to avoid ref forwarding issues */}
      <SelectPrimitive.Root value={selectedScoutId || ""} onValueChange={handleValueChange}>
        <SelectPrimitive.Trigger 
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
          )}
        >
          <SelectPrimitive.Value placeholder="Select Child" />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-white text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            position="popper"
          >
            <SelectPrimitive.Viewport className="p-1">
              {scouts.map((scout) => (
                <SelectPrimitive.Item
                  key={scout.id}
                  value={scout.id}
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <SelectPrimitive.ItemText>{scout.name}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ChildSelector);
