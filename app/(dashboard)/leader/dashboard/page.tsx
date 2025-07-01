"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderNavigation } from "@/components/navigation/LeaderNavigation";

export default function LeaderDashboard() {  // In a real app, this would come from auth context
  // These values would be used to fetch data
  // const leaderId = "user-2"; // Jane Smith
  // const groupId = "group-1"; // Eagle Scouts

  // Mock data for the leader dashboard
  const stats = {
    totalScouts: 12,
    attendanceRate: 85,
    upcomingEvents: 3,
    pendingMessages: 4
  };
  
  // Mock attendance data for a chart
  const attendanceData = [
    { month: "Jan", rate: 78 },
    { month: "Feb", rate: 82 },
    { month: "Mar", rate: 80 },
    { month: "Apr", rate: 89 },
    { month: "May", rate: 85 },
    { month: "Jun", rate: 85 },
  ];
  
  // Mock recent activities
  const recentActivities = [
    { id: 1, description: "Alex Smith earned First Aid badge", date: "June 18, 2025" },
    { id: 2, description: "Summer Camp registration completed", date: "June 15, 2025" },
    { id: 3, description: "Hiking trip planned for Jul 5", date: "June 12, 2025" },
    { id: 4, description: "Monthly report submitted", date: "June 1, 2025" }
  ];

  return (
    <DashboardLayout 
      navigation={leaderNavigation} 
      pageTitle="Leader Dashboard" 
      userRole="leader"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-semibold">Welcome, Leader!</h2>
          <p className="text-gray-500">Eagle Scouts Group Overview</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Scouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalScouts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.attendanceRate}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.upcomingEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingMessages}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simple chart visualization */}
              <div className="h-48 flex items-end space-x-2">
                {attendanceData.map((item) => (
                  <div key={item.month} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t" 
                      style={{ height: `${item.rate * 0.4}%` }}
                    ></div>
                    <span className="text-xs mt-1">{item.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-start pb-3 border-b last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
