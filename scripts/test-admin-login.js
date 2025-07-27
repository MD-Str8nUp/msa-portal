#!/usr/bin/env node

const fetch = require('node-fetch');

async function testAdminLogin() {
  console.log('🧪 Testing admin login...\n');
  
  try {
    const response = await fetch('http://localhost:3004/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@msaportal.com',
        password: 'MSA@2025!'
      })
    });
    
    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Response:`, JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ Admin login successful!');
      console.log(`👤 User: ${result.user.name}`);
      console.log(`📧 Email: ${result.user.email}`);
      console.log(`🎭 Role: ${result.user.role}`);
    } else {
      console.log('\n❌ Admin login failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminLogin();