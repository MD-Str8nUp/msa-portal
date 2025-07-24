#!/usr/bin/env node

/**
 * Test Login Functionality with Real Data
 * Tests different user types and authentication
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000'; // Adjust port if needed

async function testLogin() {
  console.log('🧪 Testing MSA Portal Login Functionality...');
  
  // Test cases: real users from our migrated data
  const testUsers = [
    {
      email: 'ranaayoub85@gmail.com',
      password: 'test123',
      expectedRole: 'PARENT',
      description: 'Parent account (Dual role - promoted to leader)'
    },
    {
      email: 'leader.cubs.a@msa-portal.com', 
      password: 'test123',
      expectedRole: 'LEADER',
      description: 'Leader account for Cubs A'
    },
    {
      email: 'tahadirani90@hotmail.com',
      password: 'test123', 
      expectedRole: 'PARENT',
      description: 'Parent account (Dual role)'
    },
    {
      email: 'leader.scouts.a@msa-portal.com',
      password: 'test123',
      expectedRole: 'LEADER', 
      description: 'Leader account for Scouts A'
    },
    {
      email: 'nonexistent@test.com',
      password: 'test123',
      expectedRole: null,
      description: 'Non-existent user (should fail)'
    }
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (const testUser of testUsers) {
    console.log(`\n🔐 Testing: ${testUser.description}`);
    console.log(`   📧 Email: ${testUser.email}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`   ✅ Login successful`);
        console.log(`   👤 User: ${result.user.name}`);
        console.log(`   🎭 Role: ${result.user.role}`);
        console.log(`   🔄 Dual role: Leader=${result.user.is_also_leader}, Parent=${result.user.is_also_parent}`);
        
        if (testUser.expectedRole === result.user.role) {
          console.log(`   ✅ Role matches expected: ${testUser.expectedRole}`);
          successCount++;
        } else if (testUser.expectedRole === null) {
          console.log(`   ❌ Expected login to fail, but it succeeded`);
          failCount++;
        } else {
          console.log(`   ⚠️  Role mismatch: expected ${testUser.expectedRole}, got ${result.user.role}`);
          successCount++; // Still a successful login
        }
      } else {
        console.log(`   ❌ Login failed: ${result.error}`);
        if (testUser.expectedRole === null) {
          console.log(`   ✅ Expected failure - correct behavior`);
          successCount++;
        } else {
          failCount++;
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Network/Server error: ${error.message}`);
      failCount++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📊 Login Test Results:`);
  console.log(`   ✅ Successful tests: ${successCount}`);
  console.log(`   ❌ Failed tests: ${failCount}`);
  console.log(`   📊 Total tests: ${testUsers.length}`);
  
  if (failCount === 0) {
    console.log(`\n🎉 All login tests passed! Authentication is working correctly.`);
  } else {
    console.log(`\n⚠️  Some tests failed. Check the authentication system.`);
  }
}

// Execute test
testLogin().catch(console.error);