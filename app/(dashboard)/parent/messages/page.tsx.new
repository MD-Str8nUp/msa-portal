"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { parentNavigation } from "@/components/navigation/ParentNavigation";
import { mockMessageService, mockAuthService } from "@/lib/mock/data";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import { Button } from "@/components/ui/Button";
import { useSocketContext } from "@/lib/contexts/SocketContext";

export default function ParentMessagesPage() {
  // Get current user from socket context
  const { messages: socketMessages, sendMessage, isConnected } = useSocketContext();
  
  // For compatibility during transition, also get mock data
  const currentUser = mockAuthService.getCurrentUser();
  const parentId = currentUser?.id || "user-1";
  
  // State for new message
  const [newMessageText, setNewMessageText] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [showMessageForm, setShowMessageForm] = useState(false);
  
  // Combine real and mock messages during transition
  const mockMessages = mockMessageService.getMessages(parentId);
  const combinedMessages = [...(socketMessages || []), ...mockMessages];
  
  // Remove duplicates (in case messages appear in both systems)
  const uniqueMessages = combinedMessages.filter((message, index, self) => 
    index === self.findIndex((m) => m.id === message.id)
  );
  
  // Function to handle sending a new message
  const handleSendMessage = () => {
    if (!newMessageText.trim() || !selectedRecipient) return;
    
    // Send via socket
    sendMessage(newMessageText, selectedRecipient);
    
    // Clear form
    setNewMessageText("");
    setShowMessageForm(false);
  };
  
  return (
    <DashboardLayout 
      navigation={parentNavigation} 
      pageTitle="Messages" 
      userRole="parent"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Messages</h2>
          <Button onClick={() => setShowMessageForm(true)}>New Message</Button>
        </div>
        
        {/* Connection Status */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        
        {/* New Message Form */}
        {showMessageForm && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>New Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Recipient</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                >
                  <option value="">Select a recipient</option>
                  <option value="user-2">Jane Smith (Leader)</option>
                  <option value="user-3">Michael Johnson (Executive)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  rows={4}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowMessageForm(false)}>Cancel</Button>
                <Button onClick={handleSendMessage}>Send Message</Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Messages List */}
        <div className="grid grid-cols-1 gap-4">
          {uniqueMessages.length > 0 ? (
            uniqueMessages.map((message: any) => (
              <Card key={message.id} className={`overflow-hidden ${!message.read ? 'border-l-4 border-l-blue-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Message from {message.senderName || (message.sender ? message.sender.name : 'Unknown')}</h3>
                      <p className="text-sm text-gray-600">From: {message.senderName || (message.sender ? message.sender.name : 'Unknown')}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      <DateTimeDisplay date={message.timestamp || message.createdAt} format="MMM dd, h:mm a" />
                    </div>
                  </div>
                  <p className="mt-2">{message.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No messages found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
