import { prisma } from "../lib/prisma";

async function testDashboardData() {
  console.log("🔍 Testing Executive Dashboard Data Queries...\n");

  try {
    // Test 1: Dashboard Statistics
    console.log("1. Dashboard Statistics:");
    const totalGroups = await prisma.group.count();
    const totalLeaders = await prisma.user.count({
      where: {
        OR: [
          { isLeader: true },
          { role: "leader" },
          { leaderGroups: { some: {} } }
        ]
      }
    });
    const totalScouts = await prisma.scout.count();
    const totalParents = await prisma.user.count({
      where: {
        OR: [
          { isParent: true },
          { role: "parent" },
          { scouts: { some: {} } }
        ]
      }
    });
    const upcomingEvents = await prisma.event.count({
      where: {
        startDate: {
          gte: new Date()
        }
      }
    });

    console.log(`   - Total Groups: ${totalGroups}`);
    console.log(`   - Total Leaders: ${totalLeaders}`);
    console.log(`   - Total Scouts: ${totalScouts}`);
    console.log(`   - Total Parents: ${totalParents}`);
    console.log(`   - Total Members: ${totalScouts + totalParents}`);
    console.log(`   - Upcoming Events: ${upcomingEvents}\n`);

    // Test 2: Groups Overview
    console.log("2. Groups Overview:");
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            scouts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    groups.forEach(group => {
      console.log(`   - ${group.name}: ${group._count.scouts} scouts`);
    });

    // Test 3: Check for any users
    console.log("\n3. Sample Users:");
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        name: true,
        email: true,
        role: true
      }
    });

    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });

    // Test 4: Check for any scouts
    console.log("\n4. Sample Scouts:");
    const scouts = await prisma.scout.findMany({
      take: 5,
      include: {
        parent: {
          select: {
            name: true
          }
        },
        group: {
          select: {
            name: true
          }
        }
      }
    });

    scouts.forEach(scout => {
      console.log(`   - ${scout.name}, age ${scout.age} (Parent: ${scout.parent.name}, Group: ${scout.group.name})`);
    });

  } catch (error) {
    console.error("Error testing dashboard data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDashboardData();