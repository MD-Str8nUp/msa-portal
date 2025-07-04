"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ExecutiveSettingsPage() {
  return (
    <DashboardLayout 
      navigation={executiveNavigation} 
      pageTitle="Settings" 
      userRole="executive"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Executive Settings</h2>
          <p className="text-gray-500">Manage your organization settings and preferences</p>
        </div>
        
        {/* Settings Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Full Name
                </label>
                <Input id="name" defaultValue="Sarah Williams" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email Address
                </label>
                <Input id="email" defaultValue="sarah@scoutexecutive.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                  Phone Number
                </label>
                <Input id="phone" defaultValue="(555) 345-6789" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                  Executive Title
                </label>
                <Input id="title" defaultValue="Regional Director" />
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
          
          {/* Organization Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="orgName">
                  Organization Name
                </label>
                <Input id="orgName" defaultValue="National Scout Association" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="orgAddress">
                  Headquarters Address
                </label>
                <Input id="orgAddress" defaultValue="123 Main Street, Suite 500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="orgCity">
                  City
                </label>
                <Input id="orgCity" defaultValue="Scoutville" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="orgState">
                  State/Province
                </label>
                <Input id="orgState" defaultValue="NY" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="orgZip">
                  Zip/Postal Code
                </label>
                <Input id="orgZip" defaultValue="10001" />
              </div>
              <Button>Update Organization</Button>
            </CardContent>
          </Card>
          
          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Global email settings for all users</p>
                  </div>
                  <div className="h-6 w-11 bg-gray-200 rounded-full cursor-pointer flex items-center"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Global SMS settings for all users</p>
                  </div>
                  <div className="h-6 w-11 bg-gray-200 rounded-full cursor-pointer flex items-center"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Event Creation</h4>
                    <p className="text-sm text-gray-500">Allow group leaders to create events</p>
                  </div>
                  <div className="h-6 w-11 bg-gray-200 rounded-full cursor-pointer flex items-center"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Public Member Directory</h4>
                    <p className="text-sm text-gray-500">Make member directory visible to all users</p>
                  </div>
                  <div className="h-6 w-11 bg-gray-200 rounded-full cursor-pointer flex items-center"></div>
                </div>
                <Button className="mt-4">Save System Settings</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
