import { User, Scout, Group, Event, Message, Report, Attendance } from "@/types";
import { generateRandomId } from "@/lib/utils";

// Mock Users
export const users: User[] = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    role: "parent",
    avatar: "/avatars/user-1.png"
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "leader",
    avatar: "/avatars/user-2.png"
  },
  {
    id: "user-3",
    name: "Michael Johnson",
    email: "michael@example.com",
    role: "executive",
    avatar: "/avatars/user-3.png"
  },
  {
    id: "user-4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: "parent",
    avatar: "/avatars/user-4.png"
  },
  {
    id: "user-5",
    name: "Robert Brown",
    email: "robert@example.com",
    role: "leader",
    avatar: "/avatars/user-5.png"
  }
];

// Mock Groups
export const groups: Group[] = [
  {
    id: "group-1",
    name: "Eagle Scouts",
    leaderId: "user-2",
    leaderName: "Jane Smith",
    location: "Community Center A",
    meetingDay: "Monday",
    meetingTime: "16:00",
    memberCount: 12
  },
  {
    id: "group-2",
    name: "Wolf Pack",
    leaderId: "user-5",
    leaderName: "Robert Brown",
    location: "Library Hall",
    meetingDay: "Wednesday",
    meetingTime: "17:00",
    memberCount: 15
  },
  {
    id: "group-3",
    name: "Trailblazers",
    leaderId: "user-2",
    leaderName: "Jane Smith",
    location: "School Gymnasium",
    meetingDay: "Thursday",
    meetingTime: "16:30",
    memberCount: 9
  }
];

// Mock Scouts
export const scouts: Scout[] = [
  {
    id: "scout-1",
    name: "Alex Doe",
    age: 12,
    groupId: "group-1",
    groupName: "Eagle Scouts",
    rank: "First Class",
    joinedDate: "2023-06-15",
    parentId: "user-1"
  },
  {
    id: "scout-2",
    name: "Emma Doe",
    age: 10,
    groupId: "group-2",
    groupName: "Wolf Pack",
    rank: "Second Class",
    joinedDate: "2023-07-20",
    parentId: "user-1"
  },
  {
    id: "scout-3",
    name: "Olivia Williams",
    age: 11,
    groupId: "group-1",
    groupName: "Eagle Scouts",
    rank: "Tenderfoot",
    joinedDate: "2023-05-10",
    parentId: "user-4"
  },
  {
    id: "scout-4",
    name: "Ethan Williams",
    age: 13,
    groupId: "group-3",
    groupName: "Trailblazers",
    rank: "Star",
    joinedDate: "2022-09-15",
    parentId: "user-4"
  }
];

// Mock Events
export const events: Event[] = [
  {
    id: "event-1",
    title: "Summer Camp",
    description: "A week-long camping adventure with activities, challenges, and fun!",
    location: "Pine Ridge Campground",
    startDate: "2025-07-10",
    endDate: "2025-07-17",
    attendees: 30,
    requiresPermissionSlip: true,
    status: "approved",
    type: "organization-wide",
    createdBy: "user-3" // executive
  },
  {
    id: "event-2",
    title: "Hiking Expedition",
    description: "Day hike through scenic trails with nature observation activities",
    location: "Blue Mountain Trails",
    startDate: "2025-06-28",
    endDate: "2025-06-28",
    groupId: "group-1",
    groupName: "Eagle Scouts",
    attendees: 12,
    requiresPermissionSlip: true,
    status: "approved",
    type: "regular",
    createdBy: "user-2" // leader
  },
  {
    id: "event-3",
    title: "Badge Workshop",
    description: "Indoor workshop to earn various skill badges",
    location: "Community Center A",
    startDate: "2025-07-05",
    endDate: "2025-07-05",
    groupId: "group-2",
    groupName: "Wolf Pack",
    attendees: 15,
    requiresPermissionSlip: false,
    status: "approved",
    type: "regular",
    createdBy: "user-5" // leader
  },
  {
    id: "event-4",
    title: "First Aid Training",
    description: "Comprehensive first aid training session with certification opportunity",
    location: "Scout Headquarters",
    startDate: "2025-06-30",
    endDate: "2025-06-30",
    attendees: 25,
    requiresPermissionSlip: false,
    status: "approved",
    type: "special",
    createdBy: "user-3" // executive
  }
];

// Mock Messages
export const messages: Message[] = [
  {
    id: "message-1",
    senderId: "user-2",
    senderName: "Jane Smith",
    receiverId: "user-1",
    receiverName: "John Doe",
    content: "Hello, your child has been selected for a special leadership role in our next event. Please let me know if they're interested.",
    timestamp: "2025-06-18T14:30:00",
    read: false
  },
  {
    id: "message-2",
    senderId: "user-1",
    senderName: "John Doe",
    receiverId: "user-2",
    receiverName: "Jane Smith",
    content: "That sounds fantastic! Alex would love to take on this role. What does it involve?",
    timestamp: "2025-06-18T15:45:00",
    read: true
  },
  {
    id: "message-3",
    senderId: "user-5",
    senderName: "Robert Brown",
    receiverId: "user-4",
    receiverName: "Sarah Williams",
    content: "Just a reminder that next week's meeting will be at the park instead of our usual location.",
    timestamp: "2025-06-19T09:15:00",
    read: false
  }
];

// Mock Attendance Records
export const mockAttendance: Attendance[] = [
  {
    id: "attendance-1",
    scoutId: "scout-1",
    eventId: "event-1",
    date: "2025-06-15",
    present: true,
    notes: "Arrived on time"
  },
  {
    id: "attendance-2",
    scoutId: "scout-2",
    eventId: "event-1",
    date: "2025-06-15",
    present: true,
    notes: ""
  },
  {
    id: "attendance-3",
    scoutId: "scout-3",
    eventId: "event-1",
    date: "2025-06-15",
    present: false,
    notes: "Sick with flu"
  },
  {
    id: "attendance-4",
    scoutId: "scout-1",
    eventId: "event-2",
    date: "2025-06-22",
    present: true,
    notes: ""
  },
  {
    id: "attendance-5",
    scoutId: "scout-2",
    eventId: "event-2",
    date: "2025-06-22",
    present: false,
    notes: "Family vacation"
  },
  {
    id: "attendance-6",
    scoutId: "scout-3",
    eventId: "event-2",
    date: "2025-06-22",
    present: true,
    notes: ""
  }
];

// Mock Reports
export const mockReports: Report[] = [
  {
    id: "report-1",
    title: "Monthly Activity Summary - June",
    description: "Summary of all troop activities for the month of June",
    date: "2025-06-30",
    authorId: "user-2",
    type: "activity",
    status: "submitted",
    content: "This month we completed 3 regular meetings and 2 special events. Attendance was excellent with 90% average participation.",
    groupId: "group-1"
  },
  {
    id: "report-2",
    title: "First Aid Training Results",
    description: "Results and certification status from the First Aid training event",
    date: "2025-06-30",
    authorId: "user-2",
    type: "activity",
    status: "draft",
    content: "15 scouts completed basic first aid certification. 7 scouts earned advanced certification.",
    groupId: "group-1"
  },
  {
    id: "report-3",
    title: "Minor Injury Incident - Hiking Trip",
    description: "Documentation of minor injury during weekend hiking trip",
    date: "2025-06-22",
    authorId: "user-2",
    type: "incident",
    status: "resolved",
    content: "Scout Alex Doe sustained a minor sprained ankle during the hike. First aid was administered on site by Leader Jane Smith. Parent was contacted and picked up scout from the trail end point. No further medical attention was required.",
    groupId: "group-1"
  },
  {
    id: "report-4",
    title: "Quarterly Scout Progress Report - Q2",
    description: "Progress tracking for all scouts in Eagle Scouts group for Q2 2025",
    date: "2025-06-28",
    authorId: "user-2",
    type: "progress",
    status: "approved",
    content: "This quarter saw excellent progress with achievement completion rate up 15% from Q1. Five scouts advanced in rank and the group earned a total of 37 new badges.",
    groupId: "group-1"
  }
];

// Export for direct access in components
export const mockUsers = users;
export const mockScouts = scouts;
export const mockMessages = messages;

// Mock service functions
export const mockAuthService = {
  login: (email: string, password: string) => {
    const user = users.find(u => u.email === email);
    if (user && password === "password") {
      try {
        // Make sure we're in a browser environment
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(user));
        }
        return user;
      } catch (error) {
        console.error("Error storing user in localStorage:", error);
        return user; // Still return the user even if localStorage fails
      }
    }
    return null;
  },
  logout: () => {
    try {
      // Make sure we're in a browser environment
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Error removing user from localStorage:", error);
    }
  },
  getCurrentUser: () => {
    try {
      // Make sure we're in a browser environment
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
      }
    } catch (error) {
      console.error("Error getting user from localStorage:", error);
    }
    return null;
  }
};

export const mockScoutService = {
  getScouts: (parentId?: string, groupId?: string) => {
    if (parentId) {
      return scouts.filter(s => s.parentId === parentId);
    }
    if (groupId) {
      return scouts.filter(s => s.groupId === groupId);
    }
    return scouts;
  },
  getScoutById: (id: string) => {
    return scouts.find(s => s.id === id);
  },  addScout: (scout: { name: string; age: number; groupId: string; parentId?: string }) => {
    const newScout: Scout = {
      id: `scout-${generateRandomId()}`,
      name: scout.name,
      age: scout.age,
      groupId: scout.groupId,
      parentId: scout.parentId,
      rank: "New Scout",
      joinedDate: new Date().toISOString().split('T')[0],
      groupName: groups.find(g => g.id === scout.groupId)?.name || ""
    };
    scouts.push(newScout);
    return newScout;
  }
};

export const mockGroupService = {
  getGroups: () => {
    return groups;
  },
  getGroupById: (id: string) => {
    return groups.find(g => g.id === id);
  }
};

export const mockEventService = {
  getEvents: (groupId?: string) => {
    if (groupId) {
      return events.filter(e => e.groupId === groupId);
    }
    return events;
  },
  getEventById: (id: string) => {
    return events.find(e => e.id === id);
  }
};

export const mockMessageService = {
  getMessages: (userId: string) => {
    return messages.filter(
      m => m.receiverId === userId || m.senderId === userId
    );
  },
  sendMessage: (message: Omit<Message, "id" | "timestamp" | "read">) => {
    const newMessage: Message = {
      id: `message-${generateRandomId()}`,
      ...message,
      timestamp: new Date().toISOString(),
      read: false
    };
    messages.push(newMessage);
    return newMessage;
  }
};

export const mockReportService = {  getReports: (groupId?: string, type?: string) => {
    let filteredReports = mockReports;
    if (groupId) {
      filteredReports = filteredReports.filter(r => r.groupId === groupId);
    }
    if (type) {
      filteredReports = filteredReports.filter(r => r.type === type);
    }
    return filteredReports;
  },
  getReportById: (id: string) => {
    return mockReports.find(r => r.id === id);
  }
};
