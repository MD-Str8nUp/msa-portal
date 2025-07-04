export interface User {
  id: string;
  name: string;
  email: string;
  role: "parent" | "leader" | "executive";
  avatar?: string;
  childrenIds?: string[]; // For parent users
  assignedGroupIds?: string[]; // For leader users
}

export interface Parent {
  userId: string;
  childrenIds: string[];
}

export interface Leader {
  userId: string;
  groupIds: string[];
  assignedScoutIds: string[];
}

export interface Scout {
  id: string;
  name: string;
  age: number;
  groupId: string;
  groupName: string;
  rank: string;
  joinedDate: string;
  parentId?: string;
  personalInfo?: ScoutPersonalInfo;
  medicalInfo?: ScoutMedicalInfo;
  emergencyContacts?: EmergencyContact[];
  achievements?: Achievement[];
  attendance?: Attendance[];
}

export interface ScoutPersonalInfo {
  dateOfBirth: string;
  address: string;
  phone?: string;
  email?: string;
  school?: string;
  grade?: string;
}

export interface ScoutMedicalInfo {
  allergies: string[];
  medications: string[];
  conditions: string[];
  doctorName?: string;
  doctorPhone?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isAuthorizedForPickup: boolean;
}

export interface Group {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  location: string;
  meetingDay: string;
  meetingTime: string;
  memberCount: number;
  description?: string;
}

export interface Achievement {
  id: string;
  scoutId: string;
  name: string;
  description: string;
  dateEarned: string;
  type?: "badge" | "rank" | "skill";
  imageUrl?: string;
}

export interface Attendance {
  id: string;
  scoutId: string;
  eventId: string;
  date: string;
  present: boolean;
  notes?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  groupId?: string;
  groupName?: string;
  attendees?: number;
  createdBy?: string; // userId of creator
  status?: "pending" | "approved" | "rejected"; // For event approval workflow
  approvedBy?: string; // executiveId who approved
  requiresPermissionSlip?: boolean;
  rsvps?: EventRSVP[]; // For tracking RSVPs
  type?: "regular" | "special" | "organization-wide";
}

export interface EventRSVP {
  eventId: string;
  scoutId: string;
  status: "attending" | "not-attending" | "pending";
  permissionSlipSigned?: boolean;
  signedBy?: string; // parentId
  signedAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string; // can be userId or "group-{groupId}" for group messages
  receiverName: string;
  content: string;
  timestamp: string;
  read: boolean;
  subject?: string;
  isAnnouncement?: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  date: string;
  groupId?: string;
  groupName?: string;
  type: "attendance" | "achievements" | "events" | "financial" | "incident" | "activity" | "progress";
  fileUrl?: string;
  createdBy?: string;
  authorId?: string;
  content?: string;
  status?: "draft" | "submitted" | "approved" | "rejected" | "resolved";
  data?: any;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: "document" | "video" | "link" | "lesson";
  url: string;
  createdBy: string;
  createdAt: string;
  targetGroups?: string[]; // groupIds this resource is shared with
  tags?: string[];
  isPublic: boolean;
}

export interface Incident {
  id: string;
  scoutId: string;
  reportedBy: string; // userId
  date: string;
  description: string;
  severity: "minor" | "moderate" | "serious";
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  witnesses?: string[];
}
