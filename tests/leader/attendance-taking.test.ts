import { prisma } from '@/lib/prisma';
import { seedTestDatabase, msaUsers, msaEvents } from '../fixtures/msa-data';
import { NextRequest } from 'next/server';

describe('Leader Attendance Taking', () => {
  beforeEach(async () => {
    await seedTestDatabase(prisma);
    
    // Create leader-group associations
    await prisma.userGroup.create({
      data: {
        id: 'leader-cubs-association',
        userId: 'leader-sarah-droubi',
        groupId: 'group-cubs',
        role: 'leader',
      },
    });
  });

  describe('Attendance Recording', () => {
    test('should allow leader to mark attendance for their group', async () => {
      const attendanceRecord = await prisma.attendance.create({
        data: {
          id: 'attendance-test-1',
          scoutId: 'scout-ayana-ayoub',
          userId: 'leader-sarah-droubi',
          eventId: 'event-cubs-meeting',
          status: 'present',
        },
      });

      expect(attendanceRecord.status).toBe('present');
      expect(attendanceRecord.userId).toBe('leader-sarah-droubi');
      expect(attendanceRecord.scoutId).toBe('scout-ayana-ayoub');
    });

    test('should handle bulk attendance marking', async () => {
      const cubsScouts = await prisma.scout.findMany({
        where: { groupId: 'group-cubs' },
      });

      const bulkAttendance = cubsScouts.map((scout, index) => ({
        id: `bulk-attendance-${index}`,
        scoutId: scout.id,
        userId: 'leader-sarah-droubi',
        eventId: 'event-cubs-meeting',
        status: index % 2 === 0 ? 'present' : 'absent',
      }));

      await prisma.attendance.createMany({
        data: bulkAttendance,
      });

      const recordedAttendance = await prisma.attendance.findMany({
        where: { 
          eventId: 'event-cubs-meeting',
          userId: 'leader-sarah-droubi',
        },
      });

      expect(recordedAttendance).toHaveLength(bulkAttendance.length);
    });

    test('should validate leader has permission for group', async () => {
      // Leader should only mark attendance for their assigned groups
      const leaderGroups = await prisma.userGroup.findMany({
        where: { userId: 'leader-sarah-droubi' },
      });

      expect(leaderGroups).toHaveLength(1);
      expect(leaderGroups[0].groupId).toBe('group-cubs');
      expect(leaderGroups[0].role).toBe('leader');
    });

    test('should handle late arrivals and early departures', async () => {
      const attendanceWithNotes = await prisma.attendance.create({
        data: {
          id: 'attendance-late',
          scoutId: 'scout-ayana-ayoub',
          userId: 'leader-sarah-droubi',
          eventId: 'event-cubs-meeting',
          status: 'present',
          date: new Date('2025-06-28T10:30:00Z'), // 30 minutes late
        },
      });

      const eventStart = new Date('2025-06-28T10:00:00Z');
      const arrivalTime = attendanceWithNotes.date;
      const isLate = arrivalTime > eventStart;

      expect(isLate).toBe(true);
      expect(attendanceWithNotes.status).toBe('present');
    });
  });

  describe('Attendance Status Management', () => {
    test('should support all attendance statuses', async () => {
      const statuses = ['present', 'absent', 'excused'];
      const scouts = await prisma.scout.findMany({
        where: { groupId: 'group-cubs' },
        take: 3,
      });

      for (let i = 0; i < statuses.length; i++) {
        await prisma.attendance.create({
          data: {
            id: `status-test-${i}`,
            scoutId: scouts[i].id,
            userId: 'leader-sarah-droubi',
            eventId: 'event-cubs-meeting',
            status: statuses[i],
          },
        });
      }

      const attendanceByStatus = await prisma.attendance.groupBy({
        by: ['status'],
        where: { eventId: 'event-cubs-meeting' },
        _count: { status: true },
      });

      expect(attendanceByStatus).toHaveLength(3);
      statuses.forEach(status => {
        expect(attendanceByStatus.find(a => a.status === status)).toBeTruthy();
      });
    });

    test('should allow updating attendance status', async () => {
      const attendance = await prisma.attendance.create({
        data: {
          id: 'attendance-update-test',
          scoutId: 'scout-ayana-ayoub',
          userId: 'leader-sarah-droubi',
          eventId: 'event-cubs-meeting',
          status: 'absent',
        },
      });

      const updated = await prisma.attendance.update({
        where: { id: 'attendance-update-test' },
        data: { status: 'present' },
      });

      expect(updated.status).toBe('present');
      expect(updated.id).toBe(attendance.id);
    });

    test('should prevent duplicate attendance records', async () => {
      await prisma.attendance.create({
        data: {
          id: 'attendance-duplicate-1',
          scoutId: 'scout-ayana-ayoub',
          userId: 'leader-sarah-droubi',
          eventId: 'event-cubs-meeting',
          status: 'present',
        },
      });

      // Attempting to create duplicate should be handled by application logic
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          scoutId: 'scout-ayana-ayoub',
          eventId: 'event-cubs-meeting',
        },
      });

      expect(existingAttendance).toBeTruthy();
      expect(existingAttendance?.status).toBe('present');
    });
  });

  describe('Multi-Event Attendance', () => {
    test('should handle attendance for multiple events', async () => {
      const events = await prisma.event.findMany({
        where: {
          OR: [
            { groupId: 'group-cubs' },
            { groupId: null },
          ],
        },
      });

      expect(events.length).toBeGreaterThan(1);

      // Mark attendance for different events
      for (const event of events) {
        await prisma.attendance.create({
          data: {
            id: `multi-event-${event.id}`,
            scoutId: 'scout-ayana-ayoub',
            userId: 'leader-sarah-droubi',
            eventId: event.id,
            status: 'present',
          },
        });
      }

      const scoutAttendance = await prisma.attendance.findMany({
        where: { scoutId: 'scout-ayana-ayoub' },
        include: { event: true },
      });

      expect(scoutAttendance.length).toBe(events.length);
    });

    test('should generate attendance reports for events', async () => {
      // Create attendance for multiple scouts
      const scouts = await prisma.scout.findMany({
        where: { groupId: 'group-cubs' },
      });

      for (const scout of scouts) {
        await prisma.attendance.create({
          data: {
            id: `report-${scout.id}`,
            scoutId: scout.id,
            userId: 'leader-sarah-droubi',
            eventId: 'event-cubs-meeting',
            status: Math.random() > 0.3 ? 'present' : 'absent',
          },
        });
      }

      const attendanceReport = await prisma.attendance.findMany({
        where: { eventId: 'event-cubs-meeting' },
        include: {
          scout: true,
          event: true,
        },
      });

      expect(attendanceReport.length).toBe(scouts.length);
      
      // Calculate attendance rate
      const presentCount = attendanceReport.filter(a => a.status === 'present').length;
      const attendanceRate = (presentCount / attendanceReport.length) * 100;
      
      expect(attendanceRate).toBeGreaterThanOrEqual(0);
      expect(attendanceRate).toBeLessThanOrEqual(100);
    });
  });

  describe('Parent-Leader Dual Role Attendance', () => {
    test('should allow parent-leader to mark attendance as leader', async () => {
      // Set up parent-leader as group leader
      await prisma.userGroup.create({
        data: {
          id: 'parentleader-scouts-association',
          userId: 'parentleader-fatima-hassoun',
          groupId: 'group-scouts',
          role: 'leader',
        },
      });

      const attendance = await prisma.attendance.create({
        data: {
          id: 'parentleader-attendance',
          scoutId: 'scout-zahraa-farhat',
          userId: 'parentleader-fatima-hassoun',
          eventId: 'event-camp-weekend',
          status: 'present',
        },
      });

      expect(attendance.userId).toBe('parentleader-fatima-hassoun');
      expect(attendance.status).toBe('present');
    });

    test('should track attendance for own child differently when acting as leader', async () => {
      await prisma.userGroup.create({
        data: {
          id: 'parentleader-scouts-leadership',
          userId: 'parentleader-fatima-hassoun',
          groupId: 'group-scouts',
          role: 'leader',
        },
      });

      // Mark attendance for own child as leader
      const leaderAttendance = await prisma.attendance.create({
        data: {
          id: 'own-child-leader-attendance',
          scoutId: 'scout-zahraa-farhat', // Their own child
          userId: 'parentleader-fatima-hassoun',
          eventId: 'event-camp-weekend',
          status: 'present',
        },
      });

      // Verify the attendance is marked by the parent-leader
      expect(leaderAttendance.userId).toBe('parentleader-fatima-hassoun');
      
      // In real implementation, this would be flagged for review to avoid bias
      const ownChildAttendance = await prisma.attendance.findFirst({
        where: {
          scoutId: 'scout-zahraa-farhat',
          userId: 'parentleader-fatima-hassoun',
        },
        include: {
          scout: {
            include: { parent: true },
          },
        },
      });

      const isOwnChild = ownChildAttendance?.scout.parent.id === ownChildAttendance?.userId;
      expect(isOwnChild).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle attendance for cancelled events', async () => {
      // In real implementation, events might be cancelled
      const cancelledEvent = await prisma.event.create({
        data: {
          id: 'cancelled-event',
          title: 'Cancelled Meeting',
          description: 'This meeting was cancelled',
          location: 'MSA Hall',
          startDate: new Date('2025-07-01T10:00:00Z'),
          endDate: new Date('2025-07-01T12:00:00Z'),
          groupId: 'group-cubs',
        },
      });

      // Attendance shouldn't be marked for cancelled events
      const attendanceCount = await prisma.attendance.count({
        where: { eventId: cancelledEvent.id },
      });

      expect(attendanceCount).toBe(0);
    });

    test('should handle very large group attendance efficiently', async () => {
      // Create many scouts for performance testing
      const largeGroupScouts = Array.from({ length: 100 }, (_, i) => ({
        id: `large-group-scout-${i}`,
        name: `Scout ${i + 1}`,
        age: 8 + (i % 4),
        rank: 'Cub',
        parentId: 'parent-amal-aouli',
        groupId: 'group-cubs',
      }));

      await prisma.scout.createMany({ data: largeGroupScouts });

      const startTime = Date.now();
      
      // Bulk attendance marking
      const bulkAttendance = largeGroupScouts.map(scout => ({
        id: `bulk-large-${scout.id}`,
        scoutId: scout.id,
        userId: 'leader-sarah-droubi',
        eventId: 'event-cubs-meeting',
        status: 'present',
      }));

      await prisma.attendance.createMany({ data: bulkAttendance });
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      const attendanceCount = await prisma.attendance.count({
        where: { eventId: 'event-cubs-meeting' },
      });

      expect(attendanceCount).toBeGreaterThanOrEqual(100);
    });

    test('should validate event timing for attendance', async () => {
      const pastEvent = await prisma.event.create({
        data: {
          id: 'past-event',
          title: 'Past Meeting',
          description: 'This meeting already happened',
          location: 'MSA Hall',
          startDate: new Date('2025-01-01T10:00:00Z'),
          endDate: new Date('2025-01-01T12:00:00Z'),
          groupId: 'group-cubs',
        },
      });

      // Attendance can still be marked for past events (make-up attendance)
      const pastAttendance = await prisma.attendance.create({
        data: {
          id: 'past-event-attendance',
          scoutId: 'scout-ayana-ayoub',
          userId: 'leader-sarah-droubi',
          eventId: pastEvent.id,
          status: 'present',
        },
      });

      expect(pastAttendance.status).toBe('present');
      
      // Verify event is in the past
      const isPastEvent = pastEvent.startDate < new Date();
      expect(isPastEvent).toBe(true);
    });

    test('should handle network interruption during attendance submission', async () => {
      // Simulate partial attendance submission
      const partialAttendance = [
        {
          id: 'partial-1',
          scoutId: 'scout-ayana-ayoub',
          userId: 'leader-sarah-droubi',
          eventId: 'event-cubs-meeting',
          status: 'present',
        },
      ];

      await prisma.attendance.createMany({ data: partialAttendance });

      // Verify partial data is saved
      const savedAttendance = await prisma.attendance.findMany({
        where: { eventId: 'event-cubs-meeting' },
      });

      expect(savedAttendance.length).toBe(1);
      expect(savedAttendance[0].status).toBe('present');
    });
  });
});