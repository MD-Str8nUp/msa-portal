"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { parentNavigation } from "@/components/navigation/ParentNavigation";
import { mockEventService, mockScoutService } from "@/lib/mock/data";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Modal";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Users, 
  Check, 
  X, 
  FileText, 
  ChevronRight,
  AlertCircle,
  FileCheck
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import EventDetailModal from "@/components/events/EventDetailModal";
import RsvpCard from "@/components/events/RsvpCard";

export default function ParentEventsPage() {
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [signatureValue, setSignatureValue] = useState("");
  const [permissionSigned, setPermissionSigned] = useState<Record<string, boolean>>({});
  const [rsvpStatus, setRsvpStatus] = useState<Record<string, 'attending' | 'not-attending' | 'pending'>>({});
  
  // In a real app, this would come from auth context/session
  const parentId = "user-1";
  
  // Get parent's scouts
  const myScouts = mockScoutService.getScouts(parentId);
    // Get upcoming events
  const allEvents = mockEventService.getEvents();
  const upcomingEvents = allEvents.filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
  // State for event detail modal
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventDetailModalOpen, setEventDetailModalOpen] = useState(false);

  // Get closest upcoming event
  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  
  // Function to handle RSVP
  const handleRsvp = (eventId: string, status: 'attending' | 'not-attending') => {
    setRsvpStatus((prev) => ({
      ...prev,
      [eventId]: status
    }));
    
    // If this event requires permission slip and the user is attending
    const event = allEvents.find(e => e.id === eventId);
    if (event?.requiresPermissionSlip && status === 'attending' && !permissionSigned[eventId]) {
      setActiveEventId(eventId);
      setPermissionModalOpen(true);
    }
  };
  
  // Function to handle permission slip signing
  const handleSignPermission = (eventId: string) => {
    if (!signatureValue.trim()) {
      alert("Please enter your full name to sign the permission slip.");
      return;
    }
    
    setPermissionSigned((prev) => ({
      ...prev,
      [eventId]: true
    }));
    setPermissionModalOpen(false);
    setSignatureValue("");
  };
  
  return (
    <DashboardLayout 
      navigation={parentNavigation} 
      pageTitle="Events" 
      userRole="parent"
    >
      <div className="space-y-8">
        {/* Next Event Spotlight */}
        {nextEvent && (
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="bg-blue-600 p-4 text-white">
              <h3 className="text-xl font-semibold">Next Upcoming Event</h3>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{nextEvent.title}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-4">{nextEvent.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-5 w-5 text-blue-500" />
                      <span><DateTimeDisplay date={nextEvent.startDate} format="EEEE, MMMM d, yyyy" /></span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-blue-500" />
                      <span><DateTimeDisplay date={nextEvent.startDate} format="h:mm a" /> - <DateTimeDisplay date={nextEvent.endDate} format="h:mm a" /></span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                      <span>{nextEvent.location}</span>
                    </div>
                    {nextEvent.groupName && (
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-blue-500" />
                        <span>{nextEvent.groupName}</span>
                      </div>
                    )}
                  </div>
                  
                  {nextEvent.requiresPermissionSlip && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3 flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-700 font-medium">Permission slip required</p>
                        <p className="text-xs text-yellow-600">This event requires a signed permission slip</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">RSVP Status</h3>
                  
                  <div className="space-y-4">
                    {myScouts.map(scout => (
                      <div key={scout.id} className="bg-white p-3 rounded border">
                        <p className="font-medium">{scout.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            {rsvpStatus[`${nextEvent.id}-${scout.id}`] === 'attending' ? (
                              <span className="inline-flex items-center text-sm text-green-600">
                                <Check className="h-4 w-4 mr-1" /> Attending
                              </span>
                            ) : rsvpStatus[`${nextEvent.id}-${scout.id}`] === 'not-attending' ? (
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
                              variant={rsvpStatus[`${nextEvent.id}-${scout.id}`] === 'attending' ? "default" : "outline"}
                              className="text-xs h-8"
                              onClick={() => handleRsvp(`${nextEvent.id}-${scout.id}`, 'attending')}
                            >
                              <Check className="h-3 w-3 mr-1" /> Yes
                            </Button>
                            <Button 
                              size="sm"
                              variant={rsvpStatus[`${nextEvent.id}-${scout.id}`] === 'not-attending' ? "default" : "outline"}
                              className="text-xs h-8"
                              onClick={() => handleRsvp(`${nextEvent.id}-${scout.id}`, 'not-attending')}
                            >
                              <X className="h-3 w-3 mr-1" /> No
                            </Button>
                          </div>
                        </div>
                        
                        {nextEvent.requiresPermissionSlip && rsvpStatus[`${nextEvent.id}-${scout.id}`] === 'attending' && (
                          <div className="mt-2 pt-2 border-t flex justify-between items-center">
                            <span className="text-xs text-gray-600">Permission Slip:</span>
                            {permissionSigned[`${nextEvent.id}-${scout.id}`] ? (
                              <span className="text-xs text-green-600 flex items-center">
                                <FileCheck className="h-3 w-3 mr-1" />
                                Signed
                              </span>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs h-7 px-2"
                                onClick={() => {
                                  setActiveEventId(`${nextEvent.id}-${scout.id}`);
                                  setPermissionModalOpen(true);
                                }}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Sign
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tabs for Upcoming and Past Events */}
        <div className="bg-white rounded-lg shadow">
          <Tabs defaultValue="upcoming">
            <TabsList className="border-b w-full">
              <TabsTrigger value="upcoming" className="flex-1">Upcoming Events</TabsTrigger>
              <TabsTrigger value="past" className="flex-1">Past Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => (
                    <Card key={event.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between">
                          <CardTitle>{event.title}</CardTitle>
                          {event.groupName && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {event.groupName}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              <DateTimeDisplay date={event.startDate} format="EEEE, MMMM d, yyyy" />
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              <DateTimeDisplay date={event.startDate} format="h:mm a" /> - <DateTimeDisplay date={event.endDate} format="h:mm a" />
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                          <p className="text-sm mt-2">{event.description}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4 bg-gray-50">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            {event.requiresPermissionSlip && (
                              <span className="text-xs text-yellow-600 flex items-center mr-3">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Permission required
                              </span>
                            )}
                            <span className="text-xs text-gray-500">{event.attendees} attendees</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="flex items-center"
                            onClick={() => {
                              setSelectedEvent(event);
                              setEventDetailModalOpen(true);
                            }}
                          >
                            View Details 
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No upcoming events are currently scheduled.
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="past" className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {allEvents
                  .filter(event => new Date(event.endDate) < new Date())
                  .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                  .map(event => (
                    <Card key={event.id} className="overflow-hidden opacity-75">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between">
                          <CardTitle>{event.title}</CardTitle>
                          {event.groupName && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {event.groupName}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              <DateTimeDisplay date={event.startDate} format="EEEE, MMMM d, yyyy" />
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4 bg-gray-50">
                        <div className="flex justify-end w-full">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedEvent(event);
                              setEventDetailModalOpen(true);
                            }}
                          >
                            View Summary
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                {allEvents.filter(event => new Date(event.endDate) < new Date()).length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No past events found.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
          {/* Permission Slip Modal */}
        <Dialog open={permissionModalOpen} onOpenChange={() => setPermissionModalOpen(false)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Permission Slip</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Scout Permission Form</h3>
                <p className="text-gray-600 text-sm">
                  I give permission for my scout to attend the event described below. I understand the activities involved and agree to the terms outlined.
                </p>
              </div>
              
              <div className="mb-6 border rounded p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Event Details</h4>
                {activeEventId && (
                  <div className="text-sm space-y-2">
                    <p><strong>Event:</strong> {nextEvent?.title}</p>
                    <p><strong>Date:</strong> <DateTimeDisplay date={nextEvent?.startDate} format="MMMM d, yyyy" fallbackText="" /></p>
                    <p><strong>Location:</strong> {nextEvent?.location}</p>
                    <p><strong>Activities:</strong> Field activities, team building exercises, educational workshops.</p>
                    <p><strong>Requirements:</strong> Standard scout uniform, appropriate footwear, packed lunch.</p>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Digital Signature</h4>
                <p className="text-sm text-gray-600 mb-2">Please type your full name below to sign this permission slip:</p>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Your Full Name"
                  value={signatureValue}
                  onChange={(e) => setSignatureValue(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  By signing, I confirm I am the parent/guardian and authorize my scout's participation.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setPermissionModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => activeEventId && handleSignPermission(activeEventId)}>
                  Sign & Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Event Detail Modal */}
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            isOpen={eventDetailModalOpen}
            onClose={() => setEventDetailModalOpen(false)}
            scouts={myScouts}
            onRsvp={handleRsvp}
            rsvpStatus={rsvpStatus}
            permissionSigned={permissionSigned}
            onSignPermission={(eventId, scoutId) => {
              setActiveEventId(`${eventId}-${scoutId}`);
              setPermissionModalOpen(true);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
