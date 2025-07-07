"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";

export default function ExecutiveDashboard() {
  // Mock data for the executive dashboard
  const stats = {
    totalGroups: 3,
    totalLeaders: 5,
    totalMembers: 36,
    upcomingEvents: 7
  };
  
  // Mock group data
  const groupData = [
    { id: "g1", name: "Eagle Scouts", memberCount: 12, location: "Community Center A" },
    { id: "g2", name: "Wolf Pack", memberCount: 15, location: "Library Hall" },
    { id: "g3", name: "Trailblazers", memberCount: 9, location: "School Gymnasium" }
  ];
  
  // Mock chart data for membership growth
  const membershipData = [
    { month: "Jan", count: 30 },
    { month: "Feb", count: 31 },
    { month: "Mar", count: 32 },
    { month: "Apr", count: 34 },
    { month: "May", count: 35 },
    { month: "Jun", count: 36 }
  ];
  
  // Mock recent reports
  const recentReports = [
    { id: 1, title: "Monthly Attendance Report", date: "June 1, 2025", type: "Attendance" },
    { id: 2, title: "Achievement Progress", date: "May 15, 2025", type: "Achievements" },
    { id: 3, title: "Annual Financial Summary", date: "May 30, 2025", type: "Financial" }
  ];

  return (
    <DashboardLayout 
      navigation={executiveNavigation} 
      pageTitle="Executive Dashboard" 
      userRole="executive"
    >
      <div className="space-y-6">
        {/* MSA Islamic Welcome Section */}
        <div className="bg-gradient-to-r from-msa-sage/10 via-msa-golden/10 to-msa-light-sage/20 rounded-xl p-6 border border-msa-light-sage/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">🌙</div>
            <div>
              <h2 className="text-2xl font-bold text-msa-charcoal mb-1 font-primary">
                Assalamu Alaikum, Executive!
              </h2>
            </div>
          </div>
          <p className="text-msa-charcoal/80 text-lg font-secondary">
            Leading Mi'raj Scouts Academy - Organization-wide metrics and management
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-msa-sage">
              May Allah bless your guidance
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalGroups}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Leaders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalLeaders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalMembers}</div>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Groups Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Groups Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupData.map((group) => (
                  <div key={group.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-medium">{group.name}</h4>
                      <p className="text-sm text-gray-500">{group.location}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 bg-msa-sage/20 text-msa-sage rounded-full text-xs">
                        {group.memberCount} members
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Membership Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Membership Growth</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simple graph visualization */}
              <div className="h-48 flex items-end space-x-2">
                {membershipData.map((item) => (
                  <div key={item.month} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-msa-forest rounded-t" 
                      style={{ height: `${item.count * 1.2}%` }}
                    ></div>
                    <span className="text-xs mt-1">{item.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{report.title}</h4>
                    <p className="text-sm text-gray-500">{report.date}</p>
                  </div>
                  <span className="inline-block px-2 py-1 bg-msa-light-sage/30 text-msa-charcoal rounded-full text-xs">
                    {report.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
