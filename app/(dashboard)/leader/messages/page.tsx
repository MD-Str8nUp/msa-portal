"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderNavigation } from "@/components/navigation/LeaderNavigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { messageService, userService, scoutService, groupService } from "@/lib/services/supabaseService";
import { useAuth } from "@/lib/contexts/AuthContext";
import { formatDate } from "@/lib/utils";

export default function LeaderMessagesPage() {
  const { userDetails } = useAuth();
  
  // State
  const [messages, setMessages] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [scouts, setScouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!userDetails) return;
      
      try {
        setLoading(true);
        
        // Get leader's groups
        const allGroups = await groupService.getAllGroups();
        const leaderGroups = allGroups.filter(group => group.leader_id === userDetails.id);
        setGroups(leaderGroups);
        
        // Get messages for this user
        const userMessages = await messageService.getMessagesByUser(userDetails.id);
        setMessages(userMessages || []);
        
        // Get parents from leader's groups
        if (leaderGroups.length > 0) {
          const groupId = leaderGroups[0].id;
          const groupScouts = await scoutService.getScoutsByGroup(groupId);
          setScouts(groupScouts);
          
          const parentIds = [...new Set(groupScouts.filter((scout: any) => scout.parent_id).map((scout: any) => scout.parent_id!))];
          
          if (parentIds.length > 0) {
            const allUsers = await userService.getAllUsers();
            const parentUsers = allUsers.filter((user: any) => parentIds.includes(user.id));
            setParents(parentUsers);
          }
        }
      } catch (error) {
        console.error('Error fetching messages data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userDetails]);
  
  // Get first group for this leader (demo purposes)
  const leaderGroup = groups.length > 0 ? groups[0] : null;
  
  // Get scouts in the leader's group
  const groupScouts = leaderGroup ? scouts.filter((scout: any) => scout.groupId === leaderGroup.id) : [];
  
  // States
  const [selectedParentId, setSelectedParentId] = useState<string | null>(parents.length > 0 ? parents[0].id : null);
  const [messageText, setMessageText] = useState("");
  const [showGroupAnnouncement, setShowGroupAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [groupAnnouncements, setGroupAnnouncements] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Record<string, any[]>>(() => {
    // Group messages by conversation partner
    const convos: Record<string, any[]> = {};
    
    messages
      .filter(msg => msg.senderId === userDetails?.id || msg.receiverId === userDetails?.id)
      .forEach(msg => {
        const partnerId = msg.senderId === userDetails?.id ? msg.receiverId : msg.senderId;
        if (!convos[partnerId]) {
          convos[partnerId] = [];
        }
        convos[partnerId].push(msg);
      });
      
    // Sort messages by timestamp
    Object.keys(convos).forEach(key => {
      convos[key].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });
    
    return convos;
  });

  // Helper to get user by ID
  const getUserById = (userId: string) => {
    return parents.find((u: any) => u.id === userId) || 
           (userDetails?.id === userId ? userDetails : null);
  };
  
  // Send a message
  const sendMessage = () => {
    if (!messageText.trim() || !selectedParentId || !userDetails?.id) return;
    
    // Create a new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: userDetails.id,
      receiverId: selectedParentId,
      content: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Update conversations state
    setConversations(prev => {
      const updated = { ...prev };
      if (!updated[selectedParentId]) {
        updated[selectedParentId] = [];
      }
      updated[selectedParentId] = [...updated[selectedParentId], newMessage];
      return updated;
    });
    
    // Clear input
    setMessageText("");
  };
  
  // Send group announcement
  const sendGroupAnnouncement = () => {
    if (!announcementText.trim() || !userDetails?.id || !leaderGroup?.id) return;
    
    const announcement = {
      id: `announcement-${Date.now()}`,
      senderId: userDetails.id,
      content: announcementText,
      timestamp: new Date().toISOString(),
      type: 'group_announcement',
      groupId: leaderGroup.id,
      recipientCount: parents.length
    };
    
    setGroupAnnouncements(prev => [announcement, ...prev]);
    setAnnouncementText("");
    setShowGroupAnnouncement(false);
    
    // In a real app, this would send the announcement to all parents
    console.log('Group announcement sent to', parents.length, 'parents');
  };
  
  return (
    <DashboardLayout 
      navigation={leaderNavigation}
      pageTitle="Messages"
      userRole="leader"
    >
      <div className="flex h-[calc(100vh-64px)]">
        {/* Parents list (left sidebar) */}
        <div className="w-1/4 border-r p-4 overflow-y-auto">
          {/* Group Announcements Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Group Announcements</h2>
              <Button 
                size="sm"
                onClick={() => setShowGroupAnnouncement(true)}
                className="bg-msa-sage hover:bg-msa-sage/90 text-white text-xs px-2 py-1"
              >
                + New
              </Button>
            </div>
            <div 
              className={`p-3 rounded-md cursor-pointer border-2 ${selectedParentId === 'announcements' ? 'bg-msa-sage/10 border-msa-sage' : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setSelectedParentId('announcements')}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-msa-sage/20 flex items-center justify-center mr-3">
                  📢
                </div>
                <div>
                  <p className="font-medium">Group Announcements</p>
                  <p className="text-sm text-gray-500">{groupAnnouncements.length} sent</p>
                </div>
              </div>
            </div>
          </div>
          
          <h2 className="text-lg font-semibold mb-4">Individual Conversations</h2>
          <div className="space-y-2">
            {parents.map(parent => (
              <div 
                key={parent.id} 
                className={`p-3 rounded-md cursor-pointer flex items-center ${selectedParentId === parent.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedParentId(parent.id)}
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  {parent.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{parent.name}</p>
                  <p className="text-sm text-gray-500">
                    {groupScouts
                      .filter(scout => scout.parentId === parent.id)
                      .map(scout => scout.name)
                      .join(", ")
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Messages area (right side) */}
        <div className="w-3/4 flex flex-col">
          {selectedParentId === 'announcements' ? (
            <>
              {/* Group Announcements View */}
              <div className="border-b p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-msa-sage/20 flex items-center justify-center mr-3">
                    📢
                  </div>
                  <div>
                    <p className="font-medium">Group Announcements</p>
                    <p className="text-sm text-gray-500">Send announcements to all {parents.length} parents</p>
                  </div>
                </div>
              </div>
              
              {/* Announcements List */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
                {groupAnnouncements.length > 0 ? (
                  groupAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="bg-white border rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <span className="bg-msa-sage text-white text-xs px-2 py-1 rounded-full mr-2">
                            Announcement
                          </span>
                          <span className="text-sm text-gray-500">
                            Sent to {announcement.recipientCount} parents
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(announcement.timestamp, "MMM dd, h:mm a")}
                        </span>
                      </div>
                      <p className="text-gray-800">{announcement.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No group announcements sent yet</p>
                    <p className="text-sm">Click "New" to send your first announcement</p>
                  </div>
                )}
              </div>
            </>
          ) : selectedParentId ? (
            <>
              {/* Selected parent header */}
              <div className="border-b p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                    {getUserById(selectedParentId)?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{getUserById(selectedParentId)?.name}</p>
                    <p className="text-sm text-gray-500">
                      {groupScouts
                        .filter(scout => scout.parentId === selectedParentId)
                        .map(scout => scout.name)
                        .join(", ")
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
                {conversations[selectedParentId]?.map((message, index) => {
                  const isFromMe = message.senderId === userDetails?.id;
                  
                  return (
                    <div key={message.id} className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[70%] p-3 rounded-md ${
                          isFromMe 
                            ? 'bg-blue-500 text-white rounded-br-none' 
                            : 'bg-white border rounded-bl-none'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${isFromMe ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatDate(message.timestamp, "h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {(!conversations[selectedParentId] || conversations[selectedParentId].length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No messages yet</p>
                    <p className="text-sm">Send a message to start the conversation</p>
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <div className="border-t p-4">
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 mr-2"
                  />
                  <Button onClick={sendMessage}>Send</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="w-2/3">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500 mb-4">Select a parent to start a conversation</p>
                  {parents.length === 0 && (
                    <p className="text-sm text-gray-400">No parents found in your group</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        {/* Group Announcement Modal */}
        {showGroupAnnouncement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Send Group Announcement</h2>
                <button 
                  onClick={() => setShowGroupAnnouncement(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  This announcement will be sent to all {parents.length} parents in your group.
                </p>
                <div className="bg-msa-sage/10 border border-msa-sage/20 rounded-lg p-3 mb-4">
                  <p className="text-sm text-msa-charcoal font-medium">📢 Islamic Reminder:</p>
                  <p className="text-xs text-msa-sage">"And speak to them a word of appropriate kindness" - Quran 17:23</p>
                </div>
                <textarea
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  rows={4}
                  placeholder="Type your announcement message here..."
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowGroupAnnouncement(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={sendGroupAnnouncement}
                  className="bg-msa-sage hover:bg-msa-sage/90 text-white"
                >
                  Send to All Parents
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
