"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { parentNavigation } from "@/components/navigation/ParentNavigation";
import { mockScoutService } from "@/lib/mock/data";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";

export default function ParentProgressPage() {
  const [activeTab, setActiveTab] = useState("attendance");
  
  // In a real app, this would come from auth context/session
  const parentId = "user-1";
  
  // Get parent's scouts
  const myScouts = mockScoutService.getScouts(parentId);
  const selectedScout = myScouts.length > 0 ? myScouts[0] : null;
  
  // Mock attendance data
  const attendanceData = [
    { id: "att-1", date: "2025-06-01", present: true, event: "Group Meeting" },
    { id: "att-2", date: "2025-06-08", present: true, event: "Group Meeting" },
    { id: "att-3", date: "2025-06-15", present: false, event: "Group Meeting" },
    { id: "att-4", date: "2025-06-22", present: true, event: "Group Meeting" },
    { id: "att-5", date: "2025-05-25", present: true, event: "Special Event" },
    { id: "att-6", date: "2025-05-18", present: true, event: "Group Meeting" },
  ];
  
  // Mock achievements data
  const achievementsData = [
    { id: "ach-1", name: "First Aid Badge", date: "2025-05-10", description: "Completed first aid training" },
    { id: "ach-2", name: "Camping Badge", date: "2025-04-15", description: "Completed overnight camping trip" },
    { id: "ach-3", name: "Swimming Badge", date: "2025-03-20", description: "Passed swimming proficiency test" },
    { id: "ach-4", name: "Leadership Badge", date: "2025-02-05", description: "Led a group activity successfully" },
  ];
  
  // Mock incident reports
  const incidentReports = [
    { id: "inc-1", date: "2025-05-15", description: "Minor scraped knee during outdoor activity", severity: "minor" },
    { id: "inc-2", date: "2025-03-10", description: "Verbal disagreement with another scout", severity: "minor" },
  ];

  // Button handlers
  const handleDownloadAttendanceReport = () => {
    // Generate CSV data for attendance
    const csvData = attendanceData.map(record => 
      `${record.date},${record.event},"${record.present ? 'Present' : 'Absent'}"`
    ).join('\n');
    const header = 'Date,Event,Status\n';
    const csvContent = header + csvData;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedScout?.name || 'scout'}_attendance_report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleViewAllAchievements = () => {
    // For now, show an alert. In a real app, this would navigate to a detailed achievements page
    alert(`${selectedScout?.name || 'Scout'} has earned ${achievementsData.length} achievements:\n\n${achievementsData.map(a => `• ${a.name} (${formatDate(a.date, "MMM dd, yyyy")})`).join('\n')}`);
  };
  
  return (
    <DashboardLayout 
      navigation={parentNavigation} 
      pageTitle="Progress Tracking" 
      userRole="parent"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Scout Progress</h2>
          <p className="text-gray-500">Track your scout's progress, attendance, and achievements</p>
        </div>
        
        {selectedScout ? (
          <>
            {/* Scout Info Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{selectedScout.name}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Group</p>
                  <p>{selectedScout.groupName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rank</p>
                  <p>{selectedScout.rank}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p>{formatDate(selectedScout.joinedDate, "MMM dd, yyyy")}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Progress Tabs */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="border-b flex justify-start overflow-x-auto">
                  <TabsTrigger value="attendance" className="px-4 py-2">Attendance</TabsTrigger>
                  <TabsTrigger value="achievements" className="px-4 py-2">Achievements</TabsTrigger>
                  <TabsTrigger value="reports" className="px-4 py-2">Incident Reports</TabsTrigger>
                </TabsList>
                
                <TabsContent value="attendance" className="p-6">
                  <h3 className="font-medium text-lg mb-4">Attendance Record</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceData.map((record) => (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatDate(record.date, "MMM dd, yyyy")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.event}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {record.present ? 'Present' : 'Absent'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={handleDownloadAttendanceReport}>Download Report</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="achievements" className="p-6">
                  <h3 className="font-medium text-lg mb-4">Achievements & Badges</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievementsData.map((achievement) => (
                      <Card key={achievement.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-md">{achievement.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Earned on {formatDate(achievement.date, "MMM dd, yyyy")}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={handleViewAllAchievements}>View All Achievements</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="reports" className="p-6">
                  <h3 className="font-medium text-lg mb-4">Incident Reports</h3>
                  {incidentReports.length > 0 ? (
                    <div className="space-y-4">
                      {incidentReports.map((report) => (
                        <Card key={report.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-md">Incident Report</CardTitle>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                report.severity === 'minor' ? 'bg-yellow-100 text-yellow-800' : 
                                report.severity === 'serious' ? 'bg-red-100 text-red-800' : 
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600">{report.description}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Reported on {formatDate(report.date, "MMM dd, yyyy")}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No incident reports for this scout.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 py-8">No scouts found for this parent.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
