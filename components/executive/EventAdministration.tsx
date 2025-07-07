"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  academy: string;
  groupId?: string;
  groupName?: string;
  type: 'regular' | 'special' | 'organization-wide' | 'islamic' | 'outdoor' | 'educational';
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled';
  maxAttendees?: number;
  currentAttendees: number;
  requiresPermission: boolean;
  cost?: number;
  organizer: string;
  organizerId: string;
  createdDate: string;
  lastModified: string;
  tags: string[];
  resources: string[];
  requirements: string[];
  islamicFocus?: string;
}

interface EventTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  defaultDuration: number; // in hours
  defaultRequirements: string[];
  islamicElements: string[];
}

interface EventAdministrationProps {
  className?: string;
}

const EventAdministration: React.FC<EventAdministrationProps> = ({ className = "" }) => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAcademy, setSelectedAcademy] = useState<string>('all');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '16:00',
    endTime: '18:00',
    location: '',
    academy: 'Main Academy',
    groupId: '',
    type: 'regular',
    maxAttendees: '',
    requiresPermission: false,
    cost: '',
    tags: '',
    requirements: '',
    islamicFocus: ''
  });

  // Mock events data
  const [events, setEvents] = useState<Event[]>([
    {
      id: 'event-1',
      title: 'Ramadan Iftar Gathering',
      description: 'Community iftar gathering with Islamic stories and Quran recitation for all academy families',
      startDate: '2025-03-15',
      endDate: '2025-03-15',
      startTime: '18:30',
      endTime: '21:00',
      location: 'Main Academy Hall',
      academy: 'Main Academy',
      type: 'islamic',
      status: 'published',
      maxAttendees: 150,
      currentAttendees: 89,
      requiresPermission: false,
      cost: 0,
      organizer: 'Aisha Khan',
      organizerId: 'executive-1',
      createdDate: '2025-01-10',
      lastModified: '2025-01-18',
      tags: ['ramadan', 'iftar', 'community', 'islamic'],
      resources: ['Quran reciters', 'Food donations', 'Prayer mats'],
      requirements: ['Bring your own water bottle', 'Modest Islamic dress'],
      islamicFocus: 'Building community bonds during the blessed month of Ramadan'
    },
    {
      id: 'event-2',
      title: 'Outdoor Adventure Camp',
      description: 'Three-day outdoor camping experience with hiking, team building, and survival skills training',
      startDate: '2025-02-20',
      endDate: '2025-02-22',
      startTime: '09:00',
      endTime: '16:00',
      location: 'Pine Ridge Campground',
      academy: 'Main Academy',
      groupId: 'group-1',
      groupName: 'Eagle Scouts',
      type: 'outdoor',
      status: 'published',
      maxAttendees: 25,
      currentAttendees: 18,
      requiresPermission: true,
      cost: 75,
      organizer: 'Ahmad Rahman',
      organizerId: 'leader-1',
      createdDate: '2025-01-05',
      lastModified: '2025-01-15',
      tags: ['camping', 'outdoor', 'adventure', 'skills'],
      resources: ['Camping gear', 'First aid kit', 'Cooking equipment'],
      requirements: ['Medical clearance', 'Camping equipment list', 'Permission slip'],
      islamicFocus: 'Appreciating Allah\'s creation through nature exploration'
    },
    {
      id: 'event-3',
      title: 'Islamic History Workshop',
      description: 'Interactive workshop exploring Islamic history and the stories of the Sahaba (companions of Prophet Muhammad)',
      startDate: '2025-02-10',
      endDate: '2025-02-10',
      startTime: '14:00',
      endTime: '17:00',
      location: 'North Branch Learning Center',
      academy: 'North Branch',
      groupId: 'group-2',
      groupName: 'Wolf Pack',
      type: 'educational',
      status: 'active',
      maxAttendees: 30,
      currentAttendees: 24,
      requiresPermission: false,
      cost: 0,
      organizer: 'Fatima Malik',
      organizerId: 'leader-2',
      createdDate: '2025-01-08',
      lastModified: '2025-01-12',
      tags: ['islamic', 'history', 'education', 'sahaba'],
      resources: ['Islamic history books', 'Presentation materials', 'Activity sheets'],
      requirements: ['Notebook and pen', 'Interest in Islamic history'],
      islamicFocus: 'Learning from the noble examples of the Sahaba and early Islamic community'
    },
    {
      id: 'event-4',
      title: 'First Aid & Safety Training',
      description: 'Comprehensive first aid training with certification opportunity for scouts and leaders',
      startDate: '2025-02-05',
      endDate: '2025-02-05',
      startTime: '10:00',
      endTime: '15:00',
      location: 'South Branch Training Room',
      academy: 'South Branch',
      type: 'educational',
      status: 'completed',
      maxAttendees: 20,
      currentAttendees: 20,
      requiresPermission: false,
      cost: 25,
      organizer: 'Hassan Omar',
      organizerId: 'leader-3',
      createdDate: '2025-01-01',
      lastModified: '2025-02-06',
      tags: ['first-aid', 'safety', 'training', 'certification'],
      resources: ['First aid mannequins', 'Training materials', 'Certificates'],
      requirements: ['Comfortable clothing', 'Willingness to practice'],
      islamicFocus: 'Helping others as taught by Prophet Muhammad (peace be upon him)'
    },
    {
      id: 'event-5',
      title: 'Inter-Academy Sports Day',
      description: 'Annual sports competition bringing together all three academies for friendly competition and unity',
      startDate: '2025-03-01',
      endDate: '2025-03-01',
      startTime: '09:00',
      endTime: '17:00',
      location: 'City Sports Complex',
      academy: 'Organization-wide',
      type: 'organization-wide',
      status: 'draft',
      maxAttendees: 200,
      currentAttendees: 0,
      requiresPermission: true,
      cost: 10,
      organizer: 'Aisha Khan',
      organizerId: 'executive-1',
      createdDate: '2025-01-12',
      lastModified: '2025-01-19',
      tags: ['sports', 'competition', 'unity', 'academy'],
      resources: ['Sports equipment', 'Medals and trophies', 'First aid station'],
      requirements: ['Sports clothing', 'Water bottle', 'Registration form'],
      islamicFocus: 'Promoting healthy competition and brotherhood as encouraged in Islam'
    }
  ]);

  // Event templates for quick creation
  const eventTemplates: EventTemplate[] = [
    {
      id: 'template-1',
      name: 'Weekly Group Meeting',
      description: 'Regular group meeting with activities and progress tracking',
      type: 'regular',
      defaultDuration: 2,
      defaultRequirements: ['Scout handbook', 'Uniform'],
      islamicElements: ['Opening prayer', 'Islamic values discussion']
    },
    {
      id: 'template-2',
      name: 'Islamic Study Circle',
      description: 'Quran study and Islamic education session',
      type: 'islamic',
      defaultDuration: 1.5,
      defaultRequirements: ['Quran', 'Notebook'],
      islamicElements: ['Quran recitation', 'Hadith study', 'Islamic character building']
    },
    {
      id: 'template-3',
      name: 'Outdoor Adventure',
      description: 'Outdoor activity with nature exploration',
      type: 'outdoor',
      defaultDuration: 6,
      defaultRequirements: ['Hiking gear', 'Water bottle', 'Permission slip'],
      islamicElements: ['Gratitude for Allah\'s creation', 'Environmental stewardship']
    },
    {
      id: 'template-4',
      name: 'Community Service',
      description: 'Volunteer activity serving the local community',
      type: 'special',
      defaultDuration: 4,
      defaultRequirements: ['Comfortable work clothes', 'Positive attitude'],
      islamicElements: ['Service to humanity', 'Giving back to community']
    }
  ];

  // Available academies and groups
  const academies = ['Main Academy', 'North Branch', 'South Branch', 'Organization-wide'];
  const groups = [
    { id: 'group-1', name: 'Eagle Scouts', academy: 'Main Academy' },
    { id: 'group-2', name: 'Wolf Pack', academy: 'North Branch' },
    { id: 'group-3', name: 'Trailblazers', academy: 'South Branch' }
  ];

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    const matchesType = selectedType === 'all' || event.type === selectedType;
    const matchesAcademy = selectedAcademy === 'all' || event.academy === selectedAcademy;
    
    return matchesSearch && matchesStatus && matchesType && matchesAcademy;
  });

  // Event statistics
  const eventStats = {
    totalEvents: events.length,
    upcomingEvents: events.filter(e => new Date(e.startDate) > new Date() && e.status !== 'cancelled').length,
    activeEvents: events.filter(e => e.status === 'active').length,
    completedEvents: events.filter(e => e.status === 'completed').length,
    totalAttendees: events.reduce((sum, event) => sum + event.currentAttendees, 0),
    averageAttendance: Math.round(events.reduce((sum, event) => sum + (event.currentAttendees / (event.maxAttendees || 1)), 0) / events.length * 100)
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type color
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'islamic':
        return 'bg-msa-sage/20 text-msa-sage';
      case 'outdoor':
        return 'bg-green-100 text-green-800';
      case 'educational':
        return 'bg-blue-100 text-blue-800';
      case 'organization-wide':
        return 'bg-purple-100 text-purple-800';
      case 'special':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle event creation/update
  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.startDate || !newEvent.location) {
      alert('Please fill in all required fields');
      return;
    }

    const event: Event = {
      id: editingEvent ? editingEvent.id : `event-${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate || newEvent.startDate,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      location: newEvent.location,
      academy: newEvent.academy,
      groupId: newEvent.groupId || undefined,
      groupName: newEvent.groupId ? groups.find(g => g.id === newEvent.groupId)?.name : undefined,
      type: newEvent.type as any,
      status: 'draft',
      maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : undefined,
      currentAttendees: editingEvent ? editingEvent.currentAttendees : 0,
      requiresPermission: newEvent.requiresPermission,
      cost: newEvent.cost ? parseFloat(newEvent.cost) : undefined,
      organizer: 'Executive Admin',
      organizerId: 'executive-1',
      createdDate: editingEvent ? editingEvent.createdDate : new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      tags: newEvent.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      resources: [],
      requirements: newEvent.requirements.split(',').map(req => req.trim()).filter(req => req),
      islamicFocus: newEvent.islamicFocus
    };

    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? event : e));
    } else {
      setEvents([event, ...events]);
    }

    setShowEventModal(false);
    setEditingEvent(null);
    setNewEvent({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      startTime: '16:00',
      endTime: '18:00',
      location: '',
      academy: 'Main Academy',
      groupId: '',
      type: 'regular',
      maxAttendees: '',
      requiresPermission: false,
      cost: '',
      tags: '',
      requirements: '',
      islamicFocus: ''
    });
  };

  // Handle event editing
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      academy: event.academy,
      groupId: event.groupId || '',
      type: event.type,
      maxAttendees: event.maxAttendees?.toString() || '',
      requiresPermission: event.requiresPermission,
      cost: event.cost?.toString() || '',
      tags: event.tags.join(', '),
      requirements: event.requirements.join(', '),
      islamicFocus: event.islamicFocus || ''
    });
    setShowEventModal(true);
  };

  // Handle template selection
  const handleSelectTemplate = (template: EventTemplate) => {
    setNewEvent(prev => ({
      ...prev,
      title: template.name,
      description: template.description,
      type: template.type,
      endTime: new Date(new Date().setHours(new Date().getHours() + template.defaultDuration)).toTimeString().slice(0, 5),
      requirements: template.defaultRequirements.join(', '),
      islamicFocus: template.islamicElements.join(', ')
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-msa-sage">{eventStats.totalEvents}</div>
            <p className="text-xs text-msa-sage/70">All academies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{eventStats.upcomingEvents}</div>
            <p className="text-xs text-msa-sage/70">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{eventStats.totalAttendees}</div>
            <p className="text-xs text-msa-sage/70">All events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{eventStats.averageAttendance}%</div>
            <p className="text-xs text-msa-sage/70">Capacity utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sm:max-w-xs"
              />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="regular">Regular</option>
                <option value="special">Special</option>
                <option value="organization-wide">Organization-wide</option>
                <option value="islamic">Islamic</option>
                <option value="outdoor">Outdoor</option>
                <option value="educational">Educational</option>
              </select>
              <select
                value={selectedAcademy}
                onChange={(e) => setSelectedAcademy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
              >
                <option value="all">All Academies</option>
                {academies.map(academy => (
                  <option key={academy} value={academy}>{academy}</option>
                ))}
              </select>
            </div>
            <Button 
              onClick={() => setShowEventModal(true)}
              className="bg-msa-sage hover:bg-msa-sage/90 text-white"
            >
              Create Event
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Event Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* All Events Tab */}
        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <Card key={event.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>📅 {event.startDate} {event.startTime} - {event.endTime}</span>
                        <span>📍 {event.location}</span>
                        <span>🏫 {event.academy}</span>
                        {event.groupName && <span>👥 {event.groupName}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {event.currentAttendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''}
                      </div>
                      <div className="text-xs text-gray-500">attendees</div>
                      {event.cost && (
                        <div className="text-sm text-green-600 mt-1">${event.cost}</div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.islamicFocus && (
                    <div className="bg-msa-sage/10 p-3 rounded-lg">
                      <div className="text-sm font-medium text-msa-sage mb-1">🕌 Islamic Focus:</div>
                      <div className="text-sm text-msa-charcoal">{event.islamicFocus}</div>
                    </div>
                  )}

                  {event.requirements.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Requirements:</div>
                      <div className="flex flex-wrap gap-1">
                        {event.requirements.map((req, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.tags.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Tags:</div>
                      <div className="flex flex-wrap gap-1">
                        {event.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Organized by {event.organizer} • Last modified: {event.lastModified}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                      >
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Attendees
                      </Button>
                      <Button variant="outline" size="sm" className="text-blue-600">
                        Duplicate
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No events found matching your criteria
              </div>
            )}
          </div>
        </TabsContent>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
              <p className="text-sm text-msa-sage/70">Visual overview of all scheduled events</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📅</div>
                <p>Calendar view component would be integrated here</p>
                <p className="text-sm mt-2">Showing events across all academies and groups</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eventTemplates.map(template => (
              <Card key={template.id} className="p-6 hover:bg-msa-sage/5 cursor-pointer">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-msa-charcoal">{template.name}</h3>
                    <p className="text-sm text-msa-sage/70 mt-1">{template.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      Type: <span className="capitalize">{template.type}</span> • 
                      Duration: {template.defaultDuration} hours
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium mb-1">Default Requirements:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.defaultRequirements.map((req, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium mb-1">Islamic Elements:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.islamicElements.map((element, index) => (
                          <span key={index} className="px-2 py-1 bg-msa-sage/20 text-msa-sage rounded text-xs">
                            {element}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleSelectTemplate(template)}
                    className="w-full bg-msa-sage hover:bg-msa-sage/90 text-white"
                  >
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button 
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                    rows={3}
                    placeholder="Describe the event"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <Input
                      type="date"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <Input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <Input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <Input
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Event location"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academy *
                  </label>
                  <select
                    value={newEvent.academy}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, academy: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  >
                    {academies.map(academy => (
                      <option key={academy} value={academy}>{academy}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specific Group (Optional)
                  </label>
                  <select
                    value={newEvent.groupId}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, groupId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  >
                    <option value="">All groups</option>
                    {groups.filter(group => newEvent.academy === 'Organization-wide' || group.academy === newEvent.academy).map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
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
                    <option value="regular">Regular</option>
                    <option value="special">Special</option>
                    <option value="organization-wide">Organization-wide</option>
                    <option value="islamic">Islamic</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="educational">Educational</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Attendees
                    </label>
                    <Input
                      type="number"
                      value={newEvent.maxAttendees}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, maxAttendees: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newEvent.cost}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, cost: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newEvent.requiresPermission}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, requiresPermission: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="ml-2 text-sm">Requires parental permission</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Islamic Focus
                  </label>
                  <textarea
                    value={newEvent.islamicFocus}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, islamicFocus: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                    rows={2}
                    placeholder="How does this event connect to Islamic values?"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements (comma-separated)
                </label>
                <Input
                  value={newEvent.requirements}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="e.g., permission slip, water bottle, comfortable shoes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <Input
                  value={newEvent.tags}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., outdoor, islamic, educational, fun"
                />
              </div>

              <div className="bg-msa-sage/10 border border-msa-sage/20 rounded-lg p-3">
                <p className="text-sm text-msa-charcoal font-medium">🎪 Event Planning with Purpose:</p>
                <p className="text-xs text-msa-sage">"And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth." - Quran 6:73</p>
                <p className="text-xs text-msa-sage mt-1">Every event is an opportunity to build character, community, and connection to Islamic values</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEvent}
                className="bg-msa-sage hover:bg-msa-sage/90 text-white"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Islamic Values Message */}
      <Card className="bg-gradient-to-r from-msa-sage/5 to-msa-golden/5 border-msa-sage/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎪</div>
            <div>
              <h3 className="text-lg font-semibold text-msa-charcoal">Events with Islamic Purpose</h3>
              <p className="text-sm text-msa-sage/80 mt-1">
                "And it is He who created the heavens and earth in truth" - Quran 6:73
              </p>
              <p className="text-xs text-msa-sage/70 mt-2">
                Every event we organize is an opportunity to build character, strengthen community bonds, and connect our scouts to Islamic values.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventAdministration;