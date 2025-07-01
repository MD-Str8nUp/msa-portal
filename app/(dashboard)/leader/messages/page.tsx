"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderNavigation } from "@/components/navigation/LeaderNavigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { mockUsers, mockMessages, mockScoutService, mockGroupService } from "@/lib/mock/data";
import { formatDate } from "@/lib/utils";

export default function LeaderMessagesPage() {
  // In a real app, get the current user from auth context
  const currentUserId = "user-2"; // Jane Smith (Leader)
  const currentUser = mockUsers.find(user => user.id === currentUserId);
  
  // Get leader's group info
  const groups = mockGroupService.getGroups();
  const leaderGroups = groups.filter(group => group.leaderId === currentUserId);
  const groupId = leaderGroups.length > 0 ? leaderGroups[0].id : null;
  
  // Get parents of scouts in leader's group
  const groupScouts = groupId ? mockScoutService.getScouts(undefined, groupId) : [];
  const parentIds = [...new Set(groupScouts.filter(scout => scout.parentId).map(scout => scout.parentId!))];
  const parents = mockUsers.filter(user => parentIds.includes(user.id));
  
  // States
  const [selectedParentId, setSelectedParentId] = useState<string | null>(parents.length > 0 ? parents[0].id : null);
  const [messageText, setMessageText] = useState("");
  const [conversations, setConversations] = useState<Record<string, any[]>>(() => {
    // Group messages by conversation partner
    const convos: Record<string, any[]> = {};
    
    mockMessages
      .filter(msg => msg.senderId === currentUserId || msg.receiverId === currentUserId)
      .forEach(msg => {
        const partnerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
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
    return mockUsers.find(u => u.id === userId);
  };
  
  // Send a message
  const sendMessage = () => {
    if (!messageText.trim() || !selectedParentId) return;
    
    // Create a new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
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
  
  return (
    <DashboardLayout 
      navigation={leaderNavigation}
      pageTitle="Messages"
      userRole="leader"
    >
      <div className="flex h-[calc(100vh-64px)]">
        {/* Parents list (left sidebar) */}
        <div className="w-1/4 border-r p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Parents</h2>
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
          {selectedParentId ? (
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
                  const isFromMe = message.senderId === currentUserId;
                  
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
      </div>
    </DashboardLayout>
  );
}
