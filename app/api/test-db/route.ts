import { NextResponse } from 'next/server';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    environment: {
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    }
  };

  // Test 1: Basic environment check
  results.tests.push({
    test: 'Environment Variables',
    status: process.env.DATABASE_URL ? 'PASS' : 'FAIL',
    details: process.env.DATABASE_URL ? 'DATABASE_URL is configured' : 'DATABASE_URL missing'
  });

  // Test 2: Prisma import test
  try {
    const { PrismaClient } = await import('../../../prisma/generated/client');
    results.tests.push({
      test: 'Prisma Client Import',
      status: 'PASS',
      details: 'Prisma client imported successfully'
    });

    // Test 3: Prisma client instantiation
    try {
      const prisma = new PrismaClient({
        log: ['error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      });

      results.tests.push({
        test: 'Prisma Client Creation',
        status: 'PASS',
        details: 'Prisma client created successfully'
      });

      // Test 4: Basic connection test
      try {
        await prisma.$connect();
        results.tests.push({
          test: 'Database Connection',
          status: 'PASS',
          details: 'Successfully connected to database'
        });

        // Test 5: Simple query test
        try {
          const result = await prisma.$queryRaw`SELECT 1 as test`;
          results.tests.push({
            test: 'Basic Query',
            status: 'PASS',
            details: 'Basic query executed successfully',
            queryResult: result
          });

          // Test 6: Table existence check
          try {
            const tables = await prisma.$queryRaw`
              SELECT table_name 
              FROM information_schema.tables 
              WHERE table_schema = 'public' 
              ORDER BY table_name
            `;
            results.tests.push({
              test: 'Table Check',
              status: 'PASS',
              details: `Found ${(tables as any[]).length} tables`,
              tables: (tables as any[]).map(t => t.table_name)
            });

            // Test 7: User table count
            try {
              const userCount = await prisma.user.count();
              results.tests.push({
                test: 'User Count Query',
                status: 'PASS',
                details: `Found ${userCount} users in database`
              });
            } catch (error) {
              results.tests.push({
                test: 'User Count Query',
                status: 'FAIL',
                details: error instanceof Error ? error.message : 'Unknown error'
              });
            }

          } catch (error) {
            results.tests.push({
              test: 'Table Check',
              status: 'FAIL',
              details: error instanceof Error ? error.message : 'Unknown error'
            });
          }

        } catch (error) {
          results.tests.push({
            test: 'Basic Query',
            status: 'FAIL',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        await prisma.$disconnect();

      } catch (error) {
        results.tests.push({
          test: 'Database Connection',
          status: 'FAIL',
          details: error instanceof Error ? error.message : 'Unknown error',
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        });
      }

    } catch (error) {
      results.tests.push({
        test: 'Prisma Client Creation',
        status: 'FAIL',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

  } catch (error) {
    results.tests.push({
      test: 'Prisma Client Import',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 8: Network connectivity test (alternative approach)
  try {
    const testUrl = 'https://oynkexdziaezoodcerid.supabase.co/rest/v1/';
    const response = await fetch(testUrl, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      }
    });
    
    results.tests.push({
      test: 'Supabase REST API',
      status: response.ok ? 'PASS' : 'FAIL',
      details: `HTTP ${response.status} - ${response.statusText}`,
      url: testUrl
    });
  } catch (error) {
    results.tests.push({
      test: 'Supabase REST API',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  const overallStatus = results.tests.every(test => test.status === 'PASS') ? 'PASS' : 'FAIL';
  const passedTests = results.tests.filter(test => test.status === 'PASS').length;
  
  return NextResponse.json({
    success: overallStatus === 'PASS',
    summary: `${passedTests}/${results.tests.length} tests passed`,
    overallStatus,
    ...results
  }, { 
    status: overallStatus === 'PASS' ? 200 : 500 
  });
}
