"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderNavigation } from "@/components/navigation/LeaderNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { mockAttendance, mockGroupService, mockScoutService, mockEventService } from "@/lib/mock/data";
import AttendanceManager from "@/components/leader/AttendanceManager";
import AttendanceHistory from "@/components/leader/AttendanceHistory";

export default function LeaderAttendance() {
  const [currentTab, setCurrentTab] = useState("record");
  
  // In a real app, this would come from auth context
  const leaderId = "user-2"; // Jane Smith
  
  // For demo purposes, get the first group associated with this leader
  const groups = mockGroupService.getGroups();
  const leaderGroups = groups.filter(group => group.leaderId === leaderId);
  const leaderGroup = leaderGroups.length > 0 ? leaderGroups[0] : null;
  
  // Get scouts in the leader's group
  const groupScouts = leaderGroup ? mockScoutService.getScouts(undefined, leaderGroup.id) : [];
  
  // Get group events
  const groupEvents = leaderGroup ? mockEventService.getEvents(leaderGroup.id) : [];
  const allEvents = mockEventService.getEvents(); // Include organization-wide events
  
  // Handle saving attendance
  const handleSaveAttendance = (attendanceRecords: any[], date: string, eventId?: string) => {
    console.log("Saving attendance:", { attendanceRecords, date, eventId });
    // In real app: API call to save attendance data
    alert("Attendance saved successfully! May Allah reward the consistent scouts.");
  };
  
  // Handle contacting parent
  const handleContactParent = (scoutId: string) => {
    const scout = groupScouts.find(s => s.id === scoutId);
    console.log("Contacting parent for scout:", scout?.name);
    // In real app: Open messaging interface or contact modal
    alert(`Opening contact interface for ${scout?.name}'s parent`);
  };
  
  // Handle exporting reports
  const handleExportReport = (scoutId?: string, dateRange?: { start: string; end: string }) => {
    console.log("Exporting report:", { scoutId, dateRange });
    // In real app: Generate and download report
    alert("Report export initiated - file will be downloaded shortly");
  };
  
  if (!leaderGroup) {
    return (
      <DashboardLayout navigation={leaderNavigation} userRole="leader" pageTitle="Attendance">
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No Group Assigned</h2>
            <p className="text-gray-500">Please contact an administrator to assign you to a scout group.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navigation={leaderNavigation} userRole="leader" pageTitle="Attendance">
      <div className="p-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="record">Record Attendance</TabsTrigger>
            <TabsTrigger value="history">Attendance History & Reports</TabsTrigger>
          </TabsList>
          
          {/* Record Attendance Tab */}
          <TabsContent value="record" className="mt-4">
            <AttendanceManager
              scouts={groupScouts}
              groupId={leaderGroup.id}
              groupName={leaderGroup.name}
              onSaveAttendance={handleSaveAttendance}
              existingAttendance={mockAttendance}
              events={allEvents}
            />
          </TabsContent>
          
          {/* Attendance History Tab */}
          <TabsContent value="history" className="mt-4">
            <AttendanceHistory
              scouts={groupScouts}
              attendance={mockAttendance}
              groupName={leaderGroup.name}
              onContactParent={handleContactParent}
              onExportReport={handleExportReport}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
