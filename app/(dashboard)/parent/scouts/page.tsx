"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { parentNavigation } from "@/components/navigation/ParentNavigation";
import { mockScoutService, mockGroupService, mockAuthService } from "@/lib/mock/data";
import { Button } from "@/components/ui/Button";
import { Plus, Info, Award, Calendar, RefreshCcw } from "lucide-react";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import ScoutDetailModal from "@/components/scouts/ScoutDetailModal";
import AddScoutModal from "@/components/scouts/AddScoutModal";
import { Scout } from "@/types";
import { useSocketContext } from "@/lib/contexts/SocketContext";

export default function ParentScoutsPage() {
  // Get current user
  const currentUser = mockAuthService.getCurrentUser();
  const parentId = currentUser?.id || "user-1";
  
  // Get socket context data
  const { isConnected, achievements } = useSocketContext();
  
  // State for scouts and groups
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for modals
  const [selectedScout, setSelectedScout] = useState<Scout | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  // Fetch scouts and groups from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch scouts from API
        const scoutsResponse = await fetch(`/api/scouts?parentId=${parentId}`);
        if (scoutsResponse.ok) {
          const scoutsData = await scoutsResponse.json();
          if (Array.isArray(scoutsData)) {
            setScouts(scoutsData);
          } else {
            console.warn('Scouts API returned non-array, using mock data');
            setScouts(mockScoutService.getScouts(parentId) || []);
          }
        } else {
          console.warn(`Scouts API failed with status ${scoutsResponse.status}, using mock data`);
          setScouts(mockScoutService.getScouts(parentId) || []);
        }
        
        // Fetch groups from API
        const groupsResponse = await fetch('/api/groups');
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          if (Array.isArray(groupsData)) {
            setGroups(groupsData);
          } else {
            console.warn('Groups API returned non-array, using mock data');
            setGroups(mockGroupService.getGroups() || []);
          }
        } else {
          console.warn(`Groups API failed with status ${groupsResponse.status}, using mock data`);
          setGroups(mockGroupService.getGroups() || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data with safety checks
        const mockScouts = mockScoutService.getScouts(parentId);
        const mockGroups = mockGroupService.getGroups();
        setScouts(Array.isArray(mockScouts) ? mockScouts : []);
        setGroups(Array.isArray(mockGroups) ? mockGroups : []);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [parentId]);
  
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
    try {
      const response = await fetch('/api/scouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...scoutData,
          parentId,
        }),
      });
      
      if (response.ok) {
        const newScout = await response.json();
        
        // Update local state with new scout (optimistic update)
        setScouts(prevScouts => [...prevScouts, newScout]);
        
        // Close the modal
        setAddModalOpen(false);
      } else {
        console.error('Failed to add scout:', await response.text());
        
        // Fallback to mock service
        mockScoutService.addScout({
          ...scoutData,
          parentId
        });
        setScouts(mockScoutService.getScouts(parentId));
        setAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding scout:', error);
      
      // Fallback to mock service
      mockScoutService.addScout({
        ...scoutData,
        parentId
      });
      setScouts(mockScoutService.getScouts(parentId));
      setAddModalOpen(false);
    }
  };
  
  // Refresh data
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/scouts?parentId=${parentId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setScouts(data);
        } else {
          console.warn('Refresh API returned non-array, using mock data');
          setScouts(mockScoutService.getScouts(parentId) || []);
        }
      } else {
        console.warn('Refresh API failed, using mock data');
        setScouts(mockScoutService.getScouts(parentId) || []);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setScouts(mockScoutService.getScouts(parentId) || []);
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
              <span>{isLoading ? "Loading..." : "Refresh"}</span>
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
          {isLoading ? (
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
                      <span>{scout.attendance && Array.isArray(scout.attendance) && scout.attendance.length > 0 ? Math.round((scout.attendance.filter(a => a.present).length / scout.attendance.length) * 100) + '%' : '90%'} Attendance</span>
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
