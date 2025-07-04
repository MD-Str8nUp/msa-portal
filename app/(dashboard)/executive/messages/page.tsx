"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import { MessageSquare, Send, Search, User, Users, Clock } from "lucide-react";
import { useSocketContext } from "@/lib/contexts/SocketContext";

export default function ExecutiveMessagesPage() {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessageText, setNewMessageText] = useState("");
  
  // Get socket context data
  const { messages: socketMessages, sendMessage, isConnected, onlineUsers } = useSocketContext();
  
  // State for all conversations
  const [conversations, setConversations] = useState<any[]>([]);
  // State for messages in the active conversation
  const [activeMessages, setActiveMessages] = useState<any[]>([]);
  
  // Effect to organize messages into conversations
  useEffect(() => {
    if (!socketMessages?.length) return;
    
    // Group messages by conversation
    const conversationMap = new Map();
    
    socketMessages.forEach(message => {
      // Create conversation IDs from the sender and receiver
      const conversationId = message.senderId > message.receiverId 
        ? `${message.receiverId}-${message.senderId}` 
        : `${message.senderId}-${message.receiverId}`;
      
      if (!conversationMap.has(conversationId)) {
        conversationMap.set(conversationId, {
          id: conversationId,
          name: message.senderName || "Unknown User",
          role: "User",
          lastMessage: message.content,
          time: message.createdAt || new Date(),
          unread: 0,
          messages: [],
          avatar: (message.senderName || "U")[0].toUpperCase(),
          participants: [message.senderId, message.receiverId],
        });
      }
      
      const conversation = conversationMap.get(conversationId);
      conversation.messages.push({
        id: message.id,
        sender: message.senderName || "Unknown",
        content: message.content,
        time: message.createdAt || new Date(),
        isMe: conversation.participants[1] === message.senderId, // Assume receiver is the executive
      });
      
      // Update last message if this is newer
      if (new Date(message.createdAt) > new Date(conversation.time)) {
        conversation.lastMessage = message.content;
        conversation.time = message.createdAt;
      }
    });
    
    // Convert to array and sort by time (newest first)
    const conversationsArray = Array.from(conversationMap.values());
    conversationsArray.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    setConversations(conversationsArray);
    
    // If there's an active conversation, update its messages
    if (activeConversation) {
      const active = conversationMap.get(activeConversation);
      if (active) {
        // Sort messages by time (oldest first)
        const sortedMessages = [...active.messages];
        sortedMessages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        setActiveMessages(sortedMessages);
      }
    } else if (conversationsArray.length > 0) {
      // Auto-select the first conversation if none is selected
      setActiveConversation(conversationsArray[0].id);
      
      // Sort messages by time (oldest first)
      const sortedMessages = [...conversationsArray[0].messages];
      sortedMessages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      setActiveMessages(sortedMessages);
    }
  }, [socketMessages, activeConversation]);
  
  // Handle selecting a conversation
  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
    
    const selectedConversation = conversations.find(c => c.id === conversationId);
    if (selectedConversation) {
      // Sort messages by time (oldest first)
      const sortedMessages = [...selectedConversation.messages];
      sortedMessages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      setActiveMessages(sortedMessages);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!newMessageText.trim() || !activeConversation) return;
    
    // Get the recipient ID from the active conversation
    const activeConvo = conversations.find(c => c.id === activeConversation);
    if (!activeConvo) return;
    
    // Find the recipient ID (the one that's not the current user)
    const recipientId = activeConvo.participants[0]; // This would need to be determined correctly
    
    // Send message via socket
    sendMessage(newMessageText, recipientId);
    
    // Clear input
    setNewMessageText("");
  };
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(convo => 
    convo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout 
      navigation={executiveNavigation} 
      pageTitle="Messages" 
      userRole="executive"
    >
      {/* Connection Status */}
      <div className={`mb-4 inline-flex items-center px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      
      <div className="flex h-[calc(100vh-200px)] overflow-hidden rounded-lg border">
        {/* Conversations Sidebar */}
        <div className="w-full sm:w-1/3 md:w-1/4 border-r bg-gray-50">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages"
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <Button className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" /> New Message
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-300px)]">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(convo => (
                <div 
                  key={convo.id}
                  className={`p-4 border-b hover:bg-gray-100 cursor-pointer flex items-start ${
                    activeConversation === convo.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleConversationSelect(convo.id)}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium text-sm mr-3">
                    {convo.avatar}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium truncate">{convo.name}</h4>
                      <span className="text-xs text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        <DateTimeDisplay date={convo.time} format="time" />
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      {convo.role === "Group Chat" ? (
                        <Users className="h-3 w-3 mr-1" />
                      ) : (
                        <User className="h-3 w-3 mr-1" />
                      )}
                      <span className="truncate">{convo.role}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">{convo.lastMessage}</p>
                    {convo.unread > 0 && (
                      <div className="mt-2 flex justify-end">
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                          {convo.unread}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No conversations found
              </div>
            )}
          </div>
        </div>

        {/* Message Content */}
        {activeConversation && (
          <div className="hidden sm:flex flex-col w-2/3 md:w-3/4 bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium text-sm">
                  {conversations.find(c => c.id === activeConversation)?.avatar}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">{conversations.find(c => c.id === activeConversation)?.name}</h3>
                  <div className="text-xs text-gray-500 flex items-center">
                    {conversations.find(c => c.id === activeConversation)?.role === "Group Chat" ? (
                      <Users className="h-3 w-3 mr-1" />
                    ) : (
                      <User className="h-3 w-3 mr-1" />
                    )}
                    <span>{conversations.find(c => c.id === activeConversation)?.role}</span>
                    {conversations.find(c => c.id === activeConversation)?.group && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{conversations.find(c => c.id === activeConversation)?.group}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Button className="text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
                  View Profile
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {activeMessages.length > 0 ? (
                activeMessages.map((message: any) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`max-w-[75%] rounded-lg p-3 ${
                        message.isMe ? 
                        "bg-blue-500 text-white" : 
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {!message.isMe && (
                        <p className="text-xs font-medium mb-1">{message.sender}</p>
                      )}
                      <p>{message.content}</p>
                      <div className={`text-xs mt-1 text-right ${
                        message.isMe ? "text-blue-200" : "text-gray-500"
                      }`}>
                        <DateTimeDisplay date={message.time} format="time" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No messages in this conversation</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type your message..."
                  className="flex-grow"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button className="flex items-center" onClick={handleSendMessage}>
                  <Send className="h-4 w-4 mr-2" /> Send
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile placeholder */}
        <div className="flex sm:hidden w-full items-center justify-center bg-gray-100">
          <div className="text-center p-6">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="mt-2 text-gray-600">Select a conversation to view messages</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
