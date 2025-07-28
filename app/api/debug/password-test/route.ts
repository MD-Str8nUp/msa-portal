import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { plainPassword, hashedPassword, testEmail } = await request.json();
    
    console.log('🔑 Password Debug Test Started');
    console.log('🔑 Input plain password length:', plainPassword?.length);
    console.log('🔑 Input hashed password length:', hashedPassword?.length);
    console.log('🔑 Test email:', testEmail);

    const results = {
      input_validation: {
        has_plain_password: !!plainPassword,
        has_hashed_password: !!hashedPassword,
        plain_password_length: plainPassword?.length || 0,
        hashed_password_length: hashedPassword?.length || 0,
        hash_starts_with_bcrypt: hashedPassword?.startsWith('$2') || false
      },
      bcrypt_tests: {} as any,
      fallback_tests: {} as any,
      node_environment: {
        node_version: process.version,
        platform: process.platform
      }
    };

    // Test bcrypt comparison if both passwords provided
    if (plainPassword && hashedPassword) {
      try {
        console.log('🔑 Testing bcrypt comparison...');
        const bcryptResult = await bcrypt.compare(plainPassword, hashedPassword);
        console.log('🔑 Bcrypt result:', bcryptResult);
        
        results.bcrypt_tests = {
          comparison_result: bcryptResult,
          error: null,
          execution_successful: true
        };
      } catch (bcryptError) {
        console.error('🔑 Bcrypt error:', bcryptError);
        results.bcrypt_tests = {
          comparison_result: false,
          error: bcryptError instanceof Error ? bcryptError.message : 'Unknown bcrypt error',
          execution_successful: false
        };
      }

      // Test plain text comparison as fallback
      results.fallback_tests = {
        plain_text_match: plainPassword === hashedPassword,
        case_insensitive_match: plainPassword?.toLowerCase() === hashedPassword?.toLowerCase()
      };
    }

    // Test common password patterns if email provided
    if (testEmail && plainPassword) {
      const emailPrefix = testEmail.split('@')[0];
      results.fallback_tests = {
        ...results.fallback_tests,
        email_prefix_match: plainPassword === emailPrefix,
        test123_match: plainPassword === 'test123',
        email_match: plainPassword === testEmail
      };
    }

    // Test hash generation
    if (plainPassword) {
      try {
        const newHash = await bcrypt.hash(plainPassword, 10);
        results.hash_generation = {
          generated_hash: newHash,
          hash_length: newHash.length,
          starts_with_bcrypt: newHash.startsWith('$2'),
          generation_successful: true
        };
      } catch (hashError) {
        results.hash_generation = {
          error: hashError instanceof Error ? hashError.message : 'Hash generation failed',
          generation_successful: false
        };
      }
    }

    console.log('🔑 Password test results:', JSON.stringify(results, null, 2));

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Password test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Password test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Password test endpoint. Use POST with { plainPassword, hashedPassword, testEmail }'
  });
}
