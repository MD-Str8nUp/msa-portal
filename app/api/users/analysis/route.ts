import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Starting comprehensive user analysis...');
    
    const supabase = getAdminClient();
    
    // Get all users with their groups and scout relationships
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        *,
        user_groups:user_groups(
          group:groups(id, name, type)
        ),
        scouts:scouts(id, first_name, last_name, age, rank, status)
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch users'
      }, { status: 500 });
    }

    // Get groups for context
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .order('name');

    if (groupsError) {
      console.error('❌ Error fetching groups:', groupsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch groups'
      }, { status: 500 });
    }

    // Analyze users by role
    const roleAnalysis = {
      ADMIN: users?.filter(u => u.role === 'ADMIN') || [],
      EXECUTIVE: users?.filter(u => u.role === 'EXECUTIVE') || [],
      LEADER1: users?.filter(u => u.role === 'LEADER1') || [],
      LEADER: users?.filter(u => u.role === 'LEADER') || [],
      PARENT: users?.filter(u => u.role === 'PARENT') || [],
      SCOUT: users?.filter(u => u.role === 'SCOUT') || []
    };

    // Analyze user status
    const statusAnalysis = {
      ACTIVE: users?.filter(u => u.status === 'ACTIVE') || [],
      INACTIVE: users?.filter(u => u.status === 'INACTIVE') || []
    };

    // Analyze data completeness
    const dataCompleteness = users?.map(user => ({
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role,
      status: user.status,
      hasPhone: !!user.phone,
      hasAvatar: !!user.avatar,
      groupCount: user.user_groups?.length || 0,
      scoutCount: user.scouts?.length || 0,
      lastLogin: user.last_login,
      loginCount: user.login_count || 0,
      createdAt: user.created_at
    })) || [];

    // Identify missing roles based on BMAD brief
    const requiredRoles = ['ADMIN', 'EXECUTIVE', 'LEADER1', 'LEADER', 'PARENT'];
    const missingRoles = requiredRoles.filter(role => 
      !roleAnalysis[role as keyof typeof roleAnalysis]?.length
    );

    // User-group relationships analysis
    const userGroupsAnalysis = users?.map(user => ({
      userId: user.id,
      userName: `${user.first_name} ${user.last_name}`,
      role: user.role,
      groups: user.user_groups?.map((ug: any) => ({
        groupId: ug.group.id,
        groupName: ug.group.name,
        groupType: ug.group.type
      })) || []
    })) || [];

    // Scout-parent relationships
    const parentScoutRelationships = roleAnalysis.PARENT.map(parent => ({
      parentId: parent.id,
      parentName: `${parent.first_name} ${parent.last_name}`,
      parentEmail: parent.email,
      scouts: parent.scouts?.map((scout: any) => ({
        scoutId: scout.id,
        scoutName: `${scout.first_name} ${scout.last_name}`,
        age: scout.age,
        rank: scout.rank,
        status: scout.status
      })) || []
    }));

    const analysis = {
      summary: {
        totalUsers: users?.length || 0,
        activeUsers: statusAnalysis.ACTIVE.length,
        inactiveUsers: statusAnalysis.INACTIVE.length,
        roleDistribution: {
          ADMIN: roleAnalysis.ADMIN.length,
          EXECUTIVE: roleAnalysis.EXECUTIVE.length,
          LEADER1: roleAnalysis.LEADER1.length,
          LEADER: roleAnalysis.LEADER.length,
          PARENT: roleAnalysis.PARENT.length,
          SCOUT: roleAnalysis.SCOUT.length
        },
        totalGroups: groups?.length || 0,
        usersWithGroups: userGroupsAnalysis.filter(u => u.groups.length > 0).length,
        parentsWithScouts: parentScoutRelationships.filter(p => p.scouts.length > 0).length
      },
      
      roleAnalysis,
      statusAnalysis,
      dataCompleteness,
      missingRoles,
      userGroupsAnalysis,
      parentScoutRelationships,
      groups,
      
      recommendations: {
        missingRoles: missingRoles.length > 0 ? 
          `Missing required roles: ${missingRoles.join(', ')}` : 
          'All required roles are present',
        
        dataQuality: {
          usersWithoutPhone: dataCompleteness.filter(u => !u.hasPhone).length,
          usersWithoutGroups: userGroupsAnalysis.filter(u => u.groups.length === 0).length,
          parentsWithoutScouts: parentScoutRelationships.filter(p => p.scouts.length === 0).length,
          usersNeverLoggedIn: dataCompleteness.filter(u => !u.lastLogin).length
        },
        
        nextActions: [
          missingRoles.length > 0 ? `Create users for missing roles: ${missingRoles.join(', ')}` : null,
          dataCompleteness.filter(u => !u.hasPhone).length > 0 ? 'Add phone numbers for users missing contact info' : null,
          userGroupsAnalysis.filter(u => u.groups.length === 0).length > 0 ? 'Assign users to appropriate groups' : null,
          parentScoutRelationships.filter(p => p.scouts.length === 0).length > 0 ? 'Link parents to their scout children' : null
        ].filter(Boolean)
      }
    };

    console.log('✅ User analysis completed successfully');
    console.log(`📊 Found ${users?.length || 0} total users across ${Object.keys(roleAnalysis).length} roles`);

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('❌ Error in user analysis:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during user analysis'
    }, { status: 500 });
  }
}