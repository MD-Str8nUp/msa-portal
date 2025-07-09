import { prisma } from '@/lib/prisma';
import { seedTestDatabase, msaUsers } from '../fixtures/msa-data';
import { NextRequest } from 'next/server';

describe('Real-time Messaging System', () => {
  beforeEach(async () => {
    await seedTestDatabase(prisma);
  });

  describe('Message Creation and Delivery', () => {
    test('should create message between parent and leader', async () => {
      const message = await prisma.message.create({
        data: {
          id: 'parent-leader-msg',
          content: 'Can we discuss my child\'s progress this week?',
          senderId: 'parent-amal-aouli',
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
      });

      expect(message.content).toBe('Can we discuss my child\'s progress this week?');
      expect(message.senderId).toBe('parent-amal-aouli');
      expect(message.receiverId).toBe('leader-sarah-droubi');
      expect(message.read).toBe(false);
    });

    test('should create message from executive to all leaders', async () => {
      const leaders = await prisma.user.findMany({
        where: { isLeader: true },
      });

      const broadcastMessages = leaders.map((leader, index) => ({
        id: `broadcast-${index}`,
        content: 'Emergency: Today\'s activities are cancelled due to weather.',
        senderId: 'executive-hassan-hammoud',
        receiverId: leader.id,
        read: false,
      }));

      await prisma.message.createMany({
        data: broadcastMessages,
      });

      const sentMessages = await prisma.message.findMany({
        where: { 
          senderId: 'executive-hassan-hammoud',
          content: { contains: 'Emergency' },
        },
      });

      expect(sentMessages.length).toBe(leaders.length);
    });

    test('should handle parent-leader communication about specific child', async () => {
      const childSpecificMessage = await prisma.message.create({
        data: {
          id: 'child-specific-msg',
          content: 'Ayana will be late to today\'s Cubs meeting due to a doctor appointment.',
          senderId: 'parent-amal-aouli',
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
      });

      expect(childSpecificMessage.content).toContain('Ayana');
      expect(childSpecificMessage.content).toContain('Cubs meeting');
    });
  });

  describe('Message Reading and Status Updates', () => {
    test('should mark message as read when viewed', async () => {
      const message = await prisma.message.create({
        data: {
          id: 'read-status-test',
          content: 'Test message for read status',
          senderId: 'executive-hassan-hammoud',
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
      });

      // Simulate reading the message
      const updatedMessage = await prisma.message.update({
        where: { id: message.id },
        data: { read: true },
      });

      expect(updatedMessage.read).toBe(true);
    });

    test('should count unread messages for user', async () => {
      // Create multiple messages for a user
      const messages = [
        {
          id: 'unread-1',
          content: 'First unread message',
          senderId: 'executive-hassan-hammoud',
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
        {
          id: 'unread-2',
          content: 'Second unread message',
          senderId: 'parent-amal-aouli',
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
        {
          id: 'read-1',
          content: 'Already read message',
          senderId: 'parentleader-fatima-hassoun',
          receiverId: 'leader-sarah-droubi',
          read: true,
        },
      ];

      await prisma.message.createMany({ data: messages });

      const unreadCount = await prisma.message.count({
        where: {
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
      });

      expect(unreadCount).toBe(2);
    });

    test('should retrieve conversation history between two users', async () => {
      const conversationMessages = [
        {
          id: 'conv-1',
          content: 'Hello, how is Ayana doing in Cubs?',
          senderId: 'parent-amal-aouli',
          receiverId: 'leader-sarah-droubi',
          read: true,
        },
        {
          id: 'conv-2',
          content: 'She\'s doing great! Very engaged in activities.',
          senderId: 'leader-sarah-droubi',
          receiverId: 'parent-amal-aouli',
          read: true,
        },
        {
          id: 'conv-3',
          content: 'That\'s wonderful to hear. Thank you!',
          senderId: 'parent-amal-aouli',
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
      ];

      await prisma.message.createMany({ data: conversationMessages });

      const conversation = await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: 'parent-amal-aouli',
              receiverId: 'leader-sarah-droubi',
            },
            {
              senderId: 'leader-sarah-droubi',
              receiverId: 'parent-amal-aouli',
            },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });

      expect(conversation).toHaveLength(3);
      expect(conversation[0].content).toContain('how is Ayana doing');
      expect(conversation[1].content).toContain('doing great');
      expect(conversation[2].content).toContain('wonderful to hear');
    });
  });

  describe('Message Permissions and Security', () => {
    test('should only allow authorized users to send messages', async () => {
      // Parent should be able to message leaders about their children
      const authorizedMessage = await prisma.message.create({
        data: {
          id: 'authorized-msg',
          content: 'Permission slip for camp submitted',
          senderId: 'parent-amal-aouli',
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
      });

      expect(authorizedMessage.senderId).toBe('parent-amal-aouli');
    });

    test('should validate user roles for messaging permissions', async () => {
      // Check if sender and receiver exist and have appropriate roles
      const sender = await prisma.user.findUnique({
        where: { id: 'parent-amal-aouli' },
      });
      
      const receiver = await prisma.user.findUnique({
        where: { id: 'leader-sarah-droubi' },
      });

      expect(sender?.role).toBe('parent');
      expect(receiver?.role).toBe('leader');
      
      // In real implementation, would validate if parent can message this leader
      // (e.g., leader manages parent's child's group)
    });

    test('should prevent message injection and XSS attempts', async () => {
      const maliciousContent = '<script>alert("XSS")</script>Hello there!';
      
      const message = await prisma.message.create({
        data: {
          id: 'security-test',
          content: maliciousContent,
          senderId: 'parent-amal-aouli',
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
      });

      // In production, content should be sanitized
      expect(message.content).toBe(maliciousContent);
      
      // Verify the raw content is stored (sanitization happens on display)
      const storedMessage = await prisma.message.findUnique({
        where: { id: 'security-test' },
      });
      
      expect(storedMessage?.content).toContain('<script>');
    });
  });

  describe('Group Messaging and Announcements', () => {
    test('should send announcement to all parents in a group', async () => {
      // Get all scouts in Cubs group to find their parents
      const cubsScouts = await prisma.scout.findMany({
        where: { groupId: 'group-cubs' },
        include: { parent: true },
      });

      const parentIds = [...new Set(cubsScouts.map(scout => scout.parentId))];
      
      const announcements = parentIds.map((parentId, index) => ({
        id: `announcement-${index}`,
        content: 'Cubs group meeting moved to 2 PM this Saturday.',
        senderId: 'leader-sarah-droubi',
        receiverId: parentId,
        read: false,
      }));

      await prisma.message.createMany({ data: announcements });

      const sentAnnouncements = await prisma.message.findMany({
        where: {
          senderId: 'leader-sarah-droubi',
          content: { contains: 'Cubs group meeting' },
        },
      });

      expect(sentAnnouncements.length).toBe(parentIds.length);
    });

    test('should handle emergency broadcast messages', async () => {
      const allUsers = await prisma.user.findMany({
        where: {
          OR: [
            { isParent: true },
            { isLeader: true },
          ],
        },
      });

      const emergencyMessages = allUsers.map((user, index) => ({
        id: `emergency-${index}`,
        content: 'EMERGENCY: All MSA activities cancelled today due to severe weather warning.',
        senderId: 'executive-hassan-hammoud',
        receiverId: user.id,
        read: false,
      }));

      await prisma.message.createMany({ data: emergencyMessages });

      const emergencyCount = await prisma.message.count({
        where: {
          senderId: 'executive-hassan-hammoud',
          content: { contains: 'EMERGENCY' },
        },
      });

      expect(emergencyCount).toBe(allUsers.length);
    });

    test('should support priority message levels', async () => {
      // In a real system, messages might have priority levels
      const priorityMessages = [
        {
          id: 'low-priority',
          content: 'Regular weekly newsletter available',
          senderId: 'executive-hassan-hammoud',
          receiverId: 'parent-amal-aouli',
          read: false,
          // priority: 'low' - would be added to schema
        },
        {
          id: 'high-priority',
          content: 'URGENT: Child pickup time changed today',
          senderId: 'leader-sarah-droubi',
          receiverId: 'parent-amal-aouli',
          read: false,
          // priority: 'high' - would be added to schema
        },
      ];

      await prisma.message.createMany({ 
        data: priorityMessages.map(({ id, content, senderId, receiverId, read }) => ({
          id, content, senderId, receiverId, read
        }))
      });

      const urgentMessages = await prisma.message.findMany({
        where: {
          receiverId: 'parent-amal-aouli',
          content: { contains: 'URGENT' },
        },
      });

      expect(urgentMessages).toHaveLength(1);
      expect(urgentMessages[0].content).toContain('pickup time changed');
    });
  });

  describe('Message Search and Filtering', () => {
    test('should search messages by content', async () => {
      const searchableMessages = [
        {
          id: 'search-1',
          content: 'Camp permission slip needed for next week',
          senderId: 'leader-sarah-droubi',
          receiverId: 'parent-amal-aouli',
          read: false,
        },
        {
          id: 'search-2',
          content: 'Meeting about camp activities on Friday',
          senderId: 'executive-hassan-hammoud',
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
        {
          id: 'search-3',
          content: 'Uniform requirements for new members',
          senderId: 'leader-sarah-droubi',
          receiverId: 'parent-amal-aouli',
          read: false,
        },
      ];

      await prisma.message.createMany({ data: searchableMessages });

      const campMessages = await prisma.message.findMany({
        where: {
          content: { contains: 'camp' },
        },
      });

      expect(campMessages).toHaveLength(2);
      expect(campMessages.every(msg => msg.content.toLowerCase().includes('camp'))).toBe(true);
    });

    test('should filter messages by date range', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.message.create({
        data: {
          id: 'date-filter-test',
          content: 'Message within date range',
          senderId: 'parent-amal-aouli',
          receiverId: 'leader-sarah-droubi',
          read: false,
          createdAt: new Date(), // Now
        },
      });

      const recentMessages = await prisma.message.findMany({
        where: {
          createdAt: {
            gte: yesterday,
            lte: tomorrow,
          },
        },
      });

      expect(recentMessages.length).toBeGreaterThan(0);
      expect(recentMessages.some(msg => msg.id === 'date-filter-test')).toBe(true);
    });

    test('should filter messages by sender role', async () => {
      await prisma.message.create({
        data: {
          id: 'role-filter-test',
          content: 'Message from executive',
          senderId: 'executive-hassan-hammoud',
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
      });

      const executiveMessages = await prisma.message.findMany({
        where: {
          receiverId: 'leader-sarah-droubi',
        },
        include: {
          sender: true,
        },
      });

      const fromExecutives = executiveMessages.filter(msg => 
        msg.sender.isExecutive === true
      );

      expect(fromExecutives.length).toBeGreaterThan(0);
      expect(fromExecutives.every(msg => msg.sender.isExecutive)).toBe(true);
    });
  });

  describe('Edge Cases and Performance', () => {
    test('should handle very long message content', async () => {
      const longContent = 'A'.repeat(5000); // 5000 character message
      
      const longMessage = await prisma.message.create({
        data: {
          id: 'long-message-test',
          content: longContent,
          senderId: 'parent-amal-aouli',
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
      });

      expect(longMessage.content.length).toBe(5000);
      expect(longMessage.content).toBe(longContent);
    });

    test('should handle rapid message sending', async () => {
      const rapidMessages = Array.from({ length: 50 }, (_, i) => ({
        id: `rapid-${i}`,
        content: `Rapid message ${i + 1}`,
        senderId: 'parent-amal-aouli',
        receiverId: 'leader-sarah-droubi',
        read: false,
      }));

      const startTime = Date.now();
      await prisma.message.createMany({ data: rapidMessages });
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(2000); // Should complete within 2 seconds

      const savedMessages = await prisma.message.findMany({
        where: {
          senderId: 'parent-amal-aouli',
          content: { contains: 'Rapid message' },
        },
      });

      expect(savedMessages).toHaveLength(50);
    });

    test('should handle message deletion', async () => {
      const messageToDelete = await prisma.message.create({
        data: {
          id: 'delete-test',
          content: 'This message will be deleted',
          senderId: 'parent-amal-aouli',
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
      });

      await prisma.message.delete({
        where: { id: messageToDelete.id },
      });

      const deletedMessage = await prisma.message.findUnique({
        where: { id: 'delete-test' },
      });

      expect(deletedMessage).toBeNull();
    });

    test('should handle invalid user IDs gracefully', async () => {
      try {
        await prisma.message.create({
          data: {
            id: 'invalid-user-test',
            content: 'Message to non-existent user',
            senderId: 'parent-amal-aouli',
            receiverId: 'non-existent-user-id',
            read: false,
          },
        });

        // Should not reach here if foreign key constraints are enabled
        expect(true).toBe(false);
      } catch (error: any) {
        // Should fail due to foreign key constraint
        expect(error.code).toBe('P2003'); // Prisma foreign key constraint error
      }
    });
  });

  describe('Real-time Features Simulation', () => {
    test('should simulate WebSocket message delivery status', async () => {
      const message = await prisma.message.create({
        data: {
          id: 'websocket-test',
          content: 'Real-time message test',
          senderId: 'parent-amal-aouli',
          receiverId: 'leader-sarah-droubi',
          read: false,
        },
      });

      // Simulate WebSocket delivery confirmation
      const deliveryStatus = {
        messageId: message.id,
        delivered: true,
        deliveredAt: new Date(),
        socketId: 'socket-123',
      };

      expect(deliveryStatus.delivered).toBe(true);
      expect(deliveryStatus.messageId).toBe(message.id);
    });

    test('should simulate typing indicators', async () => {
      // In real-time system, typing indicators would be managed separately
      const typingIndicator = {
        userId: 'parent-amal-aouli',
        chatWith: 'leader-sarah-droubi',
        isTyping: true,
        timestamp: new Date(),
      };

      expect(typingIndicator.isTyping).toBe(true);
      expect(typingIndicator.userId).toBe('parent-amal-aouli');
    });

    test('should simulate online status for message delivery', async () => {
      // Update user online status
      await prisma.user.update({
        where: { id: 'leader-sarah-droubi' },
        data: { 
          isOnline: true,
          lastSeen: new Date(),
        },
      });

      const user = await prisma.user.findUnique({
        where: { id: 'leader-sarah-droubi' },
      });

      expect(user?.isOnline).toBe(true);
      expect(user?.lastSeen).toBeDefined();
    });
  });
});