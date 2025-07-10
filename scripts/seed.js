const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Create default groups
    const groups = await Promise.all([
      prisma.group.create({
        data: {
          id: 'joeys',
          name: 'Joeys',
          description: 'Ages 5-7'
        }
      }),
      prisma.group.create({
        data: {
          id: 'cubs',
          name: 'Cubs',
          description: 'Ages 8-10'
        }
      }),
      prisma.group.create({
        data: {
          id: 'scouts',
          name: 'Scouts',
          description: 'Ages 11+'
        }
      })
    ]);

    console.log('✅ Groups created:', groups.length);

    // Create sample users
    const users = await Promise.all([
      prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@msa.com',
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'executive',
          avatar: null
        }
      }),
      prisma.user.create({
        data: {
          name: 'Leader User',
          email: 'leader@msa.com',
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'leader',
          avatar: null
        }
      }),
      prisma.user.create({
        data: {
          name: 'Parent User',
          email: 'parent@msa.com',
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'parent',
          avatar: null
        }
      })
    ]);

    console.log('✅ Users created:', users.length);

    // Create sample scouts
    const scouts = await Promise.all([
      prisma.scout.create({
        data: {
          name: 'Alex Johnson',
          age: 9,
          rank: 'Cub',
          groupId: 'cubs',
          parentId: users[2].id
        }
      }),
      prisma.scout.create({
        data: {
          name: 'Sarah Wilson',
          age: 6,
          rank: 'Joey',
          groupId: 'joeys',
          parentId: users[2].id
        }
      })
    ]);

    console.log('✅ Scouts created:', scouts.length);

    // Create sample events
    const events = await Promise.all([
      prisma.event.create({
        data: {
          title: 'Weekend Camping Trip',
          description: 'Fun camping adventure for all groups',
          location: 'Forest Park Campground',
          startDate: new Date('2025-07-20T10:00:00Z'),
          endDate: new Date('2025-07-21T16:00:00Z'),
          groupId: null, // All groups
          requiresPermissionSlip: true
        }
      }),
      prisma.event.create({
        data: {
          title: 'Badge Workshop',
          description: 'Craft and cooking badge workshop',
          location: 'Community Center',
          startDate: new Date('2025-07-15T14:00:00Z'),
          endDate: new Date('2025-07-15T16:00:00Z'),
          groupId: 'cubs',
          requiresPermissionSlip: false
        }
      })
    ]);

    console.log('✅ Events created:', events.length);

    console.log('🎉 Database seeded successfully!');
    
    // Final verification
    const totalUsers = await prisma.user.count();
    const totalScouts = await prisma.scout.count();
    const totalGroups = await prisma.group.count();
    const totalEvents = await prisma.event.count();
    
    console.log('📊 Final counts:');
    console.log(`   Users: ${totalUsers}`);
    console.log(`   Scouts: ${totalScouts}`);
    console.log(`   Groups: ${totalGroups}`);
    console.log(`   Events: ${totalEvents}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch(console.error);
