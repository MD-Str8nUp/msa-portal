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
    if (user) {
      // In a real application, this should use bcrypt.compare() with hashed passwords
      // For development/demo purposes, check against user-specific passwords
      const validCredentials = [
        { email: "demo@msa.com", password: "demo123" },
        { email: "admin@msa.com", password: "admin456" },
        { email: "parent@msa.com", password: "parent789" },
        { email: "leader@msa.com", password: "leader321" }
      ];
      
      const credentials = validCredentials.find(c => c.email === email);
      if (credentials && password === credentials.password) {
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

// Financial Data Types
export interface PaymentRecord {
  id: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
  amount: number;
  type: 'membership' | 'event' | 'equipment' | 'donation';
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  academy: string;
  description: string;
  method?: 'card' | 'bank' | 'cash';
  transactionId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentName: string;
  parentEmail: string;
  amount: number;
  items: InvoiceItem[];
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  academy: string;
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface FinancialMetric {
  id: string;
  title: string;
  value: number;
  format: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  category: 'revenue' | 'expenses' | 'profit' | 'other';
}

export interface MonthlyFinancialData {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  membershipFees: number;
  eventRevenue: number;
  donations: number;
  equipmentSales: number;
  academy: string;
}

export interface AcademyFinancialData {
  id: string;
  name: string;
  revenue: number;
  students: number;
  paymentRate: number;
  outstandingAmount: number;
  monthlyGrowth: number;
  averagePayment: number;
  totalTransactions: number;
}

// Mock Financial Data
export const mockPaymentRecords: PaymentRecord[] = [
  {
    id: 'payment-1',
    studentName: 'Ahmad Ali',
    parentName: 'Mohamed Ali',
    parentEmail: 'mohamed.ali@email.com',
    amount: 75,
    type: 'membership',
    status: 'paid',
    dueDate: '2025-01-15',
    paidDate: '2025-01-10',
    academy: 'Main Academy',
    description: 'Monthly membership fee - January 2025',
    method: 'card',
    transactionId: 'txn_001'
  },
  {
    id: 'payment-2',
    studentName: 'Fatima Hassan',
    parentName: 'Omar Hassan',
    parentEmail: 'omar.hassan@email.com',
    amount: 25,
    type: 'event',
    status: 'pending',
    dueDate: '2025-01-20',
    academy: 'North Branch',
    description: 'Winter camping event registration'
  },
  {
    id: 'payment-3',
    studentName: 'Omar Ahmed',
    parentName: 'Ahmed Mohamed',
    parentEmail: 'ahmed.mohamed@email.com',
    amount: 50,
    type: 'equipment',
    status: 'overdue',
    dueDate: '2025-01-05',
    academy: 'South Branch',
    description: 'Scout uniform and equipment package'
  },
  {
    id: 'payment-4',
    studentName: 'Aisha Khan',
    parentName: 'Rashid Khan',
    parentEmail: 'rashid.khan@email.com',
    amount: 100,
    type: 'donation',
    status: 'paid',
    dueDate: '2025-01-12',
    paidDate: '2025-01-08',
    academy: 'Main Academy',
    description: 'Zakat donation for underprivileged scouts',
    method: 'bank',
    transactionId: 'txn_002'
  },
  {
    id: 'payment-5',
    studentName: 'Yusuf Ibrahim',
    parentName: 'Ibrahim Abdullah',
    parentEmail: 'ibrahim.abdullah@email.com',
    amount: 75,
    type: 'membership',
    status: 'paid',
    dueDate: '2025-01-15',
    paidDate: '2025-01-14',
    academy: 'North Branch',
    description: 'Monthly membership fee - January 2025',
    method: 'cash',
    transactionId: 'txn_003'
  },
  {
    id: 'payment-6',
    studentName: 'Maryam Said',
    parentName: 'Said Hassan',
    parentEmail: 'said.hassan@email.com',
    amount: 35,
    type: 'event',
    status: 'pending',
    dueDate: '2025-01-25',
    academy: 'South Branch',
    description: 'Nature exploration workshop'
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: 'invoice-1',
    invoiceNumber: 'INV-2025-001',
    studentName: 'Ahmad Ali',
    parentEmail: 'mohamed.ali@email.com',
    amount: 125,
    items: [
      { description: 'Monthly membership fee', quantity: 1, unitPrice: 75, total: 75 },
      { description: 'Activity materials', quantity: 1, unitPrice: 50, total: 50 }
    ],
    issueDate: '2025-01-01',
    dueDate: '2025-01-15',
    status: 'paid',
    academy: 'Main Academy',
    notes: 'Payment received via credit card'
  },
  {
    id: 'invoice-2',
    invoiceNumber: 'INV-2025-002',
    studentName: 'Fatima Hassan',
    parentEmail: 'omar.hassan@email.com',
    amount: 100,
    items: [
      { description: 'Monthly membership fee', quantity: 1, unitPrice: 75, total: 75 },
      { description: 'Event registration', quantity: 1, unitPrice: 25, total: 25 }
    ],
    issueDate: '2025-01-05',
    dueDate: '2025-01-20',
    status: 'sent',
    academy: 'North Branch'
  },
  {
    id: 'invoice-3',
    invoiceNumber: 'INV-2025-003',
    studentName: 'Omar Ahmed',
    parentEmail: 'ahmed.mohamed@email.com',
    amount: 150,
    items: [
      { description: 'Monthly membership fee', quantity: 1, unitPrice: 75, total: 75 },
      { description: 'Scout uniform package', quantity: 1, unitPrice: 50, total: 50 },
      { description: 'Badge and activity kit', quantity: 1, unitPrice: 25, total: 25 }
    ],
    issueDate: '2024-12-28',
    dueDate: '2025-01-05',
    status: 'overdue',
    academy: 'South Branch',
    notes: 'Payment reminder sent'
  }
];

export const mockMonthlyFinancialData: MonthlyFinancialData[] = [
  // Main Academy
  { month: 'Jan', year: 2025, revenue: 4500, expenses: 3200, profit: 1300, membershipFees: 3000, eventRevenue: 800, donations: 500, equipmentSales: 200, academy: 'Main Academy' },
  { month: 'Feb', year: 2025, revenue: 4800, expenses: 3400, profit: 1400, membershipFees: 3200, eventRevenue: 900, donations: 500, equipmentSales: 200, academy: 'Main Academy' },
  { month: 'Mar', year: 2025, revenue: 5200, expenses: 3600, profit: 1600, membershipFees: 3400, eventRevenue: 1000, donations: 600, equipmentSales: 200, academy: 'Main Academy' },
  { month: 'Apr', year: 2025, revenue: 4900, expenses: 3500, profit: 1400, membershipFees: 3300, eventRevenue: 900, donations: 500, equipmentSales: 200, academy: 'Main Academy' },
  { month: 'May', year: 2025, revenue: 5100, expenses: 3700, profit: 1400, membershipFees: 3400, eventRevenue: 950, donations: 550, equipmentSales: 200, academy: 'Main Academy' },
  { month: 'Jun', year: 2025, revenue: 4800, expenses: 3500, profit: 1300, membershipFees: 3200, eventRevenue: 900, donations: 500, equipmentSales: 200, academy: 'Main Academy' },
  
  // North Branch
  { month: 'Jan', year: 2025, revenue: 3200, expenses: 2400, profit: 800, membershipFees: 2100, eventRevenue: 600, donations: 350, equipmentSales: 150, academy: 'North Branch' },
  { month: 'Feb', year: 2025, revenue: 3400, expenses: 2500, profit: 900, membershipFees: 2200, eventRevenue: 650, donations: 400, equipmentSales: 150, academy: 'North Branch' },
  { month: 'Mar', year: 2025, revenue: 3600, expenses: 2600, profit: 1000, membershipFees: 2300, eventRevenue: 700, donations: 450, equipmentSales: 150, academy: 'North Branch' },
  { month: 'Apr', year: 2025, revenue: 3500, expenses: 2550, profit: 950, membershipFees: 2250, eventRevenue: 675, donations: 425, equipmentSales: 150, academy: 'North Branch' },
  { month: 'May', year: 2025, revenue: 3700, expenses: 2650, profit: 1050, membershipFees: 2350, eventRevenue: 725, donations: 475, equipmentSales: 150, academy: 'North Branch' },
  { month: 'Jun', year: 2025, revenue: 3500, expenses: 2550, profit: 950, membershipFees: 2250, eventRevenue: 675, donations: 425, equipmentSales: 150, academy: 'North Branch' },
  
  // South Branch
  { month: 'Jan', year: 2025, revenue: 2800, expenses: 2100, profit: 700, membershipFees: 1800, eventRevenue: 500, donations: 350, equipmentSales: 150, academy: 'South Branch' },
  { month: 'Feb', year: 2025, revenue: 3000, expenses: 2200, profit: 800, membershipFees: 1900, eventRevenue: 550, donations: 400, equipmentSales: 150, academy: 'South Branch' },
  { month: 'Mar', year: 2025, revenue: 3200, expenses: 2300, profit: 900, membershipFees: 2000, eventRevenue: 600, donations: 450, equipmentSales: 150, academy: 'South Branch' },
  { month: 'Apr', year: 2025, revenue: 3100, expenses: 2250, profit: 850, membershipFees: 1950, eventRevenue: 575, donations: 425, equipmentSales: 150, academy: 'South Branch' },
  { month: 'May', year: 2025, revenue: 3300, expenses: 2350, profit: 950, membershipFees: 2050, eventRevenue: 625, donations: 475, equipmentSales: 150, academy: 'South Branch' },
  { month: 'Jun', year: 2025, revenue: 3100, expenses: 2250, profit: 850, membershipFees: 1950, eventRevenue: 575, donations: 425, equipmentSales: 150, academy: 'South Branch' }
];

export const mockAcademyFinancialData: AcademyFinancialData[] = [
  {
    id: 'academy-main',
    name: 'Main Academy',
    revenue: 65000,
    students: 120,
    paymentRate: 96.5,
    outstandingAmount: 2500,
    monthlyGrowth: 8.2,
    averagePayment: 78,
    totalTransactions: 156
  },
  {
    id: 'academy-north',
    name: 'North Branch',
    revenue: 45000,
    students: 85,
    paymentRate: 92.3,
    outstandingAmount: 3500,
    monthlyGrowth: 12.1,
    averagePayment: 72,
    totalTransactions: 98
  },
  {
    id: 'academy-south',
    name: 'South Branch',
    revenue: 35000,
    students: 70,
    paymentRate: 93.8,
    outstandingAmount: 2500,
    monthlyGrowth: 5.7,
    averagePayment: 68,
    totalTransactions: 82
  }
];

export const mockFinancialMetrics: FinancialMetric[] = [
  {
    id: 'metric-total-revenue',
    title: 'Total Revenue',
    value: 145000,
    format: 'currency',
    trend: 'up',
    trendValue: 12.5,
    period: 'yearly',
    category: 'revenue'
  },
  {
    id: 'metric-monthly-revenue',
    title: 'Monthly Revenue',
    value: 12500,
    format: 'currency',
    trend: 'up',
    trendValue: 8.3,
    period: 'monthly',
    category: 'revenue'
  },
  {
    id: 'metric-payment-rate',
    title: 'Payment Rate',
    value: 94.1,
    format: 'percentage',
    trend: 'stable',
    trendValue: 0.5,
    period: 'monthly',
    category: 'other'
  },
  {
    id: 'metric-outstanding',
    title: 'Outstanding Payments',
    value: 8500,
    format: 'currency',
    trend: 'down',
    trendValue: 15.2,
    period: 'monthly',
    category: 'other'
  },
  {
    id: 'metric-monthly-profit',
    title: 'Monthly Profit',
    value: 3650,
    format: 'currency',
    trend: 'up',
    trendValue: 11.8,
    period: 'monthly',
    category: 'profit'
  },
  {
    id: 'metric-monthly-expenses',
    title: 'Monthly Expenses',
    value: 8850,
    format: 'currency',
    trend: 'stable',
    trendValue: 2.1,
    period: 'monthly',
    category: 'expenses'
  }
];

// Financial Service Functions
export const mockFinancialService = {
  getPaymentRecords: (filters?: { status?: string; academy?: string; type?: string }) => {
    let filteredRecords = mockPaymentRecords;
    if (filters?.status && filters.status !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.status === filters.status);
    }
    if (filters?.academy && filters.academy !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.academy === filters.academy);
    }
    if (filters?.type && filters.type !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.type === filters.type);
    }
    return filteredRecords;
  },
  
  getInvoices: (status?: string) => {
    if (status && status !== 'all') {
      return mockInvoices.filter(invoice => invoice.status === status);
    }
    return mockInvoices;
  },
  
  getMonthlyFinancialData: (academy?: string) => {
    if (academy && academy !== 'all') {
      return mockMonthlyFinancialData.filter(data => data.academy === academy);
    }
    return mockMonthlyFinancialData;
  },
  
  getAcademyFinancialData: () => {
    return mockAcademyFinancialData;
  },
  
  getFinancialMetrics: (period?: string, category?: string) => {
    let filteredMetrics = mockFinancialMetrics;
    if (period && period !== 'all') {
      filteredMetrics = filteredMetrics.filter(metric => metric.period === period);
    }
    if (category && category !== 'all') {
      filteredMetrics = filteredMetrics.filter(metric => metric.category === category);
    }
    return filteredMetrics;
  },
  
  processPayment: (paymentId: string, method: string) => {
    const payment = mockPaymentRecords.find(p => p.id === paymentId);
    if (payment) {
      payment.status = 'paid';
      payment.paidDate = new Date().toISOString().split('T')[0];
      payment.method = method as 'card' | 'bank' | 'cash';
      payment.transactionId = `txn_${Date.now()}`;
    }
    return payment;
  },
  
  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInvoice: Invoice = {
      id: `invoice-${generateRandomId()}`,
      invoiceNumber: `INV-2025-${String(mockInvoices.length + 1).padStart(3, '0')}`,
      ...invoiceData
    };
    mockInvoices.push(newInvoice);
    return newInvoice;
  }
};

// Administrative Data Types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'scout' | 'parent' | 'leader' | 'executive' | 'admin';
  academy: string;
  groupId?: string;
  groupName?: string;
  phone?: string;
  joinDate: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  age?: number;
  parentId?: string;
  children?: string[];
}

export interface AdminResource {
  id: string;
  name: string;
  type: 'document' | 'video' | 'image' | 'audio' | 'link';
  category: 'training' | 'activity' | 'safety' | 'islamic' | 'badges' | 'general';
  size: string;
  uploadDate: string;
  uploadedBy: string;
  description: string;
  assignedGroups: string[];
  assignedAcademies: string[];
  downloadCount: number;
  isPublic: boolean;
  tags: string[];
  fileUrl: string;
}

export interface AdminMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'scout' | 'parent' | 'leader' | 'executive';
  receiverId: string;
  receiverName: string;
  receiverRole: 'scout' | 'parent' | 'leader' | 'executive';
  content: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'attendance' | 'event' | 'safety' | 'finance' | 'achievement';
  academy: string;
  groupId?: string;
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: string;
  targetAudience: {
    academies: string[];
    groups: string[];
    roles: string[];
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'event' | 'safety' | 'islamic' | 'administrative';
  expiryDate?: string;
  readCount: number;
  isActive: boolean;
}

// Extended Mock Data for Administration
export const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin-user-1',
    name: 'Ahmad Ali Rahman',
    email: 'ahmad.rahman@email.com',
    role: 'scout',
    academy: 'Main Academy',
    groupId: 'group-1',
    groupName: 'Eagle Scouts',
    phone: '+1234567890',
    joinDate: '2023-06-15',
    lastActive: '2025-01-19',
    status: 'active',
    permissions: ['view_profile', 'join_events', 'earn_badges'],
    age: 12,
    parentId: 'admin-user-5'
  },
  {
    id: 'admin-user-2',
    name: 'Fatima Hassan Malik',
    email: 'fatima.malik@email.com',
    role: 'leader',
    academy: 'North Branch',
    groupId: 'group-2',
    groupName: 'Wolf Pack',
    phone: '+1234567891',
    joinDate: '2022-03-10',
    lastActive: '2025-01-19',
    status: 'active',
    permissions: ['manage_group', 'view_reports', 'send_messages', 'track_progress'],
    children: ['admin-user-8', 'admin-user-9']
  },
  {
    id: 'admin-user-3',
    name: 'Omar Ahmed Said',
    email: 'omar.said@email.com',
    role: 'parent',
    academy: 'South Branch',
    phone: '+1234567892',
    joinDate: '2023-01-20',
    lastActive: '2025-01-18',
    status: 'active',
    permissions: ['view_child_progress', 'pay_fees', 'receive_updates'],
    children: ['admin-user-1', 'admin-user-10']
  },
  {
    id: 'admin-user-4',
    name: 'Aisha Khan Ibrahim',
    email: 'aisha.khan@email.com',
    role: 'executive',
    academy: 'Main Academy',
    phone: '+1234567893',
    joinDate: '2021-08-05',
    lastActive: '2025-01-19',
    status: 'active',
    permissions: ['full_access', 'manage_finances', 'admin_control', 'user_management']
  },
  {
    id: 'admin-user-5',
    name: 'Yusuf Abdullah Hassan',
    email: 'yusuf.hassan@email.com',
    role: 'leader',
    academy: 'Main Academy',
    groupId: 'group-3',
    groupName: 'Trailblazers',
    phone: '+1234567894',
    joinDate: '2022-09-15',
    lastActive: '2025-01-19',
    status: 'active',
    permissions: ['manage_group', 'view_reports', 'send_messages', 'organize_events']
  },
  {
    id: 'admin-user-6',
    name: 'Khadija Mohamed Amin',
    email: 'khadija.amin@email.com',
    role: 'parent',
    academy: 'North Branch',
    phone: '+1234567895',
    joinDate: '2023-11-08',
    lastActive: '2025-01-17',
    status: 'active',
    permissions: ['view_child_progress', 'pay_fees', 'volunteer'],
    children: ['admin-user-6']
  },
  {
    id: 'admin-user-7',
    name: 'Hassan Omar Yusuf',
    email: 'hassan.yusuf@email.com',
    role: 'leader',
    academy: 'South Branch',
    groupId: 'group-3',
    groupName: 'Trailblazers',
    phone: '+1234567896',
    joinDate: '2022-01-12',
    lastActive: '2025-01-18',
    status: 'active',
    permissions: ['manage_group', 'conduct_training', 'safety_officer']
  }
];

export const mockAdminResources: AdminResource[] = [
  {
    id: 'admin-res-1',
    name: 'Islamic Leadership Guide for Scout Leaders',
    type: 'document',
    category: 'islamic',
    size: '4.2 MB',
    uploadDate: '2025-01-15',
    uploadedBy: 'Aisha Khan Ibrahim',
    description: 'Comprehensive guide for incorporating Islamic leadership principles in scouting activities',
    assignedGroups: ['group-1', 'group-2', 'group-3'],
    assignedAcademies: ['Main Academy', 'North Branch', 'South Branch'],
    downloadCount: 67,
    isPublic: false,
    tags: ['islamic', 'leadership', 'guide', 'character'],
    fileUrl: '/resources/islamic-leadership-guide.pdf'
  },
  {
    id: 'admin-res-2',
    name: 'Emergency Response Procedures Video',
    type: 'video',
    category: 'safety',
    size: '245 MB',
    uploadDate: '2025-01-12',
    uploadedBy: 'Hassan Omar Yusuf',
    description: 'Step-by-step emergency response training for all scouts and leaders',
    assignedGroups: ['group-1', 'group-2', 'group-3'],
    assignedAcademies: ['Main Academy', 'North Branch', 'South Branch'],
    downloadCount: 89,
    isPublic: false,
    tags: ['safety', 'emergency', 'training', 'response'],
    fileUrl: '/resources/emergency-response.mp4'
  },
  {
    id: 'admin-res-3',
    name: 'Outdoor Cooking Halal Recipes',
    type: 'document',
    category: 'activity',
    size: '2.8 MB',
    uploadDate: '2025-01-08',
    uploadedBy: 'Fatima Hassan Malik',
    description: 'Collection of delicious halal recipes perfect for camping and outdoor activities',
    assignedGroups: ['group-1', 'group-2'],
    assignedAcademies: ['Main Academy', 'North Branch'],
    downloadCount: 34,
    isPublic: true,
    tags: ['cooking', 'halal', 'outdoor', 'recipes', 'camping'],
    fileUrl: '/resources/halal-outdoor-recipes.pdf'
  }
];

export const mockAdminMessages: AdminMessage[] = [
  {
    id: 'admin-msg-1',
    senderId: 'admin-user-3',
    senderName: 'Omar Ahmed Said',
    senderRole: 'parent',
    receiverId: 'admin-user-2',
    receiverName: 'Fatima Hassan Malik',
    receiverRole: 'leader',
    content: 'Assalamu Alaikum. My son Ahmad will be participating in the upcoming camping trip. Please let me know what additional preparations are needed.',
    timestamp: '2025-01-19T15:30:00',
    read: false,
    priority: 'normal',
    category: 'event',
    academy: 'North Branch',
    groupId: 'group-2'
  },
  {
    id: 'admin-msg-2',
    senderId: 'admin-user-2',
    senderName: 'Fatima Hassan Malik',
    senderRole: 'leader',
    receiverId: 'admin-user-4',
    receiverName: 'Aisha Khan Ibrahim',
    receiverRole: 'executive',
    content: 'We have completed the Islamic character development program with excellent results. 18 scouts participated and all showed significant improvement in Islamic knowledge.',
    timestamp: '2025-01-19T14:15:00',
    read: true,
    priority: 'normal',
    category: 'achievement',
    academy: 'North Branch',
    groupId: 'group-2'
  },
  {
    id: 'admin-msg-3',
    senderId: 'admin-user-7',
    senderName: 'Hassan Omar Yusuf',
    senderRole: 'leader',
    receiverId: 'admin-user-4',
    receiverName: 'Aisha Khan Ibrahim',
    receiverRole: 'executive',
    content: 'URGENT: Minor safety incident during rope climbing activity. Scout sustained small scrape. First aid administered immediately. Parent contacted. All safety protocols followed.',
    timestamp: '2025-01-19T11:45:00',
    read: true,
    priority: 'urgent',
    category: 'safety',
    academy: 'South Branch',
    groupId: 'group-3'
  }
];

export const mockAdminAnnouncements: AdminAnnouncement[] = [
  {
    id: 'admin-ann-1',
    title: 'Ramadan 2025 Special Activities Program',
    content: 'Assalamu Alaikum dear MSA families! We are excited to announce our comprehensive Ramadan activities program including daily Iftar gatherings, Quran recitation competitions, and community service projects. Registration is now open for all activities.',
    authorId: 'admin-user-4',
    authorName: 'Aisha Khan Ibrahim',
    timestamp: '2025-01-19T09:00:00',
    targetAudience: {
      academies: ['Main Academy', 'North Branch', 'South Branch'],
      groups: ['group-1', 'group-2', 'group-3'],
      roles: ['scout', 'parent', 'leader']
    },
    priority: 'high',
    category: 'islamic',
    expiryDate: '2025-03-20',
    readCount: 234,
    isActive: true
  },
  {
    id: 'admin-ann-2',
    title: 'Updated Safety Protocols - Mandatory Reading',
    content: 'Important update: New safety protocols are now in effect for all outdoor activities. All leaders must review the updated guidelines and all parents must sign the new consent forms before their children can participate in outdoor events.',
    authorId: 'admin-user-4',
    authorName: 'Aisha Khan Ibrahim',
    timestamp: '2025-01-18T16:30:00',
    targetAudience: {
      academies: ['Main Academy', 'North Branch', 'South Branch'],
      groups: ['group-1', 'group-2', 'group-3'],
      roles: ['parent', 'leader']
    },
    priority: 'urgent',
    category: 'safety',
    readCount: 187,
    isActive: true
  }
];

// Administrative Service Functions
export const mockAdminService = {
  // User Management
  getAdminUsers: (filters?: { role?: string; academy?: string; status?: string }) => {
    let filteredUsers = mockAdminUsers;
    if (filters?.role && filters.role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }
    if (filters?.academy && filters.academy !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.academy === filters.academy);
    }
    if (filters?.status && filters.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === filters.status);
    }
    return filteredUsers;
  },
  
  updateUserRole: (userId: string, newRole: string) => {
    const userIndex = mockAdminUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockAdminUsers[userIndex].role = newRole as any;
      mockAdminUsers[userIndex].lastActive = new Date().toISOString();
      return mockAdminUsers[userIndex];
    }
    return null;
  },
  
  // Resource Management
  getAdminResources: (filters?: { category?: string; type?: string }) => {
    let filteredResources = mockAdminResources;
    if (filters?.category && filters.category !== 'all') {
      filteredResources = filteredResources.filter(resource => resource.category === filters.category);
    }
    if (filters?.type && filters.type !== 'all') {
      filteredResources = filteredResources.filter(resource => resource.type === filters.type);
    }
    return filteredResources;
  },
  
  uploadResource: (resourceData: Omit<AdminResource, 'id' | 'uploadDate' | 'downloadCount'>) => {
    const newResource: AdminResource = {
      id: `admin-res-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      downloadCount: 0,
      ...resourceData
    };
    mockAdminResources.push(newResource);
    return newResource;
  },
  
  // Communication Management
  getAdminMessages: (filters?: { category?: string; priority?: string }) => {
    let filteredMessages = mockAdminMessages;
    if (filters?.category && filters.category !== 'all') {
      filteredMessages = filteredMessages.filter(message => message.category === filters.category);
    }
    if (filters?.priority && filters.priority !== 'all') {
      filteredMessages = filteredMessages.filter(message => message.priority === filters.priority);
    }
    return filteredMessages;
  },
  
  getAdminAnnouncements: () => {
    return mockAdminAnnouncements;
  },
  
  createAnnouncement: (announcementData: Omit<AdminAnnouncement, 'id' | 'timestamp' | 'readCount' | 'isActive'>) => {
    const newAnnouncement: AdminAnnouncement = {
      id: `admin-ann-${Date.now()}`,
      timestamp: new Date().toISOString(),
      readCount: 0,
      isActive: true,
      ...announcementData
    };
    mockAdminAnnouncements.unshift(newAnnouncement);
    return newAnnouncement;
  }
};
