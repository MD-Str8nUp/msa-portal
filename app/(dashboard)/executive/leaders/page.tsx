"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ALL_GROUPS } from "@/lib/constants/groups";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";

export default function ExecutiveLeadersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddLeaderModalOpen, setIsAddLeaderModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignGroupModalOpen, setIsAssignGroupModalOpen] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<any>(null);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newLeaderForm, setNewLeaderForm] = useState({
    name: "",
    email: "",
    password: "",
    groupIds: [] as string[]
  });
  const [editLeaderForm, setEditLeaderForm] = useState({
    id: "",
    name: "",
    email: "",
    groupAssignments: [] as { groupId: string; role: string }[]
  });
  
  // Fetch leaders from API
  useEffect(() => {
    fetchLeaders();
  }, []);
  
  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Not authenticated');
        return;
      }
      
      const response = await fetch('/api/executive/leaders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaders');
      }
      
      const data = await response.json();
      setLeaders(data.data || []);
    } catch (error) {
      console.error('Error fetching leaders:', error);
      setError('Failed to load leaders');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter leaders by search term
  const filteredLeaders = leaders.filter(leader => 
    leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leader.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle form submission
  const handleAddLeader = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/executive/leaders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLeaderForm),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create leader');
      }
      
      // Show success message
      setSuccessMessage(data.message || 'Leader created successfully');
      
      // Reset form and close modal
      setNewLeaderForm({ name: '', email: '', password: '', groupIds: [] });
      setIsAddLeaderModalOpen(false);
      
      // Refresh leaders list
      fetchLeaders();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error creating leader:', error);
      setError(error instanceof Error ? error.message : 'Failed to create leader');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle edit leader
  const handleEditLeader = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/executive/leaders', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editLeaderForm),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update leader');
      }
      
      setSuccessMessage(data.message || 'Leader updated successfully');
      setEditLeaderForm({ id: '', name: '', email: '', groupAssignments: [] });
      setIsEditModalOpen(false);
      fetchLeaders();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating leader:', error);
      setError(error instanceof Error ? error.message : 'Failed to update leader');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle assign groups
  const handleAssignGroups = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/executive/leaders', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedLeader.id,
          groupAssignments: editLeaderForm.groupAssignments
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign groups');
      }
      
      setSuccessMessage('Groups assigned successfully');
      setIsAssignGroupModalOpen(false);
      setSelectedLeader(null);
      fetchLeaders();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error assigning groups:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign groups');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Open edit modal
  const openEditModal = (leader: any) => {
    setSelectedLeader(leader);
    setEditLeaderForm({
      id: leader.id,
      name: leader.name,
      email: leader.email,
      groupAssignments: leader.leaderGroups?.map((lg: any) => ({
        groupId: lg.group.id,
        role: lg.role
      })) || []
    });
    setIsEditModalOpen(true);
  };
  
  // Open assign group modal
  const openAssignGroupModal = (leader: any) => {
    setSelectedLeader(leader);
    setEditLeaderForm({
      ...editLeaderForm,
      id: leader.id,
      groupAssignments: leader.leaderGroups?.map((lg: any) => ({
        groupId: lg.group.id,
        role: lg.role
      })) || []
    });
    setIsAssignGroupModalOpen(true);
  };
  
  return (
    <DashboardLayout
      navigation={executiveNavigation}
      pageTitle="Leaders"
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
            <h1 className="text-2xl font-bold">Leader Management</h1>
            <p className="text-gray-500">Manage scout leaders across the organization</p>
          </div>
          <Button onClick={() => setIsAddLeaderModalOpen(true)}>Add New Leader</Button>
        </div>
        
        {/* Search */}
        <div className="relative mb-6">
          <Input
            type="text"
            placeholder="Search leaders..."
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
        
        {/* Leaders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Scout Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-500">Loading leaders...</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Assigned Groups</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaders.map((leader) => {
                    return (
                      <tr key={leader.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              {leader.name.charAt(0)}
                            </div>
                            <span className="font-medium">{leader.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">{leader.email}</td>
                        <td className="py-4 px-4">
                          {leader.leaderGroups && leader.leaderGroups.length > 0 ? (
                            <div>
                              {leader.leaderGroups.map((lg: any) => (
                                <span key={lg.group.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                                  {lg.group.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No groups assigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            leader.isOnline 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {leader.isOnline ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(leader)}>Edit</Button>
                            <Button variant="outline" size="sm" onClick={() => openAssignGroupModal(leader)}>Assign Group</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLeaders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No leaders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
          </CardContent>
        </Card>
        
        {/* Leader Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leader Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-3xl font-bold">{leaders.length}</p>
                <p className="text-gray-500">Total Leaders</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Assigned to groups:</span>
                    <span className="font-medium">
                      {leaders.filter(l => l.leaderGroups && l.leaderGroups.length > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Unassigned:</span>
                    <span className="font-medium">
                      {leaders.filter(l => !l.leaderGroups || l.leaderGroups.length === 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Multiple groups:</span>
                    <span className="font-medium">
                      {leaders.filter(l => l.leaderGroups && l.leaderGroups.length > 1).length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leader Training</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-3xl font-bold">{Math.round(leaders.length * 0.7)}</p>
                <p className="text-gray-500">Fully Trained</p>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: '70%' }}></div>
                </div>
                <div className="text-sm text-gray-500">70% of leaders have completed all training</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setIsAddLeaderModalOpen(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Add New Leader
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <polyline points="16 11 18 13 22 9"></polyline>
                  </svg>
                  Bulk Assign Groups
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <line x1="10" y1="9" x2="8" y2="9"></line>
                  </svg>
                  Generate Leader Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add New Leader Modal */}
      <Dialog open={isAddLeaderModalOpen} onOpenChange={setIsAddLeaderModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Leader</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newLeaderForm.name}
                onChange={(e) => setNewLeaderForm({...newLeaderForm, name: e.target.value})}
                className="col-span-3"
                placeholder="Enter leader name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newLeaderForm.email}
                onChange={(e) => setNewLeaderForm({...newLeaderForm, email: e.target.value})}
                className="col-span-3"
                placeholder="leader@email.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={newLeaderForm.password}
                onChange={(e) => setNewLeaderForm({...newLeaderForm, password: e.target.value})}
                className="col-span-3"
                placeholder="Enter password"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group" className="text-right">
                Groups
              </Label>
              <div className="col-span-3">
                <select
                  id="group"
                  multiple
                  value={newLeaderForm.groupIds}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setNewLeaderForm({...newLeaderForm, groupIds: selectedOptions});
                  }}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {ALL_GROUPS.map(group => (
                    <option key={group.name} value={group.name}>{group.name} (Ages {group.ageRange})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple groups</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLeaderModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddLeader}
              disabled={isSubmitting || !newLeaderForm.name || !newLeaderForm.email || !newLeaderForm.password}
            >
              {isSubmitting ? 'Adding...' : 'Add Leader'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Leader Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Leader</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editLeaderForm.name}
                onChange={(e) => setEditLeaderForm({...editLeaderForm, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editLeaderForm.email}
                onChange={(e) => setEditLeaderForm({...editLeaderForm, email: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditLeader}
              disabled={isSubmitting || !editLeaderForm.name || !editLeaderForm.email}
            >
              {isSubmitting ? 'Updating...' : 'Update Leader'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Groups Modal */}
      <Dialog open={isAssignGroupModalOpen} onOpenChange={setIsAssignGroupModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Groups to {selectedLeader?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <Label>Select Groups</Label>
              <div className="max-h-[300px] overflow-y-auto border rounded-md p-4">
                {ALL_GROUPS.map((group) => {
                  const isAssigned = editLeaderForm.groupAssignments.some(
                    (ga) => ga.groupId === group.name
                  );
                  return (
                    <div key={group.name} className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        id={`group-${group.name}`}
                        checked={isAssigned}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditLeaderForm({
                              ...editLeaderForm,
                              groupAssignments: [
                                ...editLeaderForm.groupAssignments,
                                { groupId: group.name, role: 'leader' }
                              ]
                            });
                          } else {
                            setEditLeaderForm({
                              ...editLeaderForm,
                              groupAssignments: editLeaderForm.groupAssignments.filter(
                                (ga) => ga.groupId !== group.name
                              )
                            });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`group-${group.name}`} className="flex-1 cursor-pointer">
                        <span className="font-medium">{group.name}</span>
                        <span className="text-sm text-gray-500 ml-2">(Ages {group.ageRange})</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignGroupModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignGroups}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Assigning...' : 'Assign Groups'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
