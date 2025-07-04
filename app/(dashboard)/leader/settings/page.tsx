"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderNavigation } from "@/components/navigation/LeaderNavigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LeaderSettingsPage() {
  return (
    <DashboardLayout 
      navigation={leaderNavigation} 
      pageTitle="Settings" 
      userRole="leader"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Leader Settings</h2>
          <p className="text-gray-500">Manage your account settings and group preferences</p>
        </div>
        
        {/* Settings Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Full Name
                </label>
                <Input id="name" defaultValue="Alex Johnson" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email Address
                </label>
                <Input id="email" defaultValue="alex@scoutleader.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                  Phone Number
                </label>
                <Input id="phone" defaultValue="(555) 234-5678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="position">
                  Leadership Position
                </label>
                <Input id="position" defaultValue="Scout Troop Leader" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
          
          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="currentPassword">
                  Current Password
                </label>
                <Input id="currentPassword" type="password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">
                  New Password
                </label>
                <Input id="newPassword" type="password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>
          
          {/* Group Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Group Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="groupName">
                  Group Name
                </label>
                <Input id="groupName" defaultValue="Eagle Scouts" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="meetingLocation">
                  Meeting Location
                </label>
                <Input id="meetingLocation" defaultValue="Community Center A" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="meetingDay">
                  Meeting Day
                </label>
                <Input id="meetingDay" defaultValue="Thursday" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="meetingTime">
                  Meeting Time
                </label>
                <Input id="meetingTime" defaultValue="6:00 PM" />
              </div>
              <Button>Update Group Settings</Button>
            </CardContent>
          </Card>
          
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive emails about events and announcements</p>
                  </div>
                  <div className="h-6 w-11 bg-gray-200 rounded-full cursor-pointer flex items-center"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive text messages for urgent updates</p>
                  </div>
                  <div className="h-6 w-11 bg-gray-200 rounded-full cursor-pointer flex items-center"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Scout Alerts</h4>
                    <p className="text-sm text-gray-500">Get notified when new scouts join your group</p>
                  </div>
                  <div className="h-6 w-11 bg-gray-200 rounded-full cursor-pointer flex items-center"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Event Reminders</h4>
                    <p className="text-sm text-gray-500">Receive reminders about upcoming events</p>
                  </div>
                  <div className="h-6 w-11 bg-gray-200 rounded-full cursor-pointer flex items-center"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
