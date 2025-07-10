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

    // Create default groups
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .insert([
        {
          id: 'joeys',
          name: 'Joeys',
          description: 'Ages 5-7'
        },
        {
          id: 'cubs',
          name: 'Cubs',
          description: 'Ages 8-10'
        },
        {
          id: 'scouts',
          name: 'Scouts',
          description: 'Ages 11+'
        }
      ])
      .select();

    if (groupsError) {
      console.error('❌ Error creating groups:', groupsError);
      return;
    }

    console.log('✅ Groups created:', groups?.length || 0);

    // Create sample users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert([
        {
          name: 'Admin User',
          email: 'admin@msa.com',
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'executive',
          avatar: null
        },
        {
          name: 'Leader User',
          email: 'leader@msa.com',
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'leader',
          avatar: null
        },
        {
          name: 'Parent User',
          email: 'parent@msa.com',
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'parent',
          avatar: null
        }
      ])
      .select();

    if (usersError) {
      console.error('❌ Error creating users:', usersError);
      return;
    }

    console.log('✅ Users created:', users?.length || 0);

    // Create sample scouts (using the parent user ID from the created users)
    const parentUser = users?.find(user => user.role === 'parent');
    if (!parentUser) {
      console.error('❌ Parent user not found');
      return;
    }

    const { data: scouts, error: scoutsError } = await supabase
      .from('scouts')
      .insert([
        {
          name: 'Alex Johnson',
          age: 9,
          rank: 'Cub',
          group_id: 'cubs',
          parent_id: parentUser.id
        },
        {
          name: 'Sarah Wilson',
          age: 6,
          rank: 'Joey',
          group_id: 'joeys',
          parent_id: parentUser.id
        }
      ])
      .select();

    if (scoutsError) {
      console.error('❌ Error creating scouts:', scoutsError);
      return;
    }

    console.log('✅ Scouts created:', scouts?.length || 0);

    // Create sample events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .insert([
        {
          title: 'Weekend Camping Trip',
          description: 'Fun camping adventure for all groups',
          location: 'Forest Park Campground',
          start_date: new Date('2025-07-20T10:00:00Z').toISOString(),
          end_date: new Date('2025-07-21T16:00:00Z').toISOString(),
          group_id: null, // All groups
          requires_permission_slip: true
        },
        {
          title: 'Badge Workshop',
          description: 'Craft and cooking badge workshop',
          location: 'Community Center',
          start_date: new Date('2025-07-15T14:00:00Z').toISOString(),
          end_date: new Date('2025-07-15T16:00:00Z').toISOString(),
          group_id: 'cubs',
          requires_permission_slip: false
        }
      ])
      .select();

    if (eventsError) {
      console.error('❌ Error creating events:', eventsError);
      return;
    }

    console.log('✅ Events created:', events?.length || 0);

    console.log('🎉 Database seeded successfully!');
    
    // Final verification - count records in each table
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    const { count: totalScouts } = await supabase
      .from('scouts')
      .select('*', { count: 'exact', head: true });
    
    const { count: totalGroups } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true });
    
    const { count: totalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Final counts:');
    console.log(`   Users: ${totalUsers || 0}`);
    console.log(`   Scouts: ${totalScouts || 0}`);
    console.log(`   Groups: ${totalGroups || 0}`);
    console.log(`   Events: ${totalEvents || 0}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seed().catch(console.error);
