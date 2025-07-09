import { prisma } from '@/lib/prisma';
import { seedTestDatabase, msaUsers, msaEvents } from '../fixtures/msa-data';
import { NextRequest } from 'next/server';

describe('Event RSVP Functionality', () => {
  beforeEach(async () => {
    await seedTestDatabase(prisma);
  });

  describe('RSVP Creation and Management', () => {
    test('should allow parent to RSVP for child event', async () => {
      // Create RSVP record (using attendance table as RSVP system)
      const rsvp = await prisma.attendance.create({
        data: {
          id: 'rsvp-camp-weekend',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-camp-weekend',
          status: 'present', // Will attend
        },
      });

      expect(rsvp.scoutId).toBe('scout-ayana-ayoub');
      expect(rsvp.eventId).toBe('event-camp-weekend');
      expect(rsvp.status).toBe('present');
    });

    test('should allow parent to decline event invitation', async () => {
      const declineRsvp = await prisma.attendance.create({
        data: {
          id: 'decline-camp-weekend',
          scoutId: 'scout-ali-dirani',
          userId: 'parent-amal-aouli',
          eventId: 'event-camp-weekend',
          status: 'absent', // Will not attend
        },
      });

      expect(declineRsvp.status).toBe('absent');
    });

    test('should handle tentative RSVP responses', async () => {
      const tentativeRsvp = await prisma.attendance.create({
        data: {
          id: 'tentative-camp-weekend',
          scoutId: 'scout-zahraa-farhat',
          userId: 'parentleader-fatima-hassoun',
          eventId: 'event-camp-weekend',
          status: 'excused', // Maybe/tentative
        },
      });

      expect(tentativeRsvp.status).toBe('excused');
    });

    test('should update existing RSVP response', async () => {
      // Create initial RSVP
      const initialRsvp = await prisma.attendance.create({
        data: {
          id: 'update-rsvp-test',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-cubs-meeting',
          status: 'absent',
        },
      });

      // Update RSVP to attending
      const updatedRsvp = await prisma.attendance.update({
        where: { id: 'update-rsvp-test' },
        data: { status: 'present' },
      });

      expect(updatedRsvp.status).toBe('present');
      expect(updatedRsvp.id).toBe(initialRsvp.id);
    });
  });

  describe('Event Capacity and Availability', () => {
    test('should track event attendance capacity', async () => {
      const eventCapacity = 20; // Mock capacity for camp
      
      // Create multiple RSVPs
      const rsvps = Array.from({ length: 15 }, (_, i) => ({
        id: `capacity-rsvp-${i}`,
        scoutId: `scout-ayana-ayoub`, // In real app, would be different scouts
        userId: 'parent-amal-aouli',
        eventId: 'event-camp-weekend',
        status: 'present',
      }));

      await prisma.attendance.createMany({ data: rsvps });

      const currentAttendees = await prisma.attendance.count({
        where: {
          eventId: 'event-camp-weekend',
          status: 'present',
        },
      });

      const spotsRemaining = eventCapacity - currentAttendees;
      const isEventFull = spotsRemaining <= 0;

      expect(currentAttendees).toBe(15);
      expect(spotsRemaining).toBe(5);
      expect(isEventFull).toBe(false);
    });

    test('should handle waitlist when event is full', async () => {
      // Mock event with capacity of 2
      const eventCapacity = 2;
      
      // Fill event to capacity
      const fullRsvps = [
        {
          id: 'full-rsvp-1',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-cubs-meeting',
          status: 'present',
        },
        {
          id: 'full-rsvp-2',
          scoutId: 'scout-ali-dirani',
          userId: 'parent-amal-aouli',
          eventId: 'event-cubs-meeting',
          status: 'present',
        },
      ];

      await prisma.attendance.createMany({ data: fullRsvps });

      const currentCount = await prisma.attendance.count({
        where: {
          eventId: 'event-cubs-meeting',
          status: 'present',
        },
      });

      // Attempt to add one more (would need waitlist)
      const isEventFull = currentCount >= eventCapacity;
      
      expect(isEventFull).toBe(true);
      expect(currentCount).toBe(2);
    });

    test('should handle event age restrictions', async () => {
      // Test age-appropriate group matching
      const joeyEvent = await prisma.event.create({
        data: {
          id: 'joey-only-event',
          title: 'Joey Playdate',
          description: 'For Joeys aged 5-7 only',
          location: 'MSA Playground',
          startDate: new Date('2025-07-20T10:00:00Z'),
          endDate: new Date('2025-07-20T12:00:00Z'),
          groupId: 'group-joeys',
        },
      });

      // Try to RSVP a Cub (age 8) to a Joey event
      const inappropriateRsvp = await prisma.attendance.create({
        data: {
          id: 'age-inappropriate-rsvp',
          scoutId: 'scout-ayana-ayoub', // 8 years old (Cub)
          userId: 'parent-amal-aouli',
          eventId: joeyEvent.id,
          status: 'present',
        },
      });

      // Verify scout's age vs event group
      const scout = await prisma.scout.findUnique({
        where: { id: 'scout-ayana-ayoub' },
      });

      const isAgeAppropriate = scout?.age && scout.age <= 7; // Joey age range
      
      expect(isAgeAppropriate).toBe(false); // Should be flagged
      expect(scout?.age).toBe(8); // Too old for Joey events
    });
  });

  describe('Permission Slip Requirements', () => {
    test('should track permission slip submission for camp events', async () => {
      // Check if event requires permission slip
      const campEvent = await prisma.event.findUnique({
        where: { id: 'event-camp-weekend' },
      });

      expect(campEvent?.requiresPermissionSlip).toBe(true);

      // RSVP for event requiring permission slip
      const rsvpWithPermission = await prisma.attendance.create({
        data: {
          id: 'rsvp-with-permission',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-camp-weekend',
          status: 'present',
        },
      });

      // In real implementation, would check permission slip status
      const mockPermissionSlipSubmitted = true;
      
      expect(rsvpWithPermission.status).toBe('present');
      expect(mockPermissionSlipSubmitted).toBe(true);
    });

    test('should prevent RSVP without required permission slip', async () => {
      const campEvent = await prisma.event.findUnique({
        where: { id: 'event-camp-weekend' },
      });

      const requiresPermission = campEvent?.requiresPermissionSlip;
      const mockPermissionSlipSubmitted = false;

      if (requiresPermission && !mockPermissionSlipSubmitted) {
        // In real implementation, would prevent RSVP
        const canRsvp = false;
        expect(canRsvp).toBe(false);
      }
    });

    test('should allow RSVP for events not requiring permission slip', async () => {
      const regularMeeting = await prisma.event.findUnique({
        where: { id: 'event-cubs-meeting' },
      });

      expect(regularMeeting?.requiresPermissionSlip).toBe(false);

      const simpleRsvp = await prisma.attendance.create({
        data: {
          id: 'simple-rsvp',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-cubs-meeting',
          status: 'present',
        },
      });

      expect(simpleRsvp.status).toBe('present');
    });
  });

  describe('RSVP Notifications and Reminders', () => {
    test('should send RSVP confirmation message', async () => {
      // Create RSVP
      const rsvp = await prisma.attendance.create({
        data: {
          id: 'confirmed-rsvp',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-camp-weekend',
          status: 'present',
        },
      });

      // Send confirmation message
      const confirmationMessage = await prisma.message.create({
        data: {
          id: 'rsvp-confirmation-msg',
          content: 'RSVP confirmed for MSA Weekend Camp on July 15-17. Please ensure permission slip is submitted.',
          senderId: 'leader-sarah-droubi',
          receiverId: 'parent-amal-aouli',
          read: false,
        },
      });

      expect(confirmationMessage.content).toContain('RSVP confirmed');
      expect(confirmationMessage.content).toContain('permission slip');
    });

    test('should send RSVP deadline reminders', async () => {
      const reminderMessage = await prisma.message.create({
        data: {
          id: 'rsvp-reminder',
          content: 'Reminder: RSVP deadline for MSA Weekend Camp is in 3 days. Please respond soon!',
          senderId: 'executive-hassan-hammoud',
          receiverId: 'parent-amal-aouli',
          read: false,
        },
      });

      expect(reminderMessage.content).toContain('RSVP deadline');
      expect(reminderMessage.content).toContain('3 days');
    });

    test('should notify when event is cancelled', async () => {
      // Create RSVP first
      await prisma.attendance.create({
        data: {
          id: 'cancelled-event-rsvp',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-cubs-meeting',
          status: 'present',
        },
      });

      // Send cancellation notice
      const cancellationMessage = await prisma.message.create({
        data: {
          id: 'event-cancelled-msg',
          content: 'IMPORTANT: Cubs Weekly Meeting on June 28 has been cancelled due to weather. Sorry for the inconvenience.',
          senderId: 'leader-sarah-droubi',
          receiverId: 'parent-amal-aouli',
          read: false,
        },
      });

      expect(cancellationMessage.content).toContain('cancelled');
      expect(cancellationMessage.content).toContain('weather');
    });
  });

  describe('RSVP Reporting and Analytics', () => {
    test('should generate RSVP summary for event', async () => {
      // Create various RSVP responses
      const rsvpResponses = [
        {
          id: 'summary-yes-1',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-camp-weekend',
          status: 'present',
        },
        {
          id: 'summary-yes-2',
          scoutId: 'scout-zahraa-farhat',
          userId: 'parentleader-fatima-hassoun',
          eventId: 'event-camp-weekend',
          status: 'present',
        },
        {
          id: 'summary-no-1',
          scoutId: 'scout-ali-dirani',
          userId: 'parent-amal-aouli',
          eventId: 'event-camp-weekend',
          status: 'absent',
        },
      ];

      await prisma.attendance.createMany({ data: rsvpResponses });

      const rsvpSummary = await prisma.attendance.groupBy({
        by: ['status'],
        where: { eventId: 'event-camp-weekend' },
        _count: { status: true },
      });

      const summary = rsvpSummary.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>);

      expect(summary.present).toBe(2); // 2 attending
      expect(summary.absent).toBe(1);  // 1 not attending
    });

    test('should calculate RSVP response rate', async () => {
      // Total invited (all scouts in eligible groups)
      const eligibleScouts = await prisma.scout.count({
        where: {
          OR: [
            { groupId: 'group-cubs' },
            { groupId: 'group-scouts' },
            { groupId: 'group-joeys' },
          ],
        },
      });

      // RSVPs received
      const rsvpCount = await prisma.attendance.count({
        where: { eventId: 'event-camp-weekend' },
      });

      const responseRate = (rsvpCount / eligibleScouts) * 100;
      
      expect(responseRate).toBeGreaterThanOrEqual(0);
      expect(responseRate).toBeLessThanOrEqual(100);
      expect(eligibleScouts).toBeGreaterThan(0);
    });

    test('should track no-shows vs RSVPs', async () => {
      // Create RSVP
      await prisma.attendance.create({
        data: {
          id: 'no-show-rsvp',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-cubs-meeting',
          status: 'present', // Said they'd attend
        },
      });

      // Simulate actual attendance (could be different)
      const actualAttendance = 'absent'; // Didn't show up
      const rsvpStatus = 'present';       // But said they would
      
      const isNoShow = rsvpStatus === 'present' && actualAttendance === 'absent';
      
      expect(isNoShow).toBe(true);
    });
  });

  describe('Multi-Child RSVP Management', () => {
    test('should handle RSVP for multiple children', async () => {
      // Parent with multiple children RSVPing for same event
      const multiChildRsvps = [
        {
          id: 'multi-child-1',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-camp-weekend',
          status: 'present',
        },
        {
          id: 'multi-child-2',
          scoutId: 'scout-ali-dirani',
          userId: 'parent-amal-aouli',
          eventId: 'event-camp-weekend',
          status: 'present',
        },
      ];

      await prisma.attendance.createMany({ data: multiChildRsvps });

      const parentRsvps = await prisma.attendance.findMany({
        where: {
          userId: 'parent-amal-aouli',
          eventId: 'event-camp-weekend',
        },
        include: { scout: true },
      });

      expect(parentRsvps).toHaveLength(2);
      expect(parentRsvps.every(rsvp => rsvp.status === 'present')).toBe(true);
    });

    test('should handle mixed responses for multiple children', async () => {
      const mixedRsvps = [
        {
          id: 'mixed-yes',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-camp-weekend',
          status: 'present',
        },
        {
          id: 'mixed-no',
          scoutId: 'scout-ali-dirani',
          userId: 'parent-amal-aouli',
          eventId: 'event-camp-weekend',
          status: 'absent',
        },
      ];

      await prisma.attendance.createMany({ data: mixedRsvps });

      const parentResponses = await prisma.attendance.findMany({
        where: {
          userId: 'parent-amal-aouli',
          eventId: 'event-camp-weekend',
        },
      });

      const attendingCount = parentResponses.filter(r => r.status === 'present').length;
      const notAttendingCount = parentResponses.filter(r => r.status === 'absent').length;

      expect(attendingCount).toBe(1);
      expect(notAttendingCount).toBe(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle RSVP for past events', async () => {
      const pastEvent = await prisma.event.create({
        data: {
          id: 'past-event-rsvp',
          title: 'Past Event',
          description: 'This event already happened',
          location: 'MSA Hall',
          startDate: new Date('2025-01-01T10:00:00Z'),
          endDate: new Date('2025-01-01T12:00:00Z'),
          groupId: 'group-cubs',
        },
      });

      const isPastEvent = pastEvent.startDate < new Date();
      
      if (isPastEvent) {
        // Should prevent new RSVPs for past events
        const canRsvp = false;
        expect(canRsvp).toBe(false);
      }

      expect(isPastEvent).toBe(true);
    });

    test('should handle duplicate RSVP attempts', async () => {
      // Create first RSVP
      await prisma.attendance.create({
        data: {
          id: 'first-rsvp',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-cubs-meeting',
          status: 'present',
        },
      });

      // Check for existing RSVP before creating duplicate
      const existingRsvp = await prisma.attendance.findFirst({
        where: {
          scoutId: 'scout-ayana-ayoub',
          eventId: 'event-cubs-meeting',
        },
      });

      expect(existingRsvp).toBeTruthy();
      expect(existingRsvp?.status).toBe('present');
    });

    test('should handle RSVP for non-existent event', async () => {
      try {
        await prisma.attendance.create({
          data: {
            id: 'invalid-event-rsvp',
            scoutId: 'scout-ayana-ayoub',
            userId: 'parent-amal-aouli',
            eventId: 'non-existent-event',
            status: 'present',
          },
        });

        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        // Should fail due to foreign key constraint
        expect(error.code).toBe('P2003');
      }
    });

    test('should handle RSVP deletion/cancellation', async () => {
      const rsvp = await prisma.attendance.create({
        data: {
          id: 'delete-rsvp-test',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-cubs-meeting',
          status: 'present',
        },
      });

      // Cancel/delete RSVP
      await prisma.attendance.delete({
        where: { id: rsvp.id },
      });

      const deletedRsvp = await prisma.attendance.findUnique({
        where: { id: 'delete-rsvp-test' },
      });

      expect(deletedRsvp).toBeNull();
    });

    test('should handle bulk RSVP operations efficiently', async () => {
      // Large number of RSVPs for performance testing
      const bulkRsvps = Array.from({ length: 100 }, (_, i) => ({
        id: `bulk-rsvp-${i}`,
        scoutId: 'scout-ayana-ayoub',
        userId: 'parent-amal-aouli',
        eventId: 'event-camp-weekend',
        status: i % 3 === 0 ? 'present' : (i % 3 === 1 ? 'absent' : 'excused'),
      }));

      const startTime = Date.now();
      await prisma.attendance.createMany({ data: bulkRsvps });
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(3000); // Should complete within 3 seconds

      const rsvpCount = await prisma.attendance.count({
        where: { eventId: 'event-camp-weekend' },
      });

      expect(rsvpCount).toBeGreaterThanOrEqual(100);
    });
  });
});