"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderNavigation } from "@/components/navigation/LeaderNavigation";
import { mockGroupService, mockScoutService } from "@/lib/mock/data";
import GroupManagement from "@/components/leader/GroupManagement";
import ActivityTimeline from "@/components/leader/ActivityTimeline";
import { useRouter } from "next/navigation";
import { 
  ClipboardList, 
  MessageSquare, 
  Users, 
  Award,
  Calendar,
  BarChart3,
  Plus,
  Bell
} from "lucide-react";

export default function LeaderDashboard() {
  const router = useRouter();
  
  // In a real app, this would come from auth context
  const leaderId = "user-2"; // Jane Smith
  
  // Get leader's groups and scouts
  const allGroups = mockGroupService.getGroups();
  const leaderGroups = allGroups.filter(group => group.leaderId === leaderId);
  const primaryGroup = leaderGroups.length > 0 ? leaderGroups[0] : null;
  const allScouts = primaryGroup ? mockScoutService.getScouts(undefined, primaryGroup.id) : [];
  
  // Calculate dashboard statistics
  const totalScouts = allScouts.length;
  const attendanceRate = 85; // Mock attendance rate
  const upcomingEvents = 3; // Mock upcoming events
  const pendingMessages = 4; // Mock pending messages
  const activeAchievements = 12; // Mock active achievements
  
  // View state
  const [currentView, setCurrentView] = useState<"overview" | "management">("overview");

  // Mock attendance data for chart
  const attendanceData = [
    { month: "Jan", rate: 78 },
    { month: "Feb", rate: 82 },
    { month: "Mar", rate: 80 },
    { month: "Apr", rate: 89 },
    { month: "May", rate: 85 },
    { month: "Jun", rate: 85 },
  ];

  // Handle action functions
  const handleTakeAttendance = () => {
    router.push("/leader/attendance");
  };

  const handleSendMessage = () => {
    router.push("/leader/messages");
  };

  const handleAddScout = () => {
    router.push("/leader/scouts");
  };

  const handleViewReports = () => {
    router.push("/leader/reports");
  };

  const handleRecordAchievement = () => {
    // In real app: would open achievement modal or navigate to scouts page
    router.push("/leader/scouts");
  };

  if (!primaryGroup) {
    return (
      <DashboardLayout 
        navigation={leaderNavigation} 
        pageTitle="Leader Dashboard" 
        userRole="leader"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Groups Assigned
            </h3>
            <p className="text-gray-500">
              Please contact your administrator to assign you to a group.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      navigation={leaderNavigation} 
      pageTitle="Leader Dashboard" 
      userRole="leader"
    >
      <div className="space-y-6">
        {/* MSA Islamic Welcome Section */}
        <div className="bg-gradient-to-r from-msa-sage/10 via-msa-golden/10 to-msa-light-sage/20 rounded-xl p-6 border border-msa-light-sage/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">🌙</div>
            <div>
              <h2 className="text-2xl font-bold text-msa-charcoal mb-1 font-primary">
                Assalamu Alaikum, Leader!
              </h2>
              <p className="text-sm text-msa-sage">
                Peace and blessings upon you
              </p>
            </div>
          </div>
          <p className="text-msa-charcoal/80 text-lg font-secondary">
            Leading with Islamic values - {primaryGroup.name} Group Overview
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-msa-sage">
              May Allah bless your leadership
            </span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={currentView === "overview" ? "default" : "outline"}
              onClick={() => setCurrentView("overview")}
              className={currentView === "overview" ? "bg-msa-sage hover:bg-msa-sage/90" : ""}
            >
              Overview
            </Button>
            <Button
              variant={currentView === "management" ? "default" : "outline"}
              onClick={() => setCurrentView("management")}
              className={currentView === "management" ? "bg-msa-sage hover:bg-msa-sage/90" : ""}
            >
              Group Management
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-msa-golden text-msa-golden hover:bg-msa-golden/10"
            >
              <Bell className="w-4 h-4 mr-1" />
              Notifications
            </Button>
          </div>
        </div>

        {currentView === "overview" && (
          <>
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                className="bg-msa-sage hover:bg-msa-sage/90 text-white h-16"
                onClick={handleTakeAttendance}
              >
                <ClipboardList className="w-5 h-5 mr-2" />
                Take Attendance
              </Button>
              <Button 
                variant="outline" 
                className="border-msa-golden text-msa-golden hover:bg-msa-golden/10 h-16"
                onClick={handleRecordAchievement}
              >
                <Award className="w-5 h-5 mr-2" />
                Record Achievement
              </Button>
              <Button 
                variant="outline"
                className="border-msa-sage text-msa-sage hover:bg-msa-sage/10 h-16"
                onClick={handleSendMessage}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Send Message
              </Button>
              <Button 
                variant="outline"
                className="h-16"
                onClick={handleViewReports}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                View Reports
              </Button>
            </div>

            {/* Dashboard Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="border-l-4 border-l-msa-sage">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-msa-sage">{totalScouts}</div>
                  <div className="text-sm text-gray-500">Total Scouts</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-msa-golden">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-msa-golden">{attendanceRate}%</div>
                  <div className="text-sm text-gray-500">Attendance Rate</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{upcomingEvents}</div>
                  <div className="text-sm text-gray-500">Upcoming Events</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{activeAchievements}</div>
                  <div className="text-sm text-gray-500">Active Badges</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{pendingMessages}</div>
                  <div className="text-sm text-gray-500">Pending Messages</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Attendance Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-end space-x-2">
                    {attendanceData.map((item) => (
                      <div key={item.month} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-msa-sage rounded-t" 
                          style={{ height: `${item.rate * 0.4}%` }}
                        ></div>
                        <span className="text-xs mt-1">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <ActivityTimeline />
            </div>
          </>
        )}

        {currentView === "management" && (
          <GroupManagement
            group={primaryGroup}
            scouts={allScouts}
            onAddScout={handleAddScout}
            onBulkAttendance={handleTakeAttendance}
            onSendGroupMessage={handleSendMessage}
            onViewReports={handleViewReports}
          />
        )}
      </div>
    </DashboardLayout>
  );
}