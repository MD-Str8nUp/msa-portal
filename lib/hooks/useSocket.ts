'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (userId: string, userRole: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const socket = useRef<Socket | null>(null);
  
  useEffect(() => {
    if (!userId) return;
    
    // Create socket connection
    const socketInstance = io(process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3000', {
      path: '/api/socket',
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });
    
    socket.current = socketInstance;
    
    // Setup event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
      
      // Authenticate user
      socketInstance.emit('authenticate', { userId, role: userRole });
    });
    
    socketInstance.on('online_users', (users) => {
      setOnlineUsers(users);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });
    
    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setIsConnected(false);
    });
    
    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [userId, userRole]);
  
  // Send a message
  const sendMessage = useCallback((content: string, receiverId: string) => {
    if (socket.current && isConnected) {
      socket.current.emit('send_message', {
        content,
        senderId: userId,
        receiverId,
      });
      return true;
    }
    return false;
  }, [isConnected, userId]);
  
  // Update event RSVP
  const updateEventRSVP = useCallback((rsvpData: {
    attendanceId?: string;
    scoutId: string;
    userId: string;
    eventId: string;
    groupId: string;
    status: string;
  }) => {
    if (socket.current && isConnected) {
      socket.current.emit('update_event_rsvp', rsvpData);
      return true;
    }
    return false;
  }, [isConnected]);
  
  // Update scout progress
  const updateScoutProgress = useCallback((progressData: {
    name: string;
    description: string;
    scoutId: string;
    groupId: string;
  }) => {
    if (socket.current && isConnected) {
      socket.current.emit('update_scout_progress', progressData);
      return true;
    }
    return false;
  }, [isConnected]);
  
  // Upload document
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
    if (socket.current && isConnected) {
      socket.current.emit('document_uploaded', documentData);
      return true;
    }
    return false;
  }, [isConnected]);
  
  // Subscribe to an event
  const subscribe = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socket.current) {
      socket.current.on(event, callback);
      return () => {
        socket.current?.off(event, callback);
      };
    }
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
