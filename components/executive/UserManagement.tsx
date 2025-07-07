"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'scout' | 'parent' | 'leader' | 'executive' | 'admin';
  academy: string;
  groupId?: string;
  groupName?: string;
  phone?: string;
  joinDate: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  age?: number;
  parentId?: string;
  children?: string[];
}

interface UserManagementProps {
  className?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedAcademy, setSelectedAcademy] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Mock comprehensive user data
  const users: User[] = [
    {
      id: 'user-1',
      name: 'Ahmad Ali',
      email: 'ahmad.ali@email.com',
      role: 'scout',
      academy: 'Main Academy',
      groupId: 'group-1',
      groupName: 'Eagle Scouts',
      phone: '+1234567890',
      joinDate: '2023-06-15',
      lastActive: '2025-01-18',
      status: 'active',
      permissions: ['view_profile', 'join_events'],
      age: 12,
      parentId: 'user-5'
    },
    {
      id: 'user-2',
      name: 'Fatima Hassan',
      email: 'fatima.hassan@email.com',
      role: 'leader',
      academy: 'North Branch',
      groupId: 'group-2',
      groupName: 'Wolf Pack',
      phone: '+1234567891',
      joinDate: '2022-03-10',
      lastActive: '2025-01-19',
      status: 'active',
      permissions: ['manage_group', 'view_reports', 'send_messages'],
      children: ['user-8', 'user-9']
    },
    {
      id: 'user-3',
      name: 'Omar Ahmed',
      email: 'omar.ahmed@email.com',
      role: 'parent',
      academy: 'South Branch',
      phone: '+1234567892',
      joinDate: '2023-01-20',
      lastActive: '2025-01-17',
      status: 'active',
      permissions: ['view_child_progress', 'pay_fees'],
      children: ['user-1', 'user-10']
    },
    {
      id: 'user-4',
      name: 'Aisha Khan',
      email: 'aisha.khan@email.com',
      role: 'executive',
      academy: 'Main Academy',
      phone: '+1234567893',
      joinDate: '2021-08-05',
      lastActive: '2025-01-19',
      status: 'active',
      permissions: ['full_access', 'manage_finances', 'admin_control']
    },
    {
      id: 'user-5',
      name: 'Yusuf Ibrahim',
      email: 'yusuf.ibrahim@email.com',
      role: 'leader',
      academy: 'Main Academy',
      groupId: 'group-3',
      groupName: 'Trailblazers',
      phone: '+1234567894',
      joinDate: '2022-09-15',
      lastActive: '2025-01-18',
      status: 'active',
      permissions: ['manage_group', 'view_reports', 'send_messages']
    },
    {
      id: 'user-6',
      name: 'Maryam Said',
      email: 'maryam.said@email.com',
      role: 'scout',
      academy: 'North Branch',
      groupId: 'group-2',
      groupName: 'Wolf Pack',
      phone: '+1234567895',
      joinDate: '2023-11-08',
      lastActive: '2025-01-16',
      status: 'active',
      permissions: ['view_profile', 'join_events'],
      age: 11,
      parentId: 'user-7'
    }
  ];

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.groupName && user.groupName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesAcademy = selectedAcademy === 'all' || user.academy === selectedAcademy;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesAcademy && matchesStatus;
  });

  // User statistics
  const userStats = {
    totalUsers: users.length,
    scouts: users.filter(u => u.role === 'scout').length,
    parents: users.filter(u => u.role === 'parent').length,
    leaders: users.filter(u => u.role === 'leader').length,
    executives: users.filter(u => u.role === 'executive').length,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingUsers: users.filter(u => u.status === 'pending').length
  };

  // Role color mapping
  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'scout':
        return 'bg-blue-100 text-blue-800';
      case 'parent':
        return 'bg-green-100 text-green-800';
      case 'leader':
        return 'bg-purple-100 text-purple-800';
      case 'executive':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status color mapping
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle user selection for bulk actions
  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  // Handle role change
  const handleRoleChange = (userId: string, newRole: string) => {
    console.log(`Changing user ${userId} role to ${newRole}`);
    // In real implementation, this would update the database
  };

  // Handle user edit
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  // Handle bulk action
  const handleBulkAction = () => {
    if (bulkAction && selectedUsers.length > 0) {
      console.log(`Performing ${bulkAction} on users:`, selectedUsers);
      setBulkAction('');
      setSelectedUsers([]);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* User Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-msa-sage">{userStats.totalUsers}</div>
            <p className="text-xs text-msa-sage/70">Platform-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Scouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userStats.scouts}</div>
            <p className="text-xs text-msa-sage/70">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{userStats.leaders}</div>
            <p className="text-xs text-msa-sage/70">Group leaders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Parents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats.parents}</div>
            <p className="text-xs text-msa-sage/70">Family members</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users by name, email, or group..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="scout">Scouts</option>
                  <option value="parent">Parents</option>
                  <option value="leader">Leaders</option>
                  <option value="executive">Executives</option>
                </select>
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
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-4 p-3 bg-msa-sage/10 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedUsers.length} user(s) selected
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select Action</option>
                  <option value="activate">Activate Users</option>
                  <option value="deactivate">Deactivate Users</option>
                  <option value="change-academy">Change Academy</option>
                  <option value="send-message">Send Message</option>
                </select>
                <Button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="bg-msa-sage hover:bg-msa-sage/90 text-white text-sm"
                >
                  Apply Action
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">User Profiles</CardTitle>
          <p className="text-sm text-msa-sage/70">Manage all user accounts and permissions</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Academy</th>
                  <th className="text-left py-3 px-4">Group</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Last Active</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                        className="rounded"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.phone && (
                          <div className="text-xs text-gray-400">{user.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(user.role)} border-none`}
                      >
                        <option value="scout">Scout</option>
                        <option value="parent">Parent</option>
                        <option value="leader">Leader</option>
                        <option value="executive">Executive</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">{user.academy}</td>
                    <td className="py-4 px-4">
                      {user.groupName ? (
                        <span className="text-sm">{user.groupName}</span>
                      ) : (
                        <span className="text-xs text-gray-400">No group</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm">{user.lastActive}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600"
                        >
                          Profile
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your search criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 hover:bg-msa-sage/5 cursor-pointer">
          <div className="flex flex-col items-center text-center">
            <div className="text-2xl mb-2">👤</div>
            <h3 className="font-semibold text-sm">Create User</h3>
            <p className="text-xs text-msa-sage/70">Add new user account</p>
          </div>
        </Card>
        
        <Card className="p-4 hover:bg-msa-sage/5 cursor-pointer">
          <div className="flex flex-col items-center text-center">
            <div className="text-2xl mb-2">📧</div>
            <h3 className="font-semibold text-sm">Bulk Invite</h3>
            <p className="text-xs text-msa-sage/70">Send invitations</p>
          </div>
        </Card>
        
        <Card className="p-4 hover:bg-msa-sage/5 cursor-pointer">
          <div className="flex flex-col items-center text-center">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-sm">User Reports</h3>
            <p className="text-xs text-msa-sage/70">Generate analytics</p>
          </div>
        </Card>
        
        <Card className="p-4 hover:bg-msa-sage/5 cursor-pointer">
          <div className="flex flex-col items-center text-center">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-sm">Permissions</h3>
            <p className="text-xs text-msa-sage/70">Manage access</p>
          </div>
        </Card>
      </div>

      {/* Islamic Values Message */}
      <Card className="bg-gradient-to-r from-msa-sage/5 to-msa-golden/5 border-msa-sage/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤝</div>
            <div>
              <h3 className="text-lg font-semibold text-msa-charcoal">Community Leadership</h3>
              <p className="text-sm text-msa-sage/80 mt-1">
                "And We made from them leaders guiding by Our command when they were patient and were certain of Our signs." - Quran 32:24
              </p>
              <p className="text-xs text-msa-sage/70 mt-2">
                Every user management decision impacts our Islamic community. Guide with wisdom, fairness, and compassion.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;