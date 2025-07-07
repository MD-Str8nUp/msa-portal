"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  Award, 
  Calendar, 
  MessageSquare, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "achievement" | "event" | "message" | "attendance" | "incident" | "general";
  title: string;
  description: string;
  timestamp: string;
  scoutName?: string;
  priority?: "high" | "medium" | "low";
}

interface ActivityTimelineProps {
  activities?: ActivityItem[];
  maxItems?: number;
}

export default function ActivityTimeline({ 
  activities = [], 
  maxItems = 10 
}: ActivityTimelineProps) {
  // Mock activities if none provided
  const mockActivities: ActivityItem[] = [
    {
      id: "1",
      type: "achievement",
      title: "First Aid Badge Earned",
      description: "Alex Smith completed First Aid training and earned the badge",
      timestamp: "2025-07-07T10:30:00",
      scoutName: "Alex Smith",
      priority: "high"
    },
    {
      id: "2",
      type: "attendance",
      title: "Perfect Attendance Week",
      description: "All 12 scouts attended this week's meetings",
      timestamp: "2025-07-07T09:00:00",
      priority: "medium"
    },
    {
      id: "3",
      type: "event",
      title: "Summer Camp Registration",
      description: "8 scouts registered for summer camp at Pine Ridge",
      timestamp: "2025-07-06T16:45:00",
      priority: "high"
    },
    {
      id: "4",
      type: "message",
      title: "Parent Communication",
      description: "Sent meeting reminder to all parents",
      timestamp: "2025-07-06T14:20:00",
      priority: "low"
    },
    {
      id: "5",
      type: "achievement",
      title: "Leadership Badge Progress",
      description: "Emma Johnson completed leadership project requirements",
      timestamp: "2025-07-06T11:15:00",
      scoutName: "Emma Johnson",
      priority: "medium"
    },
    {
      id: "6",
      type: "incident",
      title: "Minor Injury Report",
      description: "Olivia Williams scraped knee during outdoor activity - first aid applied",
      timestamp: "2025-07-05T15:30:00",
      scoutName: "Olivia Williams",
      priority: "high"
    },
    {
      id: "7",
      type: "general",
      title: "Meeting Location Changed",
      description: "Next week's meeting moved to Community Center B",
      timestamp: "2025-07-05T12:00:00",
      priority: "medium"
    },
    {
      id: "8",
      type: "achievement",
      title: "Camping Badge Earned",
      description: "Marcus Davis completed camping requirements",
      timestamp: "2025-07-04T18:00:00",
      scoutName: "Marcus Davis",
      priority: "medium"
    }
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;
  const sortedActivities = displayActivities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxItems);

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "achievement":
        return <Award className="w-4 h-4 text-msa-golden" />;
      case "event":
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-green-600" />;
      case "attendance":
        return <CheckCircle className="w-4 h-4 text-msa-sage" />;
      case "incident":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "achievement":
        return "border-l-msa-golden bg-msa-golden/5";
      case "event":
        return "border-l-blue-600 bg-blue-50";
      case "message":
        return "border-l-green-600 bg-green-50";
      case "attendance":
        return "border-l-msa-sage bg-msa-sage/5";
      case "incident":
        return "border-l-red-600 bg-red-50";
      default:
        return "border-l-gray-400 bg-gray-50";
    }
  };

  const getPriorityIndicator = (priority: ActivityItem["priority"]) => {
    switch (priority) {
      case "high":
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case "medium":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case "low":
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={`p-4 rounded-lg border-l-4 ${getActivityColor(activity.type)} transition-all hover:shadow-sm`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-msa-charcoal truncate">
                      {activity.title}
                    </h4>
                    {activity.priority && getPriorityIndicator(activity.priority)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatTimestamp(activity.timestamp)}</span>
                    {activity.scoutName && (
                      <>
                        <span>•</span>
                        <span className="font-medium">{activity.scoutName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {sortedActivities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}