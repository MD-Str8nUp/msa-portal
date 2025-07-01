'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Scout } from '@/types';

interface ScoutDetailModalProps {
  open: boolean;
  onClose: () => void;
  scout: Scout | null;
}

export default function ScoutDetailModal({ open, onClose, scout }: ScoutDetailModalProps) {
  // Add mounted state for hydration safety
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state once component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use callback to prevent recreating handler on each render
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  }, [onClose]);

  // If no scout is selected, render nothing
  if (!scout) return null;
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{scout.name}&apos;s Profile</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="font-medium">Name:</span> {scout.name}</div>
              <div><span className="font-medium">Age:</span> {scout.age}</div>
              <div><span className="font-medium">Group:</span> {scout.groupName}</div>
              <div><span className="font-medium">Rank:</span> {scout.rank}</div>
              {scout.joinedDate && (
                <div suppressHydrationWarning>
                  <span className="font-medium">Joined:</span>{" "}
                  {mounted 
                    ? formatDate(scout.joinedDate, "MMM dd, yyyy") 
                    : (typeof scout.joinedDate === 'string' ? scout.joinedDate : 'Loading...')}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
