import bcrypt from 'bcryptjs';

// Sample realistic MSA users based on the actual data
export const msaUsers = {
  // Parent user
  parent: {
    id: 'parent-amal-aouli',
    name: 'Amal Aouli',
    email: 'amal_aouli281@hotmail.com',
    password: '$2a$10$hashedpassword1', // 'password123'
    role: 'parent',
    isParent: true,
    isLeader: false,
    isExecutive: false,
    isSupport: false,
    defaultPortal: 'parent',
  },
  
  // Leader user
  leader: {
    id: 'leader-sarah-droubi',
    name: 'Sarah Droubi',
    email: 'sarah.droubi@hotmail.com',
    password: '$2a$10$hashedpassword2', // 'leader123'
    role: 'leader',
    isParent: false,
    isLeader: true,
    isExecutive: false,
    isSupport: false,
    defaultPortal: 'leader',
  },
  
  // Executive user
  executive: {
    id: 'executive-hassan-hammoud',
    name: 'Hicham Hammoud',
    email: 'info@hardcoregym.com.au',
    password: '$2a$10$hashedpassword3', // 'exec123'
    role: 'executive',
    isParent: false,
    isLeader: false,
    isExecutive: true,
    isSupport: false,
  },
  
  // Parent-Leader dual role
  parentLeader: {
    id: 'parentleader-fatima-hassoun',
    name: 'Fatima Hassoun',
    email: 'fatima_leen@hotmail.com',
    password: '$2a$10$hashedpassword4', // 'dual123'
    role: 'parent_leader',
    isParent: true,
    isLeader: true,
    isExecutive: false,
    isSupport: false,
    defaultPortal: 'parent',
  },
  
  // Support user
  support: {
    id: 'support-mohamad-dirani',
    name: 'Mohamad Dirani',
    email: 'dabossmoe@gmail.com',
    password: '$2a$10$hashedpassword5', // 'support123'
    role: 'support',
    isParent: false,
    isLeader: false,
    isExecutive: false,
    isSupport: true,
  },
};

// Groups based on scouting structure
export const msaGroups = [
  {
    id: 'group-joeys',
    name: 'Joeys (5-7 years)',
    description: 'For children aged 5 to 7 years',
  },
  {
    id: 'group-cubs',
    name: 'Cubs (8-11 years)',
    description: 'For children aged 8 to 11 years',
  },
  {
    id: 'group-scouts',
    name: 'Scouts (12+ years)',
    description: 'For children aged 12 and above',
  },
];

// Sample scouts based on real MSA applications
export const msaScouts = [
  {
    id: 'scout-ayana-ayoub',
    name: 'Ayana Ayoub',
    age: 8,
    rank: 'Cub',
    parentId: 'parent-amal-aouli',
    groupId: 'group-cubs',
  },
  {
    id: 'scout-zahraa-farhat',
    name: 'Zahraa Farhat',
    age: 12,
    rank: 'Scout',
    parentId: 'parentleader-fatima-hassoun',
    groupId: 'group-scouts',
  },
  {
    id: 'scout-ali-dirani',
    name: 'Ali Dirani',
    age: 9,
    rank: 'Cub',
    parentId: 'parent-amal-aouli',
    groupId: 'group-cubs',
  },
  {
    id: 'scout-muhammad-ali-hammoud',
    name: 'Muhammad Ali Hammoud',
    age: 12,
    rank: 'Scout',
    parentId: 'executive-hassan-hammoud',
    groupId: 'group-scouts',
  },
];

// Sample achievements
export const msaAchievements = [
  {
    id: 'achievement-1',
    name: 'First Aid Badge',
    description: 'Completed basic first aid training',
    scoutId: 'scout-ayana-ayoub',
  },
  {
    id: 'achievement-2',
    name: 'Community Service Badge',
    description: 'Completed 10 hours of community service',
    scoutId: 'scout-zahraa-farhat',
  },
];

// Sample events
export const msaEvents = [
  {
    id: 'event-camp-weekend',
    title: 'MSA Weekend Camp',
    description: 'Annual weekend camping trip for all groups',
    location: 'Bungonia National Park',
    startDate: new Date('2025-07-15T09:00:00Z'),
    endDate: new Date('2025-07-17T15:00:00Z'),
    groupId: null, // All groups
    requiresPermissionSlip: true,
  },
  {
    id: 'event-cubs-meeting',
    title: 'Cubs Weekly Meeting',
    description: 'Regular Cubs group meeting',
    location: 'MSA Hall',
    startDate: new Date('2025-06-28T10:00:00Z'),
    endDate: new Date('2025-06-28T12:00:00Z'),
    groupId: 'group-cubs',
    requiresPermissionSlip: false,
  },
];

// Helper function to hash passwords for tests
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Helper function to create test database with MSA data
export async function seedTestDatabase(prisma: any) {
  // Create groups
  for (const group of msaGroups) {
    await prisma.group.create({ data: group });
  }
  
  // Create users with hashed passwords
  for (const user of Object.values(msaUsers)) {
    await prisma.user.create({
      data: {
        ...user,
        password: await hashPassword(user.password.replace('$2a$10$hashedpassword', 'password')),
      },
    });
  }
  
  // Create scouts
  for (const scout of msaScouts) {
    await prisma.scout.create({ data: scout });
  }
  
  // Create events
  for (const event of msaEvents) {
    await prisma.event.create({ data: event });
  }
  
  // Create achievements
  for (const achievement of msaAchievements) {
    await prisma.achievement.create({ data: achievement });
  }
}