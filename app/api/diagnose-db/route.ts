import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const issues: string[] = [];

    // Check if required tables exist
    const requiredTables = ['profiles', 'groups', 'scouts', 'user_groups', 'messages'];
    const tableChecks: Record<string, { exists: boolean; error?: string }> = {};

    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        tableChecks[table] = { exists: !error, error: error?.message };
        if (error) issues.push(`Table '${table}' issue: ${error.message}`);
      } catch (e) {
        tableChecks[table] = { exists: false, error: 'Table does not exist' };
        issues.push(`Table '${table}' does not exist`);
      }
    }

    // Check profiles table structure
    try {
      const { data: profileSample } = await supabase.from('profiles').select('*').limit(1);
      const profileFields = profileSample?.[0] ? Object.keys(profileSample[0]) : [];
      
      const requiredProfileFields = ['id', 'email', 'name', 'role', 'temp_password', 'is_active'];
      const missingFields = requiredProfileFields.filter(field => !profileFields.includes(field));
      
      if (missingFields.length > 0) {
        issues.push(`Profiles table missing fields: ${missingFields.join(', ')}`);
      }
    } catch (e) {
      issues.push('Could not check profiles table structure');
    }

    // Check groups table structure
    try {
      const { data: groupSample } = await supabase.from('groups').select('*').limit(1);
      const groupFields = groupSample?.[0] ? Object.keys(groupSample[0]) : [];
      
      const requiredGroupFields = ['id', 'name', 'description', 'leader_id'];
      const missingGroupFields = requiredGroupFields.filter(field => !groupFields.includes(field));
      
      if (missingGroupFields.length > 0) {
        issues.push(`Groups table missing fields: ${missingGroupFields.join(', ')}`);
      }
    } catch (e) {
      issues.push('Could not check groups table structure');
    }

    // Check role distribution
    try {
      const { data: roleData } = await supabase.from('profiles').select('role');
      const roleCounts: Record<string, number> = {};
      roleData?.forEach((item: any) => {
        roleCounts[item.role] = (roleCounts[item.role] || 0) + 1;
      });
      
      const expectedRoles = ['PARENT', 'LEADER', 'LEADER1', 'EXECUTIVE'];
      const missingRoles = expectedRoles.filter(role => !roleCounts[role]);
      
      if (missingRoles.length > 0) {
        issues.push(`Missing role types: ${missingRoles.join(', ')}`);
      }
    } catch (e) {
      issues.push('Could not check role distribution');
    }

    return NextResponse.json({
      success: true,
      issues,
      tableChecks,
      summary: {
        totalIssues: issues.length,
        criticalIssues: issues.filter(i => i.includes('does not exist')).length
      }
    });

  } catch (error) {
    console.error('Database diagnosis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to diagnose database',
      details: error
    }, { status: 500 });
  }
}