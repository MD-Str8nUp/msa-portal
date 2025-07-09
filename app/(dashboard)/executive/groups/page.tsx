"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { mockGroupService } from "@/lib/mock/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ExecutiveGroupsPage() {
  // Get all groups
  const [groups, setGroups] = useState(mockGroupService.getGroups());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    location: '',
    meetingDay: 'Thursday',
    meetingTime: '6:00 PM',
    maxMembers: '20',
    description: ''
  });

  // Handle creating new group
  const handleCreateGroup = () => {
    if (!newGroup.name || !newGroup.location) {
      alert('Please fill in all required fields');
      return;
    }

    const group = {
      id: `group-${Date.now()}`,
      name: newGroup.name,
      location: newGroup.location,
      meetingDay: newGroup.meetingDay,
      meetingTime: newGroup.meetingTime,
      memberCount: 0,
      leaderName: 'Unassigned',
      leaderId: '', // Fixed: changed from null to empty string
      maxMembers: parseInt(newGroup.maxMembers),
      description: newGroup.description,
      createdAt: new Date().toISOString()
    };

    setGroups(prev => [...prev, group]);
    setShowCreateModal(false);
    setNewGroup({
      name: '',
      location: '',
      meetingDay: 'Thursday',
      meetingTime: '6:00 PM',
      maxMembers: '20',
      description: ''
    });
  };

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
        
        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{group.name}</span>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Location:</strong> {group.location}</p>
                  <p><strong>Meeting:</strong> {group.meetingDay}s at {group.meetingTime}</p>
                  <p><strong>Members:</strong> {group.memberCount || 0}</p>
                  <p><strong>Leader:</strong> {group.leaderName}</p>
                  {group.description && (
                    <p><strong>Description:</strong> {group.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Group</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    placeholder="e.g., Cubs A"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Location *</label>
                  <Input
                    value={newGroup.location}
                    onChange={(e) => setNewGroup({...newGroup, location: e.target.value})}
                    placeholder="e.g., Community Center"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Meeting Day</label>
                  <select
                    value={newGroup.meetingDay}
                    onChange={(e) => setNewGroup({...newGroup, meetingDay: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                
                <div>
                  <label className="block text-sm font-medium mb-1">Meeting Time</label>
                  <Input
                    value={newGroup.meetingTime}
                    onChange={(e) => setNewGroup({...newGroup, meetingTime: e.target.value})}
                    placeholder="e.g., 6:00 PM"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Max Members</label>
                  <Input
                    type="number"
                    value={newGroup.maxMembers}
                    onChange={(e) => setNewGroup({...newGroup, maxMembers: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    placeholder="Optional description"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGroup}>
                  Create Group
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}