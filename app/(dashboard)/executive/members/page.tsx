"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ALL_GROUPS } from "@/lib/constants/groups";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";

export default function ExecutiveMembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("scouts");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Data states
  const [scouts, setScouts] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  
  const [inviteData, setInviteData] = useState({
    email: '',
    name: '',
    role: 'parent',
    groupIds: [] as string[]
  });
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [activeTab]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Not authenticated');
        return;
      }
      
      // Fetch scouts
      const scoutsResponse = await fetch('/api/scouts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch users by role
      const parentsResponse = await fetch('/api/users?role=parent', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const leadersResponse = await fetch('/api/users?role=leader', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch groups
      const groupsResponse = await fetch('/api/groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (scoutsResponse.ok) {
        const scoutsData = await scoutsResponse.json();
        setScouts(scoutsData.data || []);
      }
      
      if (parentsResponse.ok) {
        const parentsData = await parentsResponse.json();
        setParents(parentsData.data || []);
      }
      
      if (leadersResponse.ok) {
        const leadersData = await leadersResponse.json();
        setLeaders(leadersData.data || []);
      }
      
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setGroups(groupsData.data || []);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter data based on search and filters
  const filteredScouts = scouts.filter(scout => {
    const matchesSearch = scout.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "all" || scout.group?.id === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const filteredParents = parents.filter(parent => 
    parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredLeaders = leaders.filter(leader => 
    leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leader.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle user invitation
  const handleInviteUser = async () => {
    if (!inviteData.email || !inviteData.name) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      // For leaders, use the leaders API, for parents use users API
      const endpoint = inviteData.role === 'leader' ? '/api/executive/leaders' : '/api/users';
      
      const requestBody = inviteData.role === 'leader' ? {
        name: inviteData.name,
        email: inviteData.email,
        password: 'temp123', // Temporary password
        groupIds: inviteData.groupIds
      } : {
        name: inviteData.name,
        email: inviteData.email,
        password: 'temp123', // Temporary password
        role: inviteData.role
      };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite user');
      }
      
      setSuccessMessage(`${inviteData.role} invited successfully! They can login with password: temp123`);
      setShowInviteModal(false);
      setInviteData({ email: '', name: '', role: 'parent', groupIds: [] });
      fetchData(); // Refresh data
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Error inviting user:', error);
      setError(error instanceof Error ? error.message : 'Failed to invite user');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout
      navigation={executiveNavigation}
      pageTitle="Members"
      userRole="executive"
    >
      <div className="p-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

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
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="mt-2 text-gray-500">Loading scouts...</p>
                  </div>
                ) : (
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
                              {scout.group?.name || 'No Group'}
                            </span>
                          </td>
                          <td className="py-4 px-4">{scout.rank}</td>
                          <td className="py-4 px-4">
                            <DateTimeDisplay date={new Date(scout.joinedDate)} format="MMM dd, yyyy" />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">View</Button>
                              <Button variant="outline" size="sm">Edit</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredScouts.length === 0 && !loading && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            No scouts found matching your search
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                )}
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
                              {parent.scouts?.length || 0} scout(s)
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
        <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={inviteData.name}
                  onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
                  className="col-span-3"
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  className="col-span-3"
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <select
                  id="role"
                  value={inviteData.role}
                  onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="parent">Parent</option>
                  <option value="leader">Leader</option>
                </select>
              </div>
              {inviteData.role === 'leader' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    Groups
                  </Label>
                  <div className="col-span-3 space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                    {ALL_GROUPS.map(group => (
                      <label key={group.name} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={inviteData.groupIds.includes(group.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setInviteData({
                                ...inviteData,
                                groupIds: [...inviteData.groupIds, group.name]
                              });
                            } else {
                              setInviteData({
                                ...inviteData,
                                groupIds: inviteData.groupIds.filter(id => id !== group.name)
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{group.name} (Ages {group.ageRange})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleInviteUser}
                disabled={isSubmitting || !inviteData.email || !inviteData.name}
              >
                {isSubmitting ? 'Inviting...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
