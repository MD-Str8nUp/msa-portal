"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { mockUsers, mockGroupService } from "@/lib/mock/data";
import { User } from "@/types";

export default function ExecutiveLeadersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get all leaders
  const leaders = mockUsers.filter(user => user.role === 'leader');
  const groups = mockGroupService.getGroups();
  
  // Filter leaders by search term
  const filteredLeaders = leaders.filter(leader => 
    leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leader.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get assigned group for a leader
  const getLeaderGroups = (leaderId: string) => {
    return groups.filter(group => group.leaderId === leaderId);
  };
  
  return (
    <DashboardLayout
      navigation={executiveNavigation}
      pageTitle="Leaders"
      userRole="executive"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Leader Management</h1>
            <p className="text-gray-500">Manage scout leaders across the organization</p>
          </div>
          <Button>Add New Leader</Button>
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
                    const leaderGroups = getLeaderGroups(leader.id);
                    
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
                          {leaderGroups.length > 0 ? (
                            <div>
                              {leaderGroups.map(group => (
                                <span key={group.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                                  {group.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No groups assigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Active
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">Assign Group</Button>
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
                      {leaders.filter(l => getLeaderGroups(l.id).length > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Unassigned:</span>
                    <span className="font-medium">
                      {leaders.filter(l => getLeaderGroups(l.id).length === 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Multiple groups:</span>
                    <span className="font-medium">
                      {leaders.filter(l => getLeaderGroups(l.id).length > 1).length}
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
                <Button variant="outline" className="w-full justify-start">
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
    </DashboardLayout>
  );
}
