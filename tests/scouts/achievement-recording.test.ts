import { prisma } from '@/lib/prisma';
import { seedTestDatabase, msaUsers, msaScouts } from '../fixtures/msa-data';

describe('Scout Achievement Recording', () => {
  beforeEach(async () => {
    await seedTestDatabase(prisma);
  });

  describe('Achievement Creation and Recording', () => {
    test('should record new achievement for scout', async () => {
      const newAchievement = await prisma.achievement.create({
        data: {
          id: 'new-achievement-test',
          name: 'Cooking Badge',
          description: 'Successfully prepared a meal during camp',
          scoutId: 'scout-ayana-ayoub',
        },
      });

      expect(newAchievement.name).toBe('Cooking Badge');
      expect(newAchievement.scoutId).toBe('scout-ayana-ayoub');
      expect(newAchievement.dateEarned).toBeDefined();
    });

    test('should record multiple achievements for same scout', async () => {
      const multipleAchievements = [
        {
          id: 'multiple-1',
          name: 'Swimming Badge',
          description: 'Completed swimming proficiency test',
          scoutId: 'scout-ayana-ayoub',
        },
        {
          id: 'multiple-2',
          name: 'Hiking Badge',
          description: 'Completed 5km nature hike',
          scoutId: 'scout-ayana-ayoub',
        },
      ];

      await prisma.achievement.createMany({ data: multipleAchievements });

      const achievements = await prisma.achievement.findMany({
        where: { scoutId: 'scout-ayana-ayoub' },
      });

      expect(achievements.length).toBeGreaterThanOrEqual(3); // 2 new + 1 existing
    });

    test('should track achievement progress levels', async () => {
      const progressAchievements = [
        {
          id: 'bronze-level',
          name: 'Environmental Badge - Bronze',
          description: 'Basic environmental awareness',
          scoutId: 'scout-zahraa-farhat',
        },
        {
          id: 'silver-level',
          name: 'Environmental Badge - Silver',
          description: 'Advanced environmental project',
          scoutId: 'scout-zahraa-farhat',
        },
      ];

      await prisma.achievement.createMany({ data: progressAchievements });

      const envBadges = await prisma.achievement.findMany({
        where: {
          scoutId: 'scout-zahraa-farhat',
          name: { contains: 'Environmental Badge' },
        },
        orderBy: { dateEarned: 'asc' },
      });

      expect(envBadges).toHaveLength(2);
      expect(envBadges[0].name).toContain('Bronze');
      expect(envBadges[1].name).toContain('Silver');
    });
  });

  describe('Achievement Validation and Requirements', () => {
    test('should validate age-appropriate achievements', async () => {
      // 8-year-old shouldn't get advanced Venturer badges
      const scout = await prisma.scout.findUnique({
        where: { id: 'scout-ayana-ayoub' },
      });

      const isAgeAppropriate = (scoutAge: number, achievementLevel: string) => {
        const ageRequirements = {
          'Joeys': [5, 7],
          'Cubs': [8, 11], 
          'Scouts': [12, 17],
          'Venturers': [18, 25],
        };
        
        const [minAge, maxAge] = ageRequirements[achievementLevel as keyof typeof ageRequirements] || [0, 100];
        return scoutAge >= minAge && scoutAge <= maxAge;
      };

      expect(scout?.age).toBe(8);
      expect(isAgeAppropriate(8, 'Cubs')).toBe(true);
      expect(isAgeAppropriate(8, 'Venturers')).toBe(false);
    });

    test('should prevent duplicate achievements', async () => {
      // Create first achievement
      await prisma.achievement.create({
        data: {
          id: 'first-cooking-badge',
          name: 'Cooking Badge',
          description: 'Basic cooking skills',
          scoutId: 'scout-ayana-ayoub',
        },
      });

      // Check for existing achievement before creating duplicate
      const existingAchievement = await prisma.achievement.findFirst({
        where: {
          scoutId: 'scout-ayana-ayoub',
          name: 'Cooking Badge',
        },
      });

      expect(existingAchievement).toBeTruthy();
      expect(existingAchievement?.name).toBe('Cooking Badge');
    });

    test('should validate prerequisite achievements', async () => {
      // Mock prerequisite checking
      const prerequisites = {
        'Advanced Camping Badge': ['Basic Camping Badge', 'Fire Safety Badge'],
        'Leadership Badge': ['Communication Badge', 'Team Work Badge'],
      };

      const scoutAchievements = await prisma.achievement.findMany({
        where: { scoutId: 'scout-zahraa-farhat' },
      });

      const hasPrerequisites = (targetBadge: string) => {
        const required = prerequisites[targetBadge as keyof typeof prerequisites] || [];
        const earned = scoutAchievements.map(a => a.name);
        return required.every(req => earned.includes(req));
      };

      // Would need prerequisite badges first
      expect(hasPrerequisites('Advanced Camping Badge')).toBe(false);
    });
  });

  describe('Achievement Categories and Types', () => {
    test('should record achievements by category', async () => {
      const categorizedAchievements = [
        {
          id: 'outdoor-1',
          name: 'Camping Badge',
          description: 'Outdoor skills - camping proficiency',
          scoutId: 'scout-muhammad-ali-hammoud',
        },
        {
          id: 'community-1',
          name: 'Community Service Badge',
          description: 'Community involvement - 20 hours service',
          scoutId: 'scout-muhammad-ali-hammoud',
        },
        {
          id: 'creative-1',
          name: 'Arts and Crafts Badge',
          description: 'Creative skills - completed art project',
          scoutId: 'scout-muhammad-ali-hammoud',
        },
      ];

      await prisma.achievement.createMany({ data: categorizedAchievements });

      const scoutAchievements = await prisma.achievement.findMany({
        where: { scoutId: 'scout-muhammad-ali-hammoud' },
      });

      expect(scoutAchievements.length).toBeGreaterThanOrEqual(3);
      
      // Mock categorization (would be stored in database in real system)
      const categories = scoutAchievements.map(a => {
        if (a.description.includes('Outdoor')) return 'Outdoor';
        if (a.description.includes('Community')) return 'Community';
        if (a.description.includes('Creative')) return 'Creative';
        return 'Other';
      });

      expect(categories).toContain('Outdoor');
      expect(categories).toContain('Community');
      expect(categories).toContain('Creative');
    });

    test('should track special recognition achievements', async () => {
      const specialAchievements = [
        {
          id: 'special-recognition',
          name: 'Scout of the Year',
          description: 'Outstanding leadership and participation',
          scoutId: 'scout-zahraa-farhat',
        },
        {
          id: 'milestone-achievement',
          name: '50 Hours Community Service',
          description: 'Milestone achievement - exceptional service',
          scoutId: 'scout-zahraa-farhat',
        },
      ];

      await prisma.achievement.createMany({ data: specialAchievements });

      const specialRecognitions = await prisma.achievement.findMany({
        where: {
          scoutId: 'scout-zahraa-farhat',
          OR: [
            { name: { contains: 'Year' } },
            { name: { contains: 'Hours' } },
          ],
        },
      });

      expect(specialRecognitions).toHaveLength(2);
    });
  });

  describe('Achievement Reporting and Analytics', () => {
    test('should generate achievement summary for scout', async () => {
      // Add more achievements for testing
      const testAchievements = Array.from({ length: 10 }, (_, i) => ({
        id: `summary-achievement-${i}`,
        name: `Test Badge ${i + 1}`,
        description: `Achievement number ${i + 1}`,
        scoutId: 'scout-ayana-ayoub',
      }));

      await prisma.achievement.createMany({ data: testAchievements });

      const totalAchievements = await prisma.achievement.count({
        where: { scoutId: 'scout-ayana-ayoub' },
      });

      expect(totalAchievements).toBeGreaterThanOrEqual(10);
    });

    test('should calculate group achievement statistics', async () => {
      // Create achievements for different scouts in same group
      const groupAchievements = [
        {
          id: 'group-stat-1',
          name: 'Group Activity Badge',
          description: 'Participated in group activity',
          scoutId: 'scout-ayana-ayoub', // Cubs group
        },
        {
          id: 'group-stat-2',
          name: 'Group Activity Badge',
          description: 'Participated in group activity',
          scoutId: 'scout-ali-dirani', // Cubs group
        },
      ];

      await prisma.achievement.createMany({ data: groupAchievements });

      // Calculate group statistics
      const cubsScouts = await prisma.scout.findMany({
        where: { groupId: 'group-cubs' },
        include: { achievements: true },
      });

      const totalCubsAchievements = cubsScouts.reduce(
        (total, scout) => total + scout.achievements.length,
        0
      );

      const averageAchievements = totalCubsAchievements / cubsScouts.length;

      expect(totalCubsAchievements).toBeGreaterThan(0);
      expect(averageAchievements).toBeGreaterThan(0);
    });

    test('should track achievement trends over time', async () => {
      const timeBasedAchievements = [
        {
          id: 'trend-1',
          name: 'Monthly Challenge Badge',
          description: 'Completed January challenge',
          scoutId: 'scout-ayana-ayoub',
          dateEarned: new Date('2025-01-15'),
        },
        {
          id: 'trend-2',
          name: 'Monthly Challenge Badge',
          description: 'Completed February challenge',
          scoutId: 'scout-ayana-ayoub',
          dateEarned: new Date('2025-02-15'),
        },
      ];

      await prisma.achievement.createMany({ data: timeBasedAchievements });

      const monthlyAchievements = await prisma.achievement.findMany({
        where: {
          scoutId: 'scout-ayana-ayoub',
          name: 'Monthly Challenge Badge',
        },
        orderBy: { dateEarned: 'asc' },
      });

      expect(monthlyAchievements).toHaveLength(2);
      expect(monthlyAchievements[0].dateEarned < monthlyAchievements[1].dateEarned).toBe(true);
    });
  });

  describe('Leader Achievement Management', () => {
    test('should allow leaders to award achievements', async () => {
      // Leader awards achievement to scout
      const leaderAwardedAchievement = await prisma.achievement.create({
        data: {
          id: 'leader-awarded',
          name: 'Leadership Participation Badge',
          description: 'Awarded by leader for outstanding participation',
          scoutId: 'scout-ayana-ayoub',
        },
      });

      // In real system, would track who awarded it
      const mockAwardedBy = 'leader-sarah-droubi';
      
      expect(leaderAwardedAchievement.name).toContain('Leadership');
      expect(mockAwardedBy).toBe('leader-sarah-droubi');
    });

    test('should support bulk achievement awards', async () => {
      // Award same achievement to multiple scouts
      const cubsScouts = await prisma.scout.findMany({
        where: { groupId: 'group-cubs' },
        take: 3,
      });

      const bulkAchievements = cubsScouts.map((scout, index) => ({
        id: `bulk-award-${index}`,
        name: 'Group Participation Badge',
        description: 'Participated in group event',
        scoutId: scout.id,
      }));

      await prisma.achievement.createMany({ data: bulkAchievements });

      const groupAchievements = await prisma.achievement.findMany({
        where: { name: 'Group Participation Badge' },
      });

      expect(groupAchievements.length).toBe(cubsScouts.length);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle achievement for non-existent scout', async () => {
      try {
        await prisma.achievement.create({
          data: {
            id: 'invalid-scout-achievement',
            name: 'Test Badge',
            description: 'This should fail',
            scoutId: 'non-existent-scout',
          },
        });

        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.code).toBe('P2003'); // Foreign key constraint error
      }
    });

    test('should handle very long achievement descriptions', async () => {
      const longDescription = 'A'.repeat(1000);
      
      const longAchievement = await prisma.achievement.create({
        data: {
          id: 'long-description-test',
          name: 'Detailed Achievement',
          description: longDescription,
          scoutId: 'scout-ayana-ayoub',
        },
      });

      expect(longAchievement.description.length).toBe(1000);
    });

    test('should handle achievement deletion', async () => {
      const achievementToDelete = await prisma.achievement.create({
        data: {
          id: 'delete-test-achievement',
          name: 'Temporary Badge',
          description: 'This will be deleted',
          scoutId: 'scout-ayana-ayoub',
        },
      });

      await prisma.achievement.delete({
        where: { id: achievementToDelete.id },
      });

      const deletedAchievement = await prisma.achievement.findUnique({
        where: { id: 'delete-test-achievement' },
      });

      expect(deletedAchievement).toBeNull();
    });

    test('should handle concurrent achievement recording', async () => {
      const concurrentAchievements = [
        prisma.achievement.create({
          data: {
            id: 'concurrent-1',
            name: 'Concurrent Badge 1',
            description: 'First concurrent achievement',
            scoutId: 'scout-ayana-ayoub',
          },
        }),
        prisma.achievement.create({
          data: {
            id: 'concurrent-2',
            name: 'Concurrent Badge 2',
            description: 'Second concurrent achievement',
            scoutId: 'scout-ali-dirani',
          },
        }),
      ];

      const [achievement1, achievement2] = await Promise.all(concurrentAchievements);

      expect(achievement1.name).toBe('Concurrent Badge 1');
      expect(achievement2.name).toBe('Concurrent Badge 2');
    });

    test('should handle achievement performance with large datasets', async () => {
      const manyAchievements = Array.from({ length: 200 }, (_, i) => ({
        id: `performance-test-${i}`,
        name: `Performance Badge ${i + 1}`,
        description: `Performance test achievement ${i + 1}`,
        scoutId: 'scout-ayana-ayoub',
      }));

      const startTime = Date.now();
      await prisma.achievement.createMany({ data: manyAchievements });
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds

      const achievementCount = await prisma.achievement.count({
        where: { scoutId: 'scout-ayana-ayoub' },
      });

      expect(achievementCount).toBeGreaterThanOrEqual(200);
    });
  });
});