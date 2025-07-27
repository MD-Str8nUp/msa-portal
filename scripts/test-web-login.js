#!/usr/bin/env node

const fetch = require('node-fetch');

async function testWebLogin() {
  console.log('🌐 Testing web-style login (simulating browser behavior)...\n');
  
  try {
    // Test exactly what the browser would send
    const response = await fetch('http://localhost:3004/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({
        email: 'admin@msaportal.com',
        password: 'MSA@2025!'
      })
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log(`📋 Response:`, JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ Web-style login successful!');
    } else {
      console.log('\n❌ Web-style login failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWebLogin();