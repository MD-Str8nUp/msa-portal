import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parse } from 'csv-parse/sync';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

// MSA Staff List - Real staff members from the organization
const MSA_STAFF = {
  leaders: [
    { name: 'Rehab Kassem', role: 'leader', group: 'Joeys' },
    { name: 'Zeinab O', role: 'leader', group: 'Joeys' },
    { name: 'Fatima G', role: 'leader', group: 'Joeys' },
    { name: 'Ali Makki', role: 'leader', group: 'Cubs' },
    { name: 'Alyaa', role: 'leader', group: 'Cubs' },
    { name: 'Ayah Merhi', role: 'leader', group: 'Cubs' },
    { name: 'Nour Maliki', role: 'leader', group: 'Cubs' },
    { name: 'Hassan Hijazi', role: 'leader', group: 'Scouts' },
    { name: 'Hawraa H', role: 'leader', group: 'Scouts' },
    { name: 'Fay Jaafar', role: 'leader', group: 'Scouts' },
    { name: 'Batoul Rabii', role: 'leader', group: 'Scouts' },
    { name: 'Hussein Ramadan', role: 'leader', group: 'Joeys' },
    { name: 'Hodah Iash', role: 'leader', group: 'Joeys' },
    { name: 'M.A Hijazi', role: 'leader', group: 'Cubs' },
    { name: 'Ali Chaytou', role: 'leader', group: 'Cubs' },
    { name: 'Aminah Reslan', role: 'leader', group: 'Cubs' },
    { name: 'Mohamed Wehbi', role: 'leader', group: 'Scouts' },
    { name: 'Fatima Issa', role: 'leader', group: 'Scouts' },
    { name: 'Mohamed Kobeissi', role: 'leader', group: 'Scouts' },
    { name: 'Hussein M.A', role: 'leader', group: 'Joeys' },
    { name: 'Samar Droubi', role: 'leader', group: 'Joeys' },
    { name: 'Hussein Darwich', role: 'leader', group: 'Cubs' },
    { name: 'Mariam Droubi', role: 'leader', group: 'Cubs' },
    { name: 'M.A Droubi', role: 'leader', group: 'Scouts' },
    { name: 'Ali Chour', role: 'leader', group: 'Scouts' },
    { name: 'Gofran Kassirah', role: 'leader', group: 'Joeys' },
    { name: 'Zeinab Sleiman', role: 'leader', group: 'Cubs' },
    { name: 'Haidar Alawie', role: 'leader', group: 'Scouts' },
    { name: 'Hamzah Bibawi', role: 'leader', group: 'Joeys' },
    { name: 'Hawraa Elhousseini', role: 'leader', group: 'Cubs' },
    { name: 'Hussein Mohamed Ali', role: 'leader', group: 'Scouts' },
    { name: 'Mohamed Ali Droubi', role: 'leader', group: 'Scouts' },
    { name: 'Mohamad Ali Hijazi', role: 'leader', group: 'Cubs' }
  ],
  support: [
    { name: 'Fatima Kadouh', role: 'support', title: 'AGL Support' },
    { name: 'Mohamed Dirani', role: 'support', title: 'Support/Scouting Officer' },
    { name: 'Mohamed Allouche', role: 'support', title: 'Support + Logistics' },
    { name: 'Hassan Nassour', role: 'support', title: 'Logistics' },
    { name: 'Hassan Ellachi', role: 'support', title: 'Media/Support' },
    { name: 'Zayn El Husseini', role: 'support', title: 'Support' }
  ],
  executives: [
    { name: 'Moe MSA', role: 'executive', title: 'Chief Executive Officer' },
    { name: 'Sarah Droubi', role: 'executive', title: 'President' },
    { name: 'Mohamed Droubi', role: 'executive', title: 'Vice President' }
  ]
};

// Helper function to generate email from name
function generateEmail(firstName: string, lastName: string): string {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  return `${cleanFirst}.${cleanLast}@mirajscouts.org.au`;
}

// Helper function to clean phone numbers
function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '').replace(/^0/, '+61');
}

// Helper function to get division based on age
function getDivisionByAge(age: number): string {
  if (age >= 5 && age <= 7) return 'Joeys';
  if (age >= 8 && age <= 11) return 'Cubs';
  if (age >= 12 && age <= 15) return 'Scouts';
  return 'Cubs'; // Default
}

export async function POST(request: Request) {
  try {
    console.log('🚀 Starting MSA data import...');
    
    // Read and parse CSV file
    const csvPath = path.join(process.cwd(), 'MSA_Applications .csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });

    console.log(`📊 Found ${records.length} records in CSV`);

    // Transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Clear existing data (optional - comment out if you want to append)
      console.log('🧹 Clearing existing data...');
      await tx.attendance.deleteMany({});
      await tx.achievement.deleteMany({});
      await tx.userGroup.deleteMany({});
      await tx.scout.deleteMany({});
      await tx.message.deleteMany({});
      await tx.event.deleteMany({});
      await tx.group.deleteMany({});
      await tx.user.deleteMany({});

      // Step 2: Create scout groups
      console.log('📦 Creating scout groups...');
      const joeys = await tx.group.create({
        data: {
          name: 'Joeys',
          description: 'Ages 5-7: Our youngest scouts learning basic skills and Islamic values'
        }
      });
      const cubs = await tx.group.create({
        data: {
          name: 'Cubs', 
          description: 'Ages 8-11: Building character through adventure and teamwork'
        }
      });
      const scouts = await tx.group.create({
        data: {
          name: 'Scouts',
          description: 'Ages 12-15: Developing leadership and advanced scouting skills'
        }
      });

      const groupMap = {
        'Joeys': joeys.id,
        'Cubs': cubs.id,
        'Scouts': scouts.id
      };

      // Step 3: Create staff users
      console.log('👥 Creating staff members...');
      const hashedPassword = await bcrypt.hash('Msa@2025', 10);
      
      // Create executives
      for (const exec of MSA_STAFF.executives) {
        const [firstName, ...lastNameParts] = exec.name.split(' ');
        const lastName = lastNameParts.join(' ') || 'MSA';
        
        await tx.user.create({
          data: {
            name: exec.name,
            email: generateEmail(firstName, lastName),
            password: hashedPassword,
            role: 'executive',
            isExecutive: true,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${exec.name}`,
          }
        });
      }

      // Create leaders and assign to groups
      const leadersByGroup: Record<string, any[]> = { Joeys: [], Cubs: [], Scouts: [] };
      
      for (const leader of MSA_STAFF.leaders) {
        const [firstName, ...lastNameParts] = leader.name.split(' ');
        const lastName = lastNameParts.join(' ') || 'Leader';
        
        const leaderUser = await tx.user.create({
          data: {
            name: leader.name,
            email: generateEmail(firstName, lastName),
            password: hashedPassword,
            role: 'leader',
            isLeader: true,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${leader.name}`,
          }
        });

        // Assign leader to group
        await tx.userGroup.create({
          data: {
            userId: leaderUser.id,
            groupId: groupMap[leader.group as keyof typeof groupMap],
            role: 'leader'
          }
        });

        leadersByGroup[leader.group].push(leaderUser);
      }

      // Create support staff
      for (const support of MSA_STAFF.support) {
        const [firstName, ...lastNameParts] = support.name.split(' ');
        const lastName = lastNameParts.join(' ') || 'Support';
        
        await tx.user.create({
          data: {
            name: support.name,
            email: generateEmail(firstName, lastName),
            password: hashedPassword,
            role: 'support',
            isSupport: true,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${support.name}`,
          }
        });
      }

      // Step 4: Process parent and scout data from CSV
      console.log('👨‍👩‍👧‍👦 Processing families from CSV...');
      const parentMap = new Map();
      const scoutsByGroup: Record<string, any[]> = { Joeys: [], Cubs: [], Scouts: [] };
      let processedFamilies = 0;
      let processedScouts = 0;

      for (const record of records) {
        // Skip duplicates and records without child data
        if (record.notes?.includes('DUPLICATE') || !record.child_first_name) {
          continue;
        }

        // Create or get parent
        const parentKey = record.parent_email.toLowerCase();
        let parent = parentMap.get(parentKey);

        if (!parent) {
          parent = await tx.user.create({
            data: {
              name: `${record.parent_first_name} ${record.parent_last_name}`,
              email: record.parent_email.toLowerCase(),
              password: hashedPassword,
              role: 'parent',
              isParent: true,
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${record.parent_first_name} ${record.parent_last_name}`,
            }
          });
          parentMap.set(parentKey, parent);
          processedFamilies++;
        }

        // Create scout if child data exists
        if (record.child_first_name && record.child_age) {
          const division = record.child_division || getDivisionByAge(parseInt(record.child_age));
          const groupId = groupMap[division as keyof typeof groupMap];

          if (groupId) {
            const scout = await tx.scout.create({
              data: {
                name: `${record.child_first_name} ${record.child_last_name || record.parent_last_name}`,
                age: parseInt(record.child_age),
                rank: 'Scout', // Default rank
                parentId: parent.id,
                groupId: groupId,
                joinedDate: new Date(record.submission_date)
              }
            });
            
            scoutsByGroup[division].push(scout);
            processedScouts++;
          }
        }
      }

      // Step 5: Create sample events
      console.log('📅 Creating sample events...');
      const events = [
        {
          title: 'Ramadan Night Hike',
          description: 'Special night hike during Ramadan with iftar under the stars',
          location: 'Bankstown Sports Club, Greenfield Park NSW',
          startDate: new Date('2025-03-15T19:00:00'),
          endDate: new Date('2025-03-15T22:00:00'),
          groupId: null,
          requiresPermissionSlip: true
        },
        {
          title: 'Islamic Values Workshop',
          description: 'Interactive workshop on Islamic character building and scout values',
          location: 'Mi\'raj Scouts Academy Hall, Punchbowl NSW',
          startDate: new Date('2025-02-08T10:00:00'),
          endDate: new Date('2025-02-08T12:00:00'),
          groupId: null,
          requiresPermissionSlip: false
        },
        {
          title: 'Eid ul-Fitr Celebration',
          description: 'Community celebration with games, activities and Eid treats',
          location: 'Crest Reserve, Bankstown NSW',
          startDate: new Date('2025-04-10T10:00:00'),
          endDate: new Date('2025-04-10T15:00:00'),
          groupId: null,
          requiresPermissionSlip: false
        }
      ];

      for (const eventData of events) {
        await tx.event.create({ data: eventData });
      }

      // Step 6: Create sample achievements for some scouts
      console.log('🏆 Creating sample achievements...');
      const achievementTypes = [
        { name: 'Salah Excellence Badge', description: 'Demonstrated consistent prayer habits and knowledge' },
        { name: 'Quran Memorization - Juz Amma', description: 'Successfully memorized the 30th chapter of the Quran' },
        { name: 'Community Service Star', description: 'Completed 20+ hours of Islamic community service' },
        { name: 'First Aid Certified', description: 'Completed basic first aid training' },
        { name: 'Camping Skills Badge', description: 'Mastered essential outdoor and camping skills' }
      ];

      // Give random achievements to 30% of scouts
      for (const division of Object.keys(scoutsByGroup)) {
        const scouts = scoutsByGroup[division];
        const selectedScouts = scouts.slice(0, Math.floor(scouts.length * 0.3));
        
        for (const scout of selectedScouts) {
          const randomAchievement = achievementTypes[Math.floor(Math.random() * achievementTypes.length)];
          await tx.achievement.create({
            data: {
              name: randomAchievement.name,
              description: randomAchievement.description,
              scoutId: scout.id,
              dateEarned: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date in last 90 days
            }
          });
        }
      }

      // Step 7: Create sample attendance records
      console.log('📋 Creating sample attendance records...');
      const attendanceEvents = await tx.event.findMany({ take: 3 });
      
      for (const event of attendanceEvents) {
        // Create attendance for 70-90% of scouts
        for (const division of Object.keys(scoutsByGroup)) {
          const scouts = scoutsByGroup[division];
          const attendanceRate = 0.7 + Math.random() * 0.2; // 70-90%
          const attendingScouts = scouts.slice(0, Math.floor(scouts.length * attendanceRate));
          
          for (const scout of attendingScouts) {
            const status = Math.random() > 0.1 ? 'present' : 'excused'; // 90% present, 10% excused
            const randomLeader = leadersByGroup[division][Math.floor(Math.random() * leadersByGroup[division].length)];
            
            await tx.attendance.create({
              data: {
                scoutId: scout.id,
                userId: randomLeader.id,
                eventId: event.id,
                status: status,
                date: event.startDate
              }
            });
          }
        }
      }

      return {
        families: processedFamilies,
        scouts: processedScouts,
        leaders: MSA_STAFF.leaders.length,
        support: MSA_STAFF.support.length,
        executives: MSA_STAFF.executives.length,
        groups: 3,
        events: events.length
      };
    });

    console.log('✅ MSA data import completed successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'MSA data imported successfully',
      stats: {
        ...result,
        totalUsers: result.families + result.leaders + result.support + result.executives,
        totalRecords: records.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Import error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to import MSA data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stats = await prisma.$transaction(async (tx) => {
      const users = await tx.user.count();
      const scouts = await tx.scout.count();
      const groups = await tx.group.count();
      const events = await tx.event.count();
      const achievements = await tx.achievement.count();
      const attendance = await tx.attendance.count();

      return {
        users,
        scouts,
        groups,
        events,
        achievements,
        attendance
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Current database statistics',
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get database statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}