"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { mockGroupService } from "@/lib/mock/data";
import { Button } from "@/components/ui/Button";

export default function ExecutiveGroupsPage() {
  // Get all groups
  const groups = mockGroupService.getGroups();
  
  return (
    <DashboardLayout 
      navigation={executiveNavigation} 
      pageTitle="Groups" 
      userRole="executive"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Scout Groups</h2>
            <p className="text-gray-500">Manage all scout groups in the organization</p>
          </div>
          <Button className="flex items-center space-x-2">
            <span>Create Group</span>
          </Button>
        </div>
        
        {/* Groups List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map(group => (
            <Card key={group.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle>{group.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">Leader: {group.leaderName}</span>
                  <span className="text-sm font-medium">
                    Members: {group.memberCount} scouts
                  </span>
                  <span className="text-sm font-medium">
                    Location: {group.location}
                  </span>
                  <span className="text-sm font-medium">
                    Meetings: {group.meetingDay}s at {group.meetingTime}
                  </span>
                </div>
              </CardContent>
              <div className="p-4 pt-0 flex space-x-2">
                <Button className="flex-1">Manage</Button>
                <Button variant="outline" className="flex-1">View Scouts</Button>
              </div>
            </Card>
          ))}        </div>
        
        {/* Group Statistics */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Group Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold">{groups.length}</div>
                <div className="text-sm text-gray-500">Total Groups</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold">
                  {groups.reduce((total, group) => total + group.memberCount, 0)}
                </div>
                <div className="text-sm text-gray-500">Total Scouts</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold">
                  {groups.length > 0 ? Math.round(groups.reduce((total, group) => total + group.memberCount, 0) / groups.length) : 0}
                </div>
                <div className="text-sm text-gray-500">Avg. Group Size</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold">
                  {groups.filter(g => g.memberCount > 10).length}
                </div>
                <div className="text-sm text-gray-500">Large Groups ({'>'}10)</div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Group Management Tools */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Group Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 hover:bg-gray-50 cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-blue-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <h3 className="font-semibold">Create New Group</h3>
                <p className="text-sm text-gray-500 mt-2">Setup a new scout group with leader and location</p>
              </div>
            </Card>
            <Card className="p-6 hover:bg-gray-50 cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-green-500">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h3 className="font-semibold">Assign Leaders</h3>
                <p className="text-sm text-gray-500 mt-2">Assign or change group leadership</p>
              </div>
            </Card>
            <Card className="p-6 hover:bg-gray-50 cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-purple-500">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <h3 className="font-semibold">Schedule Management</h3>
                <p className="text-sm text-gray-500 mt-2">Update meeting schedules and locations</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
