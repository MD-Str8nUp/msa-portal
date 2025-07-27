import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Test direct query to profiles table
    const { data, error, count } = await supabase
      .from('profiles')
      .select('id, email, name, role', { count: 'exact' })
      .limit(5);

    if (error) {
      console.error('❌ Supabase query error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL
      });
    }

    console.log('✅ Supabase connection successful');
    console.log('Users found:', data?.length || 0);

    return NextResponse.json({
      success: true,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      profilesCount: count,
      sampleUsers: data
    });

  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Connection test failed'
    }, { status: 500 });
  }
}