import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const fixes = [];

    // 1. Create user_groups table
    try {
      const { error: createTableError } = await supabase.rpc('create_user_groups_table', {});
      if (createTableError) {
        // Try direct SQL if RPC doesn't work
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS user_groups (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
            role TEXT NOT NULL DEFAULT 'MEMBER',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, group_id)
          );
        `;
        
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
        if (sqlError) {
          fixes.push({ action: 'Create user_groups table', status: 'failed', error: sqlError.message });
        } else {
          fixes.push({ action: 'Create user_groups table', status: 'success' });
        }
      } else {
        fixes.push({ action: 'Create user_groups table', status: 'success' });
      }
    } catch (e) {
      fixes.push({ action: 'Create user_groups table', status: 'failed', error: e.message });
    }

    // 2. Update role designations
    try {
      // Set Sarah Droubi as EXECUTIVE (she's marked as EXECUTIVE TEAM in the data)
      const { error: sarahError } = await supabase
        .from('profiles')
        .update({ role: 'EXECUTIVE' })
        .eq('email', 'sarah.droubi@msaportal.com');
      
      if (!sarahError) {
        fixes.push({ action: 'Set Sarah Droubi as EXECUTIVE', status: 'success' });
      } else {
        fixes.push({ action: 'Set Sarah Droubi as EXECUTIVE', status: 'failed', error: sarahError.message });
      }

      // Set admin as EXECUTIVE
      const { error: adminError } = await supabase
        .from('profiles')
        .update({ role: 'EXECUTIVE' })
        .eq('email', 'admin@msaportal.com');
      
      if (!adminError) {
        fixes.push({ action: 'Set admin as EXECUTIVE', status: 'success' });
      } else {
        fixes.push({ action: 'Set admin as EXECUTIVE', status: 'failed', error: adminError.message });
      }

      // Keep others as LEADER for now (will be updated when importing parent data)
      fixes.push({ action: 'Role assignments', status: 'partial', note: 'EXECUTIVE roles set, PARENT roles will be added during data import' });

    } catch (e) {
      fixes.push({ action: 'Update roles', status: 'failed', error: e.message });
    }

    // 3. Create scouts table if missing columns  
    try {
      const { data: scoutSample } = await supabase.from('scouts').select('*').limit(1);
      const scoutFields = scoutSample?.[0] ? Object.keys(scoutSample[0]) : [];
      
      const requiredFields = ['id', 'first_name', 'last_name', 'age', 'parent_id', 'group_id'];
      const missingFields = requiredFields.filter(field => !scoutFields.includes(field));
      
      if (missingFields.length > 0) {
        fixes.push({ action: 'Check scouts table', status: 'needs_update', missing_fields: missingFields });
      } else {
        fixes.push({ action: 'Check scouts table', status: 'ok' });
      }
    } catch (e) {
      fixes.push({ action: 'Check scouts table', status: 'failed', error: e.message });
    }

    return NextResponse.json({
      success: true,
      message: 'Database fixes attempted',
      fixes,
      summary: {
        total: fixes.length,
        successful: fixes.filter(f => f.status === 'success').length,
        failed: fixes.filter(f => f.status === 'failed').length
      }
    });

  } catch (error) {
    console.error('Database fix error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix database',
      details: error
    }, { status: 500 });
  }
}