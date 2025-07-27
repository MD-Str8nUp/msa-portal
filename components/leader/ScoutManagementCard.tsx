"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Scout } from "@/types";
import { 
  User, 
  Award, 
  MessageSquare, 
  CheckCircle, 
  Clock,
  Star,
  Phone
} from "lucide-react";

interface ScoutManagementCardProps {
  scout: Scout;
  attendanceRate?: number;
  recentAchievements?: number;
  onViewProfile?: (scout: Scout) => void;
  onRecordAchievement?: (scout: Scout) => void;
  onContactParent?: (scout: Scout) => void;
  onMarkAttendance?: (scout: Scout) => void;
}

export default function ScoutManagementCard({
  scout,
  attendanceRate = 85,
  recentAchievements = 2,
  onViewProfile,
  onRecordAchievement,
  onContactParent,
  onMarkAttendance
}: ScoutManagementCardProps) {
  const getRankColor = (rank: string) => {
    switch (rank?.toLowerCase()) {
      case "eagle":
        return "bg-msa-golden text-white";
      case "star":
        return "bg-purple-100 text-purple-800";
      case "first class":
        return "bg-blue-100 text-blue-800";
      case "second class":
        return "bg-green-100 text-green-800";
      case "tenderfoot":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-msa-sage">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-msa-sage/20 flex items-center justify-center">
            <User className="w-6 h-6 text-msa-sage" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-msa-charcoal">
              {scout.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRankColor(scout.rank)}`}>
                {scout.rank}
              </span>
              <span className="text-sm text-gray-500">Age {scout.age}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getAttendanceColor(attendanceRate)}`}>
              {attendanceRate}%
            </div>
            <div className="text-xs text-gray-500">Attendance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-msa-golden">
              {recentAchievements}
            </div>
            <div className="text-xs text-gray-500">Recent Badges</div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-600">Active</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-msa-sage" />
            <span className="text-gray-600">Joined {new Date(scout.joinedDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => onViewProfile?.(scout)}
          >
            <User className="w-3 h-3 mr-1" />
            View Profile
          </Button>
          <Button
            size="sm"
            className="text-xs bg-msa-sage hover:bg-msa-sage/90"
            onClick={() => onRecordAchievement?.(scout)}
          >
            <Award className="w-3 h-3 mr-1" />
            Add Badge
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => onContactParent?.(scout)}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Contact Parent
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => onMarkAttendance?.(scout)}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Mark Present
          </Button>
        </div>

        {/* Recent Activity */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-msa-golden" />
            <span className="text-gray-600">
              Last activity: First Aid badge earned
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}