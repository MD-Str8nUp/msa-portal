const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  try {
    console.log('🌱 Seeding Supabase database...');

    // Check if groups already have data
    const { data: existingGroups, error: existingGroupsError } = await supabase
      .from('groups')
      .select('*');

    if (existingGroupsError) {
      console.error('❌ Error checking existing groups:', existingGroupsError);
      return;
    }

    let groups = existingGroups;

    // Create groups if they don't exist
    if (!groups || groups.length === 0) {
      console.log('📝 Creating groups...');
      const { data: newGroups, error: groupsError } = await supabase
        .from('groups')
        .insert([
          { name: 'Joeys', description: 'Ages 5-7' },
          { name: 'Cubs', description: 'Ages 8-10' },
          { name: 'Scouts', description: 'Ages 11-14' },
          { name: 'Venturers', description: 'Ages 15-17' },
          { name: 'Rovers', description: 'Ages 18-25' }
        ])
        .select();

      if (groupsError) {
        console.error('❌ Error creating groups:', groupsError);
        return;
      }

      groups = newGroups;
      console.log('✅ Groups created:', groups?.length || 0);
    } else {
      console.log('✅ Groups already exist:', groups.length);
    }

    // Create sample users (if users table exists)
    console.log('📝 Creating sample users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert([
        {
          name: 'Admin User',
          email: 'admin@msa.com',
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'ADMIN'
        },
        {
          name: 'Group Leader',
          email: 'leader@msa.com',
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'LEADER'
        },
        {
          name: 'John Parent',
          email: 'parent@msa.com',
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'PARENT'
        }
      ])
      .select();

    if (usersError) {
      console.log('⚠️  Could not create users (table might not exist):', usersError.message);
    } else {
      console.log('✅ Users created:', users?.length || 0);

      // Create sample scouts (if scouts table exists and we have users and groups)
      if (users && users.length > 0 && groups && groups.length > 0) {
        const parentUser = users.find(u => u.role === 'PARENT');
        const cubsGroup = groups.find(g => g.name === 'Cubs');

        if (parentUser && cubsGroup) {
          console.log('📝 Creating sample scouts...');
          const { data: scouts, error: scoutsError } = await supabase
            .from('scouts')
            .insert([
              {
                name: 'Tommy Scout',
                age: 9,
                rank: 'Yellow Six',
                parent_id: parentUser.id,
                group_id: cubsGroup.id
              },
              {
                name: 'Sarah Scout',
                age: 10,
                rank: 'Green Six',
                parent_id: parentUser.id,
                group_id: cubsGroup.id
              }
            ])
            .select();

          if (scoutsError) {
            console.log('⚠️  Could not create scouts (table might not exist):', scoutsError.message);
          } else {
            console.log('✅ Scouts created:', scouts?.length || 0);
          }
        }
      }
    }

    // Create sample applications (if applications table exists)
    console.log('📝 Creating sample applications...');
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .insert([
        {
          scout_name: 'Alex Johnson',
          scout_age: 8,
          parent_name: 'Mary Johnson',
          parent_email: 'mary.johnson@email.com',
          parent_phone: '0401234567',
          preferred_group: 'Cubs',
          status: 'PENDING'
        },
        {
          scout_name: 'Emma Wilson',
          scout_age: 12,
          parent_name: 'David Wilson',
          parent_email: 'david.wilson@email.com',
          parent_phone: '0407654321',
          preferred_group: 'Scouts',
          status: 'APPROVED'
        }
      ])
      .select();

    if (applicationsError) {
      console.log('⚠️  Could not create applications (table might not exist):', applicationsError.message);
    } else {
      console.log('✅ Applications created:', applications?.length || 0);
    }

    // Create sample badges (if badges table exists)
    console.log('📝 Creating sample badges...');
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .insert([
        {
          name: 'Outdoor Adventure',
          description: 'Complete outdoor activities',
          requirements: 'Participate in 3 outdoor activities',
          category: 'Adventure'
        },
        {
          name: 'Community Service',
          description: 'Help in community projects',
          requirements: 'Complete 5 hours of community service',
          category: 'Service'
        },
        {
          name: 'Leadership',
          description: 'Show leadership skills',
          requirements: 'Lead a patrol activity',
          category: 'Leadership'
        }
      ])
      .select();

    if (badgesError) {
      console.log('⚠️  Could not create badges (table might not exist):', badgesError.message);
    } else {
      console.log('✅ Badges created:', badges?.length || 0);
    }

    // Create sample events (work with existing events table structure)
    console.log('📝 Creating sample events...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .insert([
        {
          title: 'Weekly Meeting',
          description: 'Regular weekly scout meeting',
          location: 'Community Hall',
          start_date: new Date('2024-02-01T19:00:00Z').toISOString()
        },
        {
          title: 'Camp Weekend',
          description: 'Weekend camping trip',
          location: 'National Park',
          start_date: new Date('2024-02-15T09:00:00Z').toISOString()
        }
      ])
      .select();

    if (eventsError) {
      console.log('⚠️  Could not create events:', eventsError.message);
    } else {
      console.log('✅ Events created:', events?.length || 0);
    }

    // Create sample announcements
    console.log('📝 Creating sample announcements...');
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .insert([
        {
          title: 'Welcome to MSA Portal',
          content: 'Welcome to our new Scout Management System!',
          priority: 'HIGH'
        },
        {
          title: 'Upcoming Events',
          content: 'Check out our upcoming events in the calendar.',
          priority: 'MEDIUM'
        }
      ])
      .select();

    if (announcementsError) {
      console.log('⚠️  Could not create announcements:', announcementsError.message);
    } else {
      console.log('✅ Announcements created:', announcements?.length || 0);
    }

    console.log('🎉 Database seeding completed successfully!');
    
    // Print summary
    console.log('\n📊 SEEDING SUMMARY:');
    console.log('==================');
    console.log(`Groups: ${groups?.length || 0}`);
    console.log(`Users: ${users?.length || 'N/A (table not available)'}`);
    console.log(`Applications: ${applications?.length || 'N/A (table not available)'}`);
    console.log(`Badges: ${badges?.length || 'N/A (table not available)'}`);
    console.log(`Events: ${events?.length || 'N/A (table not available)'}`);
    console.log(`Announcements: ${announcements?.length || 'N/A (table not available)'}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed().then(() => {
  console.log('\n✅ Seeding script completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seeding script failed:', error);
  process.exit(1);
});
