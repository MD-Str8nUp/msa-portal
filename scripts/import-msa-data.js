// Mi'raj Scouts Academy - Real Data Import Script
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const Papa = require('papaparse');

const prisma = new PrismaClient();

async function importMSAData() {
  try {
    console.log('🚀 Starting Mi\'raj Scouts Academy real data import...');
    
    // Read and parse the CSV file
    const csvContent = fs.readFileSync('MSA_Applications .csv', 'utf8');
    const parsed = Papa.parse(csvContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
    
    console.log(`📊 Found ${parsed.data.length} applications`);
    
    // Filter valid applications (with child data)
    const validApplications = parsed.data.filter(app => 
      app.child_first_name && 
      app.child_last_name && 
      app.child_age && 
      app.parent_first_name && 
      app.parent_last_name &&
      app.parent_email
    );
    
    console.log(`✅ ${validApplications.length} valid applications to import`);
    
    let stats = { parents: 0, scouts: 0, errors: 0, skipped: 0 };
    
    for (const app of validApplications) {
      try {
        // Determine group based on age and division
        const age = parseInt(app.child_age);
        let groupId;
        
        if (app.child_division === 'Joeys' || age <= 7) {
          groupId = 'group-joeys';
        } else if (app.child_division === 'Cubs' || (age >= 8 && age <= 10)) {
          groupId = 'group-cubs';
        } else if (app.child_division === 'Scouts' || age >= 11) {
          groupId = 'group-scouts';
        } else {
          groupId = 'group-cubs'; // Default to cubs
        }
        
        // Create parent user
        const parentName = `${app.parent_first_name} ${app.parent_last_name}`.trim();
        const parent = await prisma.user.upsert({
          where: { email: app.parent_email },
          update: {},
          create: {
            id: `parent-${app.submission_id}`,
            name: parentName,
            email: app.parent_email,
            password: '$2b$10$placeholder', // Will be set during activation
            role: 'parent',
            isParent: true,
            isLeader: false
          }
        });
        
        if (parent) stats.parents++;
        
        // Create scout
        const childName = `${app.child_first_name} ${app.child_last_name}`.trim();
        const scout = await prisma.scout.create({
          data: {
            id: `scout-${app.submission_id}`,
            name: childName,
            age: age,
            rank: app.child_division || 'Scout',
            parentId: parent.id,
            groupId: groupId
          }
        });
        
        stats.scouts++;
        
        console.log(`✅ ${childName} (${age}) -> ${app.child_division || 'Cubs'} group`);
        
      } catch (error) {
        console.error(`❌ Error with ${app.submission_id}:`, error.message);
        stats.errors++;
      }
    }
    
    // Show skipped applications
    const skippedApps = parsed.data.filter(app => 
      !app.child_first_name || !app.child_age || !app.parent_email
    );
    
    if (skippedApps.length > 0) {
      console.log(`\n⚠️  Skipped ${skippedApps.length} applications (missing child data):`);
      skippedApps.forEach(app => {
        console.log(`   - ${app.submission_id}: ${app.notes || 'Missing child information'}`);
      });
    }
    
    console.log('\n🎉 Mi\'raj Scouts Academy import completed!');
    console.log(`📊 Final Statistics:`);
    console.log(`   Parents imported: ${stats.parents}`);
    console.log(`   Scouts imported: ${stats.scouts}`);
    console.log(`   Applications skipped: ${skippedApps.length}`);
    console.log(`   Errors: ${stats.errors}`);
    
    // Verify database state
    const totalUsers = await prisma.user.count();
    const totalScouts = await prisma.scout.count();
    const totalGroups = await prisma.group.count();
    
    console.log(`\n🔍 Database verification:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Total scouts: ${totalScouts}`);
    console.log(`   Total groups: ${totalGroups}`);
    
    // Show group distribution
    const joeys = await prisma.scout.count({ where: { groupId: 'group-joeys' } });
    const cubs = await prisma.scout.count({ where: { groupId: 'group-cubs' } });
    const scouts = await prisma.scout.count({ where: { groupId: 'group-scouts' } });
    
    console.log(`\n🏅 Group Distribution:`);
    console.log(`   Joeys (ages 5-7): ${joeys}`);
    console.log(`   Cubs (ages 8-10): ${cubs}`);
    console.log(`   Scouts (ages 11+): ${scouts}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importMSAData()
  .then(() => console.log('✅ Mi\'raj Scouts Academy data import finished'))
  .catch(console.error);
