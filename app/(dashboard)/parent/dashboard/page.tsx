"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { parentNavigation } from "@/components/navigation/ParentNavigation";
import { mockScoutService, mockEventService } from "@/lib/mock/data";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

export default function ParentDashboard() {
  // In a real app, this would come from auth context/session
  const parentId = "user-1";
  
  // Get parent's scouts
  const myScouts = mockScoutService.getScouts(parentId);
  
  // Get upcoming events
  const events = mockEventService.getEvents();
  const upcomingEvents = events.filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  return (
    <DashboardLayout 
      navigation={parentNavigation} 
      pageTitle="Parent Dashboard" 
      userRole="parent"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-semibold">Welcome, Parent!</h2>
          <p className="text-gray-500">Here&apos;s what&apos;s happening with your scouts</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Scouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{myScouts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingEvents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2</div>
            </CardContent>
          </Card>
        </div>

        {/* My Scouts Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">My Scouts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myScouts.map((scout) => (
              <Card key={scout.id}>
                <CardHeader>
                  <CardTitle>{scout.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Age:</span>
                    <span>{scout.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Group:</span>
                    <span>{scout.groupName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rank:</span>
                    <span>{scout.rank}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-gray-700">{event.description}</p>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span><DateTimeDisplay date={event.startDate} format="MMM dd, yyyy" /></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span>{event.location}</span>
                  </div>
                  {event.groupName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Group:</span>
                      <span>{event.groupName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
