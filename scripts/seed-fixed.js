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

    // Create default groups (without specifying ID - let Supabase generate UUID)
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .insert([
        {
          name: 'Joeys',
          description: 'Ages 5-7'
        },
        {
          name: 'Cubs',
          description: 'Ages 8-10'
        },
        {
          name: 'Scouts',
          description: 'Ages 11-14'
        },
        {
          name: 'Venturers',
          description: 'Ages 15-17'
        },
        {
          name: 'Rovers',
          description: 'Ages 18-25'
        }
      ])
      .select();

    if (groupsError) {
      console.error('❌ Error creating groups:', groupsError);
      return;
    }

    console.log('✅ Groups created:', groups?.length || 0);

    // Check if users table exists and create sample users if it does
    const { data: testUsers, error: usersTestError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersTestError) {
      console.log('⚠️  Users table does not exist, skipping user creation');
    } else {
      // Create sample users
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
        console.error('❌ Error creating users:', usersError);
        return;
      }

      console.log('✅ Users created:', users?.length || 0);

      // Create sample scouts if groups and users exist
      if (groups && groups.length > 0 && users && users.length > 0) {
        const parentUser = users.find(u => u.role === 'PARENT');
        const cubsGroup = groups.find(g => g.name === 'Cubs');

        if (parentUser && cubsGroup) {
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
            console.error('❌ Error creating scouts:', scoutsError);
          } else {
            console.log('✅ Scouts created:', scouts?.length || 0);
          }
        }
      }
    }

    // Create sample events
    const { data: testEvents, error: eventsTestError } = await supabase
      .from('events')
      .select('*')
      .limit(1);

    if (eventsTestError) {
      console.log('⚠️  Events table does not exist, skipping event creation');
    } else {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .insert([
          {
            title: 'Weekly Meeting',
            description: 'Regular weekly scout meeting',
            location: 'Community Hall',
            start_date: new Date('2024-02-01T19:00:00Z').toISOString(),
            end_date: new Date('2024-02-01T21:00:00Z').toISOString(),
            created_by: null // Will be set to a user ID in actual usage
          },
          {
            title: 'Camp Weekend',
            description: 'Weekend camping trip',
            location: 'National Park',
            start_date: new Date('2024-02-15T09:00:00Z').toISOString(),
            end_date: new Date('2024-02-17T15:00:00Z').toISOString(),
            created_by: null
          }
        ])
        .select();

      if (eventsError) {
        console.error('❌ Error creating events:', eventsError);
      } else {
        console.log('✅ Events created:', events?.length || 0);
      }
    }

    console.log('🎉 Database seeding completed!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed().then(() => {
  console.log('✅ Seeding script finished');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seeding script failed:', error);
  process.exit(1);
});
