'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSocket } from '@/lib/hooks/useSocket';

interface SocketContextType {
  isConnected: boolean;
  onlineUsers: string[];
  sendMessage: (content: string, receiverId: string) => boolean;
  updateEventRSVP: (rsvpData: any) => boolean;
  updateScoutProgress: (progressData: any) => boolean;
  uploadDocument: (documentData: any) => boolean;
  messages: any[];
  events: any[];
  documents: any[];
  achievements: any[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ 
  children, 
  userId, 
  userRole 
}: { 
  children: ReactNode;
  userId: string;
  userRole: string;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  const {
    isConnected,
    onlineUsers,
    sendMessage,
    updateEventRSVP,
    updateScoutProgress,
    uploadDocument,
    subscribe,
  } = useSocket(userId, userRole);
  
  // Subscribe to socket events
  useEffect(() => {
    if (!isConnected) return;
    
    // Handle incoming messages
    const unsubscribeMessage = subscribe('receive_message', (message: any) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        return [message, ...prev];
      });
    });
    
    // Handle RSVP updates
    const unsubscribeRSVP = subscribe('event_rsvp_updated', (attendance: any) => {
      // Update events that include this attendance
      setEvents((prev) => {
        return prev.map(event => {
          if (event.id === attendance.eventId) {
            // Update or add the attendance
            const attendances = event.attendances || [];
            const index = attendances.findIndex((a: any) => a.id === attendance.id);
            
            if (index >= 0) {
              attendances[index] = attendance;
            } else {
              attendances.push(attendance);
            }
            
            return { ...event, attendances };
          }
          return event;
        });
      });
    });
    
    // Handle scout progress updates
    const unsubscribeProgress = subscribe('scout_progress_updated', (achievement: any) => {
      setAchievements((prev) => {
        // Avoid duplicates
        if (prev.some(a => a.id === achievement.id)) {
          return prev;
        }
        return [achievement, ...prev];
      });
    });
    
    // Handle new documents
    const unsubscribeDocument = subscribe('new_document', (document: any) => {
      setDocuments((prev) => {
        // Avoid duplicates
        if (prev.some(d => d.id === document.id)) {
          return prev;
        }
        return [document, ...prev];
      });
    });
    
    // Handle user status changes
    const unsubscribeStatus = subscribe('user_status_change', (statusChange: any) => {
      console.log('User status changed:', statusChange);
      // This could update a user list component
    });
    
    // Clean up subscriptions
    return () => {
      unsubscribeMessage();
      unsubscribeRSVP();
      unsubscribeProgress();
      unsubscribeDocument();
      unsubscribeStatus();
    };
  }, [isConnected, subscribe]);
  
  // Fetch initial data from API
  useEffect(() => {
    if (!userId) return;
    
    // Fetch messages
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => {
        setMessages(data);
      })
      .catch(err => console.error('Error fetching messages:', err));
    
    // Fetch events
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
      })
      .catch(err => console.error('Error fetching events:', err));
    
    // Fetch documents
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
      })
      .catch(err => console.error('Error fetching documents:', err));
    
    // Fetch achievements
    fetch('/api/achievements')
      .then(res => res.json())
      .then(data => {
        setAchievements(data);
      })
      .catch(err => console.error('Error fetching achievements:', err));
  }, [userId]);
  
  // Create context value
  const contextValue = {
    isConnected,
    onlineUsers,
    sendMessage,
    updateEventRSVP,
    updateScoutProgress,
    uploadDocument,
    messages,
    events,
    documents,
    achievements,
  };
  
  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  
  return context;
}
