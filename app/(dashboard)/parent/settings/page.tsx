"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { parentNavigation } from "@/components/navigation/ParentNavigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ParentSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  const handleSaveProfile = () => {
    alert("Profile changes saved successfully!");
  };
  
  const handleUpdatePassword = () => {
    alert("Password updated successfully!");
  };
  
  const handleSavePreferences = () => {
    alert("Notification preferences saved successfully!");
  };
  return (
    <DashboardLayout 
      navigation={parentNavigation} 
      pageTitle="Settings" 
      userRole="parent"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
          <p className="text-gray-500">Manage your account settings and preferences</p>
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
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email Address
                </label>
                <Input id="email" defaultValue="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                  Phone Number
                </label>
                <Input id="phone" defaultValue="(555) 123-4567" />
              </div>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
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
              <Button onClick={handleUpdatePassword}>Update Password</Button>
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
                  <button 
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`h-6 w-11 rounded-full cursor-pointer flex items-center transition-colors ${
                      emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform ${
                      emailNotifications ? 'translate-x-5' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive text messages for urgent updates</p>
                  </div>
                  <button 
                    onClick={() => setSmsNotifications(!smsNotifications)}
                    className={`h-6 w-11 rounded-full cursor-pointer flex items-center transition-colors ${
                      smsNotifications ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform ${
                      smsNotifications ? 'translate-x-5' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>
                <Button onClick={handleSavePreferences}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
