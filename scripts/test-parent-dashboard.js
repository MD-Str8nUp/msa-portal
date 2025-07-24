#!/usr/bin/env node

const fetch = require('node-fetch');

async function testParentDashboardFlow() {
  console.log('🧪 Testing complete parent dashboard flow...\n');
  
  try {
    // Step 1: Test login
    console.log('Step 1: Testing login...');
    const loginResponse = await fetch('http://localhost:3005/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'saharose_00@hotmail.com',
        password: 'MSA@2025!'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log(`✅ Login: ${loginResult.success ? 'SUCCESS' : 'FAILED'}`);
    
    if (!loginResult.success) {
      console.log('❌ Cannot proceed - login failed');
      return;
    }
    
    console.log(`👤 User: ${loginResult.user.name} (${loginResult.user.role})`);
    
    // Step 2: Test API endpoints that dashboard uses
    console.log('\nStep 2: Testing dashboard API endpoints...');
    
    // Test scouts endpoint
    const scoutsResponse = await fetch(`http://localhost:3005/api/scouts/by-parent?parentId=${loginResult.user.id}`);
    console.log(`📊 Scouts API: ${scoutsResponse.ok ? 'SUCCESS' : 'FAILED'} (${scoutsResponse.status})`);
    
    if (scoutsResponse.ok) {
      const scoutsData = await scoutsResponse.json();
      console.log(`   Found ${scoutsData.scouts ? scoutsData.scouts.length : 0} scouts`);
    }
    
    // Test events endpoint
    const eventsResponse = await fetch('http://localhost:3005/api/events');
    console.log(`📅 Events API: ${eventsResponse.ok ? 'SUCCESS' : 'FAILED'} (${eventsResponse.status})`);
    
    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      console.log(`   Found ${eventsData.data ? eventsData.data.length : 0} events`);
    }
    
    console.log('\n✅ Parent dashboard flow test completed!');
    console.log('🌐 Ready to test in browser:');
    console.log('   1. Go to http://localhost:3005/login');
    console.log('   2. Login with: saharose_00@hotmail.com / MSA@2025!');
    console.log('   3. Click "Go to Parent Dashboard"');
    console.log('   4. Should see dashboard with scouts and events data');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testParentDashboardFlow();