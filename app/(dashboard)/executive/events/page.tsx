"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import { ALL_GROUPS } from "@/lib/constants/groups";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";

export default function ExecutiveEventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newEventForm, setNewEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    endDate: "",
    endTime: "",
    groupId: "",
    requiresPermissionSlip: false
  });
  const [editEventForm, setEditEventForm] = useState({
    id: "",
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    groupId: "",
    requiresPermissionSlip: false
  });

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Not authenticated');
        return;
      }
      
      const response = await fetch(`/api/executive/events?status=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      setEvents(data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Handle create event
  const handleCreateEvent = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      // Combine date and time
      const startDate = new Date(`${newEventForm.date}T${newEventForm.time}`);
      const endDate = new Date(`${newEventForm.endDate}T${newEventForm.endTime}`);
      
      const response = await fetch('/api/executive/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newEventForm.title,
          description: newEventForm.description,
          location: newEventForm.location,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupId: newEventForm.groupId || null,
          requiresPermissionSlip: newEventForm.requiresPermissionSlip,
          notifyParents: true,
          notifyLeaders: true
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }
      
      setSuccessMessage(data.message || 'Event created successfully');
      setNewEventForm({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        endDate: '',
        endTime: '',
        groupId: '',
        requiresPermissionSlip: false
      });
      setIsCreateEventModalOpen(false);
      fetchEvents();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit event
  const handleEditEvent = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/executive/events', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editEventForm),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update event');
      }
      
      setSuccessMessage(data.message || 'Event updated successfully');
      setIsEditModalOpen(false);
      fetchEvents();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating event:', error);
      setError(error instanceof Error ? error.message : 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel event
  const handleCancelEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to cancel "${eventTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(`/api/executive/events?id=${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel event');
      }
      
      setSuccessMessage(data.message || 'Event cancelled successfully');
      fetchEvents();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error cancelling event:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel event');
    }
  };

  // Open edit modal
  const openEditModal = (event: any) => {
    setSelectedEvent(event);
    setEditEventForm({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      groupId: event.group?.id || '',
      requiresPermissionSlip: event.requiresPermissionSlip
    });
    setIsEditModalOpen(true);
  };

  // Mock events data removed - now using API data

  return (
    <DashboardLayout 
      navigation={executiveNavigation} 
      pageTitle="Events" 
      userRole="executive"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Organization Events</h2>
            <p className="text-gray-500">Manage and schedule events for all scout groups</p>
          </div>
          <Button className="flex items-center space-x-2" onClick={() => setIsCreateEventModalOpen(true)}>
            <span>Create Event</span>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/3">
            <Input placeholder="Search events..." />
          </div>
          <div className="flex border rounded-lg overflow-hidden">
            <button 
              className={`px-4 py-2 ${activeTab === "upcoming" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === "past" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
              onClick={() => setActiveTab("past")}
            >
              Past
            </button>
          </div>
        </div>
        
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Events List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-500">Loading events...</p>
            </div>
          ) : (
            <>
              {events.map(event => (
            <Card key={event.id}>
              <CardContent className="p-5 flex flex-col md:flex-row justify-between">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-20">Start:</span>
                      <span className="text-sm">
                        <DateTimeDisplay date={new Date(event.startDate)} format="full" />
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-20">End:</span>
                      <span className="text-sm">
                        <DateTimeDisplay date={new Date(event.endDate)} format="full" />
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-20">Location:</span>
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-20">Group:</span>
                      <span className="text-sm">{event.group?.name || 'All Academy'}</span>
                    </div>
                    {event.requiresPermissionSlip && (
                      <div className="flex items-start">
                        <span className="text-sm font-medium w-20">Note:</span>
                        <span className="text-sm text-red-600">Permission slip required</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col gap-2 mt-4 md:mt-0 justify-end">
                  <Button className="text-sm" onClick={() => openEditModal(event)}>Edit</Button>
                  {event.status === "upcoming" && (
                    <Button 
                      className="text-sm bg-red-500 hover:bg-red-600"
                      onClick={() => handleCancelEvent(event.id, event.title)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
              ))}
              {events.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No {activeTab} events found
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      <Dialog open={isCreateEventModalOpen} onOpenChange={setIsCreateEventModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newEventForm.title}
                onChange={(e) => setNewEventForm({...newEventForm, title: e.target.value})}
                className="col-span-3"
                placeholder="Event title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <textarea
                id="description"
                value={newEventForm.description}
                onChange={(e) => setNewEventForm({...newEventForm, description: e.target.value})}
                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Event description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={newEventForm.date}
                onChange={(e) => setNewEventForm({...newEventForm, date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={newEventForm.time}
                onChange={(e) => setNewEventForm({...newEventForm, time: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={newEventForm.location}
                onChange={(e) => setNewEventForm({...newEventForm, location: e.target.value})}
                className="col-span-3"
                placeholder="Event location"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={newEventForm.endDate}
                onChange={(e) => setNewEventForm({...newEventForm, endDate: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={newEventForm.endTime}
                onChange={(e) => setNewEventForm({...newEventForm, endTime: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group" className="text-right">
                Group
              </Label>
              <select
                id="group"
                value={newEventForm.groupId}
                onChange={(e) => setNewEventForm({...newEventForm, groupId: e.target.value})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">All Academy</option>
                {ALL_GROUPS.map(group => (
                  <option key={group.name} value={group.name}>{group.name} (Ages {group.ageRange})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Permission Slip
              </Label>
              <div className="col-span-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newEventForm.requiresPermissionSlip}
                    onChange={(e) => setNewEventForm({...newEventForm, requiresPermissionSlip: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <span>Requires permission slip</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateEventModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateEvent}
              disabled={isSubmitting || !newEventForm.title || !newEventForm.date || !newEventForm.time || !newEventForm.endDate || !newEventForm.endTime}
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                value={editEventForm.title}
                onChange={(e) => setEditEventForm({...editEventForm, title: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <textarea
                id="edit-description"
                value={editEventForm.description}
                onChange={(e) => setEditEventForm({...editEventForm, description: e.target.value})}
                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">
                Location
              </Label>
              <Input
                id="edit-location"
                value={editEventForm.location}
                onChange={(e) => setEditEventForm({...editEventForm, location: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-group" className="text-right">
                Group
              </Label>
              <select
                id="edit-group"
                value={editEventForm.groupId}
                onChange={(e) => setEditEventForm({...editEventForm, groupId: e.target.value})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">All Academy</option>
                {ALL_GROUPS.map(group => (
                  <option key={group.name} value={group.name}>{group.name} (Ages {group.ageRange})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Permission Slip
              </Label>
              <div className="col-span-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editEventForm.requiresPermissionSlip}
                    onChange={(e) => setEditEventForm({...editEventForm, requiresPermissionSlip: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <span>Requires permission slip</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditEvent}
              disabled={isSubmitting || !editEventForm.title}
            >
              {isSubmitting ? 'Updating...' : 'Update Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
