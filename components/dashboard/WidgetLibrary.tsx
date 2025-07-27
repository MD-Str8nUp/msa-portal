"use client";

import React from "react";
import { 
  Users, 
  Calendar, 
  Award, 
  MessageSquare, 
  BarChart3,
  Clock,
  AlertCircle,
  FileText,
  Star,
  TrendingUp
} from "lucide-react";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import { Progress } from "@/components/ui/Progress";

// Widget Components
export function ScoutOverviewWidget({ scouts }: { scouts: any[] }) {
  return (
    <div className="space-y-3">
      {scouts.map((scout) => (
        <div key={scout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">{scout.name}</p>
            <p className="text-sm text-gray-500">{scout.groupName} • {scout.rank}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{scout.attendance}%</p>
            <p className="text-xs text-gray-500">Attendance</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function UpcomingEventsWidget({ events }: { events: any[] }) {
  return (
    <div className="space-y-3">
      {events.slice(0, 3).map((event) => (
        <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{event.title}</p>
            <p className="text-sm text-gray-500">
              <DateTimeDisplay date={event.startDate} format="MMM d, h:mm a" />
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AchievementProgressWidget({ achievements }: { achievements: any[] }) {
  const totalBadges = 24;
  const earnedBadges = achievements.length;
  const progress = (earnedBadges / totalBadges) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">{earnedBadges} / {totalBadges}</span>
        </div>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="grid grid-cols-4 gap-2">
        {achievements.slice(0, 8).map((achievement) => (
          <div
            key={achievement.id}
            className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center"
            title={achievement.name}
          >
            <Star className="h-5 w-5 text-yellow-600" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MessageCenterWidget({ messages }: { messages: any[] }) {
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Recent Messages</span>
        {unreadCount > 0 && (
          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>
      {messages.slice(0, 3).map((message) => (
        <div key={message.id} className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm">{message.from}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{message.subject}</p>
            </div>
            {!message.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1.5" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AttendanceStatsWidget({ scouts }: { scouts: any[] }) {
  const avgAttendance = scouts.reduce((acc, s) => acc + (s.attendance || 0), 0) / scouts.length;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-600">{Math.round(avgAttendance)}%</p>
        <p className="text-sm text-gray-500">Average Attendance</p>
      </div>
      <div className="space-y-2">
        {scouts.map((scout) => (
          <div key={scout.id} className="flex items-center justify-between">
            <span className="text-sm">{scout.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${scout.attendance || 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-10 text-right">
                {scout.attendance || 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuickActionsWidget({ onAction }: { onAction: (action: string) => void }) {
  const actions = [
    { id: "rsvp", label: "Quick RSVP", icon: Calendar, color: "text-blue-600" },
    { id: "message", label: "Send Message", icon: MessageSquare, color: "text-green-600" },
    { id: "permission", label: "Sign Permission", icon: FileText, color: "text-orange-600" },
    { id: "report", label: "View Reports", icon: BarChart3, color: "text-purple-600" }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <action.icon className={cn("h-6 w-6", action.color)} />
          <span className="text-sm font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

// Widget Library Configuration
export const widgetLibrary = [
  {
    id: "scout-overview",
    type: "ScoutOverview",
    title: "My Scouts",
    description: "Quick overview of your scouts",
    icon: Users,
    defaultSize: "medium",
    component: ScoutOverviewWidget
  },
  {
    id: "upcoming-events",
    type: "UpcomingEvents",
    title: "Upcoming Events",
    description: "Next events on the calendar",
    icon: Calendar,
    defaultSize: "medium",
    component: UpcomingEventsWidget
  },
  {
    id: "achievement-progress",
    type: "AchievementProgress",
    title: "Achievement Progress",
    description: "Badge and achievement tracking",
    icon: Award,
    defaultSize: "small",
    component: AchievementProgressWidget
  },
  {
    id: "message-center",
    type: "MessageCenter",
    title: "Messages",
    description: "Recent messages and notifications",
    icon: MessageSquare,
    defaultSize: "medium",
    component: MessageCenterWidget
  },
  {
    id: "attendance-stats",
    type: "AttendanceStats",
    title: "Attendance",
    description: "Attendance statistics",
    icon: BarChart3,
    defaultSize: "small",
    component: AttendanceStatsWidget
  },
  {
    id: "quick-actions",
    type: "QuickActions",
    title: "Quick Actions",
    description: "Common tasks and shortcuts",
    icon: Clock,
    defaultSize: "small",
    component: QuickActionsWidget
  }
];

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}