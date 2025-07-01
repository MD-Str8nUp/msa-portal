"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { mockScouts, mockGroupService } from "@/lib/mock/data";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

export default function ExecutiveMembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedRank, setSelectedRank] = useState<string>("all");
  
  // Get all groups for filtering
  const groups = mockGroupService.getGroups();
  
  // Filter scouts based on selected filters
  const filteredScouts = mockScouts.filter(scout => {
    const matchesSearch = scout.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "all" || scout.groupId === selectedGroup;
    const matchesRank = selectedRank === "all" || scout.rank === selectedRank;
    
    return matchesSearch && matchesGroup && matchesRank;
  });
  
  // Get unique ranks for filter options
  const ranks = [...new Set(mockScouts.map(scout => scout.rank))];
  
  return (
    <DashboardLayout
      navigation={executiveNavigation}
      pageTitle="Members"
      userRole="executive"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Scout Members</h1>
            <p className="text-gray-500">Manage all scouts across the organization</p>
          </div>
          <Button>Add Scout</Button>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search scouts..."
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="all">All Groups</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Rank
            </label>
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="all">All Ranks</option>
              {ranks.map(rank => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Members Table */}
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
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
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
                        No scouts found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Scout Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold">{mockScouts.length}</div>
              <div className="text-sm text-gray-500">Total Scouts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold">
                {mockScouts.filter(s => new Date(s.joinedDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-gray-500">New Scouts (90 days)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold">
                {Math.round(mockScouts.reduce((sum, scout) => sum + scout.age, 0) / mockScouts.length)}
              </div>
              <div className="text-sm text-gray-500">Average Age</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold">
                {Object.entries(
                  mockScouts.reduce((acc, scout) => {
                    acc[scout.rank] = (acc[scout.rank] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).sort((a, b) => b[1] - a[1])[0][0]}
              </div>
              <div className="text-sm text-gray-500">Most Common Rank</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
