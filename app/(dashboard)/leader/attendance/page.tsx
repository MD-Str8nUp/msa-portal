"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderNavigation } from "@/components/navigation/LeaderNavigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { mockScouts, mockAttendance, mockGroupService, mockScoutService } from "@/lib/mock/data";
import { format } from "date-fns";
import { Scout, Attendance } from "@/types";

export default function LeaderAttendance() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [currentTab, setCurrentTab] = useState("record");
    // In a real app, this would come from auth context
  const leaderId = "user-2"; // Jane Smith
  
  // For demo purposes, get the first group associated with this leader
  const groups = mockGroupService.getGroups();
  const leaderGroups = groups.filter(group => group.leaderId === leaderId);
  const groupId = leaderGroups.length > 0 ? leaderGroups[0].id : null;
  
  // Get scouts in the leader's group
  const groupScouts = groupId ? mockScoutService.getScouts(undefined, groupId) : [];
  
  // Track attendance state
  const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>(() => {
    // Initialize with existing attendance data for the date if any
    const initialState: Record<string, boolean> = {};
    groupScouts.forEach(scout => {
      const existingRecord = mockAttendance.find(
        record => record.scoutId === scout.id && record.date === selectedDate
      );
      initialState[scout.id] = existingRecord ? existingRecord.present : false;
    });
    return initialState;
  });
  
  // Toggle attendance for a scout
  const toggleAttendance = (scoutId: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [scoutId]: !prev[scoutId]
    }));
  };
  
  // Save attendance (would send to API in real app)
  const saveAttendance = () => {
    alert("Attendance saved successfully!");
    // In real app: API call to save attendance data
    // For each scout, create/update attendance record
  };
  
  // Calculate attendance statistics
  const attendanceStats = {
    totalMeetings: 24,
    averageAttendance: "87%",
    perfectAttendance: 5,
    lowAttendance: 2
  };

  // Get historical attendance grouped by month
  const getMonthlyAttendance = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return format(date, "MMM yyyy");
    }).reverse();
    
    return last6Months.map(month => ({
      month,
      rate: Math.floor(Math.random() * 30) + 70 // Mock attendance rate between 70-100%
    }));
  };

  const monthlyAttendance = getMonthlyAttendance();
  
  return (
    <DashboardLayout navigation={leaderNavigation} userRole="leader" pageTitle="Attendance">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Attendance Management</h1>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="record">Record Attendance</TabsTrigger>
            <TabsTrigger value="history">Attendance History</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          {/* Record Attendance Tab */}
          <TabsContent value="record" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Record Attendance</CardTitle>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="px-3 py-2 border rounded-md"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Name</th>
                        <th className="text-left py-2 px-4">Group</th>
                        <th className="text-left py-2 px-4">Present</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupScouts.map((scout) => (
                        <tr key={scout.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">{scout.name}</td>
                          <td className="py-4 px-4">{scout.groupName}</td>
                          <td className="py-4 px-4">
                            <input 
                              type="checkbox" 
                              checked={attendanceState[scout.id] || false}
                              onChange={() => toggleAttendance(scout.id)}
                              className="h-5 w-5"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={saveAttendance}>Save Attendance</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Attendance History Tab */}
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-4">Monthly Attendance Rate</h3>
                    <div className="h-64 flex items-end space-x-2">
                      {monthlyAttendance.map((data, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="bg-blue-500 w-full rounded-t"
                            style={{ height: `${data.rate}%` }}
                          ></div>
                          <span className="text-xs mt-2">{data.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Attendance Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b pb-2">
                        <span>Total Meetings:</span>
                        <span className="font-medium">{attendanceStats.totalMeetings}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span>Average Attendance Rate:</span>
                        <span className="font-medium">{attendanceStats.averageAttendance}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span>Scouts with Perfect Attendance:</span>
                        <span className="font-medium">{attendanceStats.perfectAttendance}</span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span>Scouts with Low Attendance (&lt;70%):</span>
                        <span className="font-medium">{attendanceStats.lowAttendance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h3 className="font-medium">Monthly Attendance Report</h3>
                    <p className="text-gray-500">Summarized attendance data for the current month</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h3 className="font-medium">Scout Attendance Detail</h3>
                    <p className="text-gray-500">Individual attendance records for each scout</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h3 className="font-medium">Event-Specific Attendance</h3>
                    <p className="text-gray-500">Attendance records for special events and outings</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h3 className="font-medium">Quarterly Attendance Analysis</h3>
                    <p className="text-gray-500">Attendance trends over the past quarter</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
