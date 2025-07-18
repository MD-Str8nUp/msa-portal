"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { parentNavigation } from "@/components/navigation/ParentNavigation";
import { scoutService, groupService } from "@/lib/services/supabaseService";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Plus, Info, Award, Calendar, RefreshCcw } from "lucide-react";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import ScoutDetailModal from "@/components/scouts/ScoutDetailModal";
import AddScoutModal from "@/components/scouts/AddScoutModal";
import { Scout } from "@/types";
import { useSocketContext } from "@/lib/contexts/SocketContext";

export default function ParentScoutsPage() {
  const { userDetails } = useAuth();
  const [scouts, setScouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get socket context data
  const { isConnected, achievements } = useSocketContext();
  
  // State for scouts and groups
  const [groups, setGroups] = useState<any[]>([]);
  
  // State for modals
  const [selectedScout, setSelectedScout] = useState<Scout | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  // Fetch scouts and groups from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!userDetails) return;
      
      setLoading(true);
      try {
        // Fetch scouts from Supabase
        const scoutsData = await scoutService.getScoutsByParent(userDetails.id);
        setScouts(scoutsData || []);
        
        // Fetch groups from Supabase
        const groupsData = await groupService.getAllGroups();
        setGroups(groupsData || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setScouts([]);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userDetails]);
  
  // Calculate achievements per scout
  const scoutAchievements = useCallback((scoutId: string) => {
    if (!achievements || !Array.isArray(achievements)) return 0;
    return achievements.filter(a => a.scoutId === scoutId).length;
  }, [achievements]);
  
  // Stable callback that won't change between renders
  const handleCloseDetailModal = useCallback(() => {
    setDetailModalOpen(false);
  }, []);
  
  const handleCloseAddModal = useCallback(() => {
    setAddModalOpen(false);
  }, []);
  
  const viewScout = useCallback((scoutId: string) => {
    const scout = scouts.find(s => s.id === scoutId);
    if (scout) {
      setSelectedScout(scout);
      setDetailModalOpen(true);
    }
  }, [scouts]);
  
  const handleAddScout = async (scoutData: any) => {
    if (!userDetails) return;
    
    try {
      const newScout = await scoutService.createScout({
        ...scoutData,
        parent_id: userDetails.id,
      });
      
      if (newScout) {
        // Update local state with new scout (optimistic update)
        setScouts(prevScouts => [...prevScouts, newScout]);
        
        // Close the modal
        setAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding scout:', error);
      alert('Failed to add scout. Please try again.');
    }
  };
  
  // Refresh data
  const refreshData = async () => {
    if (!userDetails) return;
    
    setLoading(true);
    try {
      const scoutsData = await scoutService.getScoutsByParent(userDetails.id);
      setScouts(scoutsData || []);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DashboardLayout 
      navigation={parentNavigation} 
      pageTitle="My Scouts" 
      userRole="parent"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">My Scouts</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={refreshData} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "Loading..." : "Refresh"}</span>
            </Button>
            <Button 
              className="flex items-center space-x-2" 
              onClick={() => setAddModalOpen(true)}
            >
              <Plus size={16} />
              <span>Add Scout</span>
            </Button>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        
        {/* Scouts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-lg font-medium text-gray-700">Loading scouts...</p>
              </div>
            </div>
          ) : scouts.length > 0 ? (
            scouts.map(scout => (
              <Card key={scout.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle>{scout.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">Age: {scout.age}</span>
                    <span className="text-sm font-medium">Group: {scout.groupName || (groups.find(g => g.id === scout.groupId)?.name || 'Unknown')}</span>
                    <span className="text-sm font-medium">Rank: {scout.rank}</span>
                    
                    {/* Handle date display with client-only component */}
                    <span className="text-sm font-medium">
                      Joined: <DateTimeDisplay 
                        date={scout.joinedDate} 
                        format="MM/DD/YYYY" 
                        fallbackText={typeof scout.joinedDate === 'string' ? scout.joinedDate : 'Loading...'}
                      />
                    </span>
                  </div>
                  
                  <div className="flex justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center text-sm text-blue-600">
                      <Award size={16} className="mr-1" />
                      <span>{scoutAchievements(scout.id)} Badges</span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <Calendar size={16} className="mr-1" />
                      <span>{scout.attendance && Array.isArray(scout.attendance) && scout.attendance.length > 0 ? Math.round((scout.attendance.filter((a: any) => a.present).length / scout.attendance.length) * 100) + '%' : '90%'} Attendance</span>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 pt-0 flex space-x-2">
                  <Button 
                    className="w-full"
                    onClick={() => viewScout(scout.id)}
                  >
                    <Info size={16} className="mr-2" />
                    View Profile
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-8">
              You don't have any scouts registered yet.
            </p>
          )}
        </div>
        
        {/* Scout Detail Modal */}
        <ScoutDetailModal
          open={detailModalOpen}
          onClose={handleCloseDetailModal}
          scout={selectedScout}
        />
        
        {/* Add Scout Modal */}
        <AddScoutModal
          open={addModalOpen}
          onClose={handleCloseAddModal}
          groups={groups.map(g => ({ id: g.id, name: g.name }))}
          onSubmit={handleAddScout}
        />
      </div>
    </DashboardLayout>
  );
}
