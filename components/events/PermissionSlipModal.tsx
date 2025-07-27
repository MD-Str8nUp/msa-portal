"use client";

import React, { useState, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

interface PermissionSlipModalProps {
  open: boolean;
  onClose: () => void;
  onSign: (signature: string) => void;
  eventId: string;
  eventDetails: {
    title: string;
    date: string;
    location: string;
    description?: string;
  };
}

export default function PermissionSlipModal({
  open,
  onClose,
  onSign,
  eventId,
  eventDetails
}: PermissionSlipModalProps) {
  const [signature, setSignature] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature.trim() || !agreeToTerms) {
      return;
    }
    
    onSign(signature);
    setSignature("");
    setAgreeToTerms(false);
  };
  
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  }, [onClose]);
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Permission Slip</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold mb-2">Scout Activity Permission</h3>
            <p className="text-gray-600 text-sm">
              I give permission for my scout to attend the event described below. I understand the nature of the activities involved and assume the risks inherent in such activities.
            </p>
          </div>
          
          <div className="bg-gray-50 border rounded p-4">
            <h4 className="font-medium mb-3">Event Details</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Event:</span> {eventDetails.title}</p>
              <p><span className="font-medium">Date:</span> <DateTimeDisplay date={eventDetails.date} format="date" /></p>
              <p><span className="font-medium">Location:</span> {eventDetails.location}</p>
              {eventDetails.description && (
                <p><span className="font-medium">Description:</span> {eventDetails.description}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Terms & Conditions</h4>
            <div className="text-sm space-y-2 text-gray-600">
              <p>
                By signing this permission slip, I acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>My scout is in good health and able to participate in all activities.</li>
                <li>I have provided all necessary medical information to the scout leaders.</li>
                <li>I authorize emergency medical treatment if necessary.</li>
                <li>I release the scout organization from liability for accidents or injuries.</li>
              </ul>
            </div>
            
            <div className="flex items-start space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="agree-terms" 
                className="mt-1"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                required
              />
              <label htmlFor="agree-terms" className="text-sm">
                I have read, understand, and agree to the terms outlined above.
              </label>
            </div>
          </div>
          
          <div>
            <label className="block font-medium mb-2">Digital Signature</label>
            <p className="text-sm text-gray-600 mb-2">
              Type your full legal name below as your digital signature:
            </p>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Your Full Name"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Your digital signature is legally binding.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!signature.trim() || !agreeToTerms}
            >
              Sign & Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
