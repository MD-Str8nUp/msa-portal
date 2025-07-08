"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Button } from "@/components/ui/Button";
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

export default function ExecutiveGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  
  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    description: '',
    meetingDay: 'Thursday',
    meetingTime: '6:00 PM',
    maxMembers: 20,
    ageMin: 5,
    ageMax: 7,
    location: 'MSA Community Center'
  });

  const [editGroupForm, setEditGroupForm] = useState({
    id: '',
    name: '',
    description: '',
    meetingDay: 'Thursday',
    meetingTime: '6:00 PM',
    maxMembers: 20,
    ageMin: 5,
    ageMax: 7,
    location: 'MSA Community Center'
  });

  // Fetch groups from API
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/groups?withStats=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.status}`);
      }
      
      const data = await response.json();
      setGroups(data.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupForm.name || !newGroupForm.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newGroupForm.name,
          description: newGroupForm.description,
          meetingDay: newGroupForm.meetingDay,
          meetingTime: newGroupForm.meetingTime,
          maxMembers: newGroupForm.maxMembers,
          ageMin: newGroupForm.ageMin,
          ageMax: newGroupForm.ageMax,
          location: newGroupForm.location
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create group');
      }

      const createdGroup = await response.json();
      setGroups(prev => [...prev, createdGroup.data]);
      setSuccessMessage('Group created successfully!');
      setShowCreateModal(false);
      
      // Reset form
      setNewGroupForm({
        name: '',
        description: '',
        meetingDay: 'Thursday',
        meetingTime: '6:00 PM',
        maxMembers: 20,
        ageMin: 5,
        ageMax: 7,
        location: 'MSA Community Center'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error: any) {
      console.error('Error creating group:', error);
      setError(error.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGroup = async () => {
    if (!editGroupForm.name || !editGroupForm.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch('/api/groups', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editGroupForm.id,
          name: editGroupForm.name,
          description: editGroupForm.description,
          meetingDay: editGroupForm.meetingDay,
          meetingTime: editGroupForm.meetingTime,
          maxMembers: editGroupForm.maxMembers,
          ageMin: editGroupForm.ageMin,
          ageMax: editGroupForm.ageMax,
          location: editGroupForm.location
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update group');
      }

      const updatedGroup = await response.json();
      setGroups(prev => prev.map(group => 
        group.id === editGroupForm.id ? updatedGroup.data : group
      ));
      
      setSuccessMessage('Group updated successfully!');
      setIsEditModalOpen(false);
      setSelectedGroup(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error: any) {
      console.error('Error updating group:', error);
      setError(error.message || 'Failed to update group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      
      const response = await fetch(`/api/groups?id=${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete group');
      }

      setGroups(prev => prev.filter(group => group.id !== groupId));
      setSuccessMessage('Group deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error: any) {
      console.error('Error deleting group:', error);
      setError(error.message || 'Failed to delete group');
    }
  };

  const openEditModal = (group: any) => {
    setSelectedGroup(group);
    setEditGroupForm({
      id: group.id,
      name: group.name,
      description: group.description || '',
      meetingDay: group.meetingDay || 'Thursday',
      meetingTime: group.meetingTime || '6:00 PM',
      maxMembers: group.maxMembers || 20,
      ageMin: group.ageMin || 5,
      ageMax: group.ageMax || 7,
      location: group.location || 'MSA Community Center'
    });
    setIsEditModalOpen(true);
  };

  // Clear messages when they exist
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  return (
    <DashboardLayout
      navigation={executiveNavigation}
      pageTitle="Groups"
      userRole="executive"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Group Management</h1>
            <p className="text-gray-500">Manage scout groups across the academy</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            Create New Group
          </Button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Groups Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p>Loading groups...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{group.name}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(group)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Description:</strong> {group.description || 'No description'}</p>
                    <p><strong>Total Scouts:</strong> {group.stats?.totalScouts || 0}</p>
                    <p><strong>Active Scouts:</strong> {group.stats?.activeScouts || 0}</p>
                    <p><strong>Leaders:</strong> {group.stats?.totalLeaders || 0}</p>
                    <p><strong>Upcoming Events:</strong> {group.stats?.upcomingEvents || 0}</p>
                    {group.groupLeaders && group.groupLeaders.length > 0 && (
                      <p><strong>Lead by:</strong> {group.groupLeaders.map((gl: any) => gl.user.name).join(', ')}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Group Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="group-name"
                  value={newGroupForm.name}
                  onChange={(e) => setNewGroupForm({...newGroupForm, name: e.target.value})}
                  placeholder="e.g., Cubs A"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-description" className="text-right">
                  Description *
                </Label>
                <Input
                  id="group-description"
                  value={newGroupForm.description}
                  onChange={(e) => setNewGroupForm({...newGroupForm, description: e.target.value})}
                  placeholder="Group description"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="age-range" className="text-right">
                  Age Range
                </Label>
                <div className="col-span-3 flex space-x-2">
                  <Input
                    type="number"
                    value={newGroupForm.ageMin}
                    onChange={(e) => setNewGroupForm({...newGroupForm, ageMin: parseInt(e.target.value)})}
                    placeholder="Min"
                    min="5"
                    max="18"
                  />
                  <span className="self-center">to</span>
                  <Input
                    type="number"
                    value={newGroupForm.ageMax}
                    onChange={(e) => setNewGroupForm({...newGroupForm, ageMax: parseInt(e.target.value)})}
                    placeholder="Max"
                    min="5"
                    max="18"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="max-members" className="text-right">
                  Max Members
                </Label>
                <Input
                  id="max-members"
                  type="number"
                  value={newGroupForm.maxMembers}
                  onChange={(e) => setNewGroupForm({...newGroupForm, maxMembers: parseInt(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={newGroupForm.location}
                  onChange={(e) => setNewGroupForm({...newGroupForm, location: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meeting-day" className="text-right">
                  Meeting Day
                </Label>
                <select
                  id="meeting-day"
                  value={newGroupForm.meetingDay}
                  onChange={(e) => setNewGroupForm({...newGroupForm, meetingDay: e.target.value})}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meeting-time" className="text-right">
                  Meeting Time
                </Label>
                <Input
                  id="meeting-time"
                  value={newGroupForm.meetingTime}
                  onChange={(e) => setNewGroupForm({...newGroupForm, meetingTime: e.target.value})}
                  placeholder="e.g., 6:00 PM"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateGroup}
                disabled={isSubmitting || !newGroupForm.name || !newGroupForm.description}
              >
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Group Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="edit-name"
                  value={editGroupForm.name}
                  onChange={(e) => setEditGroupForm({...editGroupForm, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description *
                </Label>
                <Input
                  id="edit-description"
                  value={editGroupForm.description}
                  onChange={(e) => setEditGroupForm({...editGroupForm, description: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-age-range" className="text-right">
                  Age Range
                </Label>
                <div className="col-span-3 flex space-x-2">
                  <Input
                    type="number"
                    value={editGroupForm.ageMin}
                    onChange={(e) => setEditGroupForm({...editGroupForm, ageMin: parseInt(e.target.value)})}
                    min="5"
                    max="18"
                  />
                  <span className="self-center">to</span>
                  <Input
                    type="number"
                    value={editGroupForm.ageMax}
                    onChange={(e) => setEditGroupForm({...editGroupForm, ageMax: parseInt(e.target.value)})}
                    min="5"
                    max="18"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-max-members" className="text-right">
                  Max Members
                </Label>
                <Input
                  id="edit-max-members"
                  type="number"
                  value={editGroupForm.maxMembers}
                  onChange={(e) => setEditGroupForm({...editGroupForm, maxMembers: parseInt(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-location" className="text-right">
                  Location
                </Label>
                <Input
                  id="edit-location"
                  value={editGroupForm.location}
                  onChange={(e) => setEditGroupForm({...editGroupForm, location: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-meeting-day" className="text-right">
                  Meeting Day
                </Label>
                <select
                  id="edit-meeting-day"
                  value={editGroupForm.meetingDay}
                  onChange={(e) => setEditGroupForm({...editGroupForm, meetingDay: e.target.value})}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-meeting-time" className="text-right">
                  Meeting Time
                </Label>
                <Input
                  id="edit-meeting-time"
                  value={editGroupForm.meetingTime}
                  onChange={(e) => setEditGroupForm({...editGroupForm, meetingTime: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditGroup}
                disabled={isSubmitting || !editGroupForm.name || !editGroupForm.description}
              >
                {isSubmitting ? 'Updating...' : 'Update Group'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}