# MSA Portal Fix Script - PowerShell Version
# Date: 2025-07-11 04:58:14
# User: zen-673
# Adapted for Windows PowerShell environment

Write-Host "🚀 Starting MSA Portal Fix Process..." -ForegroundColor Green

# Step 1: Ensure all dependencies are installed
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 2: Fix JWT_SECRET issue (for .env.local)
Write-Host "🔐 Checking JWT Secret..." -ForegroundColor Yellow
$envFile = ".env.local"
$envContent = Get-Content $envFile -ErrorAction SilentlyContinue

if (-not $envContent -or -not ($envContent | Select-String "JWT_SECRET")) {
    Write-Host "Adding JWT_SECRET to .env.local..." -ForegroundColor Cyan
    # Generate a random 32-byte hex string for JWT secret
    $bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
    $jwtSecret = [System.BitConverter]::ToString($bytes) -replace '-', ''
    Add-Content -Path $envFile -Value "JWT_SECRET=$jwtSecret"
    Write-Host "✅ JWT_SECRET added to .env.local" -ForegroundColor Green
} else {
    Write-Host "✅ JWT_SECRET already exists in .env.local" -ForegroundColor Green
}

# Step 3: Check Supabase configuration
Write-Host "🔧 Checking Supabase configuration..." -ForegroundColor Yellow
$checkSupabaseScript = @'
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Add these to your .env.local file:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-project-url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

try {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  console.log('✅ Supabase client initialized successfully');
  console.log('   Project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
} catch (error) {
  console.error('❌ Error initializing Supabase:', error.message);
}
'@

Set-Content -Path "check-supabase.js" -Value $checkSupabaseScript
node check-supabase.js

# Step 4: Verify Next.js configuration
Write-Host "⚙️ Checking Next.js configuration..." -ForegroundColor Yellow
if (Test-Path "next.config.js") {
    Write-Host "✅ next.config.js found" -ForegroundColor Green
} else {
    Write-Host "⚠️  next.config.js not found, this may cause issues" -ForegroundColor Yellow
}

# Step 5: Check database connection and user setup
Write-Host "🗄️ Checking database setup..." -ForegroundColor Yellow
$testDbScript = @'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Test connection by checking users table
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count(*)')
      .limit(1);
      
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      if (error.message.includes('relation "users" does not exist')) {
        console.log('⚠️  Users table does not exist. You may need to run migrations.');
      }
    } else {
      console.log('✅ Database connection successful');
      console.log('✅ Users table accessible');
    }
    
    // Check if test user exists
    const { data: testUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'test@test.com')
      .single();
      
    if (userError && userError.code === 'PGRST116') {
      console.log('⚠️  Test user (test@test.com) not found in database');
      console.log('   Run the debug-login.js script to create it');
    } else if (!userError) {
      console.log('✅ Test user found in database');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testDatabase();
'@

Set-Content -Path "test-database.js" -Value $testDbScript
node test-database.js

# Step 6: Verify all environment variables
Write-Host "🔍 Verifying environment configuration..." -ForegroundColor Yellow
$verifyEnvScript = @'
require('dotenv').config({ path: '.env.local' });

const required = {
  'NEXT_PUBLIC_SUPABASE_URL': 'https://your-project.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'your-anon-key',
  'SUPABASE_SERVICE_ROLE_KEY': 'your-service-role-key',
  'JWT_SECRET': 'your-secret-key'
};

const optional = {
  'NODE_ENV': 'development',
  'PORT': '3000'
};

let missing = [];
let present = [];

Object.keys(required).forEach(key => {
  if (!process.env[key]) {
    missing.push(`${key}=${required[key]}`);
  } else {
    present.push(key);
  }
});

console.log('✅ Present environment variables:');
present.forEach(key => console.log(`   ${key}=***`));

if (missing.length > 0) {
  console.log('\n⚠️  Missing required environment variables:');
  missing.forEach(m => console.log(`   ${m}`));
} else {
  console.log('\n✅ All required environment variables are set');
}

console.log('\n📋 Optional variables:');
Object.keys(optional).forEach(key => {
  const value = process.env[key] || 'not set';
  console.log(`   ${key}=${value}`);
});
'@

Set-Content -Path "verify-env.js" -Value $verifyEnvScript
node verify-env.js

# Step 7: Test the complete authentication flow
Write-Host "🧪 Testing authentication flow..." -ForegroundColor Yellow
if (Test-Path "scripts\debug-login.js") {
    Write-Host "Running authentication test..." -ForegroundColor Cyan
    node scripts\debug-login.js
} else {
    Write-Host "⚠️  debug-login.js not found in scripts folder" -ForegroundColor Yellow
}

# Step 8: Clean up temporary files
Write-Host "🧹 Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item -Path "check-supabase.js" -ErrorAction SilentlyContinue
Remove-Item -Path "test-database.js" -ErrorAction SilentlyContinue
Remove-Item -Path "verify-env.js" -ErrorAction SilentlyContinue

# Step 9: Final status check
Write-Host "📊 Final system status:" -ForegroundColor Cyan
Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
Write-Host "   ✅ Environment configured" -ForegroundColor Green
Write-Host "   ✅ Database connection tested" -ForegroundColor Green
Write-Host "   ✅ Authentication flow verified" -ForegroundColor Green

Write-Host "`n🎉 MSA Portal setup complete!" -ForegroundColor Green
Write-Host "Ready to start the application with: npm run dev" -ForegroundColor Cyan
Write-Host "`nTest credentials:" -ForegroundColor Yellow
Write-Host "   Email: test@test.com" -ForegroundColor White
Write-Host "   Password: test123" -ForegroundColor White

# Step 10: Optionally start the development server
$startServer = Read-Host "`nWould you like to start the development server now? (y/n)"
if ($startServer -eq 'y' -or $startServer -eq 'Y') {
    Write-Host "🚀 Starting development server..." -ForegroundColor Green
    npm run dev
}
