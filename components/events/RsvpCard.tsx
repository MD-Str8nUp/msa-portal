"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Check, X, FileText, FileCheck } from "lucide-react";
import PermissionSlipModal from "./PermissionSlipModal";

interface RsvpCardProps {
  eventId: string;
  scoutId: string;
  scoutName: string;
  eventDetails: {
    title: string;
    date: string;
    location: string;
    description?: string;
  };
  requiresPermissionSlip?: boolean;
}

export default function RsvpCard({ 
  eventId, 
  scoutId, 
  scoutName, 
  eventDetails, 
  requiresPermissionSlip = false 
}: RsvpCardProps) {
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'not-attending' | 'pending'>('pending');
  const [permissionSigned, setPermissionSigned] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  
  const handleRsvp = (status: 'attending' | 'not-attending') => {
    setRsvpStatus(status);
    
    // If attending and permission slip is required but not signed
    if (status === 'attending' && requiresPermissionSlip && !permissionSigned) {
      setPermissionModalOpen(true);
    }
    
    // In a real app, we would send this to the API
    // api.updateRsvp(eventId, scoutId, status);
  };
  
  const handleSignPermission = (signature: string) => {
    // In a real app, we would send this to the API
    // api.signPermissionSlip(eventId, scoutId, signature);
    setPermissionSigned(true);
    setPermissionModalOpen(false);
  };
  
  return (
    <div className="bg-white p-3 rounded border">
      <p className="font-medium">{scoutName}</p>
      <div className="flex items-center justify-between mt-2">
        <div>
          {rsvpStatus === 'attending' ? (
            <span className="inline-flex items-center text-sm text-green-600">
              <Check className="h-4 w-4 mr-1" /> Attending
            </span>
          ) : rsvpStatus === 'not-attending' ? (
            <span className="inline-flex items-center text-sm text-red-600">
              <X className="h-4 w-4 mr-1" /> Not attending
            </span>
          ) : (
            <span className="text-sm text-gray-500">No response yet</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm"
            variant={rsvpStatus === 'attending' ? "default" : "outline"}
            className="text-xs h-8"
            onClick={() => handleRsvp('attending')}
          >
            <Check className="h-3 w-3 mr-1" /> Yes
          </Button>
          <Button 
            size="sm"
            variant={rsvpStatus === 'not-attending' ? "default" : "outline"}
            className="text-xs h-8"
            onClick={() => handleRsvp('not-attending')}
          >
            <X className="h-3 w-3 mr-1" /> No
          </Button>
        </div>
      </div>
      
      {requiresPermissionSlip && rsvpStatus === 'attending' && (
        <div className="mt-2 pt-2 border-t flex justify-between items-center">
          <span className="text-xs text-gray-600">Permission Slip:</span>
          {permissionSigned ? (
            <span className="text-xs text-green-600 flex items-center">
              <FileCheck className="h-3 w-3 mr-1" />
              Signed
            </span>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs h-7 px-2"
              onClick={() => setPermissionModalOpen(true)}
            >
              <FileText className="h-3 w-3 mr-1" />
              Sign
            </Button>
          )}
        </div>
      )}
      
      <PermissionSlipModal
        open={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        onSign={handleSignPermission}
        eventId={eventId}
        eventDetails={eventDetails}
      />
    </div>
  );
}
