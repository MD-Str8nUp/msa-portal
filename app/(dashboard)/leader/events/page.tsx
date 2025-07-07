"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderNavigation } from "@/components/navigation/LeaderNavigation";
import { mockEventService, mockAuthService } from "@/lib/mock/data";
import { Button } from "@/components/ui/Button";
import { RefreshCcw, Calendar, Info, CheckCircle } from "lucide-react";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import { useSocketContext } from "@/lib/contexts/SocketContext";

export default function LeaderEventsPage() {
  // Get current user
  const currentUser = mockAuthService.getCurrentUser();
  const leaderId = currentUser?.id || "user-2"; // Default to user-2 as the leader
  
  // Get socket context for events
  const { events: socketEvents, isConnected, updateEventRSVP } = useSocketContext();
  
  // State for events
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    type: 'meeting'
  });
  
  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          // Fallback to mock data
          setEvents(mockEventService.getEvents());
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to mock data
        setEvents(mockEventService.getEvents());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Combine events from socket and API
  const combinedEvents = [...(socketEvents || []), ...events];
  
  // Remove duplicates
  const uniqueEvents = combinedEvents.filter((event, index, self) => 
    index === self.findIndex((e) => e.id === event.id)
  );
  
  // Sort events by date
  const upcomingEvents = uniqueEvents
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  const pastEvents = uniqueEvents
    .filter(event => new Date(event.endDate) < new Date())
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
    .slice(0, 3); // Show only the 3 most recent past events
  
  // Function to refresh events
  const refreshEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle submitting attendance
  const submitAttendance = (eventId: string) => {
    updateEventRSVP({
      scoutId: "scout-1", // This would need to be adjusted
      userId: leaderId,
      eventId,
      groupId: "group-1", // This would need to be adjusted
      status: "completed",
    });
  };

  // Handle creating new event
  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.startDate || !newEvent.endDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    const event = {
      id: `event-${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description,
      location: newEvent.location,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      type: newEvent.type,
      createdBy: leaderId,
      createdAt: new Date().toISOString()
    };
    
    setEvents(prev => [...prev, event]);
    setShowCreateModal(false);
    setNewEvent({
      title: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      type: 'meeting'
    });
  };
  
  return (
    <DashboardLayout 
      navigation={leaderNavigation} 
      pageTitle="Events" 
      userRole="leader"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Events</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={refreshEvents} 
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
              <span>{isLoading ? "Loading..." : "Refresh"}</span>
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)} 
              className="flex items-center space-x-2"
            >
              <Calendar size={16} className="mr-2" />
              Create Event
            </Button>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        
        {/* Events List */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-lg font-medium text-gray-700">Loading events...</p>
              </div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <Card key={event.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle>{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">
                      Date: <DateTimeDisplay date={event.startDate} format="MMM dd, yyyy" />
                    </span>
                    <span className="text-sm font-medium">
                      Time: <DateTimeDisplay date={event.startDate} format="h:mm a" /> - <DateTimeDisplay date={event.endDate} format="h:mm a" />
                    </span>
                    <span className="text-sm font-medium">Location: {event.location}</span>
                    <p className="text-sm mt-2">{event.description}</p>
                  </div>
                </CardContent>
                <div className="p-4 pt-0 flex space-x-2">
                  <Button className="flex-1 flex items-center justify-center">
                    <Info size={16} className="mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" className="flex-1">File Report</Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">
              No upcoming events are currently scheduled.
            </p>
          )}
        </div>

        {/* Past Events Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Past Events</h2>
          <div className="grid grid-cols-1 gap-4">
            {pastEvents.length > 0 ? (
              pastEvents.map(event => (
                <Card key={event.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle>{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium">
                        Date: <DateTimeDisplay date={event.startDate} format="MMM dd, yyyy" />
                      </span>
                      <span className="text-sm font-medium">
                        Location: {event.location}
                      </span>
                      <p className="text-sm mt-2">{event.description}</p>
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0 flex space-x-2">
                    <Button variant="outline" className="flex-1 flex items-center justify-center">
                      <Info size={16} className="mr-2" />
                      View Details
                    </Button>
                    <Button 
                      className="flex-1 flex items-center justify-center"
                      onClick={() => submitAttendance(event.id)}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Submit Attendance
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No past events found.
              </p>
            )}
          </div>
        </div>
        
        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create New Event</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                    placeholder="Enter event title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                    rows={3}
                    placeholder="Enter event description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                    placeholder="Enter event location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  >
                    <option value="meeting">Group Meeting</option>
                    <option value="activity">Activity</option>
                    <option value="camp">Camp</option>
                    <option value="service">Service Project</option>
                    <option value="training">Training</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateEvent}
                  className="bg-msa-sage hover:bg-msa-sage/90 text-white"
                >
                  Create Event
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
