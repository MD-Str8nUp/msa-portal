'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Mock socket implementation for production deployment
export const useSocket = (userId: string, userRole: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  useEffect(() => {
    // Simulate connection
    setIsConnected(true);
    
    // Clean up on unmount
    return () => {
      setIsConnected(false);
    };
  }, [userId, userRole]);
  
  // Mock send message function
  const sendMessage = useCallback((content: string, receiverId: string) => {
    console.log('Mock: Sending message', { content, receiverId });
    return true;
  }, []);
  
  // Mock update event RSVP
  const updateEventRSVP = useCallback((rsvpData: {
    attendanceId?: string;
    scoutId: string;
    userId: string;
    eventId: string;
    groupId: string;
    status: string;
  }) => {
    console.log('Mock: Updating RSVP', rsvpData);
    return true;
  }, []);
  
  // Mock update scout progress
  const updateScoutProgress = useCallback((progressData: {
    name: string;
    description: string;
    scoutId: string;
    groupId: string;
  }) => {
    console.log('Mock: Updating scout progress', progressData);
    return true;
  }, []);
  
  // Mock upload document
  const uploadDocument = useCallback((documentData: {
    title: string;
    fileUrl: string;
    fileType: string;
    description?: string;
    uploadedBy: string;
    type: string;
    size: number;
    groupId?: string;
  }) => {
    console.log('Mock: Uploading document', documentData);
    return true;
  }, []);
  
  // Mock subscribe function
  const subscribe = useCallback((event: string, callback: (...args: any[]) => void) => {
    console.log('Mock: Subscribing to event', event);
    return () => {};
  }, []);
  
  return {
    isConnected,
    onlineUsers,
    sendMessage,
    updateEventRSVP,
    updateScoutProgress,
    uploadDocument,
    subscribe,
  };
};
