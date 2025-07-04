"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

export default function ExecutiveEventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");

  // Mock events data
  const events = [
    {
      id: "e1",
      title: "National Scout Jamboree",
      description: "Annual gathering of scout groups from across the country",
      date: new Date(2025, 7, 15), // August 15, 2025
      location: "National Park",
      duration: "3 days",
      groups: ["Eagle Scouts", "Wolf Pack", "Trailblazers"],
      status: "upcoming"
    },
    {
      id: "e2",
      title: "Leadership Training Workshop",
      description: "Training session for scout leaders on leadership skills",
      date: new Date(2025, 8, 5), // September 5, 2025
      location: "Training Center",
      duration: "1 day",
      groups: ["All Leaders"],
      status: "upcoming"
    },
    {
      id: "e3",
      title: "Summer Camp Planning",
      description: "Planning session for the annual summer camp",
      date: new Date(2025, 5, 10), // June 10, 2025
      location: "Headquarters Conference Room",
      duration: "4 hours",
      groups: ["Eagle Scouts", "Wolf Pack"],
      status: "upcoming"
    },
    {
      id: "e4",
      title: "Spring Hiking Trip",
      description: "Hiking trip to explore local trails",
      date: new Date(2025, 4, 20), // May 20, 2025
      location: "Mountain Trails",
      duration: "1 day",
      groups: ["Trailblazers"],
      status: "past"
    },
    {
      id: "e5",
      title: "Community Service Day",
      description: "Volunteer event to clean up local parks",
      date: new Date(2025, 3, 15), // April 15, 2025
      location: "City Park",
      duration: "6 hours",
      groups: ["All Groups"],
      status: "past"
    }
  ];

  // Filter events based on active tab
  const filteredEvents = events.filter(event => {
    if (activeTab === "upcoming") {
      return event.status === "upcoming";
    } else {
      return event.status === "past";
    }
  });

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
          <Button className="flex items-center space-x-2">
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
        
        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <Card key={event.id}>
              <CardContent className="p-5 flex flex-col md:flex-row justify-between">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-20">Date:</span>
                      <span className="text-sm">
                        <DateTimeDisplay date={event.date} format="full" />
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-20">Location:</span>
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-20">Duration:</span>
                      <span className="text-sm">{event.duration}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-20">Groups:</span>
                      <span className="text-sm">{event.groups.join(", ")}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col gap-2 mt-4 md:mt-0 justify-end">
                  <Button className="text-sm">Edit</Button>
                  {event.status === "upcoming" && (
                    <Button 
                      className="text-sm bg-red-500 hover:bg-red-600"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
