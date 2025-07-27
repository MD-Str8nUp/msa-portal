"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface GroupData {
  id: string;
  name: string;
  academy: string;
  leaderId?: string;
  leaderName?: string;
  memberCount: number;
  maxMembers: number;
  meetingDay: string;
  meetingTime: string;
  location: string;
  description: string;
  status: 'active' | 'inactive' | 'forming';
  ageRange: string;
  createdDate: string;
  members: GroupMember[];
}

interface GroupMember {
  id: string;
  name: string;
  age: number;
  rank?: string;
  joinedDate: string;
  role: 'scout' | 'leader' | 'assistant';
}

interface GroupAdministrationProps {
  className?: string;
}

const GroupAdministration: React.FC<GroupAdministrationProps> = ({ className = "" }) => {
  const [selectedAcademy, setSelectedAcademy] = useState<string>('all');
  const [draggedItem, setDraggedItem] = useState<{type: 'leader' | 'scout', id: string, name: string} | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    academy: 'Main Academy',
    location: '',
    meetingDay: 'Monday',
    meetingTime: '16:00',
    maxMembers: '20',
    ageRange: '8-12',
    description: ''
  });

  // Mock comprehensive group data
  const [groups, setGroups] = useState<GroupData[]>([
    {
      id: 'group-1',
      name: 'Eagle Scouts',
      academy: 'Main Academy',
      leaderId: 'leader-1',
      leaderName: 'Ahmad Rahman',
      memberCount: 15,
      maxMembers: 20,
      meetingDay: 'Monday',
      meetingTime: '16:00',
      location: 'Community Center A',
      description: 'Advanced scouting group for experienced members',
      status: 'active',
      ageRange: '12-16',
      createdDate: '2023-01-15',
      members: [
        { id: 'scout-1', name: 'Omar Ali', age: 13, rank: 'First Class', joinedDate: '2023-02-01', role: 'scout' },
        { id: 'scout-2', name: 'Yasmin Hassan', age: 14, rank: 'Star', joinedDate: '2023-02-15', role: 'scout' },
        { id: 'scout-3', name: 'Ibrahim Ahmed', age: 12, rank: 'Second Class', joinedDate: '2023-03-01', role: 'scout' }
      ]
    },
    {
      id: 'group-2',
      name: 'Wolf Pack',
      academy: 'North Branch',
      leaderId: 'leader-2',
      leaderName: 'Fatima Malik',
      memberCount: 12,
      maxMembers: 18,
      meetingDay: 'Wednesday',
      meetingTime: '17:00',
      location: 'North Branch Hall',
      description: 'Energetic group focusing on outdoor activities',
      status: 'active',
      ageRange: '8-12',
      createdDate: '2023-03-10',
      members: [
        { id: 'scout-4', name: 'Aisha Khan', age: 10, rank: 'Tenderfoot', joinedDate: '2023-04-01', role: 'scout' },
        { id: 'scout-5', name: 'Zaid Ibrahim', age: 11, rank: 'Second Class', joinedDate: '2023-04-15', role: 'scout' }
      ]
    },
    {
      id: 'group-3',
      name: 'Trailblazers',
      academy: 'South Branch',
      leaderId: 'leader-3',
      leaderName: 'Hassan Omar',
      memberCount: 8,
      maxMembers: 15,
      meetingDay: 'Thursday',
      meetingTime: '16:30',
      location: 'South Branch Center',
      description: 'New group with focus on leadership development',
      status: 'forming',
      ageRange: '10-14',
      createdDate: '2024-11-01',
      members: [
        { id: 'scout-6', name: 'Mariam Said', age: 12, rank: 'Scout', joinedDate: '2024-11-15', role: 'scout' },
        { id: 'scout-7', name: 'Ali Hassan', age: 13, rank: 'Tenderfoot', joinedDate: '2024-12-01', role: 'scout' }
      ]
    },
    {
      id: 'group-4',
      name: 'Cubs Den',
      academy: 'Main Academy',
      memberCount: 0,
      maxMembers: 12,
      meetingDay: 'Saturday',
      meetingTime: '10:00',
      location: 'Main Academy Room B',
      description: 'New cubs group - seeking leader',
      status: 'forming',
      ageRange: '6-8',
      createdDate: '2025-01-10',
      members: []
    }
  ]);

  // Available leaders for assignment
  const availableLeaders = [
    { id: 'leader-4', name: 'Yusuf Abdullah', academy: 'Main Academy', experience: '3 years' },
    { id: 'leader-5', name: 'Khadija Mahmoud', academy: 'North Branch', experience: '2 years' },
    { id: 'leader-6', name: 'Mohamed Salem', academy: 'South Branch', experience: '5 years' }
  ];

  // Available scouts for reassignment
  const unassignedScouts = [
    { id: 'scout-8', name: 'Layla Ahmed', age: 11, academy: 'Main Academy' },
    { id: 'scout-9', name: 'Adam Khan', age: 12, academy: 'North Branch' },
    { id: 'scout-10', name: 'Nour Hassan', age: 10, academy: 'South Branch' }
  ];

  // Filter groups by academy
  const filteredGroups = selectedAcademy === 'all' 
    ? groups 
    : groups.filter(group => group.academy === selectedAcademy);

  // Group statistics
  const groupStats = {
    totalGroups: groups.length,
    activeGroups: groups.filter(g => g.status === 'active').length,
    formingGroups: groups.filter(g => g.status === 'forming').length,
    totalMembers: groups.reduce((sum, group) => sum + group.memberCount, 0),
    averageGroupSize: Math.round(groups.reduce((sum, group) => sum + group.memberCount, 0) / groups.length),
    groupsNeedingLeaders: groups.filter(g => !g.leaderId).length
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, type: 'leader' | 'scout', id: string, name: string) => {
    setDraggedItem({ type, id, name });
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop on group
  const handleDropOnGroup = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    if (draggedItem.type === 'leader') {
      // Assign leader to group
      const updatedGroups = groups.map(g => {
        if (g.id === groupId) {
          return { 
            ...g, 
            leaderId: draggedItem.id, 
            leaderName: draggedItem.name,
            status: g.status === 'forming' ? 'active' : g.status
          };
        }
        // Remove leader from previous group if any
        if (g.leaderId === draggedItem.id) {
          return { ...g, leaderId: undefined, leaderName: undefined };
        }
        return g;
      });
      setGroups(updatedGroups);
    } else if (draggedItem.type === 'scout') {
      // Add scout to group (simplified - would need proper member management)
      console.log(`Moving scout ${draggedItem.name} to group ${group.name}`);
    }

    setDraggedItem(null);
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'forming':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle create group
  const handleCreateGroup = () => {
    if (!newGroup.name || !newGroup.location) {
      alert('Please fill in all required fields');
      return;
    }

    const group: GroupData = {
      id: `group-${Date.now()}`,
      name: newGroup.name,
      academy: newGroup.academy,
      memberCount: 0,
      maxMembers: parseInt(newGroup.maxMembers),
      meetingDay: newGroup.meetingDay,
      meetingTime: newGroup.meetingTime,
      location: newGroup.location,
      description: newGroup.description,
      status: 'forming',
      ageRange: newGroup.ageRange,
      createdDate: new Date().toISOString().split('T')[0],
      members: []
    };

    setGroups([...groups, group]);
    setShowCreateModal(false);
    setNewGroup({
      name: '',
      academy: 'Main Academy',
      location: '',
      meetingDay: 'Monday',
      meetingTime: '16:00',
      maxMembers: '20',
      ageRange: '8-12',
      description: ''
    });
  };

  // Handle group deletion
  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      setGroups(groups.filter(g => g.id !== groupId));
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Group Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-msa-sage">{groupStats.totalGroups}</div>
            <p className="text-xs text-msa-sage/70">Across all academies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{groupStats.activeGroups}</div>
            <p className="text-xs text-msa-sage/70">Fully operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Need Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{groupStats.groupsNeedingLeaders}</div>
            <p className="text-xs text-msa-sage/70">Awaiting assignment</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-4">
              <select
                value={selectedAcademy}
                onChange={(e) => setSelectedAcademy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
              >
                <option value="all">All Academies</option>
                <option value="Main Academy">Main Academy</option>
                <option value="North Branch">North Branch</option>
                <option value="South Branch">South Branch</option>
              </select>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-msa-sage hover:bg-msa-sage/90 text-white"
            >
              Create New Group
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGroups.map(group => (
          <Card 
            key={group.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnGroup(e, group.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <p className="text-sm text-msa-sage/70">{group.academy}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(group.status)}`}>
                  {group.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Leader Section */}
              <div className="p-3 bg-msa-sage/5 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Group Leader</h4>
                {group.leaderName ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{group.leaderName}</span>
                    <Button variant="outline" size="sm" className="text-xs">
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-orange-600 font-medium">
                    🚨 Leader Needed
                    <p className="text-xs text-gray-500 mt-1">Drag a leader here</p>
                  </div>
                )}
              </div>

              {/* Group Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Members:</span>
                  <span className="font-medium">{group.memberCount}/{group.maxMembers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Age Range:</span>
                  <span>{group.ageRange}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Meetings:</span>
                  <span>{group.meetingDay}s {group.meetingTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Location:</span>
                  <span>{group.location}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-msa-sage h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(group.memberCount / group.maxMembers) * 100}%` }}
                ></div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowMemberModal(true);
                  }}
                >
                  Members
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Leaders and Scouts for Assignment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Leaders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Available Leaders</CardTitle>
            <p className="text-sm text-msa-sage/70">Drag leaders to assign them to groups</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableLeaders.map(leader => (
                <div
                  key={leader.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'leader', leader.id, leader.name)}
                  className="p-3 border border-gray-200 rounded-lg cursor-move hover:bg-msa-sage/5 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{leader.name}</div>
                      <div className="text-sm text-gray-500">{leader.academy}</div>
                    </div>
                    <div className="text-xs text-msa-sage">
                      {leader.experience}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unassigned Scouts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Unassigned Scouts</CardTitle>
            <p className="text-sm text-msa-sage/70">Scouts awaiting group assignment</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unassignedScouts.map(scout => (
                <div
                  key={scout.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'scout', scout.id, scout.name)}
                  className="p-3 border border-gray-200 rounded-lg cursor-move hover:bg-blue-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{scout.name}</div>
                      <div className="text-sm text-gray-500">{scout.academy}</div>
                    </div>
                    <div className="text-xs text-blue-600">
                      Age {scout.age}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Group</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name *
                </label>
                <Input
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academy *
                </label>
                <select
                  value={newGroup.academy}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, academy: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                >
                  <option value="Main Academy">Main Academy</option>
                  <option value="North Branch">North Branch</option>
                  <option value="South Branch">South Branch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Location *
                </label>
                <Input
                  value={newGroup.location}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter meeting location"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Day
                  </label>
                  <select
                    value={newGroup.meetingDay}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, meetingDay: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Time
                  </label>
                  <Input
                    type="time"
                    value={newGroup.meetingTime}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, meetingTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Range
                  </label>
                  <select
                    value={newGroup.ageRange}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, ageRange: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  >
                    <option value="6-8">6-8 years (Cubs)</option>
                    <option value="8-12">8-12 years (Scouts)</option>
                    <option value="12-16">12-16 years (Venturers)</option>
                    <option value="16-18">16-18 years (Rovers)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Members
                  </label>
                  <Input
                    type="number"
                    value={newGroup.maxMembers}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, maxMembers: e.target.value }))}
                    min="5"
                    max="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Description
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  rows={3}
                  placeholder="Describe the group's focus and activities"
                />
              </div>

              <div className="bg-msa-sage/10 border border-msa-sage/20 rounded-lg p-3">
                <p className="text-sm text-msa-charcoal font-medium">🕌 Group Foundation:</p>
                <p className="text-xs text-msa-sage">"And hold firmly to the rope of Allah all together and do not become divided" - Quran 3:103</p>
                <p className="text-xs text-msa-sage mt-1">Building unity and brotherhood through Islamic scouting</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateGroup}
                className="bg-msa-sage hover:bg-msa-sage/90 text-white"
              >
                Create Group
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Islamic Values Message */}
      <Card className="bg-gradient-to-r from-msa-sage/5 to-msa-golden/5 border-msa-sage/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏕️</div>
            <div>
              <h3 className="text-lg font-semibold text-msa-charcoal">Group Leadership & Unity</h3>
              <p className="text-sm text-msa-sage/80 mt-1">
                "And We made from them leaders guiding by Our command when they were patient and were certain of Our signs." - Quran 32:24
              </p>
              <p className="text-xs text-msa-sage/70 mt-2">
                Every group formation decision shapes our scouts' Islamic character development and community bonds.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupAdministration;