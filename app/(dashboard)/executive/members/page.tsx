"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { mockScouts, mockGroupService, mockUsers } from "@/lib/mock/data";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

export default function ExecutiveMembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedRank, setSelectedRank] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("scouts");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'parent',
    groupId: ''
  });
  
  // Get all groups for filtering
  const groups = mockGroupService.getGroups();
  
  // Get different user types
  const scouts = mockScouts;
  const parents = mockUsers.filter(user => user.role === 'parent');
  const leaders = mockUsers.filter(user => user.role === 'leader');
  
  // Filter scouts based on selected filters
  const filteredScouts = scouts.filter(scout => {
    const matchesSearch = scout.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "all" || scout.groupId === selectedGroup;
    const matchesRank = selectedRank === "all" || scout.rank === selectedRank;
    
    return matchesSearch && matchesGroup && matchesRank;
  });

  // Filter other user types
  const filteredParents = parents.filter(parent => 
    parent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredLeaders = leaders.filter(leader => 
    leader.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get unique ranks for filter options
  const ranks = [...new Set(scouts.map(scout => scout.rank))];

  // Handle user invitation
  const handleInviteUser = () => {
    if (!inviteData.email) {
      alert('Please enter an email address');
      return;
    }
    
    console.log('Inviting user:', inviteData);
    setShowInviteModal(false);
    setInviteData({ email: '', role: 'parent', groupId: '' });
  };
  
  return (
    <DashboardLayout
      navigation={executiveNavigation}
      pageTitle="Members"
      userRole="executive"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-gray-500">Manage all users across the Mi'raj Scouts Academy</p>
          </div>
          <Button 
            onClick={() => setShowInviteModal(true)}
            className="bg-msa-sage hover:bg-msa-sage/90 text-white"
          >
            Invite User
          </Button>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-msa-sage">{scouts.length}</div>
              <div className="text-sm text-gray-500">Total Scouts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{parents.length}</div>
              <div className="text-sm text-gray-500">Parents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{leaders.length}</div>
              <div className="text-sm text-gray-500">Leaders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-msa-golden">{scouts.length + parents.length + leaders.length}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scouts">Scouts ({scouts.length})</TabsTrigger>
            <TabsTrigger value="parents">Parents ({parents.length})</TabsTrigger>
            <TabsTrigger value="leaders">Leaders ({leaders.length})</TabsTrigger>
          </TabsList>
          
          {/* Search Filter */}
          <div className="mt-6 mb-4">
            <div className="relative max-w-md">
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
          </div>

          {/* Scouts Tab */}
          <TabsContent value="scouts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Scout Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Age</th>
                        <th className="text-left py-3 px-4">Group</th>
                        <th className="text-left py-3 px-4">Rank</th>
                        <th className="text-left py-3 px-4">Joined Date</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScouts.map((scout) => (
                        <tr key={scout.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-medium">{scout.name}</div>
                          </td>
                          <td className="py-4 px-4">{scout.age}</td>
                          <td className="py-4 px-4">
                            <span className="bg-msa-sage/20 text-msa-sage text-xs px-2 py-1 rounded">
                              {scout.groupName}
                            </span>
                          </td>
                          <td className="py-4 px-4">{scout.rank}</td>
                          <td className="py-4 px-4">
                            <DateTimeDisplay date={scout.joinedDate} format="MMM dd, yyyy" />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">View</Button>
                              <Button variant="outline" size="sm">Edit</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredScouts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            No scouts found matching your search
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parents Tab */}
          <TabsContent value="parents" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Parent Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Children</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredParents.map((parent) => (
                        <tr key={parent.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-medium">{parent.name}</div>
                          </td>
                          <td className="py-4 px-4">{parent.email}</td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">
                              {scouts.filter(s => s.parentId === parent.id).length} scout(s)
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Active
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">View</Button>
                              <Button variant="outline" size="sm">Message</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredParents.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            No parents found matching your search
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaders Tab */}
          <TabsContent value="leaders" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Leader Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Assigned Group</th>
                        <th className="text-left py-3 px-4">Experience</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaders.map((leader) => (
                        <tr key={leader.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-medium">{leader.name}</div>
                          </td>
                          <td className="py-4 px-4">{leader.email}</td>
                          <td className="py-4 px-4">
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                              {groups.find(g => g.leaderId === leader.id)?.name || 'Unassigned'}
                            </span>
                          </td>
                          <td className="py-4 px-4">5 years</td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">View</Button>
                              <Button variant="outline" size="sm">Assign Group</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredLeaders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            No leaders found matching your search
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Invite User Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Invite New User</h2>
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
                    value={inviteData.email}
                    onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={inviteData.role}
                    onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  >
                    <option value="parent">Parent</option>
                    <option value="leader">Leader</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {inviteData.role === 'leader' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Group</label>
                    <select
                      value={inviteData.groupId}
                      onChange={(e) => setInviteData(prev => ({ ...prev, groupId: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                    >
                      <option value="">Select Group (Optional)</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="bg-msa-sage/10 border border-msa-sage/20 rounded-lg p-3">
                  <p className="text-sm text-msa-charcoal font-medium">📧 Invitation Process:</p>
                  <p className="text-xs text-msa-sage">User will receive an email with registration instructions and role assignment</p>
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
                  onClick={handleInviteUser}
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
