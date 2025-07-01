"use client";

import React, { useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, MapPin, Users, AlertTriangle } from "lucide-react";
import { Event } from "@/types";
import RsvpCard from "./RsvpCard";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

interface EventDetailModalProps {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  scouts?: {
    id: string;
    name: string;
  }[];
}

export default function EventDetailModal({
  open,
  onClose,
  event,
  scouts = []
}: EventDetailModalProps) {
  if (!event) {
    return null;
  }
  
  // Use callback to prevent recreating handler on each render
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-gray-600">{event.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                <span><DateTimeDisplay date={event.startDate} format="date" /></span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                <span>
                  <DateTimeDisplay date={event.startDate} format="time" /> - <DateTimeDisplay date={event.endDate} format="time" />
                </span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                <span>{event.location}</span>
              </div>
              
              {event.groupName && (
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{event.groupName}</span>
                </div>
              )}
            </div>
            
            <div>
              {event.requiresPermissionSlip && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 flex items-start mb-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">Permission slip required</p>
                    <p className="text-xs text-yellow-600">
                      A signed permission slip is required for attendance
                    </p>
                  </div>
                </div>
              )}
              
              {event.attendees !== undefined && (
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Attendance</span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {event.attendees} attendees
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Registration status will be updated 48 hours before the event.
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* RSVP Section */}
          {scouts.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">RSVP for Your Scouts</h3>
              <div className="space-y-3">
                {scouts.map(scout => (
                  <RsvpCard
                    key={scout.id}
                    eventId={event.id}
                    scoutId={scout.id}
                    scoutName={scout.name}
                    eventDetails={{
                      title: event.title,
                      date: event.startDate,
                      location: event.location,
                      description: event.description
                    }}
                    requiresPermissionSlip={event.requiresPermissionSlip}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button 
            onClick={() => {
              // In a real app, this would do something like download event details
              onClose();
            }}
          >
            Add to Calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
