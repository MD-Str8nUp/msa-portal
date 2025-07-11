"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderNavigation } from "@/components/navigation/LeaderNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { eventService, groupService, scoutService } from "@/lib/services/supabaseService";
import { useAuth } from "@/lib/contexts/AuthContext";
import AttendanceManager from "@/components/leader/AttendanceManager";
import AttendanceHistory from "@/components/leader/AttendanceHistory";
import { Group, Scout, Event } from "@/types";

export default function LeaderAttendance() {
  const { userDetails } = useAuth();
  const [currentTab, setCurrentTab] = useState("record");
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  
  // Fetch attendance data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!userDetails?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch groups for this leader
        const groupsData = await groupService.getAllGroups();
        const leaderGroups = groupsData.filter((group: any) => group.leaderId === userDetails.id);
        setGroups(leaderGroups);

        if (leaderGroups.length > 0) {
          // Get scouts in the leader's groups
          const scoutsData = await scoutService.getAllScouts();
          const groupScouts = scoutsData.filter((scout: any) => 
            leaderGroups.some((group: any) => group.id === scout.groupId)
          );
          setScouts(groupScouts);

          // Get events
          const eventsData = await eventService.getAllEvents();
          setEvents(eventsData);
        }
        
        // TODO: Implement attendance service
        // For now, just set empty array
        setAttendanceData([]);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userDetails]);
  
  // Get the first group for this demo
  const leaderGroup = groups.length > 0 ? groups[0] : null;
  
  // Get scouts in the leader's group
  const groupScouts = leaderGroup ? scouts.filter(scout => scout.groupId === leaderGroup.id) : [];
  
  // Get group and organization events
  const groupEvents = events.filter(event => 
    event.groupId === leaderGroup?.id || event.groupId === null
  );
  const allEvents = events; // Include organization-wide events
  
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
              existingAttendance={attendanceData}
              events={allEvents}
            />
          </TabsContent>
          
          {/* Attendance History Tab */}
          <TabsContent value="history" className="mt-4">
            <AttendanceHistory
              scouts={groupScouts}
              attendance={attendanceData}
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
