"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderNavigation } from "@/components/navigation/LeaderNavigation";
import { mockScoutService, mockGroupService } from "@/lib/mock/data";
import { Button } from "@/components/ui/Button";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import { Input } from "@/components/ui/Input";
import { Scout } from "@/types";

export default function LeaderScoutsPage() {
  // In a real app, this would come from auth context/session
  const leaderId = "user-2";
  
  // For demo purposes, get the first group associated with this leader
  const groups = mockGroupService.getGroups();
  const leaderGroups = groups.filter(group => group.leaderId === leaderId);
  const groupId = leaderGroups.length > 0 ? leaderGroups[0].id : null;
  
  // Get scouts in the leader's group
  const scouts = groupId ? mockScoutService.getScouts(undefined, groupId) : [];

  // State for search and selected scout
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScout, setSelectedScout] = useState<Scout | null>(null);
  
  // Filter scouts based on search
  const filteredScouts = scouts.filter(scout => 
    scout.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      navigation={leaderNavigation} 
      pageTitle="Scouts" 
      userRole="leader"
    >
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Scout Management</h1>
            <p className="text-gray-500">Manage scouts in your group</p>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
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
        </div>
        
        {/* Scouts List */}
        <Card>
          <CardHeader>
            <CardTitle>Group Scouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Age</th>
                    <th className="text-left py-3 px-4">Rank</th>
                    <th className="text-left py-3 px-4">Joined Date</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScouts.length > 0 ? (
                    filteredScouts.map(scout => (
                      <tr key={scout.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{scout.name}</div>
                        </td>
                        <td className="py-3 px-4">{scout.age}</td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {scout.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4"><DateTimeDisplay date={scout.joinedDate} format="short" /></td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Progress</Button>
                            <Button size="sm">Record Achievement</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
                        {searchTerm ? "No scouts found matching your search" : "No scouts in your group"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Scout Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold">{scouts.length}</div>
              <div className="text-sm text-gray-500">Total Scouts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold">
                {scouts.filter(s => s.rank === "Tenderfoot").length}
              </div>
              <div className="text-sm text-gray-500">Tenderfoot Scouts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold">
                {scouts.filter(s => new Date(s.joinedDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-gray-500">New Scouts (90 days)</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
