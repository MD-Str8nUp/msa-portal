const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixLeaderAuth() {
  console.log('🔧 Fixing leader authentication...\n');

  try {
    // Get all leaders
    const { data: leaders, error: leadersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'leader')
      .limit(5); // Test with first 5 leaders

    if (leadersError) throw leadersError;

    console.log(`Found ${leaders.length} leaders to fix authentication for\n`);

    const results = {
      created: [],
      errors: []
    };

    for (const leader of leaders) {
      try {
        console.log(`Processing: ${leader.first_name} ${leader.last_name || ''} (${leader.email})`);

        // Create auth user for this leader
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: leader.email,
          password: 'leader123',
          email_confirm: true
        });

        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log('   ⚠️  Auth user already exists - trying to update password');
            
            // Try to update the password instead
            const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
              leader.id,
              { password: 'leader123' }
            );

            if (updateError) {
              throw updateError;
            }
            
            console.log('   ✅ Updated existing auth password');
          } else {
            throw authError;
          }
        } else {
          console.log('   ✅ Created auth user');
        }

        results.created.push({
          name: `${leader.first_name} ${leader.last_name || ''}`.trim(),
          email: leader.email
        });

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        results.errors.push({
          email: leader.email,
          error: error.message
        });
      }
      
      console.log('');
    }

    // Test authentication with one of the leaders
    console.log('🧪 Testing authentication...\n');
    
    const testLeader = leaders[0];
    if (testLeader) {
      try {
        const { data: authData, error: testError } = await supabase.auth.signInWithPassword({
          email: testLeader.email,
          password: 'leader123'
        });

        if (testError) {
          console.log(`❌ Test login failed for ${testLeader.email}:`, testError.message);
        } else {
          console.log(`✅ Test login successful for ${testLeader.email}`);
          console.log(`   Auth User ID: ${authData.user.id}`);
          
          // Sign out
          await supabase.auth.signOut();
        }
      } catch (testError) {
        console.log(`❌ Test login error: ${testError.message}`);
      }
    }

    // Summary
    console.log('\n📊 AUTHENTICATION FIX SUMMARY');
    console.log('==============================');
    console.log(`✅ Successfully processed: ${results.created.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);

    if (results.created.length > 0) {
      console.log('\n✅ LEADERS WITH FIXED AUTH:');
      results.created.forEach(leader => {
        console.log(`   ${leader.name} (${leader.email})`);
      });
    }

    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(error => {
        console.log(`   ${error.email}: ${error.error}`);
      });
    }

    console.log('\n🔐 LEADER LOGIN CREDENTIALS:');
    console.log('Email: [leader email from list]');
    console.log('Password: leader123');

    return results;

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  fixLeaderAuth()
    .then((results) => {
      console.log('\n✨ Leader authentication fix completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { fixLeaderAuth };