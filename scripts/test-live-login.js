#!/usr/bin/env node

const fetch = require('node-fetch');

async function testLiveLogin() {
  console.log('🧪 Testing live login with debugging...\n');
  
  const testCredentials = [
    { email: 'saharose_00@hotmail.com', password: 'MSA@2025!' },
    { email: 'nada@qspeechclinic.com.au', password: 'MSA@2025!' },
    { email: 'test@test.com', password: 'test123' }
  ];
  
  for (const creds of testCredentials) {
    console.log(`🔐 Testing login for: ${creds.email}`);
    console.log(`🔑 Password: ${creds.password}`);
    
    try {
      const response = await fetch('http://localhost:3003/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
      });
      
      const result = await response.json();
      
      console.log(`📊 Status: ${response.status}`);
      console.log(`📋 Response:`, result);
      
      if (result.success) {
        console.log('✅ Login successful!');
      } else {
        console.log('❌ Login failed:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Request failed:', error.message);
    }
    
    console.log('   ---\n');
  }
}

testLiveLogin();