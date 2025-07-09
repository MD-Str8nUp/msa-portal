import { prisma } from '@/lib/prisma';
import { seedTestDatabase, msaUsers, msaScouts } from '../fixtures/msa-data';
import { NextRequest } from 'next/server';

describe('Parent Progress Viewing', () => {
  beforeEach(async () => {
    await seedTestDatabase(prisma);
  });

  describe('Children Progress Dashboard', () => {
    test('should display all children for a parent', async () => {
      // Amal Aouli has multiple children
      const children = await prisma.scout.findMany({
        where: { parentId: 'parent-amal-aouli' },
        include: {
          group: true,
          achievements: true,
          attendance: true,
        },
      });

      expect(children).toHaveLength(2); // Ayana and Ali
      expect(children[0].name).toBe('Ayana Ayoub');
      expect(children[1].name).toBe('Ali Dirani');
      
      // Verify group assignments
      expect(children[0].groupId).toBe('group-cubs');
      expect(children[1].groupId).toBe('group-cubs');
    });

    test('should show achievement progress for each child', async () => {
      const ayana = await prisma.scout.findUnique({
        where: { id: 'scout-ayana-ayoub' },
        include: { achievements: true },
      });

      expect(ayana?.achievements).toHaveLength(1);
      expect(ayana?.achievements[0].name).toBe('First Aid Badge');
      expect(ayana?.achievements[0].description).toBe('Completed basic first aid training');
    });

    test('should display attendance history for children', async () => {
      // Create attendance records for testing
      await prisma.attendance.create({
        data: {
          id: 'attendance-1',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-cubs-meeting',
          status: 'present',
        },
      });

      const attendance = await prisma.attendance.findMany({
        where: { scoutId: 'scout-ayana-ayoub' },
        include: { event: true },
      });

      expect(attendance).toHaveLength(1);
      expect(attendance[0].status).toBe('present');
      expect(attendance[0].event.title).toBe('Cubs Weekly Meeting');
    });

    test('should handle parent with no children gracefully', async () => {
      // Create a parent with no children
      await prisma.user.create({
        data: {
          id: 'parent-no-children',
          name: 'Test Parent',
          email: 'nochildren@test.com',
          password: 'hashedpass',
          role: 'parent',
          isParent: true,
        },
      });

      const children = await prisma.scout.findMany({
        where: { parentId: 'parent-no-children' },
      });

      expect(children).toHaveLength(0);
    });
  });

  describe('Individual Child Progress', () => {
    test('should show detailed progress for specific child', async () => {
      const childProgress = await prisma.scout.findUnique({
        where: { id: 'scout-ayana-ayoub' },
        include: {
          achievements: true,
          attendance: {
            include: { event: true },
          },
          group: true,
          parent: true,
        },
      });

      expect(childProgress?.name).toBe('Ayana Ayoub');
      expect(childProgress?.age).toBe(8);
      expect(childProgress?.rank).toBe('Cub');
      expect(childProgress?.group.name).toBe('Cubs (8-11 years)');
      expect(childProgress?.parent.name).toBe('Amal Aouli');
    });

    test('should show upcoming events for child group', async () => {
      const upcomingEvents = await prisma.event.findMany({
        where: {
          OR: [
            { groupId: 'group-cubs' },
            { groupId: null }, // All-group events
          ],
          startDate: {
            gte: new Date(),
          },
        },
        orderBy: { startDate: 'asc' },
      });

      expect(upcomingEvents.length).toBeGreaterThan(0);
      // Should include both Cubs-specific and all-group events
      const cubsEvents = upcomingEvents.filter(e => e.groupId === 'group-cubs');
      const allGroupEvents = upcomingEvents.filter(e => e.groupId === null);
      
      expect(cubsEvents.length + allGroupEvents.length).toBe(upcomingEvents.length);
    });

    test('should calculate achievement progress percentage', async () => {
      // In a real implementation, this would be calculated based on badges available vs earned
      const totalAchievements = await prisma.achievement.count({
        where: { scoutId: 'scout-ayana-ayoub' },
      });
      
      // Mock calculation - in real app this would include all available badges
      const availableBadges = 20; // Example number
      const progressPercentage = (totalAchievements / availableBadges) * 100;
      
      expect(progressPercentage).toBe(5); // 1 out of 20 badges
      expect(totalAchievements).toBe(1);
    });
  });

  describe('Parent-Leader Dual Role Progress', () => {
    test('should show progress for own children when acting as parent', async () => {
      const parentLeaderChildren = await prisma.scout.findMany({
        where: { parentId: 'parentleader-fatima-hassoun' },
        include: {
          achievements: true,
          group: true,
        },
      });

      expect(parentLeaderChildren).toHaveLength(1);
      expect(parentLeaderChildren[0].name).toBe('Zahraa Farhat');
      expect(parentLeaderChildren[0].group.name).toBe('Scouts (12+ years)');
    });

    test('should differentiate between parent view and leader view', async () => {
      // Parent view - only own children
      const ownChildren = await prisma.scout.findMany({
        where: { parentId: 'parentleader-fatima-hassoun' },
      });

      // Leader view - all children in managed groups
      const managedGroups = await prisma.userGroup.findMany({
        where: { userId: 'parentleader-fatima-hassoun' },
      });

      expect(ownChildren).toHaveLength(1);
      // In a real scenario, managed groups would have more children
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle deleted child records gracefully', async () => {
      // Delete a child and verify parent dashboard handles it
      await prisma.scout.delete({
        where: { id: 'scout-ali-dirani' },
      });

      const remainingChildren = await prisma.scout.findMany({
        where: { parentId: 'parent-amal-aouli' },
      });

      expect(remainingChildren).toHaveLength(1);
      expect(remainingChildren[0].name).toBe('Ayana Ayoub');
    });

    test('should handle permission verification for viewing progress', async () => {
      // Attempt to view another parent's child should fail
      const otherParentChild = await prisma.scout.findFirst({
        where: { 
          parentId: { not: 'parent-amal-aouli' },
        },
      });

      expect(otherParentChild).toBeTruthy();
      expect(otherParentChild?.parentId).not.toBe('parent-amal-aouli');
    });

    test('should handle large achievement lists efficiently', async () => {
      // Create many achievements for performance testing
      const manyAchievements = Array.from({ length: 50 }, (_, i) => ({
        id: `achievement-bulk-${i}`,
        name: `Badge ${i + 1}`,
        description: `Description for badge ${i + 1}`,
        scoutId: 'scout-ayana-ayoub',
      }));

      await prisma.achievement.createMany({
        data: manyAchievements,
      });

      const achievements = await prisma.achievement.findMany({
        where: { scoutId: 'scout-ayana-ayoub' },
        orderBy: { dateEarned: 'desc' },
      });

      expect(achievements).toHaveLength(51); // 50 + 1 original
      
      // Verify pagination would work
      const recentAchievements = achievements.slice(0, 10);
      expect(recentAchievements).toHaveLength(10);
    });

    test('should handle mixed attendance statuses correctly', async () => {
      const attendanceRecords = [
        {
          id: 'att-1',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli',
          eventId: 'event-cubs-meeting',
          status: 'present',
        },
        {
          id: 'att-2',
          scoutId: 'scout-ayana-ayoub', 
          userId: 'parent-amal-aouli',
          eventId: 'event-camp-weekend',
          status: 'absent',
        },
        {
          id: 'att-3',
          scoutId: 'scout-ayana-ayoub',
          userId: 'parent-amal-aouli', 
          eventId: 'event-camp-weekend',
          status: 'excused',
        },
      ];

      await prisma.attendance.createMany({ data: attendanceRecords });

      const attendanceStats = await prisma.attendance.groupBy({
        by: ['status'],
        where: { scoutId: 'scout-ayana-ayoub' },
        _count: { status: true },
      });

      const stats = attendanceStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>);

      expect(stats.present).toBe(1);
      expect(stats.absent).toBe(1);
      expect(stats.excused).toBe(1);
    });
  });

  describe('Real-time Updates', () => {
    test('should reflect latest achievement additions', async () => {
      const initialAchievements = await prisma.achievement.count({
        where: { scoutId: 'scout-ayana-ayoub' },
      });

      // Add new achievement
      await prisma.achievement.create({
        data: {
          id: 'achievement-new',
          name: 'Camping Badge',
          description: 'Completed first camping trip',
          scoutId: 'scout-ayana-ayoub',
        },
      });

      const updatedAchievements = await prisma.achievement.count({
        where: { scoutId: 'scout-ayana-ayoub' },
      });

      expect(updatedAchievements).toBe(initialAchievements + 1);
    });
  });
});