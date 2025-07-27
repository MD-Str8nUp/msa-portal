"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Scout, Group } from "@/types";
import ScoutManagementCard from "./ScoutManagementCard";
import { 
  Search, 
  Users, 
  Calendar, 
  MessageSquare, 
  ClipboardList,
  Award,
  Filter,
  Plus,
  BarChart3
} from "lucide-react";

interface GroupManagementProps {
  group: Group;
  scouts: Scout[];
  onAddScout?: () => void;
  onBulkAttendance?: () => void;
  onSendGroupMessage?: () => void;
  onViewReports?: () => void;
}

export default function GroupManagement({
  group,
  scouts,
  onAddScout,
  onBulkAttendance,
  onSendGroupMessage,
  onViewReports
}: GroupManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Filter scouts based on search term and filter
  const filteredScouts = scouts.filter(scout => {
    const matchesSearch = scout.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "new") {
      const joinedDate = new Date(scout.joinedDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return matchesSearch && joinedDate > threeMonthsAgo;
    }
    if (selectedFilter === "rank") {
      return matchesSearch && scout.rank.toLowerCase().includes(selectedFilter);
    }
    
    return matchesSearch;
  });

  // Calculate group statistics
  const groupStats = {
    totalScouts: scouts.length,
    averageAge: scouts.reduce((sum, scout) => sum + scout.age, 0) / scouts.length,
    newScouts: scouts.filter(scout => {
      const joinedDate = new Date(scout.joinedDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return joinedDate > threeMonthsAgo;
    }).length,
    rankDistribution: scouts.reduce((acc, scout) => {
      acc[scout.rank] = (acc[scout.rank] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <Card className="bg-gradient-to-r from-msa-sage/10 via-msa-golden/10 to-msa-light-sage/20 border-msa-sage/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-msa-charcoal flex items-center gap-2">
                <Users className="w-6 h-6" />
                {group.name}
              </CardTitle>
              <p className="text-msa-sage mt-1">
                {group.location} • {group.meetingDay}s at {group.meetingTime}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-msa-golden">
                {groupStats.totalScouts}
              </div>
              <div className="text-sm text-gray-600">Active Scouts</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          className="bg-msa-sage hover:bg-msa-sage/90 text-white"
          onClick={onBulkAttendance}
        >
          <ClipboardList className="w-4 h-4 mr-2" />
          Take Attendance
        </Button>
        <Button 
          variant="outline" 
          className="border-msa-sage text-msa-sage hover:bg-msa-sage/10"
          onClick={onSendGroupMessage}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Group Message
        </Button>
        <Button 
          variant="outline"
          className="border-msa-golden text-msa-golden hover:bg-msa-golden/10"
          onClick={onAddScout}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Scout
        </Button>
        <Button 
          variant="outline"
          onClick={onViewReports}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          View Reports
        </Button>
      </div>

      {/* Group Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-msa-sage">{groupStats.totalScouts}</div>
            <div className="text-sm text-gray-500">Total Scouts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-msa-golden">{groupStats.newScouts}</div>
            <div className="text-sm text-gray-500">New Scouts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{Math.round(groupStats.averageAge)}</div>
            <div className="text-sm text-gray-500">Average Age</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">85%</div>
            <div className="text-sm text-gray-500">Attendance Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search scouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
          >
            All Scouts
          </Button>
          <Button
            variant={selectedFilter === "new" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("new")}
          >
            New Scouts
          </Button>
        </div>
      </div>

      {/* Scout Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScouts.map((scout) => (
          <ScoutManagementCard
            key={scout.id}
            scout={scout}
            attendanceRate={Math.floor(Math.random() * 30) + 70} // Mock attendance rate
            recentAchievements={Math.floor(Math.random() * 5) + 1} // Mock recent achievements
            onViewProfile={(scout) => console.log("View profile:", scout.name)}
            onRecordAchievement={(scout) => console.log("Record achievement:", scout.name)}
            onContactParent={(scout) => console.log("Contact parent:", scout.name)}
            onMarkAttendance={(scout) => console.log("Mark attendance:", scout.name)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredScouts.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm ? "No scouts found" : "No scouts in this group"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Add your first scout to get started"}
            </p>
            {!searchTerm && (
              <Button onClick={onAddScout} className="bg-msa-sage hover:bg-msa-sage/90">
                <Plus className="w-4 h-4 mr-2" />
                Add First Scout
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}