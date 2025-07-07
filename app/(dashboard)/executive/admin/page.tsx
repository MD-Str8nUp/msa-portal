"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import UserManagement from "@/components/executive/UserManagement";
import GroupAdministration from "@/components/executive/GroupAdministration";
import ResourceHub from "@/components/executive/ResourceHub";
import CommunicationCenter from "@/components/executive/CommunicationCenter";
import EventAdministration from "@/components/executive/EventAdministration";

export default function ExecutiveAdminPage() {
  const [activeTab, setActiveTab] = useState("users");

  // Admin statistics for overview
  const adminStats = {
    totalUsers: 347,
    totalGroups: 18,
    totalScouts: 275,
    totalLeaders: 23,
    totalParents: 186,
    totalEvents: 24,
    activeMessages: 89,
    pendingApprovals: 7
  };

  return (
    <DashboardLayout 
      navigation={executiveNavigation} 
      pageTitle="Administrative Control Center" 
      userRole="executive"
    >
      <div className="space-y-6">
        {/* Islamic Administrative Leadership Section */}
        <div className="bg-gradient-to-r from-msa-sage/10 via-msa-golden/10 to-msa-light-sage/20 rounded-xl p-6 border border-msa-light-sage/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">🛡️</div>
            <div>
              <h2 className="text-2xl font-bold text-msa-charcoal mb-1 font-primary">
                Administrative Control Center
              </h2>
            </div>
          </div>
          <p className="text-msa-charcoal/80 text-lg font-secondary">
            Complete administrative oversight of Mi'raj Scouts Academy with Islamic principles of leadership and trust
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-msa-sage">
              "And those who believe and work righteous deeds, no fear shall they have, nor shall they grieve" - Quran 2:62
            </span>
          </div>
        </div>

        {/* Administrative Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-msa-sage">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-msa-charcoal">{adminStats.totalUsers}</div>
              <p className="text-xs text-msa-sage/70">All platform users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-msa-golden">Active Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-msa-charcoal">{adminStats.totalGroups}</div>
              <p className="text-xs text-msa-sage/70">Across all academies</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-600">Active Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-msa-charcoal">{adminStats.totalEvents}</div>
              <p className="text-xs text-msa-sage/70">Scheduled & ongoing</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-600">Pending Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-msa-charcoal">{adminStats.pendingApprovals}</div>
              <p className="text-xs text-msa-sage/70">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Administrative Control Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">User Management</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Group Admin</span>
              <span className="sm:hidden">Groups</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Resource Hub</span>
              <span className="sm:hidden">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Communication</span>
              <span className="sm:hidden">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Events Admin</span>
              <span className="sm:hidden">Events</span>
            </TabsTrigger>
          </TabsList>
          
          {/* User Management Tab - Priority 1 */}
          <TabsContent value="users" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-msa-charcoal">Universal User Management</h3>
                  <p className="text-msa-sage/70">Search, edit, and manage all user profiles and permissions</p>
                </div>
              </div>
              <UserManagement />
            </div>
          </TabsContent>
          
          {/* Group Administration Tab - Priority 2 */}
          <TabsContent value="groups" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-msa-charcoal">Advanced Group Administration</h3>
                  <p className="text-msa-sage/70">Create, manage, and reorganize groups across all academies</p>
                </div>
              </div>
              <GroupAdministration />
            </div>
          </TabsContent>
          
          {/* Resource Hub Tab - Priority 3 */}
          <TabsContent value="resources" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-msa-charcoal">Resource Management Hub</h3>
                  <p className="text-msa-sage/70">Upload, organize, and distribute resources to groups</p>
                </div>
              </div>
              <ResourceHub />
            </div>
          </TabsContent>
          
          {/* Communication Center Tab - Priority 3 */}
          <TabsContent value="communication" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-msa-charcoal">Communication Center</h3>
                  <p className="text-msa-sage/70">Monitor messages and send academy-wide announcements</p>
                </div>
              </div>
              <CommunicationCenter />
            </div>
          </TabsContent>
          
          {/* Event Administration Tab - Priority 3 */}
          <TabsContent value="events" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-msa-charcoal">Event Administration</h3>
                  <p className="text-msa-sage/70">Create, modify, and manage all academy events</p>
                </div>
              </div>
              <EventAdministration />
            </div>
          </TabsContent>
        </Tabs>

        {/* Administrative Responsibilities Card */}
        <Card className="bg-gradient-to-r from-msa-sage/5 to-msa-golden/5 border-msa-sage/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🕌</div>
              <div>
                <h3 className="text-lg font-semibold text-msa-charcoal">Administrative Amanah (Trust)</h3>
                <p className="text-sm text-msa-sage/80 mt-1">
                  "O you who believe! Betray not Allah and His Messenger, nor betray your trust while you know" - Quran 8:27
                </p>
                <p className="text-xs text-msa-sage/70 mt-2">
                  Administrative control is a sacred trust. Every action taken here impacts our Islamic community's growth and well-being.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}