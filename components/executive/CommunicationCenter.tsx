"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

interface Message {
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
  attachments?: string[];
}

interface Announcement {
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

interface CommunicationAnalytics {
  totalMessages: number;
  unreadMessages: number;
  messagesByCategory: { [key: string]: number };
  responseRate: number;
  averageResponseTime: string;
  activeUsers: number;
  peakHours: string[];
}

interface CommunicationCenterProps {
  className?: string;
}

const CommunicationCenter: React.FC<CommunicationCenterProps> = ({ className = "" }) => {
  const [selectedTab, setSelectedTab] = useState('messages');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'normal',
    category: 'general',
    targetAcademies: [] as string[],
    targetGroups: [] as string[],
    targetRoles: [] as string[],
    expiryDate: ''
  });

  // Mock messages data
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      senderId: 'parent-1',
      senderName: 'Ahmad Ali',
      senderRole: 'parent',
      receiverId: 'leader-1',
      receiverName: 'Fatima Rahman',
      receiverRole: 'leader',
      content: 'My son Omar will be late for today\'s meeting due to a doctor\'s appointment. He should arrive by 4:30 PM.',
      timestamp: '2025-01-19T14:30:00',
      read: false,
      priority: 'normal',
      category: 'attendance',
      academy: 'Main Academy',
      groupId: 'group-1'
    },
    {
      id: 'msg-2',
      senderId: 'leader-2',
      senderName: 'Hassan Omar',
      senderRole: 'leader',
      receiverId: 'parent-2',
      receiverName: 'Khadija Hassan',
      receiverRole: 'parent',
      content: 'Congratulations! Aisha has successfully completed her First Aid badge. The certificate will be presented at next week\'s ceremony.',
      timestamp: '2025-01-19T13:15:00',
      read: true,
      priority: 'normal',
      category: 'achievement',
      academy: 'North Branch',
      groupId: 'group-2'
    },
    {
      id: 'msg-3',
      senderId: 'parent-3',
      senderName: 'Mohamed Salem',
      senderRole: 'parent',
      receiverId: 'leader-3',
      receiverName: 'Yusuf Abdullah',
      receiverRole: 'leader',
      content: 'Could you please provide information about the upcoming camping trip? We need details about equipment, costs, and pickup/drop-off times.',
      timestamp: '2025-01-19T11:45:00',
      read: false,
      priority: 'normal',
      category: 'event',
      academy: 'South Branch',
      groupId: 'group-3'
    },
    {
      id: 'msg-4',
      senderId: 'leader-1',
      senderName: 'Fatima Rahman',
      senderRole: 'leader',
      receiverId: 'executive-1',
      receiverName: 'Aisha Khan',
      receiverRole: 'executive',
      content: 'URGENT: We have a minor safety incident during the outdoor activity. A scout sustained a small cut. First aid has been administered. Parent contacted. No serious injury.',
      timestamp: '2025-01-19T10:20:00',
      read: true,
      priority: 'urgent',
      category: 'safety',
      academy: 'Main Academy',
      groupId: 'group-1'
    },
    {
      id: 'msg-5',
      senderId: 'parent-4',
      senderName: 'Layla Ahmed',
      senderRole: 'parent',
      receiverId: 'leader-2',
      receiverName: 'Hassan Omar',
      receiverRole: 'leader',
      content: 'Thank you for the excellent Islamic character development session last week. Zaid came home very excited about the stories of the Sahaba. Keep up the great work!',
      timestamp: '2025-01-18T19:30:00',
      read: true,
      priority: 'low',
      category: 'general',
      academy: 'North Branch',
      groupId: 'group-2'
    }
  ]);

  // Mock announcements data
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 'ann-1',
      title: 'Upcoming Ramadan Activities Schedule',
      content: 'Assalamu Alaikum! We are excited to announce our special Ramadan activities including Iftar gatherings, Quran recitation competitions, and charity drives. All activities will be held at the main academy. Registration is now open.',
      authorId: 'executive-1',
      authorName: 'Aisha Khan',
      timestamp: '2025-01-19T09:00:00',
      targetAudience: {
        academies: ['Main Academy', 'North Branch', 'South Branch'],
        groups: ['group-1', 'group-2', 'group-3'],
        roles: ['scout', 'parent', 'leader']
      },
      priority: 'high',
      category: 'islamic',
      expiryDate: '2025-03-15',
      readCount: 156,
      isActive: true
    },
    {
      id: 'ann-2',
      title: 'Safety Protocol Update - Outdoor Activities',
      content: 'Important safety update: All outdoor activities now require updated emergency contact forms and medical information. Please ensure all scouts have current forms on file before participating in any outdoor events.',
      authorId: 'executive-1',
      authorName: 'Aisha Khan',
      timestamp: '2025-01-18T16:00:00',
      targetAudience: {
        academies: ['Main Academy', 'North Branch', 'South Branch'],
        groups: ['group-1', 'group-2', 'group-3'],
        roles: ['parent', 'leader']
      },
      priority: 'urgent',
      category: 'safety',
      readCount: 89,
      isActive: true
    },
    {
      id: 'ann-3',
      title: 'New Badge Program Launch',
      content: 'We are excited to introduce three new Islamic character badges: Honesty, Compassion, and Community Service. These badges focus on developing Islamic values while maintaining our scouting traditions.',
      authorId: 'leader-1',
      authorName: 'Fatima Rahman',
      timestamp: '2025-01-17T14:30:00',
      targetAudience: {
        academies: ['Main Academy'],
        groups: ['group-1', 'group-2'],
        roles: ['scout', 'parent', 'leader']
      },
      priority: 'normal',
      category: 'general',
      readCount: 67,
      isActive: true
    }
  ]);

  // Available academies, groups, and roles for targeting
  const academies = ['Main Academy', 'North Branch', 'South Branch'];
  const groups = [
    { id: 'group-1', name: 'Eagle Scouts', academy: 'Main Academy' },
    { id: 'group-2', name: 'Wolf Pack', academy: 'North Branch' },
    { id: 'group-3', name: 'Trailblazers', academy: 'South Branch' }
  ];
  const roles = ['scout', 'parent', 'leader', 'executive'];

  // Filter messages
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.receiverName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || message.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || message.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Communication analytics
  const analytics: CommunicationAnalytics = {
    totalMessages: messages.length,
    unreadMessages: messages.filter(m => !m.read).length,
    messagesByCategory: {
      general: messages.filter(m => m.category === 'general').length,
      attendance: messages.filter(m => m.category === 'attendance').length,
      event: messages.filter(m => m.category === 'event').length,
      safety: messages.filter(m => m.category === 'safety').length,
      finance: messages.filter(m => m.category === 'finance').length,
      achievement: messages.filter(m => m.category === 'achievement').length
    },
    responseRate: 87.5,
    averageResponseTime: '2.3 hours',
    activeUsers: 45,
    peakHours: ['16:00-17:00', '19:00-20:00']
  };

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'safety':
        return 'bg-red-100 text-red-800';
      case 'islamic':
        return 'bg-msa-sage/20 text-msa-sage';
      case 'event':
        return 'bg-blue-100 text-blue-800';
      case 'achievement':
        return 'bg-green-100 text-green-800';
      case 'finance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle announcement creation
  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert('Please fill in all required fields');
      return;
    }

    const announcement: Announcement = {
      id: `ann-${Date.now()}`,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      authorId: 'executive-1',
      authorName: 'Executive Admin',
      timestamp: new Date().toISOString(),
      targetAudience: {
        academies: newAnnouncement.targetAcademies,
        groups: newAnnouncement.targetGroups,
        roles: newAnnouncement.targetRoles
      },
      priority: newAnnouncement.priority as any,
      category: newAnnouncement.category as any,
      expiryDate: newAnnouncement.expiryDate || undefined,
      readCount: 0,
      isActive: true
    };

    setAnnouncements([announcement, ...announcements]);
    setShowAnnouncementModal(false);
    setNewAnnouncement({
      title: '',
      content: '',
      priority: 'normal',
      category: 'general',
      targetAcademies: [],
      targetGroups: [],
      targetRoles: [],
      expiryDate: ''
    });
  };

  // Toggle target selection
  const toggleTargetSelection = (type: 'academies' | 'groups' | 'roles', value: string) => {
    setNewAnnouncement(prev => ({
      ...prev,
      [`target${type.charAt(0).toUpperCase() + type.slice(1)}`]: 
        (prev as any)[`target${type.charAt(0).toUpperCase() + type.slice(1)}`].includes(value)
          ? (prev as any)[`target${type.charAt(0).toUpperCase() + type.slice(1)}`].filter((item: string) => item !== value)
          : [...(prev as any)[`target${type.charAt(0).toUpperCase() + type.slice(1)}`], value]
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Communication Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-msa-sage">{analytics.totalMessages}</div>
            <p className="text-xs text-msa-sage/70">Platform-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Unread Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics.unreadMessages}</div>
            <p className="text-xs text-msa-sage/70">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.responseRate}%</div>
            <p className="text-xs text-msa-sage/70">Avg: {analytics.averageResponseTime}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.activeUsers}</div>
            <p className="text-xs text-msa-sage/70">Currently online</p>
          </CardContent>
        </Card>
      </div>

      {/* Communication Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messages">Message Monitor</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>

        {/* Message Monitor Tab */}
        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Message Monitoring</CardTitle>
                  <p className="text-sm text-msa-sage/70">Monitor all platform communications</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="sm:w-64"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="general">General</option>
                    <option value="attendance">Attendance</option>
                    <option value="event">Events</option>
                    <option value="safety">Safety</option>
                    <option value="finance">Finance</option>
                    <option value="achievement">Achievements</option>
                  </select>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMessages.map(message => (
                  <div 
                    key={message.id} 
                    className={`p-4 border rounded-lg ${!message.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{message.senderName}</span>
                        <span className="text-xs text-gray-500">({message.senderRole})</span>
                        <span className="text-xs text-gray-400">→</span>
                        <span className="font-medium">{message.receiverName}</span>
                        <span className="text-xs text-gray-500">({message.receiverRole})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(message.category)}`}>
                          {message.category}
                        </span>
                        {!message.read && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            Unread
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-2">{message.content}</p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div className="flex gap-4">
                        <span>Academy: {message.academy}</span>
                        {message.groupId && (
                          <span>Group: {groups.find(g => g.id === message.groupId)?.name}</span>
                        )}
                      </div>
                      <DateTimeDisplay date={message.timestamp} format="MMM dd, yyyy HH:mm" />
                    </div>
                  </div>
                ))}
                
                {filteredMessages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No messages found matching your criteria
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Academy Announcements</h3>
                <p className="text-sm text-msa-sage/70">Manage academy-wide communications</p>
              </div>
              <Button 
                onClick={() => setShowAnnouncementModal(true)}
                className="bg-msa-sage hover:bg-msa-sage/90 text-white"
              >
                Create Announcement
              </Button>
            </div>

            <div className="space-y-4">
              {announcements.map(announcement => (
                <Card key={announcement.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        <p className="text-sm text-gray-500">
                          By {announcement.authorName} • <DateTimeDisplay date={announcement.timestamp} format="MMM dd, yyyy HH:mm" />
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(announcement.category)}`}>
                          {announcement.category}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{announcement.content}</p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium mb-2">Target Audience:</div>
                      <div className="space-y-1 text-xs">
                        {announcement.targetAudience.academies.length > 0 && (
                          <div>Academies: {announcement.targetAudience.academies.join(', ')}</div>
                        )}
                        {announcement.targetAudience.groups.length > 0 && (
                          <div>
                            Groups: {announcement.targetAudience.groups.map(gId => 
                              groups.find(g => g.id === gId)?.name
                            ).join(', ')}
                          </div>
                        )}
                        {announcement.targetAudience.roles.length > 0 && (
                          <div>Roles: {announcement.targetAudience.roles.join(', ')}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Read by {announcement.readCount} users
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-600">Delete</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Message Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.messagesByCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="capitalize">{category}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Communication Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.peakHours.map((hour, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{hour}</span>
                      <span className="font-bold">High Activity</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Communication Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-msa-sage">{analytics.responseRate}%</div>
                    <div className="text-sm text-gray-500">Response Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.averageResponseTime}</div>
                    <div className="text-sm text-gray-500">Avg Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.activeUsers}</div>
                    <div className="text-sm text-gray-500">Active Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Broadcast Tab */}
        <TabsContent value="broadcast" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:bg-msa-sage/5 cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="text-3xl mb-4">📢</div>
                <h3 className="font-semibold text-msa-charcoal">Academy-wide Announcement</h3>
                <p className="text-sm text-msa-sage/70 mt-2">Send announcement to all academies</p>
              </div>
            </Card>
            
            <Card className="p-6 hover:bg-msa-sage/5 cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="text-3xl mb-4">🚨</div>
                <h3 className="font-semibold text-msa-charcoal">Emergency Alert</h3>
                <p className="text-sm text-msa-sage/70 mt-2">Send urgent safety notifications</p>
              </div>
            </Card>
            
            <Card className="p-6 hover:bg-msa-sage/5 cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="text-3xl mb-4">📱</div>
                <h3 className="font-semibold text-msa-charcoal">SMS Broadcast</h3>
                <p className="text-sm text-msa-sage/70 mt-2">Send text messages to selected groups</p>
              </div>
            </Card>
            
            <Card className="p-6 hover:bg-msa-sage/5 cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="text-3xl mb-4">📧</div>
                <h3 className="font-semibold text-msa-charcoal">Email Campaign</h3>
                <p className="text-sm text-msa-sage/70 mt-2">Send detailed email communications</p>
              </div>
            </Card>
            
            <Card className="p-6 hover:bg-msa-sage/5 cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="text-3xl mb-4">🕌</div>
                <h3 className="font-semibold text-msa-charcoal">Islamic Reminders</h3>
                <p className="text-sm text-msa-sage/70 mt-2">Send prayer times and Islamic content</p>
              </div>
            </Card>
            
            <Card className="p-6 hover:bg-msa-sage/5 cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="font-semibold text-msa-charcoal">Survey & Polls</h3>
                <p className="text-sm text-msa-sage/70 mt-2">Gather community feedback</p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create Academy Announcement</h2>
              <button 
                onClick={() => setShowAnnouncementModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Announcement Title *
                </label>
                <Input
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  rows={5}
                  placeholder="Write your announcement content here..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newAnnouncement.category}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="event">Event</option>
                    <option value="safety">Safety</option>
                    <option value="islamic">Islamic</option>
                    <option value="administrative">Administrative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Academies
                </label>
                <div className="space-y-2">
                  {academies.map(academy => (
                    <label key={academy} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newAnnouncement.targetAcademies.includes(academy)}
                        onChange={() => toggleTargetSelection('academies', academy)}
                        className="rounded"
                      />
                      <span className="ml-2 text-sm">{academy}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Groups
                </label>
                <div className="space-y-2">
                  {groups.map(group => (
                    <label key={group.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newAnnouncement.targetGroups.includes(group.id)}
                        onChange={() => toggleTargetSelection('groups', group.id)}
                        className="rounded"
                      />
                      <span className="ml-2 text-sm">{group.name} ({group.academy})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Roles
                </label>
                <div className="space-y-2">
                  {roles.map(role => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newAnnouncement.targetRoles.includes(role)}
                        onChange={() => toggleTargetSelection('roles', role)}
                        className="rounded"
                      />
                      <span className="ml-2 text-sm capitalize">{role}s</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (Optional)
                </label>
                <Input
                  type="date"
                  value={newAnnouncement.expiryDate}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>

              <div className="bg-msa-sage/10 border border-msa-sage/20 rounded-lg p-3">
                <p className="text-sm text-msa-charcoal font-medium">📢 Communication Responsibility:</p>
                <p className="text-xs text-msa-sage">"And speak to people good words" - Quran 2:83</p>
                <p className="text-xs text-msa-sage mt-1">Every communication strengthens our Islamic community bonds</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline"
                onClick={() => setShowAnnouncementModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAnnouncement}
                className="bg-msa-sage hover:bg-msa-sage/90 text-white"
              >
                Send Announcement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Islamic Values Message */}
      <Card className="bg-gradient-to-r from-msa-sage/5 to-msa-golden/5 border-msa-sage/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">💬</div>
            <div>
              <h3 className="text-lg font-semibold text-msa-charcoal">Islamic Communication Values</h3>
              <p className="text-sm text-msa-sage/80 mt-1">
                "And speak to people good words" - Quran 2:83
              </p>
              <p className="text-xs text-msa-sage/70 mt-2">
                Every message and announcement is an opportunity to strengthen our Islamic community bonds with wisdom and kindness.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationCenter;