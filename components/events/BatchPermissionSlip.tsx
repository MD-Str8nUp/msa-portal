"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Check, 
  X, 
  Users, 
  Calendar,
  MapPin,
  AlertCircle,
  Download,
  CheckSquare,
  Square
} from "lucide-react";
import { MobileButton } from "@/components/ui/MobileButton";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

interface Scout {
  id: string;
  name: string;
  age: number;
  groupName: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  activities: string[];
  requirements: string[];
  emergencyInfo?: string;
}

interface BatchPermissionSlipProps {
  event: Event;
  scouts: Scout[];
  onSign: (scoutIds: string[], signature: string) => void;
  onCancel: () => void;
  signedScouts?: string[];
}

export default function BatchPermissionSlip({ 
  event, 
  scouts, 
  onSign, 
  onCancel,
  signedScouts = []
}: BatchPermissionSlipProps) {
  const [selectedScouts, setSelectedScouts] = useState<Set<string>>(new Set());
  const [signature, setSignature] = useState("");
  const [signatureDate] = useState(new Date().toISOString());
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);

  // Load saved signature from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("parentSignature");
    if (saved) {
      setSavedSignature(saved);
      setSignature(saved);
    }
  }, []);

  const availableScouts = scouts.filter(s => !signedScouts.includes(s.id));
  const allSelected = selectedScouts.size === availableScouts.length && availableScouts.length > 0;

  const toggleScout = (scoutId: string) => {
    const newSelected = new Set(selectedScouts);
    if (newSelected.has(scoutId)) {
      newSelected.delete(scoutId);
    } else {
      newSelected.add(scoutId);
    }
    setSelectedScouts(newSelected);
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedScouts(new Set());
    } else {
      setSelectedScouts(new Set(availableScouts.map(s => s.id)));
    }
  };

  const handleSign = () => {
    if (!signature.trim()) {
      alert("Please enter your full name to sign");
      return;
    }
    if (!agreedToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }
    if (selectedScouts.size === 0) {
      alert("Please select at least one scout");
      return;
    }

    // Save signature for future use
    localStorage.setItem("parentSignature", signature);
    
    onSign(Array.from(selectedScouts), signature);
  };

  const canSign = signature.trim() && agreedToTerms && selectedScouts.size > 0;

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">Permission Slip - Batch Signing</h2>
        <p className="text-sm text-gray-600 mt-1">Sign permission for multiple scouts at once</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Event Details */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Event Details
          </h3>
          <div className="space-y-2 text-sm">
            <p><strong>Event:</strong> {event.title}</p>
            <p><strong>Date:</strong> <DateTimeDisplay date={event.startDate} format="EEEE, MMMM d, yyyy" /></p>
            <p><strong>Time:</strong> <DateTimeDisplay date={event.startDate} format="h:mm a" /> - <DateTimeDisplay date={event.endDate} format="h:mm a" /></p>
            <p><strong>Location:</strong> {event.location}</p>
          </div>
        </div>

        {/* Scout Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Scouts
            </h3>
            {availableScouts.length > 1 && (
              <button
                onClick={toggleAll}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                Select All
              </button>
            )}
          </div>

          {availableScouts.length === 0 ? (
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800">All scouts have signed permission slips for this event!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableScouts.map((scout) => (
                <label
                  key={scout.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedScouts.has(scout.id) 
                      ? "bg-blue-50 border-blue-300" 
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedScouts.has(scout.id)}
                    onChange={() => toggleScout(scout.id)}
                    className="rounded text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{scout.name}</p>
                    <p className="text-sm text-gray-600">{scout.groupName} • Age {scout.age}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Already signed scouts */}
          {signedScouts.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Already signed:</p>
              <div className="space-y-1">
                {scouts.filter(s => signedScouts.includes(s.id)).map((scout) => (
                  <div key={scout.id} className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="h-4 w-4 text-green-600" />
                    {scout.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activities & Requirements */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Activities Include:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {event.activities.map((activity, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  {activity}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Requirements:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {event.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Emergency Information */}
        {event.emergencyInfo && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Important Information
            </h4>
            <p className="text-sm text-gray-700">{event.emergencyInfo}</p>
          </div>
        )}

        {/* Terms and Signature */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Parent/Guardian Agreement</h4>
            <p className="text-sm text-gray-600 mb-4">
              By signing below, I acknowledge that I have read and understood the event details, 
              activities, and requirements. I give permission for my scout(s) to participate in 
              this event and understand that they will be supervised by qualified scout leaders.
            </p>
            
            <label className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="rounded text-blue-600 mt-0.5"
              />
              <span className="text-sm">
                I agree to the terms and conditions and confirm that all emergency contact 
                information for my scout(s) is up to date.
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Digital Signature (Type your full name)
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Your Full Name"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {savedSignature && signature === savedSignature && (
              <p className="text-xs text-gray-500 mt-1">Using saved signature</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Date: <DateTimeDisplay date={signatureDate} format="MMMM d, yyyy 'at' h:mm a" />
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium">
              {selectedScouts.size} of {availableScouts.length} scouts selected
            </p>
            {selectedScouts.size > 0 && (
              <p className="text-xs text-gray-500">
                Signing for: {Array.from(selectedScouts).map(id => 
                  scouts.find(s => s.id === id)?.name
                ).join(", ")}
              </p>
            )}
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
        
        <div className="flex gap-3">
          <MobileButton
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </MobileButton>
          <MobileButton
            onClick={handleSign}
            disabled={!canSign}
            className="flex-1"
            leftIcon={<FileText className="h-5 w-5" />}
          >
            Sign & Submit
          </MobileButton>
        </div>
      </div>
    </div>
  );
}