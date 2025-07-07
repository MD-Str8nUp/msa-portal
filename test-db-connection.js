// Test Supabase Connection
// Run this with: node test-db-connection.js

const { PrismaClient } = require('./prisma/generated/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Connected to Supabase successfully!');
    
    // Test creating a user (will fail if tables don't exist)
    console.log('🔄 Testing table creation...');
    
    // Just test that we can query (even if empty)
    const userCount = await prisma.user.count();
    console.log(`✅ Database tables created! Current user count: ${userCount}`);
    
    console.log('🎉 Supabase integration successful!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('💡 Make sure you ran: npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();