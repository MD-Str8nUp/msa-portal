"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderNavigation } from "@/components/navigation/LeaderNavigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { mockScoutService, mockGroupService, mockUsers } from "@/lib/mock/data";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

export default function LeaderSettingsPage() {
  // Get leader's data
  const leaderId = "user-2";
  const groups = mockGroupService.getGroups();
  const leaderGroups = groups.filter(group => group.leaderId === leaderId);
  const groupId = leaderGroups.length > 0 ? leaderGroups[0].id : null;
  const scouts = groupId ? mockScoutService.getScouts(undefined, groupId) : [];
  
  // Get parents of scouts in leader's group
  const parentIds = [...new Set(scouts.filter(scout => scout.parentId).map(scout => scout.parentId!))];
  const parents = mockUsers.filter(user => parentIds.includes(user.id));

  // State for member management
  const [activeTab, setActiveTab] = useState("profile");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("parent");

  // Handle inviting new member
  const handleInviteMember = () => {
    if (!inviteEmail) {
      alert('Please enter an email address');
      return;
    }
    
    console.log('Inviting member:', { email: inviteEmail, role: inviteRole });
    setShowInviteModal(false);
    setInviteEmail("");
    // In a real app, this would send an invitation
  };

  return (
    <DashboardLayout 
      navigation={leaderNavigation} 
      pageTitle="Settings" 
      userRole="leader"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Leader Settings & Group Management</h2>
          <p className="text-gray-500">Manage your profile, group settings, and members</p>
        </div>

        {/* Enhanced Settings with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="group">Group Settings</TabsTrigger>
            <TabsTrigger value="members">Group Members</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Input defaultValue="Jane Smith" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <Input defaultValue="jane.smith@msascouts.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <Input defaultValue="(555) 234-5678" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leadership Position</label>
                    <Input defaultValue="Eagle Scouts Group Leader" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <Input defaultValue="5 years" />
                  </div>
                  <Button className="bg-msa-sage hover:bg-msa-sage/90 text-white">Save Changes</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <Input type="password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <Input type="password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <Input type="password" />
                  </div>
                  <div className="bg-msa-sage/10 border border-msa-sage/20 rounded-lg p-3">
                    <p className="text-sm text-msa-charcoal font-medium">🔐 Security Reminder:</p>
                    <p className="text-xs text-msa-sage">Use a strong password to protect scout information</p>
                  </div>
                  <Button className="bg-msa-sage hover:bg-msa-sage/90 text-white">Update Password</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Group Settings Tab */}
          <TabsContent value="group" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Group Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                    <Input defaultValue="Eagle Scouts" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Description</label>
                    <textarea 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                      rows={3}
                      defaultValue="A dedicated group of young Muslims learning Islamic values through scouting activities."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                    <Input defaultValue="11-17 years" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Members</label>
                    <Input defaultValue="20" />
                  </div>
                  <Button className="bg-msa-sage hover:bg-msa-sage/90 text-white">Save Group Settings</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Location</label>
                    <Input defaultValue="MSA Community Center - Hall A" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Day</label>
                    <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent">
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Time</label>
                    <Input defaultValue="6:00 PM - 8:00 PM" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                    <textarea 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                      rows={2}
                      defaultValue="Please bring prayer mat and water bottle. Meeting starts with Maghrib prayer."
                    />
                  </div>
                  <Button className="bg-msa-sage hover:bg-msa-sage/90 text-white">Update Meeting Info</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Group Members Tab */}
          <TabsContent value="members" className="mt-6">
            <div className="space-y-6">
              {/* Member Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-msa-sage">{scouts.length}</div>
                    <div className="text-sm text-gray-500">Total Scouts</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-msa-sage">{parents.length}</div>
                    <div className="text-sm text-gray-500">Parents</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-msa-sage">1</div>
                    <div className="text-sm text-gray-500">Leaders</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-msa-sage">{scouts.length + parents.length + 1}</div>
                    <div className="text-sm text-gray-500">Total Members</div>
                  </CardContent>
                </Card>
              </div>

              {/* Members Management */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Group Members</CardTitle>
                    <Button 
                      onClick={() => setShowInviteModal(true)}
                      className="bg-msa-sage hover:bg-msa-sage/90 text-white"
                    >
                      Invite Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Scouts List */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Scouts ({scouts.length})</h3>
                    <div className="space-y-2">
                      {scouts.map(scout => (
                        <div key={scout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-msa-sage/20 flex items-center justify-center mr-3">
                              {scout.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{scout.name}</p>
                              <p className="text-sm text-gray-500">Age: {scout.age} • Rank: {scout.rank}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parents List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Parents ({parents.length})</h3>
                    <div className="space-y-2">
                      {parents.map(parent => (
                        <div key={parent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              {parent.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{parent.name}</p>
                              <p className="text-sm text-gray-500">
                                Parent of: {scouts.filter(s => s.parentId === parent.id).map(s => s.name).join(", ")}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Message</Button>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive emails about events and announcements</p>
                    </div>
                    <div className="h-6 w-11 bg-msa-sage rounded-full cursor-pointer flex items-center">
                      <div className="h-4 w-4 bg-white rounded-full ml-6 transition-all"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-gray-500">Receive text messages for urgent updates</p>
                    </div>
                    <div className="h-6 w-11 bg-gray-200 rounded-full cursor-pointer flex items-center">
                      <div className="h-4 w-4 bg-white rounded-full ml-1 transition-all"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">New Scout Alerts</h4>
                      <p className="text-sm text-gray-500">Get notified when new scouts join your group</p>
                    </div>
                    <div className="h-6 w-11 bg-msa-sage rounded-full cursor-pointer flex items-center">
                      <div className="h-4 w-4 bg-white rounded-full ml-6 transition-all"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Event Reminders</h4>
                      <p className="text-sm text-gray-500">Receive reminders about upcoming events</p>
                    </div>
                    <div className="h-6 w-11 bg-msa-sage rounded-full cursor-pointer flex items-center">
                      <div className="h-4 w-4 bg-white rounded-full ml-6 transition-all"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Weekly Reports</h4>
                      <p className="text-sm text-gray-500">Receive weekly summary reports</p>
                    </div>
                    <div className="h-6 w-11 bg-msa-sage rounded-full cursor-pointer flex items-center">
                      <div className="h-4 w-4 bg-white rounded-full ml-6 transition-all"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Islamic Reminders</h4>
                      <p className="text-sm text-gray-500">Daily Islamic quotes and prayer reminders</p>
                    </div>
                    <div className="h-6 w-11 bg-msa-sage rounded-full cursor-pointer flex items-center">
                      <div className="h-4 w-4 bg-white rounded-full ml-6 transition-all"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Invite New Member</h2>
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  >
                    <option value="parent">Parent</option>
                    <option value="assistant_leader">Assistant Leader</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>

                <div className="bg-msa-sage/10 border border-msa-sage/20 rounded-lg p-3">
                  <p className="text-sm text-msa-charcoal font-medium">📧 Invitation Process:</p>
                  <p className="text-xs text-msa-sage">An invitation email will be sent with registration instructions</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleInviteMember}
                  className="bg-msa-sage hover:bg-msa-sage/90 text-white"
                >
                  Send Invitation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
