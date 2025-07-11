"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderNavigation } from "@/components/navigation/LeaderNavigation";
import { scoutService, groupService } from "@/lib/services/supabaseService";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import { Input } from "@/components/ui/Input";
import AchievementRecordingModal from "@/components/leader/AchievementRecordingModal";

export default function LeaderScoutsPage() {
  const { userDetails } = useAuth();
  
  // State
  const [scouts, setScouts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for search and selected scout
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScout, setSelectedScout] = useState<any | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!userDetails) return;
      
      try {
        setLoading(true);
        
        // Get groups led by this user
        const allGroups = await groupService.getAllGroups();
        const leaderGroups = allGroups.filter(group => group.leader_id === userDetails.id);
        setGroups(leaderGroups);
        
        // Get scouts from leader's groups
        if (leaderGroups.length > 0) {
          const groupId = leaderGroups[0].id;
          const groupScouts = await scoutService.getScoutsByGroup(groupId);
          setScouts(groupScouts);
        }
      } catch (error) {
        console.error('Error fetching scouts data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userDetails]);
  
  // Filter scouts based on search
  const filteredScouts = scouts.filter(scout => {
    const scoutName = scout.full_name || 
                     (scout.first_name && scout.last_name ? `${scout.first_name} ${scout.last_name}` : '') ||
                     scout.first_name || 
                     'Unknown Scout';
    return scoutName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle opening achievement modal
  const openAchievementModal = (scout: any) => {
    setSelectedScout(scout);
    setShowAchievementModal(true);
  };

  // Handle recording achievement
  const handleRecordAchievement = (achievement: any) => {
    setAchievements(prev => [...prev, achievement]);
    console.log('Achievement recorded:', achievement);
    // In a real app, this would save to the database
  };

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
                            <Button 
                              size="sm"
                              onClick={() => openAchievementModal(scout)}
                              className="bg-msa-sage hover:bg-msa-sage/90 text-white"
                            >
                              Record Achievement
                            </Button>
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

        {/* Achievement Recording Modal */}
        {selectedScout && (
          <AchievementRecordingModal
            scout={selectedScout}
            isOpen={showAchievementModal}
            onClose={() => setShowAchievementModal(false)}
            onSubmit={handleRecordAchievement}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
